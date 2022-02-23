import { createReducer, on } from '@ngrx/store';
import {
  LoadEntitiesActions,
  LoadEntitiesState,
} from '../load-entities/load-entities.model';
import {
  FilterEntitiesKeyedConfig,
  FilterEntitiesMutators,
  FilterEntitiesState,
} from './filter-entities.model';
import { ƟFilterEntitiesActions } from './filter-entities.model.internal';

export function createFilterInitialState<Entity, F>(
  previousInitialState: any,
  allConfigs: FilterEntitiesKeyedConfig<Entity, F>
): LoadEntitiesState<Entity> & FilterEntitiesState<F> {
  return {
    ...previousInitialState,
    filters: allConfigs?.filter?.defaultFilter,
  };
}

export function createFilterTraitReducer<
  T,
  F,
  S extends LoadEntitiesState<T> & FilterEntitiesState<F>
>(
  initialState: S,
  allActions: ƟFilterEntitiesActions<F> & LoadEntitiesActions<T>,
  allMutators: FilterEntitiesMutators<T, F>
) {
  return createReducer(
    initialState,
    on(allActions.storeEntitiesFilter, (state, { filters }) =>
      allMutators.setFilters(filters, state)
    )
  );
}
