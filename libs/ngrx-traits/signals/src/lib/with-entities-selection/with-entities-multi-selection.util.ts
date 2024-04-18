import { capitalize } from '../util';

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
      ? `clear${capitalizedProp}Selection`
      : 'clearEntitiesSelection',
    isAllEntitiesSelectedKey: collection
      ? `isAll${capitalizedProp}Selected`
      : 'isAllEntitiesSelected',
  };
}
