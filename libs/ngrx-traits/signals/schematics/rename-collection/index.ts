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
  replacement: () => string;
}

/**
 * Generate rename patterns dynamically based on collection names
 */
export function generateRenamePatterns(
  oldName: string,
  newName: string,
): RenamePattern[] {
  const oldCapital = oldName.charAt(0).toUpperCase() + oldName.slice(1);
  const newCapital = newName.charAt(0).toUpperCase() + newName.slice(1);

  return [
    // CallStatus patterns
    {
      // fix breaking change
      pattern: new RegExp(`\\b${oldName}CallStatus\\b`, 'g'),
      replacement: () => `${newName}EntitiesCallStatus`,
    },
    {
      pattern: new RegExp(`\\b${oldName}EntitiesCallStatus\\b`, 'g'),
      replacement: () => `${newName}EntitiesCallStatus`,
    },
    {
      // fix breaking change
      pattern: new RegExp(`\\bis${oldCapital}Loading\\b`, 'g'),
      replacement: () => `is${newCapital}EntitiesLoading`,
    },
    {
      pattern: new RegExp(`\\bis${oldCapital}EntitiesLoading\\b`, 'g'),
      replacement: () => `is${newCapital}EntitiesLoading`,
    },
    {
      // fix breaking change
      pattern: new RegExp(`\\bis${oldCapital}Loaded\\b`, 'g'),
      replacement: () => `is${newCapital}EntitiesLoaded`,
    },
    {
      pattern: new RegExp(`\\bis${oldCapital}EntitiesLoaded\\b`, 'g'),
      replacement: () => `is${newCapital}EntitiesLoaded`,
    },
    {
      // fix breaking change
      pattern: new RegExp(`\\b${oldName}Error\\b`, 'g'),
      replacement: () => `${newName}EntitiesError`,
    },
    {
      pattern: new RegExp(`\\b${oldName}EntitiesError\\b`, 'g'),
      replacement: () => `${newName}EntitiesError`,
    },
    {
      // fix breaking change
      pattern: new RegExp(`\\bset${oldCapital}Loading\\b`, 'g'),
      replacement: () => `set${newCapital}EntitiesLoading`,
    },
    {
      pattern: new RegExp(`\\bset${oldCapital}EntitiesLoading\\b`, 'g'),
      replacement: () => `set${newCapital}EntitiesLoading`,
    },
    {
      // fix breaking change
      pattern: new RegExp(`\\bset${oldCapital}Loaded\\b`, 'g'),
      replacement: () => `set${newCapital}EntitiesLoaded`,
    },
    {
      pattern: new RegExp(`\\bset${oldCapital}EntitiesLoaded\\b`, 'g'),
      replacement: () => `set${newCapital}EntitiesLoaded`,
    },
    {
      // fix breaking change
      pattern: new RegExp(`\\bset${oldCapital}Error\\b`, 'g'),
      replacement: () => `set${newCapital}EntitiesError`,
    },
    {
      pattern: new RegExp(`\\bset${oldCapital}EntitiesError\\b`, 'g'),
      replacement: () => `set${newCapital}EntitiesError`,
    },

    // Pagination patterns
    {
      // fix breaking change
      pattern: new RegExp(`\\b${oldName}Pagination\\b`, 'g'),
      replacement: () => `${newName}EntitiesPagination`,
    },
    {
      pattern: new RegExp(`\\b${oldName}EntitiesPagination\\b`, 'g'),
      replacement: () => `${newName}EntitiesPagination`,
    },
    {
      // fix breaking change
      pattern: new RegExp(`\\b${oldName}CurrentPage\\b`, 'g'),
      replacement: () => `${newName}EntitiesCurrentPage`,
    },
    {
      pattern: new RegExp(`\\b${oldName}EntitiesCurrentPage\\b`, 'g'),
      replacement: () => `${newName}EntitiesCurrentPage`,
    },
    {
      // fix breaking change
      pattern: new RegExp(`\\b${oldName}PagedRequest\\b`, 'g'),
      replacement: () => `${newName}EntitiesPagedRequest`,
    },
    {
      pattern: new RegExp(`\\b${oldName}EntitiesPagedRequest\\b`, 'g'),
      replacement: () => `${newName}EntitiesPagedRequest`,
    },
    {
      // fix breaking change
      pattern: new RegExp(`\\bload${oldCapital}Page\\b`, 'g'),
      replacement: () => `load${newCapital}EntitiesPage`,
    },
    {
      pattern: new RegExp(`\\bload${oldCapital}EntitiesPage\\b`, 'g'),
      replacement: () => `load${newCapital}EntitiesPage`,
    },
    {
      // fix breaking change
      pattern: new RegExp(`\\bset${oldCapital}PagedResult\\b`, 'g'),
      replacement: () => `set${newCapital}EntitiesPagedResult`,
    },
    {
      pattern: new RegExp(`\\bset${oldCapital}EntitiesPagedResult\\b`, 'g'),
      replacement: () => `set${newCapital}EntitiesPagedResult`,
    },
    {
      // fix breaking change
      pattern: new RegExp(`\\bloadMore${oldCapital}\\b`, 'g'),
      replacement: () => `loadMore${newCapital}Entities`,
    },
    {
      pattern: new RegExp(`\\bloadMore${oldCapital}Entities\\b`, 'g'),
      replacement: () => `loadMore${newCapital}Entities`,
    },
    {
      // fix breaking change
      pattern: new RegExp(`\\bload${oldCapital}NextPage\\b`, 'g'),
      replacement: () => `load${newCapital}EntitiesNextPage`,
    },
    {
      pattern: new RegExp(`\\bload${oldCapital}EntitiesNextPage\\b`, 'g'),
      replacement: () => `load${newCapital}EntitiesNextPage`,
    },
    {
      // fix breaking change
      pattern: new RegExp(`\\bload${oldCapital}PreviousPage\\b`, 'g'),
      replacement: () => `load${newCapital}EntitiesPreviousPage`,
    },
    {
      pattern: new RegExp(`\\bload${oldCapital}EntitiesPreviousPage\\b`, 'g'),
      replacement: () => `load${newCapital}EntitiesPreviousPage`,
    },
    {
      // fix breaking change
      pattern: new RegExp(`\\bload${oldCapital}FirstPage\\b`, 'g'),
      replacement: () => `load${newCapital}EntitiesFirstPage`,
    },
    {
      pattern: new RegExp(`\\bload${oldCapital}EntitiesFirstPage\\b`, 'g'),
      replacement: () => `load${newCapital}EntitiesFirstPage`,
    },

    // Filter patterns
    {
      // fix breaking change
      pattern: new RegExp(`\\b${oldName}Filter\\b`, 'g'),
      replacement: () => `${newName}EntitiesFilter`,
    },
    {
      pattern: new RegExp(`\\b${oldName}EntitiesFilter\\b`, 'g'),
      replacement: () => `${newName}EntitiesFilter`,
    },
    {
      // fix breaking change
      pattern: new RegExp(`\\bis${oldCapital}FilterChanged\\b`, 'g'),
      replacement: () => `is${newCapital}EntitiesFilterChanged`,
    },
    {
      pattern: new RegExp(`\\bis${oldCapital}EntitiesFilterChanged\\b`, 'g'),
      replacement: () => `is${newCapital}EntitiesFilterChanged`,
    },
    {
      // fix breaking change
      pattern: new RegExp(`\\breset${oldCapital}Filter\\b`, 'g'),
      replacement: () => `reset${newCapital}EntitiesFilter`,
    },
    {
      pattern: new RegExp(`\\breset${oldCapital}EntitiesFilter\\b`, 'g'),
      replacement: () => `reset${newCapital}EntitiesFilter`,
    },
    {
      pattern: new RegExp(`\\bfilter${oldCapital}Entities\\b`, 'g'),
      replacement: () => `filter${newCapital}Entities`,
    },

    // Sort patterns
    {
      // fix breaking change
      pattern: new RegExp(`\\b${oldName}Sort\\b`, 'g'),
      replacement: () => `${newName}EntitiesSort`,
    },
    {
      pattern: new RegExp(`\\b${oldName}EntitiesSort\\b`, 'g'),
      replacement: () => `${newName}EntitiesSort`,
    },
    {
      // fix breaking change
      pattern: new RegExp(`\\bsort${oldCapital}\\b`, 'g'),
      replacement: () => `sort${newCapital}Entities`,
    },
    {
      pattern: new RegExp(`\\bsort${oldCapital}Entities\\b`, 'g'),
      replacement: () => `sort${newCapital}Entities`,
    },

    // Single Selection patterns
    {
      pattern: new RegExp(`\\b${oldName}IdSelected\\b`, 'g'),
      replacement: () => `${newName}IdSelected`,
    },
    {
      pattern: new RegExp(`\\b${oldName}EntitySelected\\b`, 'g'),
      replacement: () => `${newName}EntitySelected`,
    },
    {
      pattern: new RegExp(`\\bselect${oldCapital}Entity\\b`, 'g'),
      replacement: () => `select${newCapital}Entity`,
    },
    {
      pattern: new RegExp(`\\bdeselect${oldCapital}Entity\\b`, 'g'),
      replacement: () => `deselect${newCapital}Entity`,
    },
    {
      pattern: new RegExp(`\\btoggleSelect${oldCapital}Entity\\b`, 'g'),
      replacement: () => `toggleSelect${newCapital}Entity`,
    },

    // Multi Selection patterns
    {
      pattern: new RegExp(`\\b${oldName}IdsSelectedMap\\b`, 'g'),
      replacement: () => `${newName}IdsSelectedMap`,
    },
    {
      pattern: new RegExp(`\\b${oldName}EntitiesSelected\\b`, 'g'),
      replacement: () => `${newName}EntitiesSelected`,
    },
    {
      pattern: new RegExp(`\\b${oldName}IdsSelected\\b`, 'g'),
      replacement: () => `${newName}IdsSelected`,
    },
    {
      // fix breaking change
      pattern: new RegExp(`\\bisAll${oldCapital}Selected\\b`, 'g'),
      replacement: () => `isAll${newCapital}EntitiesSelected`,
    },
    {
      pattern: new RegExp(`\\bisAll${oldCapital}EntitiesSelected\\b`, 'g'),
      replacement: () => `isAll${newCapital}EntitiesSelected`,
    },
    {
      pattern: new RegExp(`\\btoggleSelectAll${oldCapital}Entities\\b`, 'g'),
      replacement: () => `toggleSelectAll${newCapital}Entities`,
    },
    {
      pattern: new RegExp(`\\bselect${oldCapital}Entities\\b`, 'g'),
      replacement: () => `select${newCapital}Entities`,
    },
    {
      pattern: new RegExp(`\\bdeselect${oldCapital}Entities\\b`, 'g'),
      replacement: () => `deselect${newCapital}Entities`,
    },
    {
      pattern: new RegExp(`\\btoggleSelect${oldCapital}Entities\\b`, 'g'),
      replacement: () => `toggleSelect${newCapital}Entities`,
    },
    {
      // fix breaking change
      pattern: new RegExp(`\\bclear${oldCapital}Selection\\b`, 'g'),
      replacement: () => `clear${newCapital}EntitiesSelection`,
    },

    // Collection property patterns (no word boundaries - matching inside strings)
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
      pattern: new RegExp(`\\b${oldName}Entities\\b`, 'g'),
      replacement: () => `${newName}Entities`,
    },
    {
      pattern: new RegExp(`\\b${oldName}Ids\\b`, 'g'),
      replacement: () => `${newName}Ids`,
    },
    {
      pattern: new RegExp(`\\b${oldName}EntityMap\\b`, 'g'),
      replacement: () => `${newName}EntityMap`,
    },
  ];
}

/**
 * Apply rename patterns to file content
 */
export function renameInContent(
  content: string,
  patterns: RenamePattern[],
): { modified: boolean; content: string } {
  let result = content;
  let modified = false;

  patterns.forEach((p) => {
    const newContent = result.replace(p.pattern, (match) => {
      const replacement = p.replacement();
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
