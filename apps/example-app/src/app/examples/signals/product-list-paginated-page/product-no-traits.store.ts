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
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, pipe, tap } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { Product } from '../../models';
import { ProductService } from '../../services/product.service';

/**
 * Example of the store for the product list page but without using any of the ngrx-traits/signals methods, for comparation of code saved.
 */
const productStore = signalStore(
  withEntities({ entity: type<Product>(), collection: 'products' }),
  withState<{
    productsStatus: 'init' | 'loading' | 'loaded' | { error: unknown };
    productsFilter: { name: string };
    selectedProduct?: Product;
  }>({
    productsStatus: 'loading',
    productsFilter: { name: '' },
    selectedProduct: undefined,
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
  // withEntitiesLoadingCall is the same as doing the following:
  withHooks(({ productsLoading, setProductsError, ...state }) => ({
    onInit: async () => {
      effect(() => {
        if (productsLoading()) {
          inject(ProductService)
            .getProducts()
            .pipe(
              takeUntilDestroyed(),
              tap((res) =>
                patchState(
                  state,
                  setAllEntities(res.resultList, { collection: 'products' }),
                ),
              ),
              catchError((error) => {
                setProductsError(error);
                return EMPTY;
              }),
            )
            .subscribe();
        }
      });
    },
  })),
);
