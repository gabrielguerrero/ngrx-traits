import { computed, Signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { EntitiesPaginationState } from '@ngrx-traits/common';
import { concatMap, first } from 'rxjs';

import { capitalize } from '../util';
import { getWithCallStatusKeys } from '../with-call-status/with-call-status.util';
import {
  createEvent,
  props,
} from '../with-event-handler/with-event-handler.util';
import { QueryMapper } from '../with-sync-to-route-query-params/with-sync-to-route-query-params.util';
import { EntitiesPaginationLocalMethods } from './with-entities-local-pagination.model';

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

export function getWithEntitiesLocalPaginationEvents(config?: {
  collection?: string;
}) {
  const collection = config?.collection;
  return {
    entitiesLocalPageChanged: createEvent(
      `${collection}.entitiesLocalPageChanged`,
      props<{ pageIndex: number }>(),
    ),
  };
}

export function getQueryMapperForEntitiesPagination(config?: {
  collection?: string;
}): QueryMapper<{
  page: string;
}> {
  const { loadEntitiesPageKey, paginationKey } =
    getWithEntitiesLocalPaginationKeys(config);
  const { loadingKey, loadedKey } = getWithCallStatusKeys({
    prop: config?.collection,
  });
  return {
    queryParamsToState: (query, store) => {
      const page = query.page;

      if (page) {
        const loadEntitiesPage = store[
          loadEntitiesPageKey
        ] as EntitiesPaginationLocalMethods['loadEntitiesPage'];
        const loading = store[loadingKey] as Signal<boolean>;
        const loaded = store[loadedKey] as Signal<boolean>;
        const loaded$ = toObservable(loaded);
        // TODO: how do we support ssr hydration? maybe if is loaded set the page inmediatly
        toObservable(loading)
          .pipe(
            first((v) => v),
            concatMap(() => loaded$.pipe(first((v) => v))),
            takeUntilDestroyed(),
          )
          .subscribe(() => {
            loadEntitiesPage({
              pageIndex: +page - 1,
            });
          });
      }
    },
    stateToQueryParams: (store) => {
      const pagination = store[paginationKey] as Signal<
        EntitiesPaginationState['pagination']
      >;
      return computed(() => ({
        page: (pagination().currentPage + 1).toString(),
      }));
    },
  };
}
