import { effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { EMPTY, firstValueFrom, tap } from 'rxjs';
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
  withMethods((store) => {
    const productService = inject(ProductService);

    return {
      async loadProducts(): Promise<void> {
        patchState(store, { productsStatus: 'loading' });

        try {
          const res = await firstValueFrom(productService.getProducts());
          patchState(store, {
            productsStatus: 'loaded',
            products: res.resultList,
          });
        } catch (e) {
          patchState(store, { productsStatus: { error: e } });
        }
      },
    };
  }),
);
