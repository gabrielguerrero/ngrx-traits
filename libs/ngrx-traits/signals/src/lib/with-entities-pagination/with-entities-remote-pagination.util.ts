import { Signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import type { StateSignal } from '@ngrx/signals/src/state-signal';
import { distinctUntilChanged, exhaustMap, first, pipe, tap } from 'rxjs';

import { capitalize } from '../util';
import {
  EntitiesPaginationInfiniteState,
  InfinitePaginationState,
} from './with-entities-infinite-pagination';

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
    setEntitiesLoadResultKey: collection
      ? `set${capitalizedProp}LoadedResult`
      : 'setEntitiesLoadedResult',
  };
}
export function isEntitiesInCache(
  options:
    | {
        page: number;
        pagination: EntitiesPaginationInfiniteState['entitiesPagination'];
      }
    | {
        start: number;
        end: number;
        pagination: EntitiesPaginationInfiniteState['entitiesPagination'];
      },
) {
  const pagination = options.pagination;
  const startIndex =
    'start' in options ? options.start : options.page * pagination.pageSize;
  let endIndex =
    'end' in options ? options.end : startIndex + pagination.pageSize - 1;
  endIndex =
    pagination.total && endIndex > pagination.total
      ? pagination.total - 1
      : endIndex;
  return (
    startIndex >= pagination.cache.start && endIndex <= pagination.cache.end
  );
}

export function loadEntitiesPageFactory(
  state: Record<string, Signal<unknown>>,
  loadingKey: string,
  paginationKey: string,
  setLoadingKey: string,
) {
  const isLoading = state[loadingKey] as Signal<boolean>;
  const $loading = toObservable(isLoading);
  const pagination = state[paginationKey] as Signal<InfinitePaginationState>;
  const setLoading = state[setLoadingKey] as () => void;

  const loadEntitiesPage = rxMethod<{
    pageIndex: number;
    forceLoad?: boolean;
  }>(
    pipe(
      distinctUntilChanged(
        (previous, current) =>
          !current.forceLoad && previous.pageIndex === current.pageIndex,
      ),
      exhaustMap(({ pageIndex, forceLoad }) =>
        $loading.pipe(
          first((loading) => !loading),
          // the previous exhaustMap to not loading ensures the function
          // can not be called multiple time before results are loaded, which could corrupt the cache
          tap(() => {
            console.log('loadEntitiesPage', pageIndex);
            patchState(state as StateSignal<object>, {
              [paginationKey]: {
                ...pagination(),
                currentPage: pageIndex,
                requestPage: pageIndex,
              },
            });
            if (
              isEntitiesInCache({
                page: pageIndex,
                pagination: pagination(),
              }) &&
              !forceLoad
            ) {
              console.log('cached', pageIndex);
              if (
                !isEntitiesInCache({
                  page: pageIndex + 1,
                  pagination: pagination(),
                })
              ) {
                console.log('preloadEntitiesPage', pageIndex);
                // preload next page
                patchState(state as StateSignal<object>, {
                  [paginationKey]: {
                    ...pagination(),
                    currentPage: pageIndex,
                    requestPage: pageIndex + 1,
                  },
                });
                setLoading();
              }
              return;
            }
            setLoading();
          }),
        ),
      ),
    ),
  );

  return { loadEntitiesPage };
}
