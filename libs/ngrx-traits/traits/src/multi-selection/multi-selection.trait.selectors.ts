import { createSelector } from '@ngrx/store';
import { selectTotalSelectedEntities } from './multi-selection.utils';
import {
  EntityAndMultipleSelectionState,
  MultipleSelectionSelectors,
} from './multi-selection.model';
import { LoadEntitiesSelectors } from '../load-entities';
import { Dictionary } from '@ngrx/entity/src/models';

export function createMultiSelectionTraitSelectors<Entity>(
  previousSelectors: LoadEntitiesSelectors<Entity>
): MultipleSelectionSelectors<Entity> {
  const { selectEntitiesMap, selectEntitiesTotal } = previousSelectors;

  function selectEntitiesIdsSelectedMap(
    state: EntityAndMultipleSelectionState<Entity>
  ) {
    return state.selectedIds;
  }
  const selectEntitiesIdsSelectedList = createSelector(
    selectEntitiesIdsSelectedMap,
    (ids: Dictionary<boolean>) => Object.keys(ids)
  );
  const selectEntitiesSelectedMap = createSelector(
    selectEntitiesIdsSelectedList,
    selectEntitiesMap,
    (selectedIds, entities) =>
      selectedIds.reduce((acum: { [id: string]: Entity | undefined }, id) => {
        acum[id] = entities[id];
        return acum;
      }, {})
  );
  const selectEntitiesSelectedList = createSelector(
    selectEntitiesIdsSelectedList,
    selectEntitiesMap,
    (selectedIds, entities) => selectedIds.map((id) => entities[id]!)
  );

  const isAllEntitiesSelected = createSelector(
    (state: EntityAndMultipleSelectionState<Entity>) =>
      selectEntitiesTotal(state),
    selectTotalSelectedEntities,
    (total, totalSelected) =>
      totalSelected > 0 && totalSelected === total
        ? 'all'
        : totalSelected === 0
        ? 'none'
        : 'some'
  );

  return {
    selectEntitiesIdsSelectedMap,
    selectEntitiesIdsSelectedList,
    selectEntitiesSelectedMap,
    selectEntitiesSelectedList,
    selectTotalSelectedEntities,
    isAllEntitiesSelected,
  };
}
