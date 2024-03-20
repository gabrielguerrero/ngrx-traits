import { capitalize } from '../util';

export function getWithEntitiesFilterKeys(config?: { collection?: string }) {
  const collection = config?.collection;
  const capitalizedProp = collection && capitalize(collection);
  return {
    filterKey: collection ? `${config.collection}Filter` : 'entitiesFilter',
    filterEntitiesKey: collection
      ? `filter${capitalizedProp}Entities`
      : 'filterEntities',
  };
}
