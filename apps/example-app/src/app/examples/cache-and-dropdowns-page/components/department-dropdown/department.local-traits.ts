/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  cache,
  createEntityFeatureFactory,
  LocalTraitsConfig,
  TraitsLocalStore,
} from '@ngrx-traits/core';
import {
  addFilterEntitiesTrait,
  addLoadEntitiesTrait,
} from '@ngrx-traits/common';
import { Department, DepartmentFilter } from '../../../models';
import { Injectable, Injector } from '@angular/core';
import { ProductsStoreService } from '../../../services/products-store.service';
import { catchError, exhaustMap, map } from 'rxjs/operators';
import { concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { storeCacheKeys } from '../store-dropdown/store.local-traits';

const departmentFeatureFactory = createEntityFeatureFactory(
  { entityName: 'department' },
  addLoadEntitiesTrait<Department>(),
  addFilterEntitiesTrait<Department, DepartmentFilter>({
    filterFn: (filter, entity) => {
      return (
        !filter?.search ||
        !!entity.name.toLowerCase?.().includes(filter?.search.toLowerCase())
      );
    },
    isRemoteFilter: (previous, current) =>
      previous?.storeId !== current?.storeId,
  })
);

@Injectable()
export class DepartmentLocalTraits extends TraitsLocalStore<
  typeof departmentFeatureFactory
> {
  constructor(private storeService: ProductsStoreService) {
    super();
    this.traits.addEffects(this);
  }

  loadDepartments$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(this.localActions.loadDepartments),
      concatLatestFrom(() =>
        this.store.select(this.localSelectors.selectDepartmentsFilter)
      ),
      exhaustMap(([_, filters]) =>
        cache({
          key: storeCacheKeys.departments(filters!.storeId),
          store: this.store,
          source: this.storeService.getStoreDepartments(filters!.storeId),
          expires: 1000 * 60 * 3,
          maxCacheSize: 3,
        }).pipe(
          map((res) =>
            this.localActions.loadDepartmentsSuccess({
              entities: res,
            })
          ),
          catchError(() => of(this.localActions.loadDepartmentsFail()))
        )
      )
    );
  });

  setup(): LocalTraitsConfig<typeof departmentFeatureFactory> {
    return {
      componentName: 'DepartmentDropDown',
      traitsFactory: departmentFeatureFactory,
    };
  }
}
