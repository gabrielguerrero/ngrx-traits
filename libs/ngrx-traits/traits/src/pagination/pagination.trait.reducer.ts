import { FilterActions, FilterKeyedConfig } from '../filter/filter.model';
import { createReducer, on } from '@ngrx/store';

import {
  LoadEntitiesActions,
  LoadEntitiesKeyedConfig,
  LoadEntitiesMutators,
  LoadEntitiesSelectors,
} from '../load-entities/load-entities.model';
import {
  EntityAndPaginationState,
  PaginationKeyedConfig,
  PaginationMutators,
} from './pagination.model';
import { CrudActions } from '../crud';
import { ƟPaginationActions } from './pagination.model.internal';
import { insertIf } from 'ngrx-traits';

export function createPaginationInitialState<Entity>(
  previousInitialState: any,
  allConfigs: PaginationKeyedConfig
): EntityAndPaginationState<Entity> {
  const { currentPage, pageSize, cacheType, pagesToCache } =
    allConfigs.pagination!;

  return {
    ...previousInitialState,
    pagination: {
      pageSize,
      currentPage,
      requestPage: currentPage,
      pagesToCache,
      cache: {
        type: cacheType,
        start: 0,
        end: 0,
      },
    },
  };
}

export function createPaginationTraitReducer<
  Entity,
  S extends EntityAndPaginationState<Entity>
>(
  initialState: S,
  allActions: ƟPaginationActions &
    FilterActions<Entity> &
    LoadEntitiesActions<Entity> &
    CrudActions<Entity>,
  allSelectors: LoadEntitiesSelectors<Entity>,
  allMutators: PaginationMutators<Entity> & LoadEntitiesMutators<Entity>,
  allConfigs: FilterKeyedConfig<Entity, unknown> &
    LoadEntitiesKeyedConfig<Entity> &
    PaginationKeyedConfig
) {
  function addToCacheTotal<S extends EntityAndPaginationState<Entity>>(
    state: S,
    add: number
  ) {
    return {
      ...state,
      pagination: {
        ...state.pagination,
        total: (state.pagination.total ?? 0) + add,
      },
    };
  }

  function clearPagesCache<S extends EntityAndPaginationState<Entity>>(
    state: S
  ): S {
    return {
      ...state,
      entities: {},
      ids: [],
      pagination: {
        ...state.pagination,
        currentPage: 0,
        total: 0,
        cache: { ...state.pagination.cache, start: 0, end: 0 },
      },
    };
  }

  function recalculateTotal<S extends EntityAndPaginationState<Entity>>(
    state: S
  ): S {
    const total = allSelectors.selectEntitiesTotal(state);
    return {
      ...state,
      status: 'success',
      pagination: {
        ...state.pagination,
        currentPage: 0,
        total,
        cache: {
          ...state.pagination.cache,
          start: 0,
          end: total,
        },
      },
    };
  }

  const filterRemote = !allConfigs?.filter?.filterFn;

  return createReducer(
    initialState,
    on(allActions.loadPage, (state, { index }) => ({
      ...state,
      pagination: {
        ...state.pagination,
        currentPage: index,
        requestPage: index,
      },
      status: 'loading',
    })),
    on(allActions.setRequestPage, (state, { index }) => ({
      ...state,
      pagination: {
        ...state.pagination,
        requestPage: index,
      },
      status: 'loading',
    })),
    on(allActions.loadPageSuccess, (state) => ({
      ...state,
      status: 'success',
    })),
    on(allActions.loadPageFail, (state) => ({
      ...state,
      status: 'fail',
    })),
    on(allActions.clearPagesCache, (state) => clearPagesCache(state)),
    on(allActions.loadEntitiesSuccess, (state, { entities, total }) =>
      allMutators.mergePaginatedEntities(entities, total, {
        ...state,
        status: 'success',
      })
    ),
    ...insertIf<S>(allActions.add, () =>
      on(allActions.add, (state, { entities }) =>
        addToCacheTotal(state, entities.length)
      )
    ),
    ...insertIf<S>(allActions.remove, () =>
      on(allActions.remove, (state, { keys }) =>
        addToCacheTotal(state, -keys.length)
      )
    ),
    ...insertIf<S>(filterRemote && allActions.filter, () =>
      on(allActions.filter, (state) => recalculateTotal(state))
    ),
    ...insertIf<S>(allActions.removeAll, () =>
      on(allActions.removeAll, (state) => clearPagesCache(state))
    )
  );
}
