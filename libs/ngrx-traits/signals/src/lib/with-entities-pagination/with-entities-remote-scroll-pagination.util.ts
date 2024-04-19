import { capitalize } from '../util';

export function getWithEntitiesInfinitePaginationKeys(config?: {
  collection?: string;
}) {
  const collection = config?.collection;
  const capitalizedProp = collection && capitalize(collection);
  return {
    entitiesScrollCacheKey: collection
      ? `${config.collection}ScrollCache`
      : 'entitiesScrollCache',
    entitiesRequestKey: collection
      ? `${config.collection}Request`
      : 'entitiesRequest',
    loadMoreEntitiesKey: collection
      ? `loadMore${capitalizedProp}`
      : 'loadMoreEntities',
    setEntitiesResultKey: collection
      ? `set${capitalizedProp}Result`
      : 'setEntitiesResult',
  };
}
