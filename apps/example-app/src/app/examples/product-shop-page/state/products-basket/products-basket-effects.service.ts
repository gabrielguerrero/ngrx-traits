/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ProductBasketActions,
  ProductBasketSelectors,
} from './products-basket.traits';
import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, filter, map } from 'rxjs/operators';
import { ProductService } from '../../../services/product.service';
import { of } from 'rxjs';
import { OrderService } from '../../../services/order.service';
import { Store } from '@ngrx/store';

@Injectable()
export class ProductsBasketEffects {
  checkout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductBasketActions.checkout),
      concatLatestFrom(() =>
        this.store.select(ProductBasketSelectors.selectProductOrdersList)
      ),
      filter(([_, products]) => !!products.length),
      exhaustMap(([_, products]) =>
        this.orderService
          .checkout(
            ...products.map((p) => ({
              productId: p.id,
              quantity: p.quantity || 1,
            }))
          )
          .pipe(
            map((orderId) => ProductBasketActions.checkoutSuccess({ orderId })),
            catchError(() => of(ProductBasketActions.checkoutFail()))
          )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private store: Store,
    private productService: ProductService,
    private orderService: OrderService
  ) {}
}
