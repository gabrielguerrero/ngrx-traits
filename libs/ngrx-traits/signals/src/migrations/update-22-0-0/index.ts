/**
 * Migration entry point for version 22.0.0
 * Moves the entityConfig out of the single config object of the withEntities*
 * features into their first arg: withX({ ...entityConfig, ...options }) ->
 * withX(entityConfig, options)
 */
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import {
  TRAITS_MODULE,
  transformEntityConfigArgs,
} from './entity-config-args-transformer';

export default function migrate(_options?: any): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info(
      'Migrating withEntities* features to the (entityConfig, options) call form...\n',
    );

    let filesModified = 0;
    let totalChanges = 0;
    let totalSkipped = 0;

    tree.visit((filePath) => {
      if (
        !(filePath.endsWith('.ts') || filePath.endsWith('.tsx')) ||
        filePath.endsWith('.d.ts') ||
        filePath.includes('/node_modules/') ||
        filePath.includes('/dist/') ||
        filePath.includes('/.angular/') ||
        filePath.includes('/.nx/')
      )
        return;

      const content = tree.read(filePath);
      if (!content) return;
      const text = content.toString('utf-8');
      if (!text.includes(TRAITS_MODULE)) return;

      const result = transformEntityConfigArgs(text, filePath);

      if (result.modified) {
        tree.overwrite(filePath, result.content);
        filesModified++;
        totalChanges += result.changes.length;
        context.logger.info(`Migrated: ${filePath}`);
        for (const change of result.changes) {
          context.logger.info(`  L${change.line}: ${change.feature}`);
        }
      }
      for (const skip of result.skipped) {
        totalSkipped++;
        context.logger.warn(
          `Skipped: ${filePath}:${skip.line} ${skip.feature} - ${skip.reason}`,
        );
      }
    });

    context.logger.info('\n' + '='.repeat(50));
    context.logger.info('\nMigration complete!\n');
    context.logger.info(`  ${filesModified} files modified`);
    context.logger.info(`  ${totalChanges} feature calls migrated`);
    if (totalSkipped > 0) {
      context.logger.info(
        `  ${totalSkipped} feature calls skipped, see the warnings above`,
      );
    }
    context.logger.info(
      '\nThe single object form still works, skipped calls do not need to change.',
    );
    context.logger.info(
      'Please review changes and run tests before committing.',
    );
  };
}
