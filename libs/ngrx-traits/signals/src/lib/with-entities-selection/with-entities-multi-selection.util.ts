import { computed, Signal } from '@angular/core';

import { capitalize } from '../util';
import { getWithCallStatusKeys } from '../with-call-status/with-call-status.util';
import { QueryMapper } from '../with-sync-to-route-query-params/with-sync-to-route-query-params.util';
import { EntitiesMultiSelectionMethods } from './with-entities-multi-selection.model';

export function getEntitiesMultiSelectionKeys(config?: {
  collection?: string;
}) {
  const collection = config?.collection;
  const capitalizedProp = collection && capitalize(collection);
  return {
    selectedIdsMapKey: collection
      ? `${config.collection}IdsSelectedMap`
      : 'idsSelectedMap',
    selectedEntitiesKey: collection
      ? `${config.collection}EntitiesSelected`
      : 'entitiesSelected',
    selectedEntitiesIdsKey: collection
      ? `${config.collection}IdsSelected`
      : 'idsSelected',
    selectEntitiesKey: collection
      ? `select${capitalizedProp}Entities`
      : 'selectEntities',
    deselectEntitiesKey: collection
      ? `deselect${capitalizedProp}Entities`
      : 'deselectEntities',
    toggleSelectEntitiesKey: collection
      ? `toggleSelect${capitalizedProp}Entities`
      : 'toggleSelectEntities',
    toggleSelectAllEntitiesKey: collection
      ? `toggleSelectAll${capitalizedProp}Entities`
      : 'toggleSelectAllEntities',
    clearEntitiesSelectionKey: collection
      ? `clear${capitalizedProp}EntitiesSelection`
      : 'clearEntitiesSelection',
    isAllEntitiesSelectedKey: collection
      ? `isAll${capitalizedProp}EntitiesSelected`
      : 'isAllEntitiesSelected',
  };
}

export function getQueryMapperForMultiSelection(config?: {
  collection?: string;
}): QueryMapper<{
  selectedIds: string | undefined;
}> {
  const { selectedEntitiesIdsKey, selectEntitiesKey } =
    getEntitiesMultiSelectionKeys(config);
  const { loadingKey, loadedKey } = getWithCallStatusKeys({
    collection: config?.collection,
  });
  return {
    queryParamsToState: (query, store) => {
      const selectedIds = query.selectedIds;
      if (selectedIds) {
        const selectEntities = store[
          selectEntitiesKey
        ] as EntitiesMultiSelectionMethods['selectEntities'];

        const ids = selectedIds
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean);

        selectEntities({ ids });
      }
    },
    stateToQueryParams: (store) => {
      const selectedIds = store[selectedEntitiesIdsKey] as
        | Signal<(string | number)[]>
        | undefined;
      return selectedIds
        ? computed(() => ({
            selectedIds:
              selectedIds().length > 0 ? selectedIds().join(',') : undefined,
          }))
        : undefined;
    },
  };
}
