import { effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { patchState, signalStore, withHooks, withState } from '@ngrx/signals';
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
  withHooks((state) => ({
    onInit: async () => {
      effect(
        () => {
          if (state.productsStatus() === 'loading') {
            inject(ProductService)
              .getProducts()
              .pipe(
                takeUntilDestroyed(),
                tap((res) => {
                  patchState(state, {
                    products: res.resultList,
                    productsStatus: 'loaded',
                  });
                }),
                catchError((error) => {
                  patchState(state, { productsStatus: { error } });
                  return EMPTY;
                }),
              )
              .subscribe();
          }
        },
        { allowSignalWrites: true },
      );
    },
  })),
);
