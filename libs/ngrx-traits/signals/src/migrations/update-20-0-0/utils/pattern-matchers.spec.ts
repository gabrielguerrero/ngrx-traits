/**
 * Tests for pattern matchers
 */

import { getAllPatterns, getPatternsByCategory, shouldSkip } from './pattern-matchers';

describe('Pattern Matchers', () => {
  describe('getAllPatterns', () => {
    it('should return 17 patterns', () => {
      const patterns = getAllPatterns();
      expect(patterns.length).toBe(17);
    });

    it('should include all categories', () => {
      const patterns = getAllPatterns();
      const descriptions = patterns.map(p => p.description);

      expect(descriptions.some(d => d.includes('CallStatus'))).toBe(true);
      expect(descriptions.some(d => d.includes('Pagination'))).toBe(true);
      expect(descriptions.some(d => d.includes('Filter'))).toBe(true);
      expect(descriptions.some(d => d.includes('Sort'))).toBe(true);
    });
  });

  describe('getPatternsByCategory', () => {
    it('should return 7 CallStatus patterns', () => {
      const patterns = getPatternsByCategory('callStatus');
      expect(patterns.length).toBe(7);
    });

    it('should return 9 Pagination patterns', () => {
      const patterns = getPatternsByCategory('pagination');
      expect(patterns.length).toBe(9);
    });

    it('should return 3 Filter patterns', () => {
      const patterns = getPatternsByCategory('filter');
      expect(patterns.length).toBe(3);
    });

    it('should return 2 Sort patterns', () => {
      const patterns = getPatternsByCategory('sort');
      expect(patterns.length).toBe(2);
    });
  });

  describe('CallStatus patterns', () => {
    const patterns = getPatternsByCategory('callStatus');

    it('should rename {name}CallStatus to {name}EntitiesCallStatus', () => {
      const pattern = patterns.find(p => p.description.includes('{name}CallStatus →'));
      const text = 'productCallStatus';
      const result = text.replace(pattern!.pattern, (m, ...args) => {
        const name = args[0] || m;
        return pattern!.replacement(m, name);
      });
      expect(result).toBe('productEntitiesCallStatus');
    });

    it('should skip if already contains Entities', () => {
      expect(shouldSkip('productEntitiesCallStatus')).toBe(true);
    });

    it('should rename is{Name}Loading', () => {
      const pattern = patterns.find(p => p.description.includes('is{Name}Loading →'));
      const text = 'isProductLoading';
      const result = text.replace(pattern!.pattern, (m, ...args) => {
        const name = args[0] || m;
        return pattern!.replacement(m, name);
      });
      expect(result).toBe('isProductEntitiesLoading');
    });

    it('should rename set{Name}Error(', () => {
      const pattern = patterns.find(p => p.description.includes('set{Name}Error('));
      const text = 'setProductError(';
      const result = text.replace(pattern!.pattern, (m, ...args) => {
        const name = args[0] || m;
        return pattern!.replacement(m, name);
      });
      expect(result).toBe('setProductEntitiesError(');
    });
  });

  describe('Pagination patterns', () => {
    const patterns = getPatternsByCategory('pagination');

    it('should rename {name}Pagination', () => {
      const pattern = patterns.find(p => p.description.includes('{name}Pagination →'));
      const text = 'productPagination';
      const result = text.replace(pattern!.pattern, (m, ...args) => {
        const name = args[0] || m;
        return pattern!.replacement(m, name);
      });
      expect(result).toBe('productEntitiesPagination');
    });

    it('should rename load{Name}Page()', () => {
      const pattern = patterns.find(p => p.description.includes('load{Name}Page()'));
      const text = 'loadProductPage()';
      const result = text.replace(pattern!.pattern, (m, ...args) => {
        const name = args[0] || m;
        return pattern!.replacement(m, name);
      });
      expect(result).toBe('loadProductEntitiesPage()');
    });

    it('should rename loadMore{Name}()', () => {
      const pattern = patterns.find(p => p.description.includes('loadMore{Name}()'));
      const text = 'loadMoreProduct()';
      const result = text.replace(pattern!.pattern, (m, ...args) => {
        const name = args[0] || m;
        return pattern!.replacement(m, name);
      });
      expect(result).toBe('loadMoreProductEntities()');
    });
  });

  describe('Filter patterns', () => {
    const patterns = getPatternsByCategory('filter');

    it('should rename {name}Filter', () => {
      const pattern = patterns.find(p => p.description.includes('{name}Filter →'));
      const text = 'productFilter';
      const result = text.replace(pattern!.pattern, (m, ...args) => {
        const name = args[0] || m;
        return pattern!.replacement(m, name);
      });
      expect(result).toBe('productEntitiesFilter');
    });

    it('should rename is{Name}FilterChanged', () => {
      const pattern = patterns.find(p => p.description.includes('is{Name}FilterChanged'));
      const text = 'isProductFilterChanged';
      const result = text.replace(pattern!.pattern, (m, ...args) => {
        const name = args[0] || m;
        return pattern!.replacement(m, name);
      });
      expect(result).toBe('isProductEntitiesFilterChanged');
    });

    it('should rename reset{Name}Filter()', () => {
      const pattern = patterns.find(p => p.description.includes('reset{Name}Filter()'));
      const text = 'resetProductFilter()';
      const result = text.replace(pattern!.pattern, (m, ...args) => {
        const name = args[0] || m;
        return pattern!.replacement(m, name);
      });
      expect(result).toBe('resetProductEntitiesFilter()');
    });
  });

  describe('Sort patterns', () => {
    const patterns = getPatternsByCategory('sort');

    it('should rename {name}Sort', () => {
      const pattern = patterns.find(p => p.description.includes('{name}Sort →'));
      const text = 'productSort';
      const result = text.replace(pattern!.pattern, (m, ...args) => {
        const name = args[0] || m;
        return pattern!.replacement(m, name);
      });
      expect(result).toBe('productEntitiesSort');
    });

    it('should rename sort{Name}()', () => {
      const pattern = patterns.find(p => p.description.includes('sort{Name}()'));
      const text = 'sortProduct()';
      const result = text.replace(pattern!.pattern, (m, ...args) => {
        const name = args[0] || m;
        return pattern!.replacement(m, name);
      });
      expect(result).toBe('sortProductEntities()');
    });
  });

  describe('shouldSkip', () => {
    it('should return true for text containing Entity', () => {
      expect(shouldSkip('productEntity')).toBe(true);
    });

    it('should return true for text containing Entities', () => {
      expect(shouldSkip('productEntities')).toBe(true);
    });

    it('should return false for text without Entity/Entities', () => {
      expect(shouldSkip('productFilter')).toBe(false);
    });
  });
});
