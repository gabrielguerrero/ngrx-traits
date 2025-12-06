/**
 * Pattern matchers for renaming properties to Entities suffix convention
 * Handles 17 patterns across CallStatus, Pagination, Filter, and Sort traits
 */

export interface RenamePattern {
  pattern: RegExp;
  replacement: (match: string, name: string) => string;
  description: string;
}

const createCallStatusPatterns = (): RenamePattern[] => [
  {
    pattern: /((?!with)\w+)CallStatus(?!Entities)/g,
    replacement: (match, name) => `${name}EntitiesCallStatus`,
    description: '{name}CallStatus → {name}EntitiesCallStatus',
  },
  {
    pattern: /(\w+)Error(?!Entities)/g,
    replacement: (match, name) => `${name}EntitiesError`,
    description: '{name}Error → {name}EntitiesError',
  },
  {
    pattern: /is(\w+)Loading(?!Entities)/g,
    replacement: (match, name) => `is${name}EntitiesLoading`,
    description: 'is{Name}Loading → is{Name}EntitiesLoading',
  },
  {
    pattern: /is(\w+)Loaded(?!Entities)/g,
    replacement: (match, name) => `is${name}EntitiesLoaded`,
    description: 'is{Name}Loaded → is{Name}EntitiesLoaded',
  },
  {
    pattern: /set(\w+)Loading\(\)/g,
    replacement: (match, name) => `set${name}EntitiesLoading()`,
    description: 'set{Name}Loading() → set{Name}EntitiesLoading()',
  },
  {
    pattern: /set(\w+)Loaded\(\)/g,
    replacement: (match, name) => `set${name}EntitiesLoaded()`,
    description: 'set{Name}Loaded() → set{Name}EntitiesLoaded()',
  },
  {
    pattern: /set(\w+)Error\(/g,
    replacement: (match, name) => `set${name}EntitiesError(`,
    description: 'set{Name}Error( → set{Name}EntitiesError(',
  },
];

const createPaginationPatterns = (): RenamePattern[] => [
  {
    pattern: /(\w+)Pagination(?!Entities)/g,
    replacement: (match, name) => `${name}EntitiesPagination`,
    description: '{name}Pagination → {name}EntitiesPagination',
  },
  {
    pattern: /(\w+)CurrentPage(?!Entities)/g,
    replacement: (match, name) => `${name}EntitiesCurrentPage`,
    description: '{name}CurrentPage → {name}EntitiesCurrentPage',
  },
  {
    pattern: /(\w+)PagedRequest(?!Entities)/g,
    replacement: (match, name) => `${name}EntitiesPagedRequest`,
    description: '{name}PagedRequest → {name}EntitiesPagedRequest',
  },
  {
    pattern: /load(\w+)Page\(\)/g,
    replacement: (match, name) => `load${name}EntitiesPage()`,
    description: 'load{Name}Page() → load{Name}EntitiesPage()',
  },
  {
    pattern: /set(\w+)PagedResult\(/g,
    replacement: (match, name) => `set${name}EntitiesPagedResult(`,
    description: 'set{Name}PagedResult( → set{Name}EntitiesPagedResult(',
  },
  {
    pattern: /loadMore(\w+)\(\)/g,
    replacement: (match, name) => `loadMore${name}Entities()`,
    description: 'loadMore{Name}() → loadMore{Name}Entities()',
  },
  {
    pattern: /load(\w+)NextPage\(\)/g,
    replacement: (match, name) => `load${name}EntitiesNextPage()`,
    description: 'load{Name}NextPage() → load{Name}EntitiesNextPage()',
  },
  {
    pattern: /load(\w+)PreviousPage\(\)/g,
    replacement: (match, name) => `load${name}EntitiesPreviousPage()`,
    description: 'load{Name}PreviousPage() → load{Name}EntitiesPreviousPage()',
  },
  {
    pattern: /load(\w+)FirstPage\(\)/g,
    replacement: (match, name) => `load${name}EntitiesFirstPage()`,
    description: 'load{Name}FirstPage() → load{Name}EntitiesFirstPage()',
  },
];

const createFilterPatterns = (): RenamePattern[] => [
  {
    pattern: /(\w+)Filter(?!Entities)/g,
    replacement: (match, name) => `${name}EntitiesFilter`,
    description: '{name}Filter → {name}EntitiesFilter',
  },
  {
    pattern: /is(\w+)FilterChanged(?!Entities)/g,
    replacement: (match, name) => `is${name}EntitiesFilterChanged`,
    description: 'is{Name}FilterChanged → is{Name}EntitiesFilterChanged',
  },
  {
    pattern: /reset(\w+)Filter\(\)/g,
    replacement: (match, name) => `reset${name}EntitiesFilter()`,
    description: 'reset{Name}Filter() → reset{Name}EntitiesFilter()',
  },
];

const createSortPatterns = (): RenamePattern[] => [
  {
    pattern: /(\w+)Sort(?!Entities)/g,
    replacement: (match, name) => `${name}EntitiesSort`,
    description: '{name}Sort → {name}EntitiesSort',
  },
  {
    pattern: /sort(\w+)\(\)/g,
    replacement: (match, name) => `sort${name}Entities()`,
    description: 'sort{Name}() → sort{Name}Entities()',
  },
];

/**
 * Get all rename patterns
 */
export function getAllPatterns(): RenamePattern[] {
  return [
    ...createCallStatusPatterns(),
    ...createPaginationPatterns(),
    ...createFilterPatterns(),
    ...createSortPatterns(),
  ];
}

/**
 * Get patterns by category
 */
export function getPatternsByCategory(
  category: 'callStatus' | 'pagination' | 'filter' | 'sort',
): RenamePattern[] {
  switch (category) {
    case 'callStatus':
      return createCallStatusPatterns();
    case 'pagination':
      return createPaginationPatterns();
    case 'filter':
      return createFilterPatterns();
    case 'sort':
      return createSortPatterns();
  }
}

/**
 * Check if a string should be skipped (already has Entity/Entities)
 */
export function shouldSkip(text: string): boolean {
  return /Entity|Entities/.test(text);
}
