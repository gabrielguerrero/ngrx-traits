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
      ? `${config.collection}EntitiesPagination`
      : 'entitiesPagination',
    entitiesCurrentPageKey: collection
      ? `${config.collection}EntitiesCurrentPage`
      : 'entitiesCurrentPage',
    entitiesPagedRequestKey: collection
      ? `${config.collection}EntitiesPagedRequest`
      : 'entitiesPagedRequest',
    loadEntitiesPageKey: collection
      ? `load${capitalizedProp}EntitiesPage`
      : 'loadEntitiesPage',
    setEntitiesPagedResultKey: collection
      ? `set${capitalizedProp}EntitiesPagedResult`
      : 'setEntitiesPagedResult',
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
