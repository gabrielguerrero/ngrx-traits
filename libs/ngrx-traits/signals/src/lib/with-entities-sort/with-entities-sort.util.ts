import { capitalize } from '../util';

export function getWithEntitiesSortKeys(config?: { collection?: string }) {
  const collection = config?.collection;
  const capitalizedProp = collection && capitalize(collection);
  return {
    sortKey: collection ? `${config.collection}EntitiesSort` : 'entitiesSort',
    sortEntitiesKey: collection
      ? `sort${capitalizedProp}Entities`
      : 'sortEntities',
  };
}
