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
    on(allActions.add, (state, { entities }) =>
      allMutators.add(entities, state)
    ),
    on(allActions.update, (state, { updates }) =>
      allMutators.update(updates, state)
    ),
    on(allActions.upsert, (state, { entities }) =>
      allMutators.upsert(entities, state)
    ),
    on(allActions.remove, (state, { keys }) =>
      allMutators.remove(keys as any[], state)
    ),
    on(allActions.removeAll, (state, { predicate }) =>
      predicate
        ? allMutators.remove(predicate, state)
        : allMutators.removeAll(state)
    ),
    on(allActions.clearChanges, (state) => allMutators.clearChanges(state)),
    ...insertIf<S>(sortRemote, () =>
      on(allActions.sort, (state) => allMutators.clearChanges(state))
    ),
    ...insertIf<S>(filterRemote, () =>
      on(allActions.filter, (state) => allMutators.clearChanges(state))
    ),
    ...insertIf<S>(!allActions.loadPageSuccess, () =>
      on(allActions.fetchSuccess, (state) => allMutators.clearChanges(state))
    ),
    ...insertIf<S>(
      !!allActions.loadPageSuccess && paginationCacheType === 'partial',
      () =>
        on(allActions.loadPageSuccess, (state) =>
          allMutators.clearChanges(state)
        )
    )
  );
}
