import {
  FilterEntitiesSelectors,
  FilterEntitiesState,
} from './filter-entities.model';
import { LoadEntitiesState } from '../load-entities';
export function selectEntitiesFilter<Entity, F>(
  state: LoadEntitiesState<Entity> & FilterEntitiesState<F>
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
