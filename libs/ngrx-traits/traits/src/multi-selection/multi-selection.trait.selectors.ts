import { createSelector } from '@ngrx/store';
import { selectTotalSelected } from './multi-selection.utils';
import {
  EntityAndMultipleSelectionState,
  MultipleSelectionSelectors,
} from './multi-selection.model';
import { LoadEntitiesSelectors } from '../load-entities';
import { Dictionary } from '@ngrx/entity/src/models';

export function createMultiSelectionTraitSelectors<Entity>(
  previousSelectors: LoadEntitiesSelectors<Entity>
): MultipleSelectionSelectors<Entity> {
  const { selectEntities, selectTotal } = previousSelectors;

  function selectIdsSelected(state: EntityAndMultipleSelectionState<Entity>) {
    return state.selectedIds;
  }
  const selectAllIdsSelected = createSelector(
    selectIdsSelected,
    (ids: Dictionary<boolean>) => Object.keys(ids)
  );
  const selectEntitiesSelected = createSelector(
    selectAllIdsSelected,
    selectEntities,
    (selectedIds, entities) =>
      selectedIds.reduce((acum: { [id: string]: Entity | undefined }, id) => {
        acum[id] = entities[id];
        return acum;
      }, {})
  );
  const selectAllSelected = createSelector(
    selectAllIdsSelected,
    selectEntities,
    (selectedIds, entities) => selectedIds.map((id) => entities[id]!)
  );

  const isAllSelected = createSelector(
    (state: EntityAndMultipleSelectionState<Entity>) => selectTotal(state),
    selectTotalSelected,
    (total, totalSelected) =>
      totalSelected > 0 && totalSelected === total
        ? 'all'
        : totalSelected === 0
        ? 'none'
        : 'some'
  );

  return {
    selectIdsSelected,
    selectAllIdsSelected,
    selectEntitiesSelected,
    selectAllSelected,
    selectTotalSelected,
    isAllSelected,
  };
}
