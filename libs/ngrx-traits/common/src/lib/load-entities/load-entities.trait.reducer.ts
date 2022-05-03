/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  LoadEntitiesState,
  LoadEntitiesActions,
  LoadEntitiesKeyedConfig,
  LoadEntitiesMutators,
} from './load-entities.model';
import { createReducer, on } from '@ngrx/store';
import { EntitiesPaginationKeyedConfig } from '../entities-pagination';
import { insertIf } from '@ngrx-traits/core';

export function createLoadEntitiesInitialState<Entity>(
  previousInitialState = {},
  allConfigs: LoadEntitiesKeyedConfig<Entity>
): LoadEntitiesState<Entity> {
  const traitConfig = allConfigs.loadEntities;
  const adapter = traitConfig!.adapter;

  return {
    ...previousInitialState,
    ...adapter!.getInitialState(),
    status: undefined,
  };
}

export function createLoadEntitiesTraitReducer<
  T,
  S extends LoadEntitiesState<T>
>(
  initialState: S,
  actions: LoadEntitiesActions<T>,
  allMutators: LoadEntitiesMutators<T>,
  allConfigs: LoadEntitiesKeyedConfig<T> & EntitiesPaginationKeyedConfig
) {
  const handleEntitiesMerge = !allConfigs?.pagination;

  return createReducer(
    initialState,
    on(actions.loadEntities, (state) => ({
      ...state,
      status: 'loading',
    })),
    on(actions.loadEntitiesFail, (state) => ({
      ...state,
      status: 'fail',
    })),
    on(actions.loadEntitiesSuccess, (state) => ({
      ...state,
      status: 'success',
    })),
    ...insertIf<S>(handleEntitiesMerge, () =>
      on(actions.loadEntitiesSuccess, (state, { entities }) =>
        allMutators.setEntitiesList(entities, {
          ...state,
        })
      )
    )
  );
}
