/**
 * Store Analyzer - Phase 1: Find stores with collection param
 */

import * as ts from 'typescript';
import { Tree } from '@angular-devkit/schematics';
import { StoreInfo, BREAKING_FEATURES } from './types';

/**
 * Analyze all TS files to find stores using collection param
 */
export function analyzeStores(tree: Tree): StoreInfo[] {
  const stores: StoreInfo[] = [];

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

    // Quick check - must have @ngrx-traits/signals import
    if (!text.includes('@ngrx-traits/signals')) return;

    const storeInfo = analyzeFile(text, filePath);
    if (storeInfo && storeInfo.collections.length > 0) {
      stores.push(storeInfo);
    }
  });

  return stores;
}

/**
 * Analyze a single file for store definitions with collections
 */
function analyzeFile(content: string, filePath: string): StoreInfo | null {
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
            extractCollections(decl.initializer, sourceFile, collections);
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
  collections: Set<string>
): void {
  for (const arg of callExpr.arguments) {
    if (ts.isCallExpression(arg)) {
      const funcName = arg.expression.getText(sourceFile);

      // Check if it's a breaking feature
      if (BREAKING_FEATURES.includes(funcName as any)) {
        extractCollectionFromFeatureCall(arg, sourceFile, collections);
      }
    }
  }
}

/**
 * Extract collection name from feature call like withCallStatus({ collection: 'product' })
 */
function extractCollectionFromFeatureCall(
  callExpr: ts.CallExpression,
  sourceFile: ts.SourceFile,
  collections: Set<string>
): void {
  for (const arg of callExpr.arguments) {
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
