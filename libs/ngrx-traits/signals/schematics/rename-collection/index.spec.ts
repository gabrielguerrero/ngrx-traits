/**
 * Tests for rename-collection schematic
 */
import { generateRenamePatterns, renameInContent } from './index';

describe('Rename Collection Schematic', () => {
  describe('CallStatus patterns', () => {
    it('should rename productCallStatus to itemEntitiesCallStatus', () => {
      const result = rename('productCallStatus', 'product', 'item');
      expect(result).toContain('itemEntitiesCallStatus');
    });

    it('should rename productEntitiesCallStatus to itemEntitiesCallStatus', () => {
      const result = rename('productEntitiesCallStatus', 'product', 'item');
      expect(result).toContain('itemEntitiesCallStatus');
    });

    it('should rename isProductLoading to isItemEntitiesLoading', () => {
      const result = rename('isProductLoading', 'product', 'item');
      expect(result).toContain('isItemEntitiesLoading');
    });

    it('should rename isProductEntitiesLoading to isItemEntitiesLoading', () => {
      const result = rename('isProductEntitiesLoading', 'product', 'item');
      expect(result).toContain('isItemEntitiesLoading');
    });

    it('should rename isProductLoaded to isItemEntitiesLoaded', () => {
      const result = rename('isProductLoaded', 'product', 'item');
      expect(result).toContain('isItemEntitiesLoaded');
    });

    it('should rename isProductEntitiesLoaded to isItemEntitiesLoaded', () => {
      const result = rename('isProductEntitiesLoaded', 'product', 'item');
      expect(result).toContain('isItemEntitiesLoaded');
    });

    it('should rename productError to itemEntitiesError', () => {
      const result = rename('productError', 'product', 'item');
      expect(result).toContain('itemEntitiesError');
    });

    it('should rename productEntitiesError to itemEntitiesError', () => {
      const result = rename('productEntitiesError', 'product', 'item');
      expect(result).toContain('itemEntitiesError');
    });

    it('should rename setProductLoading to setItemEntitiesLoading', () => {
      const result = rename('setProductLoading', 'product', 'item');
      expect(result).toContain('setItemEntitiesLoading');
    });

    it('should rename setProductEntitiesLoading to setItemEntitiesLoading', () => {
      const result = rename('setProductEntitiesLoading', 'product', 'item');
      expect(result).toContain('setItemEntitiesLoading');
    });

    it('should rename setProductLoaded to setItemEntitiesLoaded', () => {
      const result = rename('setProductLoaded', 'product', 'item');
      expect(result).toContain('setItemEntitiesLoaded');
    });

    it('should rename setProductEntitiesLoaded to setItemEntitiesLoaded', () => {
      const result = rename('setProductEntitiesLoaded', 'product', 'item');
      expect(result).toContain('setItemEntitiesLoaded');
    });

    it('should rename setProductError to setItemEntitiesError', () => {
      const result = rename('setProductError', 'product', 'item');
      expect(result).toContain('setItemEntitiesError');
    });

    it('should rename setProductEntitiesError to setItemEntitiesError', () => {
      const result = rename('setProductEntitiesError', 'product', 'item');
      expect(result).toContain('setItemEntitiesError');
    });
  });

  describe('Pagination patterns', () => {
    it('should rename productPagination to itemEntitiesPagination', () => {
      const result = rename('productPagination', 'product', 'item');
      expect(result).toContain('itemEntitiesPagination');
    });

    it('should rename productEntitiesPagination to itemEntitiesPagination', () => {
      const result = rename('productEntitiesPagination', 'product', 'item');
      expect(result).toContain('itemEntitiesPagination');
    });

    it('should rename productCurrentPage to itemEntitiesCurrentPage', () => {
      const result = rename('productCurrentPage', 'product', 'item');
      expect(result).toContain('itemEntitiesCurrentPage');
    });

    it('should rename productEntitiesCurrentPage to itemEntitiesCurrentPage', () => {
      const result = rename('productEntitiesCurrentPage', 'product', 'item');
      expect(result).toContain('itemEntitiesCurrentPage');
    });

    it('should rename productPagedRequest to itemEntitiesPagedRequest', () => {
      const result = rename('productPagedRequest', 'product', 'item');
      expect(result).toContain('itemEntitiesPagedRequest');
    });

    it('should rename productEntitiesPagedRequest to itemEntitiesPagedRequest', () => {
      const result = rename('productEntitiesPagedRequest', 'product', 'item');
      expect(result).toContain('itemEntitiesPagedRequest');
    });

    it('should rename loadProductPage to loadItemEntitiesPage', () => {
      const result = rename('loadProductPage', 'product', 'item');
      expect(result).toContain('loadItemEntitiesPage');
    });

    it('should rename loadProductEntitiesPage to loadItemEntitiesPage', () => {
      const result = rename('loadProductEntitiesPage', 'product', 'item');
      expect(result).toContain('loadItemEntitiesPage');
    });

    it('should rename setProductPagedResult to setItemEntitiesPagedResult', () => {
      const result = rename('setProductPagedResult', 'product', 'item');
      expect(result).toContain('setItemEntitiesPagedResult');
    });

    it('should rename setProductEntitiesPagedResult to setItemEntitiesPagedResult', () => {
      const result = rename('setProductEntitiesPagedResult', 'product', 'item');
      expect(result).toContain('setItemEntitiesPagedResult');
    });

    it('should rename loadMoreProduct to loadMoreItemEntities', () => {
      const result = rename('loadMoreProduct', 'product', 'item');
      expect(result).toContain('loadMoreItemEntities');
    });

    it('should rename loadMoreProductEntities to loadMoreItemEntities', () => {
      const result = rename('loadMoreProductEntities', 'product', 'item');
      expect(result).toContain('loadMoreItemEntities');
    });

    it('should rename loadProductNextPage to loadItemEntitiesNextPage', () => {
      const result = rename('loadProductNextPage', 'product', 'item');
      expect(result).toContain('loadItemEntitiesNextPage');
    });

    it('should rename loadProductEntitiesNextPage to loadItemEntitiesNextPage', () => {
      const result = rename('loadProductEntitiesNextPage', 'product', 'item');
      expect(result).toContain('loadItemEntitiesNextPage');
    });

    it('should rename loadProductPreviousPage to loadItemEntitiesPreviousPage', () => {
      const result = rename('loadProductPreviousPage', 'product', 'item');
      expect(result).toContain('loadItemEntitiesPreviousPage');
    });

    it('should rename loadProductEntitiesPreviousPage to loadItemEntitiesPreviousPage', () => {
      const result = rename(
        'loadProductEntitiesPreviousPage',
        'product',
        'item',
      );
      expect(result).toContain('loadItemEntitiesPreviousPage');
    });

    it('should rename loadProductFirstPage to loadItemEntitiesFirstPage', () => {
      const result = rename('loadProductFirstPage', 'product', 'item');
      expect(result).toContain('loadItemEntitiesFirstPage');
    });

    it('should rename loadProductEntitiesFirstPage to loadItemEntitiesFirstPage', () => {
      const result = rename('loadProductEntitiesFirstPage', 'product', 'item');
      expect(result).toContain('loadItemEntitiesFirstPage');
    });
  });

  describe('Filter patterns', () => {
    it('should rename productFilter to itemEntitiesFilter', () => {
      const result = rename('productFilter', 'product', 'item');
      expect(result).toContain('itemEntitiesFilter');
    });

    it('should rename productEntitiesFilter to itemEntitiesFilter', () => {
      const result = rename('productEntitiesFilter', 'product', 'item');
      expect(result).toContain('itemEntitiesFilter');
    });

    it('should rename isProductFilterChanged to isItemEntitiesFilterChanged', () => {
      const result = rename('isProductFilterChanged', 'product', 'item');
      expect(result).toContain('isItemEntitiesFilterChanged');
    });

    it('should rename isProductEntitiesFilterChanged to isItemEntitiesFilterChanged', () => {
      const result = rename(
        'isProductEntitiesFilterChanged',
        'product',
        'item',
      );
      expect(result).toContain('isItemEntitiesFilterChanged');
    });

    it('should rename resetProductFilter to resetItemEntitiesFilter', () => {
      const result = rename('resetProductFilter', 'product', 'item');
      expect(result).toContain('resetItemEntitiesFilter');
    });

    it('should rename resetProductEntitiesFilter to resetItemEntitiesFilter', () => {
      const result = rename('resetProductEntitiesFilter', 'product', 'item');
      expect(result).toContain('resetItemEntitiesFilter');
    });

    it('should rename filterProductEntities to filterItemEntities', () => {
      const result = rename('filterProductEntities', 'product', 'item');
      expect(result).toContain('filterItemEntities');
    });
  });

  describe('Sort patterns', () => {
    it('should rename productSort to itemEntitiesSort', () => {
      const result = rename('productSort', 'product', 'item');
      expect(result).toContain('itemEntitiesSort');
    });

    it('should rename productEntitiesSort to itemEntitiesSort', () => {
      const result = rename('productEntitiesSort', 'product', 'item');
      expect(result).toContain('itemEntitiesSort');
    });

    it('should rename sortProduct to sortItemEntities', () => {
      const result = rename('sortProduct', 'product', 'item');
      expect(result).toContain('sortItemEntities');
    });

    it('should rename sortProductEntities to sortItemEntities', () => {
      const result = rename('sortProductEntities', 'product', 'item');
      expect(result).toContain('sortItemEntities');
    });
  });

  describe('Single Selection patterns', () => {
    it('should rename productIdSelected to itemIdSelected', () => {
      const result = rename('productIdSelected', 'product', 'item');
      expect(result).toContain('itemIdSelected');
    });

    it('should rename productEntitySelected to itemEntitySelected', () => {
      const result = rename('productEntitySelected', 'product', 'item');
      expect(result).toContain('itemEntitySelected');
    });

    it('should rename selectProductEntity to selectItemEntity', () => {
      const result = rename('selectProductEntity', 'product', 'item');
      expect(result).toContain('selectItemEntity');
    });

    it('should rename deselectProductEntity to deselectItemEntity', () => {
      const result = rename('deselectProductEntity', 'product', 'item');
      expect(result).toContain('deselectItemEntity');
    });

    it('should rename toggleSelectProductEntity to toggleSelectItemEntity', () => {
      const result = rename('toggleSelectProductEntity', 'product', 'item');
      expect(result).toContain('toggleSelectItemEntity');
    });
  });

  describe('Multi Selection patterns', () => {
    it('should rename productIdsSelectedMap to itemIdsSelectedMap', () => {
      const result = rename('productIdsSelectedMap', 'product', 'item');
      expect(result).toContain('itemIdsSelectedMap');
    });

    it('should rename productEntitiesSelected to itemEntitiesSelected', () => {
      const result = rename('productEntitiesSelected', 'product', 'item');
      expect(result).toContain('itemEntitiesSelected');
    });

    it('should rename productIdsSelected to itemIdsSelected', () => {
      const result = rename('productIdsSelected', 'product', 'item');
      expect(result).toContain('itemIdsSelected');
    });

    it('should rename isAllProductSelected to isAllItemEntitiesSelected', () => {
      const result = rename('isAllProductSelected', 'product', 'item');
      expect(result).toContain('isAllItemEntitiesSelected');
    });

    it('should rename isAllProductEntitiesSelected to isAllItemEntitiesSelected', () => {
      const result = rename(
        'isAllProductEntitiesSelected',
        'product',
        'item',
      );
      expect(result).toContain('isAllItemEntitiesSelected');
    });

    it('should rename toggleSelectAllProductEntities to toggleSelectAllItemEntities', () => {
      const result = rename(
        'toggleSelectAllProductEntities',
        'product',
        'item',
      );
      expect(result).toContain('toggleSelectAllItemEntities');
    });

    it('should rename selectProductEntities to selectItemEntities', () => {
      const result = rename('selectProductEntities', 'product', 'item');
      expect(result).toContain('selectItemEntities');
    });

    it('should rename deselectProductEntities to deselectItemEntities', () => {
      const result = rename('deselectProductEntities', 'product', 'item');
      expect(result).toContain('deselectItemEntities');
    });

    it('should rename toggleSelectProductEntities to toggleSelectItemEntities', () => {
      const result = rename('toggleSelectProductEntities', 'product', 'item');
      expect(result).toContain('toggleSelectItemEntities');
    });

    it('should rename clearProductSelection to clearItemEntitiesSelection', () => {
      const result = rename('clearProductSelection', 'product', 'item');
      expect(result).toContain('clearItemEntitiesSelection');
    });

    it('should rename clearProductEntitiesSelection to clearItemEntitiesSelection', () => {
      const result = rename(
        'clearProductEntitiesSelection',
        'product',
        'item',
      );
      expect(result).toContain('clearItemEntitiesSelection');
    });
  });

  describe('Collection property patterns', () => {
    it('should rename collection = "product" to collection = "item"', () => {
      const result = rename('collection = "product"', 'product', 'item');
      expect(result).toContain('collection = "item"');
    });

    it('should rename collection: "product" to collection: "item"', () => {
      const result = rename('collection: "product"', 'product', 'item');
      expect(result).toContain('collection: "item"');
    });

    it("should rename collection = 'product' to collection = \"item\"", () => {
      const result = rename("collection = 'product'", 'product', 'item');
      expect(result).toContain('collection = "item"');
    });
  });

  describe('Entities patterns', () => {
    it('should rename productEntities to itemEntities', () => {
      const result = rename('productEntities', 'product', 'item');
      expect(result).toContain('itemEntities');
    });

    it('should rename productIds to itemIds', () => {
      const result = rename('productIds', 'product', 'item');
      expect(result).toContain('itemIds');
    });

    it('should rename productEntityMap to itemEntityMap', () => {
      const result = rename('productEntityMap', 'product', 'item');
      expect(result).toContain('itemEntityMap');
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

    it('should rename plural collection names', () => {
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
  });
});

function rename(
  input: string,
  oldName: string,
  newName: string,
): string {
  return renameInContent(input, generateRenamePatterns(oldName, newName))
    .content;
}

function renameCollectionInContent(
  content: string,
  oldName: string,
  newName: string,
): string {
  return renameInContent(content, generateRenamePatterns(oldName, newName))
    .content;
}
