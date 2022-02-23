import {
  SelectEntitiesMutators,
  SelectEntitiesSelectors,
  SelectEntitiesState,
} from './select-entities.model';
import { toMap } from 'ngrx-traits';
import {
  multiClearSelection,
  multiDeselect,
  multiSelect,
  multiToggleSelect,
} from './select-entities.utils';
import { LoadEntitiesState } from 'ngrx-traits/traits';

export function createSelectEntitiesTraitMutators<Entity>({
  isAllEntitiesSelected,
}: SelectEntitiesSelectors<Entity>): SelectEntitiesMutators<Entity> {
  function toggleSelectAll<
    S extends LoadEntitiesState<Entity> & SelectEntitiesState
  >(state: S): S {
    const allSelected = isAllEntitiesSelected(state);
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
