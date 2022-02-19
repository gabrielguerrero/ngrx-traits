import {
  FilterEntitiesActions,
  FilterEntitiesKeyedConfig,
} from '../filter/filter.model';
import { createReducer, on } from '@ngrx/store';

import {
  LoadEntitiesActions,
  LoadEntitiesKeyedConfig,
  LoadEntitiesMutators,
  LoadEntitiesSelectors,
} from '../load-entities/load-entities.model';
import {
  ƟLoadEntitiesEntitiesPaginationState,
  EntitiesPaginationKeyedConfig,
  EntitiesPaginationMutators,
} from './pagination.model';
import { CrudEntitiesActions } from '../crud';
import { ƟPaginationActions } from './pagination.model.internal';
import { insertIf } from 'ngrx-traits';

export function createPaginationInitialState<Entity>(
  previousInitialState: any,
  allConfigs: EntitiesPaginationKeyedConfig
): ƟLoadEntitiesEntitiesPaginationState<Entity> {
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
  S extends ƟLoadEntitiesEntitiesPaginationState<Entity>
>(
  initialState: S,
  allActions: ƟPaginationActions &
    FilterEntitiesActions<Entity> &
    LoadEntitiesActions<Entity> &
    CrudEntitiesActions<Entity>,
  allSelectors: LoadEntitiesSelectors<Entity>,
  allMutators: EntitiesPaginationMutators<Entity> &
    LoadEntitiesMutators<Entity>,
  allConfigs: FilterEntitiesKeyedConfig<Entity, unknown> &
    LoadEntitiesKeyedConfig<Entity> &
    EntitiesPaginationKeyedConfig
) {
  function addToCacheTotal<
    S extends ƟLoadEntitiesEntitiesPaginationState<Entity>
  >(state: S, add: number) {
    return {
      ...state,
      pagination: {
        ...state.pagination,
        total: (state.pagination.total ?? 0) + add,
      },
    };
  }

  function clearPagesCache<
    S extends ƟLoadEntitiesEntitiesPaginationState<Entity>
  >(state: S): S {
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

  function recalculateTotal<
    S extends ƟLoadEntitiesEntitiesPaginationState<Entity>
  >(state: S): S {
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
    on(allActions.loadEntitiesPage, (state, { index }) => ({
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
    on(allActions.loadEntitiesPageSuccess, (state) => ({
      ...state,
      status: 'success',
    })),
    on(allActions.loadEntitiesPageFail, (state) => ({
      ...state,
      status: 'fail',
    })),
    on(allActions.clearEntitiesPagesCache, (state) => clearPagesCache(state)),
    on(allActions.loadEntitiesSuccess, (state, { entities, total }) =>
      allMutators.mergePaginatedEntities(entities, total, {
        ...state,
        status: 'success',
      })
    ),
    ...insertIf<S>(allActions.addEntities, () =>
      on(allActions.addEntities, (state, { entities }) =>
        addToCacheTotal(state, entities.length)
      )
    ),
    ...insertIf<S>(allActions.removeEntities, () =>
      on(allActions.removeEntities, (state, { keys }) =>
        addToCacheTotal(state, -keys.length)
      )
    ),
    ...insertIf<S>(filterRemote && allActions.filterEntities, () =>
      on(allActions.filterEntities, (state) => recalculateTotal(state))
    ),
    ...insertIf<S>(allActions.removeAllEntities, () =>
      on(allActions.removeAllEntities, (state) => clearPagesCache(state))
    )
  );
}
