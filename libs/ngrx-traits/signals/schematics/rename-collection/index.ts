/**
 * Schematic for renaming @ngrx-traits/signals collections
 * Renames plural names (e.g., 'products') to singular (e.g., 'product')
 */
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import * as path from 'path';

interface RenameCollectionOptions {
  oldName: string;
  newName: string;
  path?: string;
  skipGitCheck?: boolean;
}

interface RenamePattern {
  pattern: RegExp;
  replacement: (oldName: string, newName: string) => string;
}

/**
 * Generate rename patterns dynamically based on collection names
 */
function generateRenamePatterns(
  oldName: string,
  newName: string,
): RenamePattern[] {
  const oldCapital = oldName.charAt(0).toUpperCase() + oldName.slice(1);
  const newCapital = newName.charAt(0).toUpperCase() + newName.slice(1);

  return [
    // CallStatus patterns
    {
      pattern: new RegExp(`${oldName}CallStatus`, 'g'),
      replacement: () => `${newName}EntitiesCallStatus`,
    },
    {
      pattern: new RegExp(`${oldName}EntitiesCallStatus`, 'g'),
      replacement: () => `${newName}EntitiesCallStatus`,
    },
    {
      pattern: new RegExp(`is${oldCapital}Loading`, 'g'),
      replacement: () => `is${newCapital}EntitiesLoading`,
    },
    {
      pattern: new RegExp(`is${oldCapital}EntitiesLoading`, 'g'),
      replacement: () => `is${newCapital}EntitiesLoading`,
    },
    {
      pattern: new RegExp(`is${oldCapital}Loaded`, 'g'),
      replacement: () => `is${newCapital}EntitiesLoaded`,
    },
    {
      pattern: new RegExp(`is${oldCapital}EntitiesLoaded`, 'g'),
      replacement: () => `is${newCapital}EntitiesLoaded`,
    },
    {
      pattern: new RegExp(`${oldName}Error`, 'g'),
      replacement: () => `${newName}EntitiesError`,
    },
    {
      pattern: new RegExp(`${oldName}EntitiesError`, 'g'),
      replacement: () => `${newName}EntitiesError`,
    },
    {
      pattern: new RegExp(`set${oldCapital}Loading`, 'g'),
      replacement: () => `set${newCapital}EntitiesLoading`,
    },
    {
      pattern: new RegExp(`set${oldCapital}EntitiesLoading`, 'g'),
      replacement: () => `set${newCapital}EntitiesLoading`,
    },
    {
      pattern: new RegExp(`set${oldCapital}Loaded`, 'g'),
      replacement: () => `set${newCapital}EntitiesLoaded`,
    },
    {
      pattern: new RegExp(`set${oldCapital}EntitiesLoaded`, 'g'),
      replacement: () => `set${newCapital}EntitiesLoaded`,
    },
    {
      pattern: new RegExp(`set${oldCapital}Error`, 'g'),
      replacement: () => `set${newCapital}EntitiesError`,
    },
    {
      pattern: new RegExp(`set${oldCapital}EntitiesError`, 'g'),
      replacement: () => `set${newCapital}EntitiesError`,
    },

    // Pagination patterns
    {
      pattern: new RegExp(`${oldName}Pagination`, 'g'),
      replacement: () => `${newName}Pagination`,
    },
    {
      pattern: new RegExp(`${oldName}EntitiesPagination`, 'g'),
      replacement: () => `${newName}EntitiesPagination`,
    },
    {
      pattern: new RegExp(`${oldName}CurrentPage`, 'g'),
      replacement: () => `${newName}EntitiesCurrentPage`,
    },
    {
      pattern: new RegExp(`${oldName}EntitiesCurrentPage`, 'g'),
      replacement: () => `${newName}EntitiesCurrentPage`,
    },
    {
      pattern: new RegExp(`${oldName}PagedRequest`, 'g'),
      replacement: () => `${newName}EntitiesPagedRequest`,
    },
    {
      pattern: new RegExp(`${oldName}EntitiesPagedRequest`, 'g'),
      replacement: () => `${newName}EntitiesPagedRequest`,
    },
    {
      pattern: new RegExp(`load${oldCapital}Page`, 'g'),
      replacement: () => `load${newCapital}EntitiesPage`,
    },
    {
      pattern: new RegExp(`load${oldCapital}EntitiesPage`, 'g'),
      replacement: () => `load${newCapital}EntitiesPage`,
    },
    {
      pattern: new RegExp(`set${oldCapital}PagedResult`, 'g'),
      replacement: () => `set${newCapital}EntitiesPagedResult`,
    },
    {
      pattern: new RegExp(`set${oldCapital}EntitiesPagedResult`, 'g'),
      replacement: () => `set${newCapital}EntitiesPagedResult`,
    },
    {
      pattern: new RegExp(`loadMore${oldCapital}`, 'g'),
      replacement: () => `loadMore${newCapital}Entities`,
    },
    {
      pattern: new RegExp(`loadMore${oldCapital}Entities`, 'g'),
      replacement: () => `loadMore${newCapital}Entities`,
    },
    {
      pattern: new RegExp(`load${oldCapital}NextPage`, 'g'),
      replacement: () => `load${newCapital}EntitiesNextPage`,
    },
    {
      pattern: new RegExp(`load${oldCapital}EntitiesNextPage`, 'g'),
      replacement: () => `load${newCapital}EntitiesNextPage`,
    },
    {
      pattern: new RegExp(`load${oldCapital}PreviousPage`, 'g'),
      replacement: () => `load${newCapital}EntitiesPreviousPage`,
    },
    {
      pattern: new RegExp(`load${oldCapital}EntitiesPreviousPage`, 'g'),
      replacement: () => `load${newCapital}EntitiesPreviousPage`,
    },
    {
      pattern: new RegExp(`load${oldCapital}FirstPage`, 'g'),
      replacement: () => `load${newCapital}EntitiesFirstPage`,
    },
    {
      pattern: new RegExp(`load${oldCapital}EntitiesFirstPage`, 'g'),
      replacement: () => `load${newCapital}EntitiesFirstPage`,
    },

    // Filter patterns
    {
      pattern: new RegExp(`${oldName}Filter`, 'g'),
      replacement: () => `${newName}EntitiesFilter`,
    },
    {
      pattern: new RegExp(`${oldName}EntitiesFilter`, 'g'),
      replacement: () => `${newName}EntitiesFilter`,
    },
    {
      pattern: new RegExp(`is${oldCapital}FilterChanged`, 'g'),
      replacement: () => `is${newCapital}FilterChanged`,
    },
    {
      pattern: new RegExp(`is${oldCapital}EntitiesFilterChanged`, 'g'),
      replacement: () => `is${newCapital}EntitiesFilterChanged`,
    },
    {
      pattern: new RegExp(`reset${oldCapital}Filter`, 'g'),
      replacement: () => `reset${newCapital}Filter`,
    },
    {
      pattern: new RegExp(`reset${oldCapital}EntitiesFilter`, 'g'),
      replacement: () => `reset${newCapital}EntitiesFilter`,
    },
    {
      pattern: new RegExp(`filter${oldCapital}Entities`, 'g'),
      replacement: () => `filter${newCapital}Entities`,
    },

    // Sort patterns
    {
      pattern: new RegExp(`${oldName}Sort`, 'g'),
      replacement: () => `${newName}Sort`,
    },
    {
      pattern: new RegExp(`${oldName}EntitiesSort`, 'g'),
      replacement: () => `${newName}EntitiesSort`,
    },
    {
      pattern: new RegExp(`sort${oldCapital}`, 'g'),
      replacement: () => `sort${newCapital}Entities`,
    },
    {
      pattern: new RegExp(`sort${oldCapital}Entities`, 'g'),
      replacement: () => `sort${newCapital}Entities`,
    },

    // Single Selection patterns
    {
      pattern: new RegExp(`${oldName}IdSelected`, 'g'),
      replacement: () => `${newName}IdSelected`,
    },
    {
      pattern: new RegExp(`${oldName}EntitySelected`, 'g'),
      replacement: () => `${newName}EntitySelected`,
    },
    {
      pattern: new RegExp(`select${oldCapital}Entity`, 'g'),
      replacement: () => `select${newCapital}Entity`,
    },
    {
      pattern: new RegExp(`deselect${oldCapital}Entity`, 'g'),
      replacement: () => `deselect${newCapital}Entity`,
    },
    {
      pattern: new RegExp(`toggleSelect${oldCapital}Entity`, 'g'),
      replacement: () => `toggleSelect${newCapital}Entity`,
    },

    // Multi Selection patterns
    {
      pattern: new RegExp(`${oldName}IdsSelectedMap`, 'g'),
      replacement: () => `${newName}IdsSelectedMap`,
    },
    {
      pattern: new RegExp(`${oldName}EntitiesSelected`, 'g'),
      replacement: () => `${newName}EntitiesSelected`,
    },
    {
      pattern: new RegExp(`${oldName}IdsSelected`, 'g'),
      replacement: () => `${newName}IdsSelected`,
    },
    {
      pattern: new RegExp(`isAll${oldCapital}Selected`, 'g'),
      replacement: () => `isAll${newCapital}EntitiesSelected`,
    },
    {
      pattern: new RegExp(`isAll${oldCapital}EntitiesSelected`, 'g'),
      replacement: () => `isAll${newCapital}EntitiesSelected`,
    },
    {
      pattern: new RegExp(`toggleSelectAll${oldCapital}Entities`, 'g'),
      replacement: () => `toggleSelectAll${newCapital}Entities`,
    },
    {
      pattern: new RegExp(`select${oldCapital}Entities`, 'g'),
      replacement: () => `select${newCapital}Entities`,
    },
    {
      pattern: new RegExp(`deselect${oldCapital}Entities`, 'g'),
      replacement: () => `deselect${newCapital}Entities`,
    },
    {
      pattern: new RegExp(`toggleSelect${oldCapital}Entities`, 'g'),
      replacement: () => `toggleSelect${newCapital}Entities`,
    },
    {
      pattern: new RegExp(`clear${oldCapital}Selection`, 'g'),
      replacement: () => `clear${newCapital}Selection`,
    },

    // Collection property patterns
    {
      pattern: new RegExp(`collection\\s*=\\s*["'\`]${oldName}["'\`]`, 'g'),
      replacement: () => `collection = "${newName}"`,
    },
    {
      pattern: new RegExp(`collection\\s*:\\s*["'\`]${oldName}["'\`]`, 'g'),
      replacement: () => `collection: "${newName}"`,
    },

    // Entities patterns
    {
      pattern: new RegExp(`${oldName}Entities`, 'g'),
      replacement: () => `${newName}Entities`,
    },
    {
      pattern: new RegExp(`${oldName}Ids`, 'g'),
      replacement: () => `${newName}Ids`,
    },
    {
      pattern: new RegExp(`${oldName}EntityMap`, 'g'),
      replacement: () => `${newName}EntityMap`,
    },
  ];
}

/**
 * Apply rename patterns to file content
 */
function renameInContent(
  content: string,
  patterns: RenamePattern[],
): { modified: boolean; content: string } {
  let result = content;
  let modified = false;

  patterns.forEach((p) => {
    const newContent = result.replace(p.pattern, (match) => {
      const replacement = p.replacement(match, match);
      if (replacement !== match) {
        modified = true;
      }
      return replacement;
    });
    if (newContent !== result) {
      result = newContent;
    }
  });

  return { modified, content: result };
}

/**
 * Process files in directory
 */
function processDirectory(
  tree: Tree,
  dirPath: string,
  patterns: RenamePattern[],
  context: SchematicContext,
  stats: { filesModified: number; totalReplacements: number },
): void {
  const dir = tree.getDir(dirPath);

  dir.visit((filePath, entry) => {
    if (
      !entry ||
      filePath.includes('node_modules') ||
      filePath.includes('.git')
    ) {
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    if (!['.ts', '.html', '.json'].includes(ext)) {
      return;
    }

    const content = entry.content.toString('utf-8');
    const result = renameInContent(content, patterns);

    if (result.modified) {
      tree.overwrite(filePath, result.content);
      stats.filesModified++;
      stats.totalReplacements++;
      context.logger.info(`✅ Migrated: ${filePath}`);
    }
  });
}

/**
 * Main schematic factory function
 */
export default function renameCollection(
  options: RenameCollectionOptions,
): Rule {
  return (tree: Tree, context: SchematicContext) => {
    let {
      oldName,
      newName,
      path: targetPath = 'src',
      skipGitCheck = false,
    } = options;

    newName = newName ? newName : oldName;
    context.logger.info(
      `🔄 Renaming collection '${oldName}' to '${newName}'...\n`,
    );

    // Generate patterns
    const patterns = generateRenamePatterns(oldName, newName);

    // Process directory
    const stats = { filesModified: 0, totalReplacements: 0 };
    processDirectory(tree, targetPath, patterns, context, stats);

    // Summary
    context.logger.info('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    context.logger.info('\n✨ Rename complete!\n');
    context.logger.info(`Summary:`);
    context.logger.info(`  • ${stats.filesModified} files modified`);
    context.logger.info(
      `\n⚠️  Please review changes and run tests before committing.`,
    );
  };
}
