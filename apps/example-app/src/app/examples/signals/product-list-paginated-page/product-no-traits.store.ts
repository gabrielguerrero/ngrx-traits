import { computed, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  patchState,
  signalStore,
  type,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';
import { EMPTY, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Product } from '../../models';
import { ProductService } from '../../services/product.service';

/**
 * Example of the store for the product list page but without using any of the ngrx-traits/signals methods, for comparation of code saved.
 */
const productStore = signalStore(
  withState<{
    products: Product[];
    productsStatus: 'init' | 'loading' | 'loaded' | { error: unknown };
  }>({
    products: [],
    productsStatus: 'loading',
  }),
  withComputed(({ productsStatus }) => ({
    productsLoading: computed(() => productsStatus() === 'loading'),
    productsLoaded: computed(() => productsStatus() === 'loaded'),
    productsError: computed(() => {
      const v = productsStatus();
      return typeof v === 'object' ? v.error : null;
    }),
  })),
  withMethods((state) => ({
    setProductsLoading: () => {
      patchState(state, { productsStatus: 'loading' });
    },
    setProductsLoaded: () => {
      patchState(state, { productsStatus: 'loaded' });
    },
    setProductsError: (error: any) => {
      patchState(state, { productsStatus: { error } });
    },
  })),
  withHooks(
    ({ productsLoading, setProductsError, setProductsLoaded, ...state }) => ({
      onInit: async () => {
        effect(
          () => {
            if (productsLoading()) {
              inject(ProductService)
                .getProducts()
                .pipe(
                  takeUntilDestroyed(),
                  tap((res) => {
                    patchState(state, { products: res.resultList });
                    setProductsLoaded();
                  }),
                  catchError((error) => {
                    setProductsError(error);
                    return EMPTY;
                  }),
                )
                .subscribe();
            }
          },
          { allowSignalWrites: true },
        );
      },
    }),
  ),
);
