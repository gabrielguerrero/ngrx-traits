/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  EntityAndStatusState,
  LoadEntitiesActions,
  LoadEntitiesKeyedConfig,
  LoadEntitiesMutators,
} from './load-entities.model';
import { createReducer, on } from '@ngrx/store';
import { PaginationKeyedConfig } from '../pagination';
import { insertIf } from 'ngrx-traits';

export function createLoadEntitiesInitialState<Entity>(
  previousInitialState = {},
  allConfigs: LoadEntitiesKeyedConfig<Entity>
): EntityAndStatusState<Entity> {
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
  S extends EntityAndStatusState<T>
>(
  initialState: S,
  actions: LoadEntitiesActions<T>,
  allMutators: LoadEntitiesMutators<T>,
  allConfigs: LoadEntitiesKeyedConfig<T> & PaginationKeyedConfig
) {
  const handleEntitiesMerge = !allConfigs?.pagination;

  return createReducer(
    initialState,
    on(actions.fetch, (state) => ({
      ...state,
      status: 'loading',
    })),
    on(actions.fetchFail, (state) => ({
      ...state,
      status: 'fail',
    })),
    on(actions.fetchSuccess, (state) => ({
      ...state,
      status: 'success',
    })),
    ...insertIf<S>(handleEntitiesMerge, () =>
      on(actions.fetchSuccess, (state, { entities }) =>
        allMutators.setAll(entities, {
          ...state,
        })
      )
    )
  );
}
