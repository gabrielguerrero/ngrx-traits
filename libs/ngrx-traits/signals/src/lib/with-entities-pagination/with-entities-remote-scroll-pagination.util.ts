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
    entitiesPagedRequestKey: collection
      ? `${config.collection}PagedRequest`
      : 'entitiesPagedRequest',
    loadMoreEntitiesKey: collection
      ? `loadMore${capitalizedProp}`
      : 'loadMoreEntities',
    setEntitiesPagedResultKey: collection
      ? `set${capitalizedProp}PagedResult`
      : 'setEntitiesPagedResult',
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
