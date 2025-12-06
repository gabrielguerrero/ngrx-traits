/**
 * Main migration logic for renaming properties to Entities suffix convention
 * Handles both TypeScript and HTML files
 */

import * as fs from 'fs';
import * as path from 'path';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { getAllPatterns } from './utils/pattern-matchers';
import { findTypeScriptFiles, findHtmlFiles, readFile, writeFile } from './utils/file-visitor';

interface MigrationStats {
  filesProcessed: number;
  filesModified: number;
  totalReplacements: number;
  errors: Array<{ file: string; error: string }>;
}

interface FileTransformResult {
  modified: boolean;
  content: string;
  replacements: Array<{ oldName: string; newName: string; count: number }>;
}

/**
 * Rename properties in TypeScript files
 */
function transformTypeScriptFile(content: string): FileTransformResult {
  let transformed = content;
  const replacements: Array<{ oldName: string; newName: string; count: number }> = [];
  let modified = false;

  const patterns = getAllPatterns();

  patterns.forEach(pattern => {
    const matches = transformed.match(pattern.pattern);
    if (matches) {
      const newContent = transformed.replace(pattern.pattern, (match, ...args) => {
        const name = args[0] || match.replace(/[^\w]/g, '');
        const replacement = pattern.replacement(match, name);

        if (match !== replacement) {
          modified = true;
          const existing = replacements.find(r => r.oldName === match);
          if (existing) {
            existing.count++;
          } else {
            replacements.push({ oldName: match, newName: replacement, count: 1 });
          }
        }
        return replacement;
      });

      if (newContent !== transformed) {
        transformed = newContent;
      }
    }
  });

  return { modified, content: transformed, replacements };
}

/**
 * Rename properties in HTML files using regex
 */
function transformHtmlFile(content: string): FileTransformResult {
  let transformed = content;
  const replacements: Array<{ oldName: string; newName: string; count: number }> = [];
  let modified = false;

  const patterns = getAllPatterns();

  patterns.forEach(pattern => {
    const matches = transformed.match(pattern.pattern);
    if (matches) {
      const newContent = transformed.replace(pattern.pattern, (match, ...args) => {
        const name = args[0] || match.replace(/[^\w]/g, '');
        const replacement = pattern.replacement(match, name);

        if (match !== replacement) {
          modified = true;
          const existing = replacements.find(r => r.oldName === match);
          if (existing) {
            existing.count++;
          } else {
            replacements.push({ oldName: match, newName: replacement, count: 1 });
          }
        }
        return replacement;
      });

      if (newContent !== transformed) {
        transformed = newContent;
      }
    }
  });

  return { modified, content: transformed, replacements };
}

/**
 * Check if git working directory is clean
 */
function checkGitStatus(context: SchematicContext, options: any): boolean {
  try {
    const { execSync } = require('child_process');
    const status = execSync('git status --porcelain', { encoding: 'utf-8' });
    return status.trim() === '';
  } catch (error) {
    if (!options['skip-git-check']) {
      context.logger.error('Warning: Could not check git status');
    }
    return options['skip-git-check'] !== false;
  }
}

/**
 * Process all TypeScript files
 */
function processTypeScriptFiles(
  tree: Tree,
  context: SchematicContext,
  stats: MigrationStats
): void {
  const workspace = tree.getDir('/');
  const tsFiles = workspace.visit((filePath, entry) => {
    if (filePath.endsWith('.ts') && !filePath.includes('node_modules')) {
      const content = entry?.content.toString();
      if (content && /@ngrx-traits\/signals/.test(content)) {
        processFile(tree, filePath, 'ts', stats, context);
      }
    }
  });
}

/**
 * Process all HTML files
 */
function processHtmlFiles(
  tree: Tree,
  context: SchematicContext,
  stats: MigrationStats
): void {
  const workspace = tree.getDir('/');
  workspace.visit((filePath, entry) => {
    if (filePath.endsWith('.html') && !filePath.includes('node_modules')) {
      const content = entry?.content.toString();
      if (content && /@ngrx-traits\/signals/.test(content)) {
        processFile(tree, filePath, 'html', stats, context);
      }
    }
  });
}

/**
 * Process individual file
 */
function processFile(
  tree: Tree,
  filePath: string,
  type: 'ts' | 'html',
  stats: MigrationStats,
  context: SchematicContext
): void {
  try {
    const content = tree.read(filePath);
    if (!content) {
      return;
    }

    const fileContent = content.toString('utf-8');
    stats.filesProcessed++;

    const result = type === 'ts'
      ? transformTypeScriptFile(fileContent)
      : transformHtmlFile(fileContent);

    if (result.modified) {
      tree.overwrite(filePath, result.content);
      stats.filesModified++;

      result.replacements.forEach(replacement => {
        stats.totalReplacements += replacement.count;
      });

      context.logger.info(`✅ Migrated: ${filePath}`);
      result.replacements.forEach(r => {
        context.logger.info(`   - ${r.oldName} → ${r.newName} (${r.count} occurrence${r.count > 1 ? 's' : ''})`);
      });
    }
  } catch (error) {
    stats.errors.push({
      file: filePath,
      error: error instanceof Error ? error.message : String(error)
    });
    context.logger.error(`❌ Error processing ${filePath}: ${error}`);
  }
}

/**
 * Main migration factory function
 */
export default function migrate(options: any): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const stats: MigrationStats = {
      filesProcessed: 0,
      filesModified: 0,
      totalReplacements: 0,
      errors: []
    };

    context.logger.info('🔍 Scanning project for @ngrx-traits/signals usage...\n');

    // Check git status
    if (!options['skip-git-check'] && !checkGitStatus(context, options)) {
      context.logger.error('❌ Git working directory is not clean. Please commit or stash changes before running migration.');
      context.logger.error('   Use --skip-git-check flag to bypass this check.');
      return;
    }

    // Process TypeScript files
    processTypeScriptFiles(tree, context, stats);

    // Process HTML files
    processHtmlFiles(tree, context, stats);

    // Print summary
    context.logger.info('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    context.logger.info('\n✨ Migration complete!\n');
    context.logger.info('Summary:');
    context.logger.info(`  • ${stats.filesProcessed} files scanned`);
    context.logger.info(`  • ${stats.filesModified} files modified`);
    context.logger.info(`  • ${stats.totalReplacements} properties renamed`);
    if (stats.errors.length > 0) {
      context.logger.info(`  • ${stats.errors.length} errors\n`);
      stats.errors.forEach(err => {
        context.logger.error(`    - ${err.file}: ${err.error}`);
      });
    }
    context.logger.info('\n⚠️  Please review changes and run tests before committing.');
  };
}
