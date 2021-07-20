import { createReducer, on } from '@ngrx/store';
import { LoadEntitiesActions } from '../load-entities/load-entities.model';
import {
  EntityAndFilterState,
  FilterKeyedConfig,
  FilterMutators,
} from './filter.model';
import { ƟFilterActions } from './filter.model.internal';

export function createFilterInitialState<Entity, F>(
  previousInitialState: any,
  allConfigs: FilterKeyedConfig<Entity, F>
): EntityAndFilterState<Entity, F> {
  return {
    ...previousInitialState,
    filters: allConfigs?.filter?.defaultFilter,
  };
}

export function createFilterTraitReducer<
  T,
  F,
  S extends EntityAndFilterState<T, F>
>(
  initialState: S,
  allActions: ƟFilterActions<F> & LoadEntitiesActions<T>,
  allMutators: FilterMutators<T, F>
) {
  return createReducer(
    initialState,
    on(allActions.storeFilter, (state, { filters }) =>
      allMutators.setFilters(filters, state)
    )
  );
}
