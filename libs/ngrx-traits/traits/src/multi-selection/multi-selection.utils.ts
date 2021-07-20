import {
  EntityAndMultipleSelectionState,
  MultipleSelectionState,
} from './multi-selection.model';

export function multiDeselect<S extends MultipleSelectionState>(
  id: number | string,
  state: S
): S {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [id]: _value, ...selectedIds } = state.selectedIds;
  return {
    ...state,
    selectedIds: selectedIds,
  };
}

export function multiSelect<S extends MultipleSelectionState>(
  id: number | string,
  state: S
): S {
  return {
    ...state,
    selectedIds: { ...state.selectedIds, [id]: true },
  };
}

export function multiToggleSelect<S extends MultipleSelectionState>(
  id: number | string,
  state: S
): S {
  const selected = state.selectedIds[id];
  if (selected) {
    return multiDeselect(id, state);
  } else {
    return multiSelect(id, state);
  }
}
export function multiClearSelection<S extends MultipleSelectionState>(
  state: S
): S {
  return { ...state, selectedIds: {} };
}

export function selectTotalSelected<
  T,
  S extends EntityAndMultipleSelectionState<T>
>(state: S): number {
  return Object.keys(state.selectedIds).length;
}

export type Selected = 'all' | 'some' | 'none';
