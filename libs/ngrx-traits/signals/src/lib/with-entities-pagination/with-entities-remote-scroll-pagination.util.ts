import { capitalize } from '../util';
import { createEvent } from '../with-event-handler/with-event-handler.util';

export function getWithEntitiesInfinitePaginationKeys(config?: {
  collection?: string;
}) {
  const collection = config?.collection;
  const capitalizedProp = collection && capitalize(collection);
  return {
    paginationKey: collection ? `${config.collection}EntitiesPagination` : 'pagination',
    entitiesCurrentPageKey: collection
      ? `${config.collection}EntitiesCurrentPage`
      : 'entitiesCurrentPage',
    entitiesPagedRequestKey: collection
      ? `${config.collection}EntitiesPagedRequest`
      : 'entitiesPagedRequest',
    loadMoreEntitiesKey: collection
      ? `loadMore${capitalizedProp}Entities`
      : 'loadMoreEntities',
    loadEntitiesNextPageKey: collection
      ? `load${capitalizedProp}EntitiesNextPage`
      : 'loadEntitiesNextPage',
    loadEntitiesPreviousPageKey: collection
      ? `load${capitalizedProp}EntitiesPreviousPage`
      : 'loadEntitiesPreviousPage',
    loadEntitiesFirstPageKey: collection
      ? `load${capitalizedProp}EntitiesFirstPage`
      : 'loadEntitiesFirstPage',
    setEntitiesPagedResultKey: collection
      ? `set${capitalizedProp}EntitiesPagedResult`
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
