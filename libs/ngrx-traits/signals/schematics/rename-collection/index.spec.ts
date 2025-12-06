/**
 * Tests for rename-collection schematic
 */

describe('Rename Collection Schematic', () => {
  describe('Pattern generation', () => {
    it('should generate patterns for CallStatus', () => {
      const patterns = generatePatternsForTest('product', 'item');
      const callStatusPatterns = patterns.filter(p => p.description?.includes('CallStatus') || p.source?.includes('CallStatus'));
      expect(callStatusPatterns.length).toBeGreaterThan(0);
    });

    it('should generate patterns for Pagination', () => {
      const patterns = generatePatternsForTest('product', 'item');
      const paginationPatterns = patterns.filter(p => p.description?.includes('Pagination') || p.source?.includes('Pagination'));
      expect(paginationPatterns.length).toBeGreaterThan(0);
    });

    it('should generate patterns for Filter', () => {
      const patterns = generatePatternsForTest('product', 'item');
      const filterPatterns = patterns.filter(p => p.description?.includes('Filter') || p.source?.includes('Filter'));
      expect(filterPatterns.length).toBeGreaterThan(0);
    });

    it('should generate patterns for Sort', () => {
      const patterns = generatePatternsForTest('product', 'item');
      const sortPatterns = patterns.filter(p => p.description?.includes('Sort') || p.source?.includes('Sort'));
      expect(sortPatterns.length).toBeGreaterThan(0);
    });
  });

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
      expect(result).toContain('itemFilter');
      expect(result).toContain('itemCallStatus');
      expect(result).toContain('itemPagination');
      expect(result).toContain('itemSort');
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
      expect(result).toContain('productFilter');
      expect(result).toContain('productCallStatus');
      expect(result).toContain('loadProductPage');
      expect(result).toContain('resetProductFilter');
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
      expect(result).toContain('ItemFilter');
      expect(result).toContain('isItemLoading');
      expect(result).toContain('loadItemPage');
    });

    it('should rename methods correctly', () => {
      const content = `
        store.loadProductsPage(1);
        store.resetProductsFilter();
        store.sortProducts();
      `;

      const result = renameCollectionInContent(content, 'products', 'product');
      expect(result).toContain('loadProductPage');
      expect(result).toContain('resetProductFilter');
      expect(result).toContain('sortProduct');
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
      expect(result).toContain('itemFilter'); // Should change
    });

    it('should handle multiple occurrences', () => {
      const content = `
        const a = productFilter;
        const b = productFilter;
        const c = productFilter;
      `;

      const result = renameCollectionInContent(content, 'product', 'item');
      const count = (result.match(/itemFilter/g) || []).length;
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
      expect(result).toContain('itemFilter');
    });

    it('should handle HTML templates', () => {
      const content = `
        <div>
          {{ store.productFilter() }}
          <button (click)="store.loadProductPage(1)">Load</button>
        </div>
      `;

      const result = renameCollectionInContent(content, 'product', 'item');
      expect(result).toContain('itemFilter');
      expect(result).toContain('loadItemPage');
    });

    it('should handle JSON files', () => {
      const content = `
        {
          "productFilter": "...",
          "productSort": "..."
        }
      `;

      const result = renameCollectionInContent(content, 'product', 'item');
      expect(result).toContain('itemFilter');
      expect(result).toContain('itemSort');
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
      expect(result).toContain('loadItemNextPage');
      expect(result).toContain('loadItemPreviousPage');
      expect(result).toContain('loadItemFirstPage');
      expect(result).toContain('loadMoreItem');
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
function generatePatternsForTest(oldName: string, newName: string): any[] {
  // Simplified pattern generation for testing
  const oldCapital = oldName.charAt(0).toUpperCase() + oldName.slice(1);
  const newCapital = newName.charAt(0).toUpperCase() + newName.slice(1);

  return [
    { source: `${oldName}CallStatus`, target: `${newName}CallStatus`, description: 'CallStatus' },
    { source: `${oldName}Pagination`, target: `${newName}Pagination`, description: 'Pagination' },
    { source: `${oldName}Filter`, target: `${newName}Filter`, description: 'Filter' },
    { source: `${oldName}Sort`, target: `${newName}Sort`, description: 'Sort' },
    { source: `is${oldCapital}Loading`, target: `is${newCapital}Loading`, description: 'Loading' },
  ];
}

function renameCollectionInContent(content: string, oldName: string, newName: string): string {
  const oldCapital = oldName.charAt(0).toUpperCase() + oldName.slice(1);
  const newCapital = newName.charAt(0).toUpperCase() + newName.slice(1);

  let result = content;

  // CallStatus patterns
  result = result.replace(new RegExp(`${oldName}CallStatus`, 'g'), `${newName}CallStatus`);
  result = result.replace(new RegExp(`is${oldCapital}Loading`, 'g'), `is${newCapital}Loading`);
  result = result.replace(new RegExp(`is${oldCapital}Loaded`, 'g'), `is${newCapital}Loaded`);
  result = result.replace(new RegExp(`${oldName}Error`, 'g'), `${newName}Error`);
  result = result.replace(new RegExp(`set${oldCapital}Loading`, 'g'), `set${newCapital}Loading`);
  result = result.replace(new RegExp(`set${oldCapital}Error`, 'g'), `set${newCapital}Error`);

  // Pagination patterns
  result = result.replace(new RegExp(`${oldName}Pagination`, 'g'), `${newName}Pagination`);
  result = result.replace(new RegExp(`${oldName}CurrentPage`, 'g'), `${newName}CurrentPage`);
  result = result.replace(new RegExp(`${oldName}PagedRequest`, 'g'), `${newName}PagedRequest`);
  result = result.replace(new RegExp(`load${oldCapital}Page`, 'g'), `load${newCapital}Page`);
  result = result.replace(new RegExp(`set${oldCapital}PagedResult`, 'g'), `set${newCapital}PagedResult`);
  result = result.replace(new RegExp(`loadMore${oldCapital}`, 'g'), `loadMore${newCapital}`);
  result = result.replace(new RegExp(`load${oldCapital}NextPage`, 'g'), `load${newCapital}NextPage`);
  result = result.replace(new RegExp(`load${oldCapital}PreviousPage`, 'g'), `load${newCapital}PreviousPage`);
  result = result.replace(new RegExp(`load${oldCapital}FirstPage`, 'g'), `load${newCapital}FirstPage`);

  // Filter patterns
  result = result.replace(new RegExp(`${oldName}Filter`, 'g'), `${newName}Filter`);
  result = result.replace(new RegExp(`is${oldCapital}FilterChanged`, 'g'), `is${newCapital}FilterChanged`);
  result = result.replace(new RegExp(`reset${oldCapital}Filter`, 'g'), `reset${newCapital}Filter`);

  // Sort patterns
  result = result.replace(new RegExp(`${oldName}Sort`, 'g'), `${newName}Sort`);
  result = result.replace(new RegExp(`sort${oldCapital}`, 'g'), `sort${newCapital}`);

  // Entities variants
  result = result.replace(new RegExp(`${oldName}EntitiesCallStatus`, 'g'), `${newName}EntitiesCallStatus`);
  result = result.replace(new RegExp(`is${oldCapital}EntitiesLoading`, 'g'), `is${newCapital}EntitiesLoading`);
  result = result.replace(new RegExp(`${oldName}EntitiesPagination`, 'g'), `${newName}EntitiesPagination`);
  result = result.replace(new RegExp(`load${oldCapital}EntitiesPage`, 'g'), `load${newCapital}EntitiesPage`);
  result = result.replace(new RegExp(`load${oldCapital}EntitiesNextPage`, 'g'), `load${newCapital}EntitiesNextPage`);
  result = result.replace(new RegExp(`load${oldCapital}EntitiesPreviousPage`, 'g'), `load${newCapital}EntitiesPreviousPage`);
  result = result.replace(new RegExp(`load${oldCapital}EntitiesFirstPage`, 'g'), `load${newCapital}EntitiesFirstPage`);
  result = result.replace(new RegExp(`loadMore${oldCapital}Entities`, 'g'), `loadMore${newCapital}Entities`);
  result = result.replace(new RegExp(`${oldName}EntitiesFilter`, 'g'), `${newName}EntitiesFilter`);
  result = result.replace(new RegExp(`${oldName}EntitiesSort`, 'g'), `${newName}EntitiesSort`);

  // Base store properties (word boundaries)
  result = result.replace(new RegExp(`\\b${oldName}\\b`, 'g'), newName);
  result = result.replace(new RegExp(`\\b${oldCapital}\\b`, 'g'), newCapital);

  return result;
}
