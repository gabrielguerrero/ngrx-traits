import { capitalize } from '../util';

export function getWithEntitiesInfinitePaginationKeys(config?: {
  collection?: string;
}) {
  const collection = config?.collection;
  const capitalizedProp = collection && capitalize(collection);
  return {
    paginationKey: collection
      ? `${config.collection}Pagination`
      : 'entitiesPagination',
    entitiesPageInfoKey: collection
      ? `${config.collection}PageInfo`
      : 'entitiesPageInfo',
    entitiesPagedRequestKey: collection
      ? `${config.collection}PagedRequest`
      : 'entitiesPagedRequest',
    loadEntitiesNextPageKey: collection
      ? `load
      ${capitalizedProp}NextPage`
      : 'loadEntitiesNextPage',
    loadEntitiesPreviousPageKey: collection
      ? `load
      ${capitalizedProp}PreviousPage`
      : 'loadEntitiesPreviousPage',
    loadEntitiesFirstPageKey: collection
      ? `load
      ${capitalizedProp}FirstPage`
      : 'loadEntitiesFirstPage',
    setEntitiesLoadResultKey: collection
      ? `set${capitalizedProp}LoadedResult`
      : 'setEntitiesLoadedResult',
  };
}
