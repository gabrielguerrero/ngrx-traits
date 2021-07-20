import {
  EntityAndMultipleSelectionState,
  MultipleSelectionMutators,
  MultipleSelectionSelectors,
} from './multi-selection.model';
import { toMap } from 'ngrx-traits';
import {
  multiClearSelection,
  multiDeselect,
  multiSelect,
  multiToggleSelect,
} from './multi-selection.utils';

export function createMultiSelectionTraitMutators<Entity>({
  isAllSelected,
}: MultipleSelectionSelectors<Entity>): MultipleSelectionMutators<Entity> {
  function toggleSelectAll<S extends EntityAndMultipleSelectionState<Entity>>(
    state: S
  ): S {
    const allSelected = isAllSelected(state);
    if (allSelected === 'all') {
      return {
        ...state,
        selectedIds: {},
      };
    } else {
      return {
        ...state,
        selectedIds: toMap(state.ids),
      };
    }
  }

  return {
    multiDeselect,
    multiSelect,
    multiToggleSelect,
    toggleSelectAll,
    multiClearSelection,
  };
}
