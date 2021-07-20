import {
  EntityAndSingleSelectionState,
  SingleSelectionMutators,
} from './single-selection.model';

export function createSingleSelectionTraitMutators<
  Entity
>(): SingleSelectionMutators<Entity> {
  function select<S extends EntityAndSingleSelectionState<Entity>>(
    id: string | number,
    state: S
  ) {
    return {
      ...state,
      selectedId: id,
    };
  }
  function deselect<S extends EntityAndSingleSelectionState<Entity>>(state: S) {
    return {
      ...state,
      selectedId: undefined,
    };
  }
  function toggleSelect<S extends EntityAndSingleSelectionState<Entity>>(
    id: string | number,
    state: S
  ) {
    return {
      ...state,
      selectedId: state.selectedId === id ? undefined : id,
    };
  }

  return {
    select,
    deselect,
    toggleSelect,
  };
}
