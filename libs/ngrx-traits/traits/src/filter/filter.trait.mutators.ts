import {
  ƟLoadEntitiesFilterEntitiesState,
  FilterEntitiesMutators,
} from './filter.model';

export function createFilterTraitMutators<Entity, F>(): FilterEntitiesMutators<
  Entity,
  F
> {
  function setFilters<S extends ƟLoadEntitiesFilterEntitiesState<Entity, F>>(
    filters: F,
    state: S
  ) {
    return {
      ...state,
      filters,
    };
  }
  return { setFilters };
}
