import { SelectEntitiesState } from './select-entities.model';
import { LoadEntitiesState } from '../load-entities';

export function deselectEntities<S extends SelectEntitiesState>(
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

export function selectEntities<S extends SelectEntitiesState>(
  id: number | string,
  state: S
): S {
  return {
    ...state,
    selectedIds: { ...state.selectedIds, [id]: true },
  };
}

export function toggleSelectEntities<S extends SelectEntitiesState>(
  id: number | string,
  state: S
): S {
  const selected = state.selectedIds[id];
  if (selected) {
    return deselectEntities(id, state);
  } else {
    return selectEntities(id, state);
  }
}
export function clearEntitiesSelection<S extends SelectEntitiesState>(
  state: S
): S {
  return { ...state, selectedIds: {} };
}

export function selectTotalSelectedEntities<
  Entity,
  S extends LoadEntitiesState<Entity> & SelectEntitiesState
>(state: S): number {
  return Object.keys(state.selectedIds).length;
}
