/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ProductActions } from './products.traits';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ProductService } from '../../../services/product.service';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';

@Injectable()
export class ProductsEffects {
  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadProducts),
      switchMap(() =>
        //call your service to get the products data
        this.productService.getProducts().pipe(
          map((products) =>
            ProductActions.loadProductsSuccess({ entities: products })
          ),
          catchError(() => of(ProductActions.loadProductsFail()))
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
