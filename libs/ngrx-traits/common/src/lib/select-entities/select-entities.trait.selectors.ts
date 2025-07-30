import { Dictionary } from '@ngrx/entity';
import { createSelector } from '@ngrx/store';

import { LoadEntitiesSelectors, LoadEntitiesState } from '../load-entities';
import {
  SelectEntitiesSelectors,
  SelectEntitiesState,
} from './select-entities.model';
import { selectTotalSelectedEntities } from './select-entities.utils';

export function createSelectEntitiesTraitSelectors<Entity>(
  previousSelectors: LoadEntitiesSelectors<Entity>,
): SelectEntitiesSelectors<Entity> {
  const { selectEntitiesMap, selectEntitiesTotal } = previousSelectors;

  function selectEntitiesIdsSelectedMap(
    state: LoadEntitiesState<Entity> & SelectEntitiesState,
  ) {
    return state.selectedIds;
  }
  const selectEntitiesIdsSelectedList = createSelector(
    selectEntitiesIdsSelectedMap,
    (ids: Dictionary<boolean>) => Object.keys(ids),
  );
  const selectEntitiesSelectedMap = createSelector(
    selectEntitiesIdsSelectedList,
    selectEntitiesMap,
    (selectedIds, entities) =>
      selectedIds.reduce((acum: { [id: string]: Entity | undefined }, id) => {
        acum[id] = entities[id];
        return acum;
      }, {}),
  );
  const selectEntitiesSelectedList = createSelector(
    selectEntitiesIdsSelectedList,
    selectEntitiesMap,
    (selectedIds, entities) => selectedIds.map((id) => entities[id]!),
  );

  const isAllEntitiesSelected = createSelector(
    (state: LoadEntitiesState<Entity> & SelectEntitiesState) =>
      selectEntitiesTotal(state),
    selectTotalSelectedEntities,
    (total, totalSelected) =>
      totalSelected > 0 && totalSelected === total
        ? 'all'
        : totalSelected === 0
          ? 'none'
          : 'some',
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
