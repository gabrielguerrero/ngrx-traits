/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatLatestFrom } from '@ngrx/operators';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, exhaustMap, filter, map, switchMap } from 'rxjs/operators';

import { OrderService } from '../../../../services/order.service';
import { ProductService } from '../../../../services/product.service';
import { ProductActions, ProductSelectors } from './products.traits';

@Injectable()
export class ProductsEffects {
  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadProducts),
      switchMap(() =>
        //call your service to get the products data
        this.productService.getProducts().pipe(
          map((res) =>
            ProductActions.loadProductsSuccess({ entities: res.resultList }),
          ),
          catchError(() => of(ProductActions.loadProductsFail())),
        ),
      ),
    ),
  );

  checkout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.checkout),
      concatLatestFrom(() =>
        this.store.select(ProductSelectors.selectProductSelected),
      ),
      filter(([, product]) => !!product),
      exhaustMap(([, product]) =>
        this.orderService
          .checkout({ productId: product!.id, quantity: 1 })
          .pipe(
            map((orderId) => ProductActions.checkoutSuccess({ orderId })),
            catchError(() => of(ProductActions.checkoutFail())),
          ),
      ),
    ),
  );

  constructor(
    private actions$: Actions,
    private store: Store,
    private productService: ProductService,
    private orderService: OrderService,
  ) {}
}
