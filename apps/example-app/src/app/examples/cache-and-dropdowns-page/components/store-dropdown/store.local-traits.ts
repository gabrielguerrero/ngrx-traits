import {
  cache,
  createEntityFeatureFactory,
  LocalTraitsConfig,
  TraitsLocalStore,
} from 'ngrx-traits';
import {
  addFilterEntitiesTrait,
  addLoadEntitiesTrait,
} from 'ngrx-traits/traits';
import { ProductsStore, ProductsStoreFilter } from '../../../models';
import { Injectable, Injector } from '@angular/core';
import { ProductsStoreService } from '../../../services/products-store.service';
import { catchError, exhaustMap, map } from 'rxjs/operators';
import { createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';

export const storeCacheKeys = {
  all: ['stores'],
  list: () => [...storeCacheKeys.all, 'list'],
  departments: (storeId: number) => [...storeCacheKeys.list(), storeId + ''],
};

const storeFeatureFactory = createEntityFeatureFactory(
  { entityName: 'store' },
  addLoadEntitiesTrait<ProductsStore>(),
  addFilterEntitiesTrait<ProductsStore, ProductsStoreFilter>({
    filterFn: (filter, entity) => {
      return (
        !filter?.search ||
        entity.name.toLowerCase().includes(filter.search) ||
        entity.address.toLowerCase().includes(filter.search)
      );
    },
  })
);

@Injectable()
export class ProductsStoreLocalTraits extends TraitsLocalStore<
  typeof storeFeatureFactory
> {
  constructor(injector: Injector, private storeService: ProductsStoreService) {
    super(injector);
    this.traits.addEffects(this);
  }

  loadStores$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(this.localActions.loadStores),
      exhaustMap(() =>
        cache({
          key: storeCacheKeys.list(),
          store: this.store,
          source: this.storeService.getStores(),
          // no expire param so is stored forever
        }).pipe(
          map((res) => this.localActions.loadStoresSuccess({ entities: res })),
          catchError(() => of(this.localActions.loadStoresFail()))
        )
      )
    );
  });

  setup(): LocalTraitsConfig<typeof storeFeatureFactory> {
    return {
      componentName: 'StoreDropDown',
      traitsFactory: storeFeatureFactory,
    };
  }
}
