import {
  EntityAndSingleSelectionState,
  SingleSelectionSelectors,
  SingleSelectionState,
} from './single-selection.model';

export function createSingleSelectionTraitSelectors<
  Entity
>(): SingleSelectionSelectors<Entity> {
  function selectIdSelected(state: SingleSelectionState) {
    return state.selectedId;
  }
  function selectEntitySelected<Entity>(
    state: EntityAndSingleSelectionState<Entity>
  ) {
    return (state.selectedId && state.entities[state.selectedId]) || undefined;
  }

  return {
    selectIdSelected,
    selectEntitySelected,
  };
}
