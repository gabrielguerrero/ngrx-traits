/**
 * Schematic wrapper for v20 migration
 * Run with: ng generate @ngrx-traits/signals:migrate-entities-suffix
 */

import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

// Import from compiled migrations (they're in sibling directory at runtime)
const { analyzeStores } = require('../../migrations/update-20-0-0/targeted/store-analyzer');
const { resolveDependencies } = require('../../migrations/update-20-0-0/targeted/dependency-resolver');
const { transformTypeScriptFile, transformHtmlFile } = require('../../migrations/update-20-0-0/targeted/targeted-transformer');

export default function migrateEntitiesSuffix(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('Scanning for @ngrx-traits/signals stores with collection param...\n');

    // Phase 1: Find stores with collection param
    const stores = analyzeStores(tree);

    if (stores.length === 0) {
      context.logger.info('No stores with collection param found. Nothing to migrate.');
      return;
    }

    context.logger.info(`Found ${stores.length} store(s) with collection param:\n`);
    for (const store of stores) {
      context.logger.info(`  ${store.storeName} (${store.filePath})`);
      context.logger.info(`    Collections: ${store.collections.join(', ')}`);
    }

    // Phase 2: Resolve dependencies (consumers + templates)
    const scope = resolveDependencies(tree, stores);

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
