import {
  ƟLoadEntitiesSelectEntiyState,
  SelectEntityMutators,
} from './select-entity.model';

export function createSelectEntityTraitMutators<
  Entity
>(): SelectEntityMutators<Entity> {
  function select<S extends ƟLoadEntitiesSelectEntiyState<Entity>>(
    id: string | number,
    state: S
  ) {
    return {
      ...state,
      selectedId: id,
    };
  }
  function deselect<S extends ƟLoadEntitiesSelectEntiyState<Entity>>(state: S) {
    return {
      ...state,
      selectedId: undefined,
    };
  }
  function toggleSelect<S extends ƟLoadEntitiesSelectEntiyState<Entity>>(
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
