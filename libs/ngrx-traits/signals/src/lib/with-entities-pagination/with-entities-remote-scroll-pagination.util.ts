import { capitalize } from '../util';
import { createEvent } from '../with-event-handler/with-event-handler.util';

export function getWithEntitiesInfinitePaginationKeys(config?: {
  collection?: string;
}) {
  const collection = config?.collection;
  const capitalizedProp = collection && capitalize(collection);
  return {
    paginationKey: collection ? `${config.collection}Pagination` : 'pagination',
    entitiesCurrentPageKey: collection
      ? `${config.collection}CurrentPage`
      : 'entitiesCurrentPage',
    entitiesPagedRequestKey: collection
      ? `${config.collection}PagedRequest`
      : 'entitiesPagedRequest',
    loadMoreEntitiesKey: collection
      ? `loadMore${capitalizedProp}`
      : 'loadMoreEntities',
    loadEntitiesNextPageKey: collection
      ? `load${capitalizedProp}NextPage`
      : 'loadEntitiesNextPage',
    loadEntitiesPreviousPageKey: collection
      ? `load${capitalizedProp}PreviousPage`
      : 'loadEntitiesPreviousPage',
    loadEntitiesFirstPageKey: collection
      ? `load${capitalizedProp}FirstPage`
      : 'loadEntitiesFirstPage',
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
