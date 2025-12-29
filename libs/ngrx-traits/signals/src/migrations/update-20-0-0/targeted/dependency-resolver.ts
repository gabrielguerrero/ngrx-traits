/**
 * Dependency Resolver - Phase 2: Find store consumers and templates
 */

import * as ts from 'typescript';
import { Tree } from '@angular-devkit/schematics';
import { StoreInfo, CustomFeatureInfo, ConsumerInfo, MigrationScope } from './types';
import * as path from 'path';

/**
 * Resolve all files that need migration based on store usage
 */
export function resolveDependencies(
  tree: Tree,
  stores: StoreInfo[],
  customFeatures: CustomFeatureInfo[] = []
): MigrationScope {
  const consumers = new Map<string, ConsumerInfo[]>();
  const allFiles = new Set<string>();
  const collections = new Set<string>();

  // Add custom feature files and their collections
  for (const feature of customFeatures) {
    allFiles.add(feature.filePath);
    feature.collections.forEach((c) => collections.add(c));
  }

  // Add store files and their collections
  for (const store of stores) {
    allFiles.add(store.filePath);
    store.collections.forEach((c) => collections.add(c));
    consumers.set(store.storeName, []);
  }

  // Find consumers of each store
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

    for (const store of stores) {
      // Skip the store's own file
      if (filePath === store.filePath) continue;

      // Check if file imports or uses this store
      if (text.includes(store.storeName)) {
        const consumerInfo = analyzeConsumer(text, filePath, tree);
        if (consumerInfo) {
          const existing = consumers.get(store.storeName) || [];
          existing.push(consumerInfo);
          consumers.set(store.storeName, existing);
          allFiles.add(filePath);

          // Add template file if external
          if (consumerInfo.templatePath) {
            allFiles.add(consumerInfo.templatePath);
          }
        }
      }
    }
  });

  return { stores, customFeatures, consumers, collections, allFiles };
}

/**
 * Analyze a consumer file to find template references
 */
function analyzeConsumer(
  content: string,
  filePath: string,
  tree: Tree
): ConsumerInfo | null {
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
  );

  let templatePath: string | undefined;

  function visit(node: ts.Node) {
    // Find @Component decorator
    if (ts.isDecorator(node) && ts.isCallExpression(node.expression)) {
      const decoratorName = node.expression.expression.getText(sourceFile);

      if (decoratorName === 'Component') {
        for (const arg of node.expression.arguments) {
          if (ts.isObjectLiteralExpression(arg)) {
            for (const prop of arg.properties) {
              if (ts.isPropertyAssignment(prop)) {
                const propName = prop.name.getText(sourceFile);

                if (propName === 'templateUrl' && ts.isStringLiteral(prop.initializer)) {
                  const templateRelPath = prop.initializer.text;
                  const dirPath = path.dirname(filePath);
                  templatePath = path.join(dirPath, templateRelPath);

                  // Normalize path
                  if (templatePath.startsWith('/')) {
                    templatePath = templatePath.substring(1);
                  }

                  // Verify template exists
                  if (!tree.exists(templatePath) && !tree.exists('/' + templatePath)) {
                    templatePath = undefined;
                  }
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

  return {
    filePath,
    templatePath,
  };
}
