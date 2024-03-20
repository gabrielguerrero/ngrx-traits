import { capitalize } from '../util';

export function getWithEntitiesRemotePaginationKeys(config?: {
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
    loadEntitiesPageKey: collection
      ? `load${capitalizedProp}Page`
      : 'loadEntitiesPage',
    setEntitiesLoadResultKey: collection
      ? `set${capitalizedProp}LoadedResult`
      : 'setEntitiesLoadedResult',
  };
}
