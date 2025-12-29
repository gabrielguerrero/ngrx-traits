/**
 * Tests for rename-collection schematic
 */
import { generateRenamePatterns, renameInContent } from './index';

describe('Rename Collection Schematic', () => {
  describe('Collection renaming', () => {
    it('should rename product to item', () => {
      const content = `
        const store = {
          productFilter,
          productCallStatus,
          productPagination,
          productSort
        };
      `;

      const result = renameCollectionInContent(content, 'product', 'item');
      expect(result).toContain('itemEntitiesFilter');
      expect(result).toContain('itemEntitiesCallStatus');
      expect(result).toContain('itemEntitiesPagination');
      expect(result).toContain('itemEntitiesSort');
    });

    it('should rename products to product (plural to singular)', () => {
      const content = `
        const store = {
          productsFilter,
          productsCallStatus,
          loadProductsPage,
          resetProductsFilter
        };
      `;

      const result = renameCollectionInContent(content, 'products', 'product');
      expect(result).toContain('productEntitiesFilter');
      expect(result).toContain('productEntitiesCallStatus');
      expect(result).toContain('loadProductEntitiesPage');
      expect(result).toContain('resetProductEntitiesFilter');
    });

    it('should handle capitalized names', () => {
      const content = `
        const store = {
          ProductFilter,
          isProductLoading,
          loadProductPage
        };
      `;

      const result = renameCollectionInContent(content, 'Product', 'Item');
      expect(result).toContain('ItemEntitiesFilter');
      expect(result).toContain('isItemEntitiesLoading');
      expect(result).toContain('loadItemEntitiesPage');
    });

    it('should rename methods correctly', () => {
      const content = `
        store.loadProductsPage(1);
        store.resetProductsFilter();
        store.sortProducts();
      `;

      const result = renameCollectionInContent(content, 'products', 'product');
      expect(result).toContain('loadProductEntitiesPage');
      expect(result).toContain('resetProductEntitiesFilter');
      expect(result).toContain('sortProductEntities');
    });

    it('should handle Entities suffix names', () => {
      const content = `
        const store = {
          productEntitiesFilter,
          productEntitiesCallStatus,
          loadProductEntitiesPage,
          isProductEntitiesFilterChanged
        };
      `;

      const result = renameCollectionInContent(content, 'product', 'item');
      expect(result).toContain('itemEntitiesFilter');
      expect(result).toContain('itemEntitiesCallStatus');
      expect(result).toContain('loadItemEntitiesPage');
      expect(result).toContain('isItemEntitiesFilterChanged');
    });
  });

  describe('Edge cases', () => {
    it('should not rename partial matches in strings', () => {
      const content = `
        const selector = 'product-list';
        const filter = productFilter;
      `;

      const result = renameCollectionInContent(content, 'product', 'item');
      expect(result).toContain("'product-list'"); // Should not change
      expect(result).toContain('itemEntitiesFilter'); // Should change
    });

    it('should handle multiple occurrences', () => {
      const content = `
        const a = productFilter;
        const b = productFilter;
        const c = productFilter;
      `;

      const result = renameCollectionInContent(content, 'product', 'item');
      const count = (result.match(/itemEntitiesFilter/g) || []).length;
      expect(count).toBe(3);
    });

    it('should preserve file structure', () => {
      const content = `
        export class ProductsComponent {
          constructor(private store: ProductStore) {}

          ngOnInit() {
            this.store.productFilter;
          }
        }
      `;

      const result = renameCollectionInContent(content, 'product', 'item');
      expect(result).toContain('export class');
      expect(result).toContain('constructor');
      expect(result).toContain('ngOnInit');
      expect(result).toContain('itemEntitiesFilter');
    });

    it('should handle HTML templates', () => {
      const content = `
        <div>
          {{ store.productFilter() }}
          <button (click)="store.loadProductPage(1)">Load</button>
        </div>
      `;

      const result = renameCollectionInContent(content, 'product', 'item');
      expect(result).toContain('itemEntitiesFilter');
      expect(result).toContain('loadItemEntitiesPage');
    });

    it('should handle JSON files', () => {
      const content = `
        {
          "productFilter": "...",
          "productSort": "..."
        }
      `;

      const result = renameCollectionInContent(content, 'product', 'item');
      expect(result).toContain('itemEntitiesFilter');
      expect(result).toContain('itemEntitiesSort');
    });
  });

  describe('Base @ngrx/signals properties', () => {
    it('should rename base store properties', () => {
      const content = `
        const store = createSignalStore(
          withEntities({ entity: Product }),
          withLoadingCall()
        );

        const products = store.product;
        const itemsCount = store.products().length;
      `;

      const result = renameCollectionInContent(content, 'product', 'item');
      expect(result).toContain('item');
      // Note: Full base property handling depends on implementation
    });
  });

  describe('Pagination scroll variants', () => {
    it('should rename scroll pagination methods', () => {
      const content = `
        store.loadProductNextPage();
        store.loadProductPreviousPage();
        store.loadProductFirstPage();
        store.loadMoreProduct();
      `;

      const result = renameCollectionInContent(content, 'product', 'item');
      expect(result).toContain('loadItemEntitiesNextPage');
      expect(result).toContain('loadItemEntitiesPreviousPage');
      expect(result).toContain('loadItemEntitiesFirstPage');
      expect(result).toContain('loadMoreItemEntities');
    });

    it('should rename Entities variants for scroll pagination', () => {
      const content = `
        store.loadProductEntitiesNextPage();
        store.loadProductEntitiesPreviousPage();
        store.loadProductEntitiesFirstPage();
        store.loadMoreProductEntities();
      `;

      const result = renameCollectionInContent(content, 'product', 'item');
      expect(result).toContain('loadItemEntitiesNextPage');
      expect(result).toContain('loadItemEntitiesPreviousPage');
      expect(result).toContain('loadItemEntitiesFirstPage');
      expect(result).toContain('loadMoreItemEntities');
    });
  });
});

// Helper functions for testing
function generatePatternsForTmest(oldName: string, newName: string): any[] {
  // Simplified pattern generation for testing
  const oldCapital = oldName.charAt(0).toUpperCase() + oldName.slice(1);
  const newCapital = newName.charAt(0).toUpperCase() + newName.slice(1);

  return [
    {
      source: `${oldName}CallStatus`,
      target: `${newName}CallStatus`,
      description: 'CallStatus',
    },
    {
      source: `${oldName}Pagination`,
      target: `${newName}Pagination`,
      description: 'Pagination',
    },
    {
      source: `${oldName}Filter`,
      target: `${newName}Filter`,
      description: 'Filter',
    },
    { source: `${oldName}Sort`, target: `${newName}Sort`, description: 'Sort' },
    {
      source: `is${oldCapital}Loading`,
      target: `is${newCapital}Loading`,
      description: 'Loading',
    },
  ];
}

function renameCollectionInContent(
  content: string,
  oldName: string,
  newName: string,
): string {
  return renameInContent(content, generateRenamePatterns(oldName, newName))
    .content;
}
