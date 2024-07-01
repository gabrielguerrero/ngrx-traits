/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatLatestFrom } from '@ngrx/operators';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, exhaustMap, filter, map } from 'rxjs/operators';

import { OrderService } from '../../../../services/order.service';
import { ProductService } from '../../../../services/product.service';
import {
  ProductBasketActions,
  ProductBasketSelectors,
} from './products-basket.traits';

@Injectable()
export class ProductsBasketEffects {
  checkout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductBasketActions.checkout),
      concatLatestFrom(() =>
        this.store.select(ProductBasketSelectors.selectProductOrdersList),
      ),
      filter(([, products]) => !!products.length),
      exhaustMap(([, products]) =>
        this.orderService
          .checkout(
            ...products.map((p) => ({
              productId: p.id,
              quantity: p.quantity || 1,
            })),
          )
          .pipe(
            map((orderId) => ProductBasketActions.checkoutSuccess({ orderId })),
            catchError(() => of(ProductBasketActions.checkoutFail())),
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
