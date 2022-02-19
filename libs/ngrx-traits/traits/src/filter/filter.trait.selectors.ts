import { EntityAndFilterState, FilterSelectors } from './filter.model';
export function selectEntitiesFilter<Entity, F>(
  state: EntityAndFilterState<Entity, F>
) {
  return state.filters;
}

export function createFilterTraitSelectors<Entity, F>(): FilterSelectors<
  Entity,
  F
> {
  return {
    selectEntitiesFilter,
  };
}
