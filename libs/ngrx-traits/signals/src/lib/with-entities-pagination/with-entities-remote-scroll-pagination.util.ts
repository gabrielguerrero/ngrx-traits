import { capitalize } from '../util';
import { createEvent } from '../with-event-handler/with-event-handler.util';

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

export function getWithEntitiesScrollPaginationEvents(config?: {
  collection?: string;
}) {
  const collection = config?.collection;
  return {
    loadingMoreEntities: createEvent(`${collection}.loadingMoreEntities`),
    entitiesResultsLoaded: createEvent(`${collection}.entitiesResultsLoaded`),
  };
}
