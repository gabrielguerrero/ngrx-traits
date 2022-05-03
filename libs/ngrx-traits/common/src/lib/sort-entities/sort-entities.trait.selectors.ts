import {
  SortEntitiesSelectors,
  SortEntitiesState,
} from './sort-entities.model';

export function createSortTraitSelectors<
  Entity
>(): SortEntitiesSelectors<Entity> {
  function selectEntitiesSort(state: SortEntitiesState<Entity>) {
    return state.sort?.current;
  }
  return {
    selectEntitiesSort,
  };
}
