import { computed, inject } from '@angular/core';
import { withCallStatus } from '@ngrx-traits/signals';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, pipe, switchMap, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Product } from '../../models';
import { ProductService } from '../../services/product.service';

/**
 * Example of the store for the product list page but without using any of the ngrx-traits/signals methods, for comparation of code saved.
 */
export const ProductStore = signalStore(
  withState<{
    products: Product[];
  }>({
    products: [],
  }),
  withCallStatus({ collection: 'products' }),
  withMethods(
    ({ setProductsLoading, setProductsLoaded, setProductsError, ...store }) => {
      const productService = inject(ProductService);

      return {
        loadProducts: rxMethod<void>(
          pipe(
            tap(() => setProductsLoading()),
            switchMap(() =>
              productService.getProducts().pipe(
                tap((res) => {
                  patchState(store, {
                    products: res.resultList,
                  });
                  setProductsLoaded();
                }),
                catchError((error) => {
                  setProductsError(error);
                  return EMPTY;
                }),
              ),
            ),
          ),
        ),
      };
    },
  ),
  withHooks((store) => ({
    onInit: () => {
      store.loadProducts();
    },
  })),
);
