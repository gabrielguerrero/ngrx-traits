/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ProductBasketActions,
  ProductBasketSelectors,
  ProductActions,
} from './products-basket.traits';
import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, filter, map, switchMap } from 'rxjs/operators';
import { ProductService } from '../../../services/product.service';
import { of } from 'rxjs';
import { OrderService } from '../../../services/order.service';
import { Store } from '@ngrx/store';

@Injectable()
export class ProductsBasketEffects {
  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadProducts),
      switchMap(() =>
        //call your service to get the products data
        this.productService.getProducts().pipe(
          map((res) =>
            ProductActions.loadProductsSuccess({ entities: res.resultList })
          ),
          catchError(() => of(ProductActions.loadProductsFail()))
        )
      )
    )
  );

  checkout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductBasketActions.checkout),
      concatLatestFrom(() =>
        this.store.select(ProductBasketSelectors.selectProductOrderSelected)
      ),
      filter(([, product]) => !!product),
      exhaustMap(([, product]) =>
        this.orderService
          .checkout({ productId: product!.id, quantity: 1 })
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
