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
      ofType(ProductActions.loadEntities),
      switchMap(() =>
        //call your service to get the products data
        this.productService.getProducts().pipe(
          map((products) =>
            ProductActions.loadEntitiesSuccess({ entities: products })
          ),
          catchError(() => of(ProductActions.loadEntitiesFail()))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private store: Store,
    private productService: ProductService
  ) {}
}
