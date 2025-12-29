/**
 * Migration entry point for version 20.0.0
 * Targeted migration - only modifies files using stores with collection param
 */

import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { analyzeAll } from './targeted/store-analyzer';
import { resolveDependencies } from './targeted/dependency-resolver';
import {
  transformTypeScriptFile,
  transformHtmlFile,
} from './targeted/targeted-transformer';

export default function migrate(_options: any): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('Scanning for @ngrx-traits/signals stores and custom features with collection param...\n');

    // Phase 1: Find stores and custom features with collection param
    const { stores, customFeatures } = analyzeAll(tree);

    if (stores.length === 0 && customFeatures.length === 0) {
      context.logger.info('No stores or custom features with collection param found. Nothing to migrate.');
      return;
    }

    if (customFeatures.length > 0) {
      context.logger.info(`Found ${customFeatures.length} custom feature(s) with collection param:\n`);
      for (const feature of customFeatures) {
        context.logger.info(`  ${feature.functionName} (${feature.filePath})`);
        context.logger.info(`    Collections: ${feature.collections.join(', ')}`);
      }
    }

    if (stores.length > 0) {
      context.logger.info(`Found ${stores.length} store(s) with collection param:\n`);
      for (const store of stores) {
        context.logger.info(`  ${store.storeName} (${store.filePath})`);
        context.logger.info(`    Collections: ${store.collections.join(', ')}`);
      }
    }

    // Phase 2: Resolve dependencies (consumers + templates)
    const scope = resolveDependencies(tree, stores, customFeatures);

    context.logger.info(`\nFiles to migrate: ${scope.allFiles.size}`);
    context.logger.info(`Collections to rename: ${Array.from(scope.collections).join(', ')}\n`);

    // Phase 3: Transform files
    let filesModified = 0;
    let totalChanges = 0;

    for (const filePath of scope.allFiles) {
      const content = tree.read(filePath);
      if (!content) continue;

      const text = content.toString('utf-8');
      const isHtml = filePath.endsWith('.html');

      const result = isHtml
        ? transformHtmlFile(text, scope.collections)
        : transformTypeScriptFile(text, filePath, scope.collections);

      if (result.modified) {
        tree.overwrite(filePath, result.content);
        filesModified++;
        totalChanges += result.changes.length;

        context.logger.info(`Migrated: ${filePath}`);
        for (const change of result.changes) {
          context.logger.info(`  L${change.line}: ${change.oldName} -> ${change.newName}`);
        }
      }
    }

    // Summary
    context.logger.info('\n' + '='.repeat(50));
    context.logger.info('\nMigration complete!\n');
    context.logger.info('Summary:');
    context.logger.info(`  ${stores.length} store(s) analyzed`);
    context.logger.info(`  ${scope.allFiles.size} files in scope`);
    context.logger.info(`  ${filesModified} files modified`);
    context.logger.info(`  ${totalChanges} properties renamed`);
    context.logger.info('\nPlease review changes and run tests before committing.');
  };
}
