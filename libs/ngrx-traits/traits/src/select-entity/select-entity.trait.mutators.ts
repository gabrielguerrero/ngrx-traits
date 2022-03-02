import { SelectEntityMutators, SelectEntityState } from './select-entity.model';
import { LoadEntitiesState } from 'ngrx-traits/traits';

export function createSelectEntityTraitMutators<
  Entity
>(): SelectEntityMutators<Entity> {
  function selectEntity<
    S extends LoadEntitiesState<Entity> & SelectEntityState
  >(id: string | number, state: S) {
    return {
      ...state,
      selectedId: id,
    };
  }
  function deselectEntity<
    S extends LoadEntitiesState<Entity> & SelectEntityState
  >(state: S) {
    return {
      ...state,
      selectedId: undefined,
    };
  }
  function toggleSelectEntity<
    S extends LoadEntitiesState<Entity> & SelectEntityState
  >(id: string | number, state: S) {
    return {
      ...state,
      selectedId: state.selectedId === id ? undefined : id,
    };
  }

  return {
    selectEntity,
    deselectEntity,
    toggleSelectEntity,
  };
}
