/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable } from '@angular/core';
import { Department, DepartmentFilter } from '@example-api/shared/models';
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
import { concatLatestFrom } from '@ngrx/operators';
import { of } from 'rxjs';
import { catchError, exhaustMap, map } from 'rxjs/operators';

import { BranchService } from '../../../../services/branch.service';
import { storeCacheKeys } from '../branch-dropdown/store.local-traits';

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
  }),
);

@Injectable()
export class DepartmentLocalTraits extends TraitsLocalStore<
  typeof departmentFeatureFactory
> {
  constructor(private storeService: BranchService) {
    super();
    this.traits.addEffects(this);
  }

  loadDepartments$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(this.localActions.loadDepartments),
      concatLatestFrom(() =>
        this.store.select(this.localSelectors.selectDepartmentsFilter),
      ),
      exhaustMap(([, filters]) =>
        cache({
          key: storeCacheKeys.departments(filters!.storeId),
          store: this.store,
          source: this.storeService.getBranchDepartments(filters!.storeId),
          expires: 1000 * 60 * 3,
          maxCacheSize: 3,
        }).pipe(
          map((res) =>
            this.localActions.loadDepartmentsSuccess({
              entities: res,
            }),
          ),
          catchError(() => of(this.localActions.loadDepartmentsFail())),
        ),
      ),
    );
  });

  setup(): LocalTraitsConfig<typeof departmentFeatureFactory> {
    return {
      componentName: 'DepartmentDropDown',
      traitsFactory: departmentFeatureFactory,
    };
  }
}
