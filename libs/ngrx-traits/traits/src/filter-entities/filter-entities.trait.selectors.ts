import {
  ƟLoadEntitiesFilterEntitiesState,
  FilterEntitiesSelectors,
} from './filter-entities.model';
export function selectEntitiesFilter<Entity, F>(
  state: ƟLoadEntitiesFilterEntitiesState<Entity, F>
) {
  console.log({ state });
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
