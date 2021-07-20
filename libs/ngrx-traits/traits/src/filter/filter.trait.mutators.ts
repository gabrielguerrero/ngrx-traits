import { EntityAndFilterState, FilterMutators } from './filter.model';

export function createFilterTraitMutators<Entity, F>(): FilterMutators<
  Entity,
  F
> {
  function setFilters<S extends EntityAndFilterState<Entity, F>>(
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
