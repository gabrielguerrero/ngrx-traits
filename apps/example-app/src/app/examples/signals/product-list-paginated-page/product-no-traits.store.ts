import { inject } from '@angular/core';
import { withCalls } from '@ngrx-traits/signals';
import { signalStore, withHooks } from '@ngrx/signals';
import { map } from 'rxjs/operators';

import { ProductService } from '../../services/product.service';

/**
 * Example of the store for the product list page but without using any of the ngrx-traits/signals methods, for comparation of code saved.
 */
export const ProductStore = signalStore(
  withCalls(() => {
    const productService = inject(ProductService);
    return {
      loadProducts: () =>
        productService.getProducts().pipe(map((res) => res.resultList)),

      loadProductDetail: ({ id }: { id: string }) =>
        inject(ProductService).getProductDetail(id),
    };
  }),
  withHooks((store) => ({
    onInit: () => {
      store.loadProducts();
    },
  })),
);
