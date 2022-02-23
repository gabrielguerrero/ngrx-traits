import { SelectEntityMutators, SelectEntityState } from './select-entity.model';
import { LoadEntitiesState } from 'ngrx-traits/traits';

export function createSelectEntityTraitMutators<
  Entity
>(): SelectEntityMutators<Entity> {
  function select<S extends LoadEntitiesState<Entity> & SelectEntityState>(
    id: string | number,
    state: S
  ) {
    return {
      ...state,
      selectedId: id,
    };
  }
  function deselect<S extends LoadEntitiesState<Entity> & SelectEntityState>(
    state: S
  ) {
    return {
      ...state,
      selectedId: undefined,
    };
  }
  function toggleSelect<
    S extends LoadEntitiesState<Entity> & SelectEntityState
  >(id: string | number, state: S) {
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
