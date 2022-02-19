import { SortSelectors, SortState } from './sort.model';

export function createSortTraitSelectors<Entity>(): SortSelectors<Entity> {
  function selectEntitiesSort(state: SortState<Entity>) {
    return state.sort?.current;
  }
  return {
    selectEntitiesSort,
  };
}
