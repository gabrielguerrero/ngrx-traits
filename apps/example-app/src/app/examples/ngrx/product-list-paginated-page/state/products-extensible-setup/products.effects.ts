/* eslint-disable @typescript-eslint/no-non-null-assertion */
// inside the state folder dont import from actions and selectors from
// /index or you will create a circular dependency
import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, exhaustMap, filter, map, switchMap } from 'rxjs/operators';

import { OrderService } from '../../../services/order.service';
import { ProductService } from '../../../services/product.service';
import * as ProductActions from './products.actions';
import * as ProductSelectors from './products.selectors';

@Injectable()
export class ProductsEffects {
  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadProducts),
      concatLatestFrom(() => [
        this.store.select(ProductSelectors.selectProductsFilter),
        this.store.select(ProductSelectors.selectProductsSort),
        this.store.select(ProductSelectors.selectProductsPagedRequest),
      ]),
      switchMap(([, filters, sort, pagination]) =>
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
            map((res) =>
              ProductActions.loadProductsSuccess({
                entities: res.resultList,
                total: res.total,
              }),
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
