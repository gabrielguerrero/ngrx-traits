import { effect, Signal } from '@angular/core';

import { capitalize } from '../util';

export function getWithEntitiesLocalPaginationKeys(config?: {
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
    loadEntitiesPageKey: collection
      ? `load${capitalizedProp}Page`
      : 'loadEntitiesPage',
  };
}

export function gotoFirstPageIfFilterOrSortChanges(
  store: Record<string, unknown>,
  filterKey: string,
  sortKey: string,
  entitiesCurrentPageKey: string,
  loadEntitiesPageKey: string,
) {
  if (filterKey in store || sortKey in store) {
    const filter = store[filterKey] as Signal<unknown>;
    const sort = store[sortKey] as Signal<unknown>;
    const entitiesCurrentPage = store[entitiesCurrentPageKey] as Signal<{
      pageIndex: number;
    }>;
    const loadEntitiesPage = store[loadEntitiesPageKey] as (options: {
      pageIndex: number;
    }) => void;
    let lastFilter = filter?.();
    let lastSort = sort?.();
    effect(
      () => {
        if (
          entitiesCurrentPage().pageIndex > 0 &&
          (lastFilter !== filter?.() || lastSort !== sort?.())
        ) {
          lastFilter = filter?.();
          lastSort = sort?.();
          loadEntitiesPage({ pageIndex: 0 });
        }
      },
      { allowSignalWrites: true },
    );
  }
}
