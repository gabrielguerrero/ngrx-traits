import { createReducer, on } from '@ngrx/store';
import { LoadEntitiesActions } from '../load-entities/load-entities.model';
import {
  ƟLoadEntitiesFilterEntitiesState,
  FilterEntitiesKeyedConfig,
  FilterEntitiesMutators,
} from './filter.model';
import { ƟFilterEntitiesActions } from './filter.model.internal';

export function createFilterInitialState<Entity, F>(
  previousInitialState: any,
  allConfigs: FilterEntitiesKeyedConfig<Entity, F>
): ƟLoadEntitiesFilterEntitiesState<Entity, F> {
  return {
    ...previousInitialState,
    filters: allConfigs?.filter?.defaultFilter,
  };
}

export function createFilterTraitReducer<
  T,
  F,
  S extends ƟLoadEntitiesFilterEntitiesState<T, F>
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
