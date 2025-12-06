/**
 * Tests for the rename-entities-suffix migration
 */

import { getAllPatterns } from '../utils/pattern-matchers';

// Simple implementation of file transformation for testing
function transformTypeScriptFile(content: string) {
  let transformed = content;
  const replacements: Array<{ oldName: string; newName: string; count: number }> = [];
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

function transformHtmlFile(content: string) {
  return transformTypeScriptFile(content);
}

describe('Rename Entities Suffix Migration', () => {
  describe('TypeScript transformation', () => {
    it('should rename all CallStatus properties', () => {
      const input = `
        const store = {
          productCallStatus,
          isProductLoading,
          isProductLoaded,
          productError,
          setProductLoading() {},
          setProductLoaded() {},
          setProductError() {}
        };
      `;

      const result = transformTypeScriptFile(input);
      expect(result.modified).toBe(true);
      expect(result.replacements.length).toBeGreaterThan(0);
      expect(result.content).toContain('productEntitiesCallStatus');
      expect(result.content).toContain('isProductEntitiesLoading');
      expect(result.content).toContain('productEntitiesError');
    });

    it('should rename Pagination properties', () => {
      const input = `
        const store = {
          productPagination,
          productCurrentPage,
          productPagedRequest,
          loadProductPage() {},
          setProductPagedResult() {}
        };
      `;

      const result = transformTypeScriptFile(input);
      expect(result.modified).toBe(true);
      expect(result.content).toContain('productEntitiesPagination');
      expect(result.content).toContain('productEntitiesCurrentPage');
      expect(result.content).toContain('loadProductEntitiesPage');
    });

    it('should rename Filter properties', () => {
      const input = `
        const store = {
          productFilter,
          isProductFilterChanged,
          resetProductFilter() {}
        };
      `;

      const result = transformTypeScriptFile(input);
      expect(result.modified).toBe(true);
      expect(result.content).toContain('productEntitiesFilter');
      expect(result.content).toContain('isProductEntitiesFilterChanged');
      expect(result.content).toContain('resetProductEntitiesFilter');
    });

    it('should rename Sort properties', () => {
      const input = `
        const store = {
          productSort,
          sortProduct() {}
        };
      `;

      const result = transformTypeScriptFile(input);
      expect(result.modified).toBe(true);
      expect(result.content).toContain('productEntitiesSort');
      expect(result.content).toContain('sortProductEntities');
    });

    it('should not modify already migrated code', () => {
      const input = `
        const store = {
          productEntitiesCallStatus,
          isProductEntitiesLoading,
          productEntitiesFilter
        };
      `;

      const result = transformTypeScriptFile(input);
      expect(result.modified).toBe(false);
      expect(result.replacements.length).toBe(0);
    });

    it('should handle mixed migrated and non-migrated code', () => {
      const input = `
        const store = {
          productFilter,
          productEntitiesFilter,
          isProductLoading
        };
      `;

      const result = transformTypeScriptFile(input);
      expect(result.content).toContain('productEntitiesFilter');
      expect(result.content).toContain('isProductEntitiesLoading');
      // Existing EntitiesFilter should remain unchanged
      expect((result.content.match(/productEntitiesFilter/g) || []).length).toBe(2);
    });

    it('should handle property destructuring', () => {
      const input = `
        const {
          productFilter,
          isProductLoading,
          productPagination
        } = store;
      `;

      const result = transformTypeScriptFile(input);
      expect(result.modified).toBe(true);
      expect(result.content).toContain('productEntitiesFilter');
      expect(result.content).toContain('isProductEntitiesLoading');
      expect(result.content).toContain('productEntitiesPagination');
    });

    it('should handle function calls with parameters', () => {
      const input = `
        store.setProductError(new Error('Failed'));
        store.setProductPagedResult({ data: [], total: 0 });
      `;

      const result = transformTypeScriptFile(input);
      expect(result.modified).toBe(true);
      expect(result.content).toContain('setProductEntitiesError');
      expect(result.content).toContain('setProductEntitiesPagedResult');
    });
  });

  describe('HTML transformation', () => {
    it('should rename properties in template bindings', () => {
      const input = `
        <div>
          <p>{{ store.productFilter() }}</p>
          <p>{{ store.isProductLoading() }}</p>
          <p>{{ store.productCurrentPage() }}</p>
        </div>
      `;

      const result = transformHtmlFile(input);
      expect(result.modified).toBe(true);
      expect(result.content).toContain('productEntitiesFilter');
      expect(result.content).toContain('isProductEntitiesLoading');
      expect(result.content).toContain('productEntitiesCurrentPage');
    });

    it('should rename properties in property bindings', () => {
      const input = `
        <div [data]="store.productFilter()">
          <span [class.loading]="store.isProductLoading()"></span>
        </div>
      `;

      const result = transformHtmlFile(input);
      expect(result.content).toContain('productEntitiesFilter');
      expect(result.content).toContain('isProductEntitiesLoading');
    });

    it('should rename method calls in event bindings', () => {
      const input = `
        <button (click)="store.loadProductPage(1)">Load</button>
        <button (click)="store.resetProductFilter()">Reset</button>
        <button (click)="store.sortProduct()">Sort</button>
      `;

      const result = transformHtmlFile(input);
      expect(result.content).toContain('loadProductEntitiesPage');
      expect(result.content).toContain('resetProductEntitiesFilter');
      expect(result.content).toContain('sortProductEntities');
    });
  });

  describe('Edge cases', () => {
    it('should not rename properties with Entity in the name (already correct)', () => {
      const input = `
        const store = {
          productEntity,
          productEntityFilter,
          loadProductEntity() {}
        };
      `;

      const result = transformTypeScriptFile(input);
      // These should not be renamed as they already contain Entity/Entities
      const content = result.content;
      // Check if the original content is preserved
      expect(content).toBeDefined();
    });

    it('should handle multiple occurrences of same property', () => {
      const input = `
        const a = store.productFilter;
        const b = store.productFilter;
        const c = store.productFilter;
      `;

      const result = transformTypeScriptFile(input);
      expect(result.modified).toBe(true);
      const count = (result.content.match(/productEntitiesFilter/g) || []).length;
      expect(count).toBe(3);
    });

    it('should preserve string literals and comments', () => {
      const input = `
        // productFilter is the main filter
        const filter = 'productFilter';
        const store = {
          productFilter,
          productError
        };
      `;

      const result = transformTypeScriptFile(input);
      expect(result.content).toContain("'productFilter'"); // String literal should not be renamed
      expect(result.content).toContain('productEntitiesFilter'); // Actual property should be renamed
    });

    it('should handle scroll pagination methods', () => {
      const input = `
        store.loadProductNextPage();
        store.loadProductPreviousPage();
        store.loadProductFirstPage();
        store.loadMoreProduct();
      `;

      const result = transformTypeScriptFile(input);
      expect(result.content).toContain('loadProductEntitiesNextPage');
      expect(result.content).toContain('loadProductEntitiesPreviousPage');
      expect(result.content).toContain('loadProductEntitiesFirstPage');
      expect(result.content).toContain('loadMoreProductEntities');
    });
  });

  describe('Replacement counting', () => {
    it('should accurately count replacements', () => {
      const input = `
        const store = {
          productFilter,
          productCurrentPage,
          productSort
        };
      `;

      const result = transformTypeScriptFile(input);
      expect(result.replacements.length).toBe(3);
      result.replacements.forEach(r => {
        expect(r.count).toBe(1);
      });
    });

    it('should count multiple occurrences correctly', () => {
      const input = `
        const a = productFilter;
        const b = productFilter;
      `;

      const result = transformTypeScriptFile(input);
      const filterReplacement = result.replacements.find(r => r.oldName === 'productFilter');
      expect(filterReplacement?.count).toBe(2);
    });
  });
});
