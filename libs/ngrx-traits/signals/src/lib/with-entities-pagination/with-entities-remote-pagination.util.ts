import { capitalize } from '../util';
import {
  createEvent,
  props,
} from '../with-event-handler/with-event-handler.util';

export function getWithEntitiesRemotePaginationKeys(config?: {
  collection?: string;
}) {
  const collection = config?.collection;
  const capitalizedProp = collection && capitalize(collection);
  return {
    paginationKey: collection
      ? `${config.collection}Pagination`
      : 'entitiesPagination',
    entitiesCurrentPageKey: collection
      ? `${config.collection}CurrentPage`
      : 'entitiesCurrentPage',
    entitiesPagedRequestKey: collection
      ? `${config.collection}PagedRequest`
      : 'entitiesPagedRequest',
    loadEntitiesPageKey: collection
      ? `load${capitalizedProp}Page`
      : 'loadEntitiesPage',
    setEntitiesResultKey: collection
      ? `set${capitalizedProp}Result`
      : 'setEntitiesResult',
  };
}

export function getWithEntitiesRemotePaginationEvents(config?: {
  collection?: string;
}) {
  const collection = config?.collection;
  return {
    entitiesRemotePageChanged: createEvent(
      `${collection}.entitiesRemotePageChanged`,
      props<{ pageIndex: number; isPageInCache: boolean }>(),
    ),
    entitiesPagedResultsLoaded: createEvent(
      `${collection}.entitiesPagedResultsLoaded`,
    ),
  };
}
