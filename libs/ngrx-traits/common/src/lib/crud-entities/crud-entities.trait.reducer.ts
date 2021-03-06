import {
  FilterEntitiesActions,
  FilterEntitiesKeyedConfig,
} from '../filter-entities/filter-entities.model';
import { createReducer, on } from '@ngrx/store';
import {
  CrudEntitiesActions,
  CrudEntitiesKeyedConfig,
  CrudEntitiesMutators,
  CrudEntitiesState,
} from './crud-entities.model';
import {
  LoadEntitiesActions,
  LoadEntitiesKeyedConfig,
  LoadEntitiesState,
} from '../load-entities';
import { SortEntitiesActions, SortEntitiesKeyedConfig } from '../sort-entities';
import {
  EntitiesPaginationActions,
  EntitiesPaginationKeyedConfig,
} from '../entities-pagination';
import { insertIf } from '@ngrx-traits/core';

export function createCrudInitialState<Entity>(
  previousInitialState: any
): LoadEntitiesState<Entity> & CrudEntitiesState<Entity> {
  return {
    ...previousInitialState,
    changes: [],
  };
}
export function createCrudTraitReducer<
  Entity,
  S extends LoadEntitiesState<Entity> & CrudEntitiesState<Entity>
>(
  initialState: S,
  allActions: CrudEntitiesActions<Entity> &
    LoadEntitiesActions<Entity> &
    SortEntitiesActions<Entity> &
    FilterEntitiesActions<any> &
    EntitiesPaginationActions,
  allMutators: CrudEntitiesMutators<Entity>,
  allConfigs: CrudEntitiesKeyedConfig &
    FilterEntitiesKeyedConfig<Entity, unknown> &
    LoadEntitiesKeyedConfig<Entity> &
    SortEntitiesKeyedConfig<Entity> &
    EntitiesPaginationKeyedConfig
) {
  const sortRemote = allConfigs.sort?.remote;
  const filterRemote = allConfigs.filter && !allConfigs.filter?.filterFn;
  const paginationCacheType = allConfigs.pagination?.cacheType;

  return createReducer(
    initialState,
    on(allActions.addEntities, (state, { entities }) =>
      allMutators.addEntities(entities, state)
    ),
    on(allActions.updateEntities, (state, { updates }) =>
      allMutators.updateEntities(updates, state)
    ),
    on(allActions.upsertEntities, (state, { entities }) =>
      allMutators.upsertEntities(entities, state)
    ),
    on(allActions.removeEntities, (state, { keys }) =>
      allMutators.removeEntities(keys as any[], state)
    ),
    on(allActions.removeAllEntities, (state, { predicate }) =>
      predicate
        ? allMutators.removeEntities(predicate, state)
        : allMutators.removeAllEntities(state)
    ),
    on(allActions.clearEntitiesChanges, (state) =>
      allMutators.clearEntitiesChanges(state)
    ),
    ...insertIf<S>(sortRemote, () =>
      on(allActions.sortEntities, (state) =>
        allMutators.clearEntitiesChanges(state)
      )
    ),
    ...insertIf<S>(filterRemote, () =>
      on(allActions.filterEntities, (state) =>
        allMutators.clearEntitiesChanges(state)
      )
    ),
    ...insertIf<S>(!allActions.loadEntitiesPageSuccess, () =>
      on(allActions.loadEntitiesSuccess, (state) =>
        allMutators.clearEntitiesChanges(state)
      )
    ),
    ...insertIf<S>(
      !!allActions.loadEntitiesPageSuccess && paginationCacheType === 'partial',
      () =>
        on(allActions.loadEntitiesPageSuccess, (state) =>
          allMutators.clearEntitiesChanges(state)
        )
    )
  );
}
