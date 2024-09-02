import { inject } from '@angular/core';
import {
  typedCallConfig,
  withCalls,
  withEntitiesLocalFilter,
  withEntitiesLocalPagination,
} from '@ngrx-traits/signals';
import { patchState, signalStore, type, withHooks } from '@ngrx/signals';
import {
  entityConfig,
  setAllEntities,
  withEntities,
} from '@ngrx/signals/entities';

import { Product } from '../../models';
import { ProductService } from '../../services/product.service';

/**
 * Example of the store for the product list page but without using any of the ngrx-traits/signals methods, for comparation of code saved.
 */
const productsEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'products',
});
export const ProductStore = signalStore(
  withEntities(productsEntityConfig),
  withEntitiesLocalPagination(productsEntityConfig),
  withEntitiesLocalFilter({
    ...productsEntityConfig,
    defaultFilter: { search: '' },
    filterFn: (entity, filter) =>
      !filter?.search ||
      entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
  }),
  withCalls((store) => {
    const productService = inject(ProductService);
    return {
      loadProducts: typedCallConfig({
        call: () => productService.getProducts(),
        storeResult: false,
        onSuccess: (res) => {
          patchState(
            store,
            setAllEntities(res.resultList, productsEntityConfig),
          );
        },
      }),

      loadProductDetail: typedCallConfig({
        call: ({ id }: { id: string }) =>
          inject(ProductService).getProductDetail(id),
        resultProp: 'productDetail',
      }),
    };
  }),
  withHooks((store) => ({
    onInit: () => {
      store.loadProducts();
    },
  })),
);
