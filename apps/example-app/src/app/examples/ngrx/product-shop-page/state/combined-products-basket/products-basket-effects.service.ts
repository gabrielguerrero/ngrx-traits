/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, exhaustMap, filter, map, switchMap } from 'rxjs/operators';

import { OrderService } from '../../../services/order.service';
import { ProductService } from '../../../services/product.service';
import {
  ProductActions,
  ProductBasketActions,
  ProductBasketSelectors,
} from './products-basket.traits';

@Injectable()
export class ProductsBasketEffects {
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
      ofType(ProductBasketActions.checkout),
      concatLatestFrom(() =>
        this.store.select(ProductBasketSelectors.selectProductOrderSelected),
      ),
      filter(([, product]) => !!product),
      exhaustMap(([, product]) =>
        this.orderService
          .checkout({ productId: product!.id, quantity: 1 })
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
