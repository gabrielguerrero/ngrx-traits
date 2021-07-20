import { SortSelectors, SortState } from './sort.model';

export function createSortTraitSelectors<Entity>(): SortSelectors<Entity> {
  function selectSort(state: SortState<Entity>) {
    return state.sort?.current;
  }
  return {
    selectSort,
  };
}
