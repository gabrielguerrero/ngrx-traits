import {
  ƟLoadEntitiesFilterEntitiesState,
  FilterEntitiesSelectors,
} from './filter.model';
export function selectEntitiesFilter<Entity, F>(
  state: ƟLoadEntitiesFilterEntitiesState<Entity, F>
) {
  return state.filters;
}

export function createFilterTraitSelectors<
  Entity,
  F
>(): FilterEntitiesSelectors<Entity, F> {
  return {
    selectEntitiesFilter,
  };
}
