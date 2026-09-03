import { toMap } from '@ngrx-traits/core';

import { LoadEntitiesState } from '../load-entities';
import {
  SelectEntitiesMutators,
  SelectEntitiesSelectors,
  SelectEntitiesState,
} from './select-entities.model';
import {
  clearEntitiesSelection,
  deselectEntities,
  selectEntities,
  toggleSelectEntities,
} from './select-entities.utils';

export function createSelectEntitiesTraitMutators<Entity>({
  isAllEntitiesSelected,
}: SelectEntitiesSelectors<Entity>): SelectEntitiesMutators<Entity> {
  function toggleSelectAllEntities<
    S extends LoadEntitiesState<Entity> & SelectEntitiesState,
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
    selectEntities,
    deselectEntities,
    toggleSelectEntities,
    toggleSelectAllEntities,
    clearEntitiesSelection,
  };
}
