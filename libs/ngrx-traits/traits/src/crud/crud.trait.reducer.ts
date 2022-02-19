import { FilterActions, FilterKeyedConfig } from '../filter/filter.model';
import { createReducer, on } from '@ngrx/store';
import {
  CrudActions,
  CrudKeyedConfig,
  CrudMutators,
  EntityAndCrudState,
} from './crud.model';
import { LoadEntitiesActions, LoadEntitiesKeyedConfig } from '../load-entities';
import { SortActions, SortKeyedConfig } from '../sort';
import { PaginationActions, PaginationKeyedConfig } from '../pagination';
import { insertIf } from 'ngrx-traits';

export function createCrudInitialState<Entity>(
  previousInitialState: any
): EntityAndCrudState<Entity> {
  return {
    ...previousInitialState,
    changes: [],
  };
}
export function createCrudTraitReducer<
  Entity,
  S extends EntityAndCrudState<Entity>
>(
  initialState: S,
  allActions: CrudActions<Entity> &
    LoadEntitiesActions<Entity> &
    SortActions<Entity> &
    FilterActions<any> &
    PaginationActions,
  allMutators: CrudMutators<Entity>,
  allConfigs: CrudKeyedConfig &
    FilterKeyedConfig<Entity, unknown> &
    LoadEntitiesKeyedConfig<Entity> &
    SortKeyedConfig<Entity> &
    PaginationKeyedConfig
) {
  const sortRemote = allConfigs.sort?.remote;
  const filterRemote = allConfigs.filter && !allConfigs.filter?.filterFn;
  const paginationCacheType = allConfigs.pagination?.cacheType;

  return createReducer(
    initialState,
    on(allActions.addEntities, (state, { entities }) =>
      allMutators.add(entities, state)
    ),
    on(allActions.updateEntities, (state, { updates }) =>
      allMutators.update(updates, state)
    ),
    on(allActions.upsertEntities, (state, { entities }) =>
      allMutators.upsert(entities, state)
    ),
    on(allActions.removeEntities, (state, { keys }) =>
      allMutators.remove(keys as any[], state)
    ),
    on(allActions.removeAllEntities, (state, { predicate }) =>
      predicate
        ? allMutators.remove(predicate, state)
        : allMutators.removeAll(state)
    ),
    on(allActions.clearEntitiesChanges, (state) =>
      allMutators.clearChanges(state)
    ),
    ...insertIf<S>(sortRemote, () =>
      on(allActions.sortEntities, (state) => allMutators.clearChanges(state))
    ),
    ...insertIf<S>(filterRemote, () =>
      on(allActions.filterEntities, (state) => allMutators.clearChanges(state))
    ),
    ...insertIf<S>(!allActions.loadEntitiesPageSuccess, () =>
      on(allActions.loadEntitiesSuccess, (state) =>
        allMutators.clearChanges(state)
      )
    ),
    ...insertIf<S>(
      !!allActions.loadEntitiesPageSuccess && paginationCacheType === 'partial',
      () =>
        on(allActions.loadEntitiesPageSuccess, (state) =>
          allMutators.clearChanges(state)
        )
    )
  );
}
