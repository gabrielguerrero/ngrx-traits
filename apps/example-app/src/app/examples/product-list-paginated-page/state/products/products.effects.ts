/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ProductActions, ProductSelectors } from './products.traits';
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
              })
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
      filter(([, product]) => !!product),
      exhaustMap(([, product]) =>
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
