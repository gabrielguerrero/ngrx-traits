import { effect, Signal } from '@angular/core';

import { capitalize } from '../util';

export function getWithEntitiesLocalPaginationKeys(config?: {
  collection?: string;
}) {
  const collection = config?.collection;
  const capitalizedProp = collection && capitalize(collection);
  return {
    paginationKey: collection ? `${config.collection}Pagination` : 'pagination',
    entitiesCurrentPageKey: collection
      ? `${config.collection}CurrentPage`
      : 'entitiesCurrentPage',
    loadEntitiesPageKey: collection
      ? `load${capitalizedProp}Page`
      : 'loadEntitiesPage',
  };
}

export function gotoFirstPageIfFilterOrSortChanges(
  input: Record<string, unknown>,
  filterKey: string,
  sortKey: string,
  entitiesCurrentPageKey: string,
  loadEntitiesPageKey: string,
) {
  if (filterKey in input || sortKey in input) {
    const filter = input[filterKey] as Signal<any>;
    const sort = input[sortKey] as Signal<any>;
    const entitiesCurrentPage = input[entitiesCurrentPageKey] as Signal<any>;
    const loadEntitiesPage = input[loadEntitiesPageKey] as (options: {
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
