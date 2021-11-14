import {
  addAsyncAction,
  addFilter,
  addLoadEntities,
  addSingleSelection,
  addSort,
} from 'ngrx-traits/traits';
import { Product, ProductFilter } from '../../../models';
import { props, Store } from '@ngrx/store';
import {
  createEntityFeatureFactory,
  LocalTraitsConfig,
  TraitEffect,
  TraitLocalEffectsFactory,
  TraitsLocalStore,
} from 'ngrx-traits';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ProductService } from '../../../services/product.service';

const productTraits = createEntityFeatureFactory(
  addLoadEntities<Product>(),
  addSingleSelection<Product>(),
  addFilter<Product, ProductFilter>({
    filterFn: (filter, entity) => {
      return entity.name.toLowerCase().includes(filter.search.toLowerCase());
    },
  }),
  addSort<Product>({
    defaultSort: { direction: 'asc', active: 'name' },
  })
);

const productsEffect: TraitLocalEffectsFactory<typeof productTraits> = (
  allActions
) => {
  @Injectable()
  class ProductsEffects extends TraitEffect {
    loadProducts$ = createEffect(() =>
      this.actions$.pipe(
        ofType(allActions.loadEntities),
        switchMap(() =>
          //call your service to get the products data
          this.productService.getProducts().pipe(
            map((products) =>
              allActions.loadEntitiesSuccess({ entities: products })
            ),
            catchError(() => of(allActions.loadEntitiesFail()))
          )
        )
      )
    );

    constructor(
      actions$: Actions,
      store: Store,
      private productService: ProductService
    ) {
      super(actions$, store);
    }
  }
  return ProductsEffects;
};

@Injectable()
export class ProductsLocalTraits extends TraitsLocalStore<
  typeof productTraits
> {
  setup(): LocalTraitsConfig<typeof productTraits> {
    return {
      componentName: 'ProductsPickerComponent',
      traitsFactory: productTraits,
      effectFactory: productsEffect,
    };
  }
}
