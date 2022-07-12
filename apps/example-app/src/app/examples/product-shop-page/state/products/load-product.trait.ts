import { Injectable } from '@angular/core';
import { ProductDetail } from '../../../models';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { addLoadEntityTraits } from '@ngrx-traits/common';
import {
  createTraitFactory,
  ExtractActionsType,
  TraitEffect,
} from '@ngrx-traits/core';
import { catchError, exhaustMap, map } from 'rxjs/operators';
import { props, Store } from '@ngrx/store';
import { ProductService } from '../../../services/product.service';
import { of } from 'rxjs';

export function addLoadProductDetailTraits() {
  // notice how we use a trait
  const traits = addLoadEntityTraits({
    entityName: 'productDetail',
    actionProps: props<{ id: string }>(),
    actionSuccessProps: props<{ productDetail: ProductDetail }>(),
  });

  type LoadProductActions = ExtractActionsType<typeof traits>;

  return [
    ...traits, // loadEntity is an array of traits so needs to be spread
    createTraitFactory({
      key: 'loadProductEffect',
      effects: ({ allActions: actions }) => {
        const allActions = actions as LoadProductActions;
        @Injectable()
        class LoadProductEffect extends TraitEffect {
          loadProduct$ = createEffect(() => {
            return this.actions$.pipe(
              ofType(allActions.loadProductDetail),
              // call backend...
              exhaustMap(({ id }) =>
                this.productService.getProductDetail(id).pipe(
                  map((productDetail) =>
                    productDetail
                      ? allActions.loadProductDetailSuccess({ productDetail })
                      : allActions.loadProductDetailFail()
                  ),
                  catchError(() => of(allActions.loadProductDetailFail()))
                )
              )
            );
          });

          constructor(private productService: ProductService) {
            super();
          }
        }
        return [LoadProductEffect];
      },
    }),
  ] as const; // important to add as const to keep the types working
}
