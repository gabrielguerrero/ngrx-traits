import {
  SelectEntitySelectors,
  SelectEntityState,
} from './select-entity.model';
import { LoadEntitiesState } from '../load-entities';

export function createSelectEntityTraitSelectors<
  Entity
>(): SelectEntitySelectors<Entity> {
  function selectEntityIdSelected(state: SelectEntityState) {
    return state.selectedId;
  }
  function selectEntitySelected<Entity>(
    state: LoadEntitiesState<Entity> & SelectEntityState
  ) {
    return (state.selectedId && state.entities[state.selectedId]) || undefined;
  }

  return {
    selectEntityIdSelected,
    selectEntitySelected,
  };
}
