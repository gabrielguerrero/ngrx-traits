import { computed, inject } from '@angular/core';
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
    productsStatus: 'init' | 'loading' | 'loaded' | { error: unknown };
  }>({
    products: [],
    productsStatus: 'init',
  }),
  withComputed(({ productsStatus }) => ({
    isProductsLoading: computed(() => productsStatus() === 'loading'),
    isProductsLoaded: computed(() => productsStatus() === 'loaded'),
    productsError: computed(() => {
      const v = productsStatus();
      return typeof v === 'object' ? v.error : null;
    }),
  })),
  withMethods((store) => ({
    setProductsLoading: () => {
      patchState(store, { productsStatus: 'loading' });
    },
    setProductsLoaded: () => {
      patchState(store, { productsStatus: 'loaded' });
    },
    setProductsError: (error: any) => {
      patchState(store, { productsStatus: { error } });
    },
  })),
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
