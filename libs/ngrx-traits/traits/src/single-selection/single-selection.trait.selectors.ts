import {
  ƟLoadEntitiesSelectEntiyState,
  SelectEntitySelectors,
  SelectEntityState,
} from './single-selection.model';

export function createSingleSelectionTraitSelectors<
  Entity
>(): SelectEntitySelectors<Entity> {
  function selectEntityIdSelected(state: SelectEntityState) {
    return state.selectedId;
  }
  function selectEntitySelected<Entity>(
    state: ƟLoadEntitiesSelectEntiyState<Entity>
  ) {
    return (state.selectedId && state.entities[state.selectedId]) || undefined;
  }

  return {
    selectEntityIdSelected,
    selectEntitySelected,
  };
}
