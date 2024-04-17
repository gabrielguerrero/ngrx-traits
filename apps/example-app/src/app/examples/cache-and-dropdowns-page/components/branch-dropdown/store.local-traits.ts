import { Injectable } from '@angular/core';
import {
  addFilterEntitiesTrait,
  addLoadEntitiesTrait,
} from '@ngrx-traits/common';
import {
  cache,
  createEntityFeatureFactory,
  LocalTraitsConfig,
  TraitsLocalStore,
} from '@ngrx-traits/core';
import { createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, exhaustMap, map } from 'rxjs/operators';

import { Branch, BranchFilter } from '../../../models';
import { BranchService } from '../../../services/branch.service';

export const storeCacheKeys = {
  all: ['stores'],
  list: () => [...storeCacheKeys.all, 'list'],
  departments: (storeId: number) => [...storeCacheKeys.list(), storeId + ''],
};

const storeFeatureFactory = createEntityFeatureFactory(
  { entityName: 'branch', entitiesName: 'branches' },
  addLoadEntitiesTrait<Branch>(),
  addFilterEntitiesTrait<Branch, BranchFilter>({
    filterFn: (filter, entity) => {
      const searchString = filter?.search?.toLowerCase?.();
      return (
        !searchString ||
        entity.name.toLowerCase().includes(searchString) ||
        entity.address.toLowerCase().includes(searchString)
      );
    },
  }),
);

@Injectable()
export class BranchLocalTraits extends TraitsLocalStore<
  typeof storeFeatureFactory
> {
  constructor(private storeService: BranchService) {
    super();
    this.traits.addEffects(this);
  }

  loadBranches$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(this.localActions.loadBranches),
      exhaustMap(() =>
        cache({
          key: storeCacheKeys.list(),
          store: this.store,
          source: this.storeService.getBranches(),
          // no expire param so is stored forever
        }).pipe(
          map((res) =>
            this.localActions.loadBranchesSuccess({ entities: res.resultList }),
          ),
          catchError(() => of(this.localActions.loadBranchesFail())),
        ),
      ),
    );
  });

  setup(): LocalTraitsConfig<typeof storeFeatureFactory> {
    return {
      componentName: 'StoreDropDown',
      traitsFactory: storeFeatureFactory,
    };
  }
}
