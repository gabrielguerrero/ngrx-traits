import { Injectable } from '@angular/core';
import { TraitEffect, Type } from '@ngrx-traits/core';
import { asyncScheduler, EMPTY, of, pipe, timer } from 'rxjs';
import {
  concatMap,
  debounce,
  distinctUntilChanged,
  first,
  map,
  pairwise,
  startWith,
} from 'rxjs/operators';
import { createEffect, ofType } from '@ngrx/effects';
import {
  FilterEntitiesKeyedConfig,
  FilterEntitiesSelectors,
} from './filter-entities.model';
import {
  LoadEntitiesActions,
  LoadEntitiesSelectors,
} from '../load-entities/load-entities.model';
import { ƟFilterEntitiesActions } from './filter-entities.model.internal';
import { EntitiesPaginationActions } from '../entities-pagination';

export function createFilterTraitEffects<Entity, F>(
  allActions: ƟFilterEntitiesActions<F> &
    LoadEntitiesActions<Entity> &
    EntitiesPaginationActions,
  allSelectors: FilterEntitiesSelectors<Entity, F> &
    LoadEntitiesSelectors<Entity>,
  allConfigs: FilterEntitiesKeyedConfig<Entity, F>
): Type<TraitEffect>[] {
  const traitConfig = allConfigs.filter;
  @Injectable()
  class FilterEffect extends TraitEffect {
    storeFilter$ = createEffect(
      () =>
        ({
          debounce: debounceTime = traitConfig!.defaultDebounceTime,
          scheduler = asyncScheduler,
        } = {}) =>
          this.actions$.pipe(
            ofType(allActions.filterEntities),
            debounce((value) =>
              value?.forceLoad ? EMPTY : timer(debounceTime, scheduler)
            ),
            concatMap((payload) =>
              payload.patch
                ? this.store.select(allSelectors.selectEntitiesFilter).pipe(
                    first(),
                    map((storedFilters) => ({
                      ...payload,
                      filters: { ...storedFilters, ...payload?.filters },
                    }))
                  )
                : of(payload)
            ),
            distinctUntilChanged(
              (previous, current) =>
                !current?.forceLoad &&
                JSON.stringify(previous?.filters) ===
                  JSON.stringify(current?.filters)
            ),
            traitConfig?.isRemoteFilter
              ? pipe(
                  startWith({
                    filters: traitConfig.defaultFilter as F,
                    patch: false,
                  }),
                  pairwise(),
                  concatMap(([previous, current]) =>
                    traitConfig?.isRemoteFilter!(
                      previous?.filters,
                      current?.filters
                    )
                      ? [
                          allActions.storeEntitiesFilter({
                            filters: current?.filters,
                            patch: current?.patch,
                          }),
                          allActions.loadEntities(),
                        ]
                      : [
                          allActions.storeEntitiesFilter({
                            filters: current?.filters,
                            patch: current?.patch,
                          }),
                        ]
                  )
                )
              : map((action) =>
                  allActions.storeEntitiesFilter({
                    filters: action?.filters,
                    patch: action?.patch,
                  })
                )
          )
    );

    loadEntities$ =
      (!traitConfig?.filterFn || traitConfig?.isRemoteFilter) &&
      createEffect(() => {
        return this.actions$.pipe(
          ofType(allActions['storeEntitiesFilter']),
          concatMap(() =>
            allActions?.loadEntitiesFirstPage
              ? [
                  allActions.clearEntitiesPagesCache(),
                  allActions.loadEntitiesFirstPage(),
                ]
              : [allActions.loadEntities()]
          )
        );
      });
  }

  return [FilterEffect];
}
