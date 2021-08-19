/* eslint-disable @typescript-eslint/no-non-null-assertion */

// inside the state folder dont import from actions and selectors from
// /index or you will create a circular dependency
import * as ProductActions from './products.actions';
import * as ProductSelectors from './products.selectors';

import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap, catchError, exhaustMap, filter } from 'rxjs/operators';
import { ProductService } from '../../../services/product.service';
import { of } from 'rxjs';
import { OrderService } from '../../../services/order.service';
import { Store } from '@ngrx/store';

@Injectable()
export class ProductsEffects {
  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadProducts),
      concatLatestFrom(() => [
        this.store.select(ProductSelectors.selectFilter),
        this.store.select(ProductSelectors.selectSort),
        this.store.select(ProductSelectors.selectPagedRequest),
      ]),
      switchMap(([_, filters, sort, pagination]) =>
        //call your service to get the products data
        this.productService
          .getProducts({
            search: filters?.search,
            sortColumn: sort.active,
            sortAscending: sort.direction === 'asc',
            skip: pagination.startIndex,
            take: pagination.size,
          })
          .pipe(
            map((products) =>
              ProductActions.loadProductsSuccess({ entities: products })
            ),
            catchError(() => of(ProductActions.loadProductsFail()))
          )
      )
    )
  );

  checkout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.checkout),
      concatLatestFrom(() =>
        this.store.select(ProductSelectors.selectProductSelected)
      ),
      filter(([_, product]) => !!product),
      exhaustMap(([_, product]) =>
        this.orderService
          .checkout({ productId: product!.id, quantity: 1 })
          .pipe(
            map((orderId) => ProductActions.checkoutSuccess({ orderId })),
            catchError(() => of(ProductActions.checkoutFail()))
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
