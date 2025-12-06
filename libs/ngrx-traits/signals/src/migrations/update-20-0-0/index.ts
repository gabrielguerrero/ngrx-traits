/**
 * Migration entry point for version 20.0.0
 * Exports the migration function for ng update
 */

import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { getAllPatterns } from './utils/pattern-matchers';

function transformContent(content: string): { modified: boolean; content: string } {
  let transformed = content;
  let modified = false;

  const patterns = getAllPatterns();

  patterns.forEach(pattern => {
    const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
    const matches = transformed.match(regex);

    if (matches) {
      const newContent = transformed.replace(regex, (match, ...args) => {
        const name = args[0] || match.replace(/[^\w]/g, '');
        const replacement = pattern.replacement(match, name);

        if (match !== replacement) {
          modified = true;
        }
        return replacement;
      });

      if (newContent !== transformed) {
        transformed = newContent;
      }
    }
  });

  return { modified, content: transformed };
}

export default function migrate(options: any): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('🔍 Scanning project for @ngrx-traits/signals usage...\n');

    let filesProcessed = 0;
    let filesModified = 0;

    // Process all files
    tree.visit((filePath, entry) => {
      if (!entry || filePath.includes('node_modules') || filePath.includes('.git')) {
        return;
      }

      const ext = filePath.slice(filePath.lastIndexOf('.')).toLowerCase();
      if (!['.ts', '.html'].includes(ext)) {
        return;
      }

      const content = entry.content.toString('utf-8');
      if (!/@ngrx-traits\/signals/.test(content)) {
        return;
      }

      filesProcessed++;
      const result = transformContent(content);

      if (result.modified) {
        tree.overwrite(filePath, result.content);
        filesModified++;
        context.logger.info(`✅ Migrated: ${filePath}`);
      }
    });

    // Summary
    context.logger.info('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    context.logger.info('\n✨ Migration complete!\n');
    context.logger.info('Summary:');
    context.logger.info(`  • ${filesProcessed} files scanned`);
    context.logger.info(`  • ${filesModified} files modified`);
    context.logger.info('\n⚠️  Please review changes and run tests before committing.');
  };
}
