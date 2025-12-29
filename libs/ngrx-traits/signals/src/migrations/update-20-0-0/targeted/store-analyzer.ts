/**
 * Store Analyzer - Phase 1: Find stores and custom features with collection param
 */

import * as ts from 'typescript';
import { Tree } from '@angular-devkit/schematics';
import { StoreInfo, CustomFeatureInfo, BREAKING_FEATURES } from './types';

export interface AnalysisResult {
  stores: StoreInfo[];
  customFeatures: CustomFeatureInfo[];
}

/**
 * Analyze all TS files to find stores and custom features using collection param
 */
export function analyzeStores(tree: Tree): StoreInfo[] {
  const result = analyzeAll(tree);
  return result.stores;
}

/**
 * Analyze all TS files to find both stores and custom signalStoreFeature functions
 */
export function analyzeAll(tree: Tree): AnalysisResult {
  const stores: StoreInfo[] = [];
  const customFeatures: CustomFeatureInfo[] = [];

  // First pass: find all custom features and their collections
  const featureCollections = new Map<string, string[]>(); // functionName -> collections

  tree.visit((filePath) => {
    if (
      !filePath.endsWith('.ts') ||
      filePath.includes('node_modules') ||
      filePath.includes('.spec.ts')
    ) {
      return;
    }

    const content = tree.read(filePath);
    if (!content) return;

    const text = content.toString('utf-8');

    // Quick check - must have @ngrx-traits/signals or signalStoreFeature
    if (!text.includes('@ngrx-traits/signals') && !text.includes('signalStoreFeature')) return;

    // Find custom features
    const features = findCustomFeatures(text, filePath);
    for (const feature of features) {
      if (feature.collections.length > 0) {
        customFeatures.push(feature);
        featureCollections.set(feature.functionName, feature.collections);
      }
    }
  });

  // Second pass: find stores (including those using custom features)
  tree.visit((filePath) => {
    if (
      !filePath.endsWith('.ts') ||
      filePath.includes('node_modules') ||
      filePath.includes('.spec.ts')
    ) {
      return;
    }

    const content = tree.read(filePath);
    if (!content) return;

    const text = content.toString('utf-8');

    // Quick check - must have signalStore
    if (!text.includes('signalStore')) return;

    const storeInfo = analyzeFile(text, filePath, featureCollections);
    if (storeInfo && storeInfo.collections.length > 0) {
      stores.push(storeInfo);
    }
  });

  return { stores, customFeatures };
}

/**
 * Find custom signalStoreFeature functions and variables that contain collections
 */
function findCustomFeatures(content: string, filePath: string): CustomFeatureInfo[] {
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
  );

  const features: CustomFeatureInfo[] = [];

  function visit(node: ts.Node) {
    // Find exported function that returns signalStoreFeature
    if (ts.isFunctionDeclaration(node) && node.name) {
      const funcName = node.name.text;
      const collections = new Set<string>();

      // Check if function body contains signalStoreFeature call
      if (node.body) {
        findSignalStoreFeatureCollections(node.body, sourceFile, collections);
      }

      if (collections.size > 0) {
        features.push({
          filePath,
          functionName: funcName,
          collections: Array.from(collections),
        });
      }
    }

    // Find variable declarations like: const productsStoreFeature = signalStoreFeature(...)
    if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        if (
          ts.isIdentifier(decl.name) &&
          decl.initializer &&
          ts.isCallExpression(decl.initializer)
        ) {
          const callText = decl.initializer.expression.getText(sourceFile);
          if (callText === 'signalStoreFeature') {
            const varName = decl.name.text;
            const collections = new Set<string>();

            // Extract collections from signalStoreFeature arguments
            for (const arg of decl.initializer.arguments) {
              if (ts.isCallExpression(arg)) {
                const innerFuncName = arg.expression.getText(sourceFile);
                if (BREAKING_FEATURES.includes(innerFuncName as any)) {
                  extractCollectionFromFeatureCall(arg, sourceFile, collections);
                }
              }
            }

            if (collections.size > 0) {
              features.push({
                filePath,
                functionName: varName,
                collections: Array.from(collections),
              });
            }
          }
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return features;
}

/**
 * Find collections inside signalStoreFeature calls within a function body
 */
function findSignalStoreFeatureCollections(
  node: ts.Node,
  sourceFile: ts.SourceFile,
  collections: Set<string>
): void {
  if (ts.isCallExpression(node)) {
    const funcName = node.expression.getText(sourceFile);

    if (funcName === 'signalStoreFeature') {
      // Extract collections from signalStoreFeature arguments
      for (const arg of node.arguments) {
        if (ts.isCallExpression(arg)) {
          const innerFuncName = arg.expression.getText(sourceFile);
          if (BREAKING_FEATURES.includes(innerFuncName as any)) {
            extractCollectionFromFeatureCall(arg, sourceFile, collections);
          }
        }
      }
    }
  }

  ts.forEachChild(node, (child) =>
    findSignalStoreFeatureCollections(child, sourceFile, collections)
  );
}

/**
 * Analyze a single file for store definitions with collections
 */
function analyzeFile(
  content: string,
  filePath: string,
  featureCollections: Map<string, string[]> = new Map()
): StoreInfo | null {
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
  );

  let storeName: string | null = null;
  const collections = new Set<string>();

  function visit(node: ts.Node) {
    // Find exported const with signalStore
    if (
      ts.isVariableStatement(node) &&
      node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      for (const decl of node.declarationList.declarations) {
        if (
          ts.isIdentifier(decl.name) &&
          decl.initializer &&
          ts.isCallExpression(decl.initializer)
        ) {
          const callText = decl.initializer.expression.getText(sourceFile);
          if (callText === 'signalStore') {
            storeName = decl.name.text;
            // Analyze signalStore arguments for breaking features with collection
            extractCollections(decl.initializer, sourceFile, collections, featureCollections);
          }
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  if (storeName && collections.size > 0) {
    return {
      filePath,
      storeName,
      collections: Array.from(collections),
    };
  }

  return null;
}

/**
 * Extract collection names from signalStore call arguments
 */
function extractCollections(
  callExpr: ts.CallExpression,
  sourceFile: ts.SourceFile,
  collections: Set<string>,
  featureCollections: Map<string, string[]> = new Map()
): void {
  for (const arg of callExpr.arguments) {
    // Handle variable reference: signalStore(productsStoreFeature, ...)
    if (ts.isIdentifier(arg)) {
      if (featureCollections.has(arg.text)) {
        const featureColls = featureCollections.get(arg.text)!;
        featureColls.forEach((c) => collections.add(c));
      }
    }

    if (ts.isCallExpression(arg)) {
      const funcName = arg.expression.getText(sourceFile);

      // Check if it's a breaking feature
      if (BREAKING_FEATURES.includes(funcName as any)) {
        extractCollectionFromFeatureCall(arg, sourceFile, collections);
      }

      // Check if it's a custom feature function we've identified
      if (featureCollections.has(funcName)) {
        const featureColls = featureCollections.get(funcName)!;
        featureColls.forEach((c) => collections.add(c));
      }

      // Handle inline signalStoreFeature(...) - recursively extract collections
      if (funcName === 'signalStoreFeature') {
        extractCollections(arg, sourceFile, collections, featureCollections);
      }

      // Handle withFeature((store) => customFeature(...))
      if (funcName === 'withFeature') {
        extractCollectionsFromWithFeature(arg, sourceFile, collections, featureCollections);
      }
    }
  }
}

/**
 * Extract collections from withFeature((store) => customFeature(...))
 */
function extractCollectionsFromWithFeature(
  callExpr: ts.CallExpression,
  sourceFile: ts.SourceFile,
  collections: Set<string>,
  featureCollections: Map<string, string[]>
): void {
  for (const arg of callExpr.arguments) {
    // withFeature takes an arrow function: (store) => featureCall(...)
    if (ts.isArrowFunction(arg)) {
      const body = arg.body;

      // Arrow with expression body: (store) => featureCall(...)
      if (ts.isCallExpression(body)) {
        const funcName = body.expression.getText(sourceFile);

        // Check if it's a known custom feature
        if (featureCollections.has(funcName)) {
          const featureColls = featureCollections.get(funcName)!;
          featureColls.forEach((c) => collections.add(c));
        }

        // Check if it's a breaking feature directly
        if (BREAKING_FEATURES.includes(funcName as any)) {
          extractCollectionFromFeatureCall(body, sourceFile, collections);
        }
      }

      // Arrow with block body: (store) => { return featureCall(...); }
      if (ts.isBlock(body)) {
        for (const stmt of body.statements) {
          if (ts.isReturnStatement(stmt) && stmt.expression && ts.isCallExpression(stmt.expression)) {
            const funcName = stmt.expression.expression.getText(sourceFile);

            if (featureCollections.has(funcName)) {
              const featureColls = featureCollections.get(funcName)!;
              featureColls.forEach((c) => collections.add(c));
            }

            if (BREAKING_FEATURES.includes(funcName as any)) {
              extractCollectionFromFeatureCall(stmt.expression, sourceFile, collections);
            }
          }
        }
      }
    }
  }
}

/**
 * Extract collection name from feature call like withCallStatus({ collection: 'product' })
 * Also handles: withCallStatus(resourcesEntityConfig) where resourcesEntityConfig is a variable
 */
function extractCollectionFromFeatureCall(
  callExpr: ts.CallExpression,
  sourceFile: ts.SourceFile,
  collections: Set<string>
): void {
  for (const arg of callExpr.arguments) {
    // Handle direct variable reference: withCallStatus(resourcesEntityConfig)
    if (ts.isIdentifier(arg)) {
      const collectionFromVar = findCollectionInVariable(arg.text, sourceFile);
      if (collectionFromVar) {
        collections.add(collectionFromVar);
      }
    }

    // Handle object literal: withCallStatus({ collection: 'product' })
    if (ts.isObjectLiteralExpression(arg)) {
      for (const prop of arg.properties) {
        if (ts.isPropertyAssignment(prop)) {
          const propName = prop.name.getText(sourceFile);

          if (propName === 'collection') {
            // Handle string literal: { collection: 'product' }
            if (ts.isStringLiteral(prop.initializer)) {
              collections.add(prop.initializer.text);
            }
            // Handle variable reference: { collection } or { collection: collectionVar }
            else if (ts.isIdentifier(prop.initializer)) {
              const varValue = findStringVariableValue(prop.initializer.text, sourceFile);
              if (varValue) {
                collections.add(varValue);
              }
            }
          }
        }

        // Handle shorthand property: { collection } (same name for key and value)
        if (ts.isShorthandPropertyAssignment(prop)) {
          const propName = prop.name.getText(sourceFile);
          if (propName === 'collection') {
            const varValue = findStringVariableValue(propName, sourceFile);
            if (varValue) {
              collections.add(varValue);
            }
          }
        }

        // Handle spread: { ...entityConfig }
        if (ts.isSpreadAssignment(prop)) {
          const spreadExpr = prop.expression;
          if (ts.isIdentifier(spreadExpr)) {
            // Try to find the variable definition
            const collectionFromVar = findCollectionInVariable(
              spreadExpr.text,
              sourceFile
            );
            if (collectionFromVar) {
              collections.add(collectionFromVar);
            }
          }
        }
      }
    }
  }
}

/**
 * Find string value of a variable like: const collection = 'products';
 */
function findStringVariableValue(
  varName: string,
  sourceFile: ts.SourceFile
): string | null {
  let result: string | null = null;

  function visit(node: ts.Node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
      if (node.name.text === varName && node.initializer) {
        // Direct string assignment: const collection = 'products';
        if (ts.isStringLiteral(node.initializer)) {
          result = node.initializer.text;
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return result;
}

/**
 * Find collection value in a variable like entityConfig({ collection: 'x' })
 */
function findCollectionInVariable(
  varName: string,
  sourceFile: ts.SourceFile
): string | null {
  let result: string | null = null;

  function visit(node: ts.Node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
      if (node.name.text === varName && node.initializer) {
        if (ts.isCallExpression(node.initializer)) {
          // entityConfig({ collection: 'x' })
          for (const arg of node.initializer.arguments) {
            if (ts.isObjectLiteralExpression(arg)) {
              for (const prop of arg.properties) {
                if (
                  ts.isPropertyAssignment(prop) &&
                  prop.name.getText(sourceFile) === 'collection' &&
                  ts.isStringLiteral(prop.initializer)
                ) {
                  result = prop.initializer.text;
                }
              }
            }
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return result;
}
