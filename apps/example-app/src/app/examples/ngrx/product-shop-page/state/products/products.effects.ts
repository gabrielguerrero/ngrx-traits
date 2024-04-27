/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { ProductService } from '../../../../services/product.service';
import { ProductActions } from './products.traits';

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

  constructor(
    private actions$: Actions,
    private store: Store,
    private productService: ProductService,
  ) {}
}
