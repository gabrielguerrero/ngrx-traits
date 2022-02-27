import {
  addAsyncActionTrait,
  addFilterEntitiesTrait,
  addLoadEntitiesTrait,
  addSelectEntitiesTrait,
  addSelectEntityTrait,
  addSortEntitiesTrait,
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
  { entityName: 'product' },
  addLoadEntitiesTrait<Product>(),
  addSelectEntityTrait<Product>(),
  addFilterEntitiesTrait<Product, ProductFilter>({
    filterFn: (filter, entity) => {
      return entity.name.toLowerCase().includes(filter.search.toLowerCase());
    },
  }),
  addSortEntitiesTrait<Product>({
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
        ofType(allActions.loadProducts),
        switchMap(() =>
          //call your service to get the products data
          this.productService.getProducts().pipe(
            map((products) =>
              allActions.loadProductsSuccess({ entities: products })
            ),
            catchError(() => of(allActions.loadProductsFail()))
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
