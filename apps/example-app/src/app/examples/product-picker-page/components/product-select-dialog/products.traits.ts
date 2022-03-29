import {
  addFilterEntitiesTrait,
  addLoadEntitiesTrait,
  addSelectEntityTrait,
  addSortEntitiesTrait,
} from 'ngrx-traits/traits';
import { Product, ProductFilter } from '../../../models';
import {
  createEntityFeatureFactory,
  LocalTraitsConfig,
  TraitsLocalStore,
} from 'ngrx-traits';
import { Injectable } from '@angular/core';
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
      return entity.name.toLowerCase().includes(filter.search.toLowerCase());
    },
  }),
  addSortEntitiesTrait<Product>({
    defaultSort: { direction: 'asc', active: 'name' },
  })
);

@Injectable()
export class ProductsLocalTraits extends TraitsLocalStore<
  typeof productFeatureFactory
> {
  productService = this.injector.get(ProductService);

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

  setup(): LocalTraitsConfig<typeof productFeatureFactory> {
    return {
      componentName: 'ProductsPickerComponent',
      traitsFactory: productFeatureFactory,
    };
  }
}
