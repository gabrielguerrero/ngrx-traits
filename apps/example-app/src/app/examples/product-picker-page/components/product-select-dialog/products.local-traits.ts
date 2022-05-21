import {
  addFilterEntitiesTrait,
  addLoadEntitiesTrait,
  addSelectEntityTrait,
  addSortEntitiesTrait,
} from '@ngrx-traits/common';
import { Product, ProductFilter } from '../../../models';
import {
  buildLocalTraits,
  createEntityFeatureFactory,
  LocalTraitsConfig,
  TraitsLocalStore,
} from '@ngrx-traits/core';
import { Injectable, Injector } from '@angular/core';
import { createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ProductService } from '../../../services/product.service';

const productFeatureFactory = createEntityFeatureFactory(
  { entityName: 'product' },
  addLoadEntitiesTrait<Product>(),
  addSelectEntityTrait<Product>(),
  addFilterEntitiesTrait<Product, ProductFilter>({
    filterFn: (filter, entity) => {
      return (
        !filter.search ||
        entity.name.toLowerCase().includes(filter.search.toLowerCase())
      );
    },
  }),
  addSortEntitiesTrait<Product>({
    remote: false,
    defaultSort: { direction: 'asc', active: 'name' },
  })
);

@Injectable()
export class ProductsLocalTraits extends TraitsLocalStore<
  typeof productFeatureFactory
> {
  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(this.localActions.loadProducts),
      switchMap(() =>
        //call your service to get the products data
        this.productService.getProducts().pipe(
          map((res) =>
            this.localActions.loadProductsSuccess({ entities: res.resultList })
          ),
          catchError(() => of(this.localActions.loadProductsFail()))
        )
      )
    )
  );

  constructor(injector: Injector, private productService: ProductService) {
    super(injector);
    this.traits.addEffects(this);
  }

  setup(): LocalTraitsConfig<typeof productFeatureFactory> {
    return {
      componentName: 'ProductsPickerComponent',
      traitsFactory: productFeatureFactory,
    };
  }
}
