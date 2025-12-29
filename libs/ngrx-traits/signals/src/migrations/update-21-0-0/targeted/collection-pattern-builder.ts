/**
 * Collection Pattern Builder - Build specific patterns for each collection name
 */

export interface CollectionPattern {
  pattern: RegExp;
  replacement: string;
}

/**
 * Capitalize first letter
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Build all rename patterns for a specific collection name
 */
export function buildPatternsForCollection(collectionName: string): CollectionPattern[] {
  const cap = capitalize(collectionName);

  return [
    // CallStatus patterns
    {
      pattern: new RegExp(`\\b${collectionName}CallStatus\\b`, 'g'),
      replacement: `${collectionName}EntitiesCallStatus`,
    },
    {
      pattern: new RegExp(`\\b${collectionName}Error\\b`, 'g'),
      replacement: `${collectionName}EntitiesError`,
    },
    {
      pattern: new RegExp(`\\bis${cap}Loading\\b`, 'g'),
      replacement: `is${cap}EntitiesLoading`,
    },
    {
      pattern: new RegExp(`\\bis${cap}Loaded\\b`, 'g'),
      replacement: `is${cap}EntitiesLoaded`,
    },
    {
      pattern: new RegExp(`\\bset${cap}Loading\\b`, 'g'),
      replacement: `set${cap}EntitiesLoading`,
    },
    {
      pattern: new RegExp(`\\bset${cap}Loaded\\b`, 'g'),
      replacement: `set${cap}EntitiesLoaded`,
    },
    {
      pattern: new RegExp(`\\bset${cap}Error\\b`, 'g'),
      replacement: `set${cap}EntitiesError`,
    },

    // Filter patterns
    {
      pattern: new RegExp(`\\b${collectionName}Filter\\b`, 'g'),
      replacement: `${collectionName}EntitiesFilter`,
    },
    {
      pattern: new RegExp(`\\bis${cap}FilterChanged\\b`, 'g'),
      replacement: `is${cap}EntitiesFilterChanged`,
    },
    {
      pattern: new RegExp(`\\breset${cap}Filter\\b`, 'g'),
      replacement: `reset${cap}EntitiesFilter`,
    },

    // Sort patterns
    {
      pattern: new RegExp(`\\b${collectionName}Sort\\b`, 'g'),
      replacement: `${collectionName}EntitiesSort`,
    },
    {
      pattern: new RegExp(`\\bsort${cap}\\b`, 'g'),
      replacement: `sort${cap}Entities`,
    },

    // Pagination patterns
    {
      pattern: new RegExp(`\\b${collectionName}Pagination\\b`, 'g'),
      replacement: `${collectionName}EntitiesPagination`,
    },
    {
      pattern: new RegExp(`\\b${collectionName}CurrentPage\\b`, 'g'),
      replacement: `${collectionName}EntitiesCurrentPage`,
    },
    {
      pattern: new RegExp(`\\b${collectionName}PagedRequest\\b`, 'g'),
      replacement: `${collectionName}EntitiesPagedRequest`,
    },
    {
      pattern: new RegExp(`\\bload${cap}Page\\b`, 'g'),
      replacement: `load${cap}EntitiesPage`,
    },
    {
      pattern: new RegExp(`\\bset${cap}PagedResult\\b`, 'g'),
      replacement: `set${cap}EntitiesPagedResult`,
    },
    {
      pattern: new RegExp(`\\bloadMore${cap}\\b`, 'g'),
      replacement: `loadMore${cap}Entities`,
    },
    {
      pattern: new RegExp(`\\bload${cap}NextPage\\b`, 'g'),
      replacement: `load${cap}EntitiesNextPage`,
    },
    {
      pattern: new RegExp(`\\bload${cap}PreviousPage\\b`, 'g'),
      replacement: `load${cap}EntitiesPreviousPage`,
    },
    {
      pattern: new RegExp(`\\bload${cap}FirstPage\\b`, 'g'),
      replacement: `load${cap}EntitiesFirstPage`,
    },

    // Selection patterns
    {
      pattern: new RegExp(`\\bisAll${cap}Selected\\b`, 'g'),
      replacement: `isAll${cap}EntitiesSelected`,
    },
    {
      pattern: new RegExp(`\\bclear${cap}Selection\\b`, 'g'),
      replacement: `clear${cap}EntitiesSelection`,
    },
  ];
}

/**
 * Build patterns for all collections
 */
export function buildPatternsForCollections(
  collections: Set<string>
): Map<string, CollectionPattern[]> {
  const result = new Map<string, CollectionPattern[]>();

  for (const collection of collections) {
    result.set(collection, buildPatternsForCollection(collection));
  }

  return result;
}
