import { inject } from '@angular/core';
import { typedCallConfig, withCalls } from '@ngrx-traits/signals';
import { patchState, signalStore, type, withHooks } from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';
import { map } from 'rxjs/operators';

import { Product } from '../../models';
import { ProductService } from '../../services/product.service';

/**
 * Example of the store for the product list page but without using any of the ngrx-traits/signals methods, for comparation of code saved.
 */

export const ProductStore = signalStore(
  withEntities({ entity: type<Product>(), collection: 'products' }),
  withCalls((store) => {
    const productService = inject(ProductService);
    return {
      loadProducts: typedCallConfig({
        call: () => productService.getProducts(),
        storeResult: false,
        onSuccess: (res) => {
          patchState(
            store,
            setAllEntities(res.resultList, { collection: 'products' }),
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
