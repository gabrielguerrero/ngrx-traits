import { computed, Signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { concatMap, take } from 'rxjs';
import { filter, startWith } from 'rxjs/operators';

import { capitalize } from '../util';
import { getWithCallStatusKeys } from '../with-call-status/with-call-status.util';
import {
  createEvent,
  props,
} from '../with-event-handler/with-event-handler.util';
import { QueryMapper } from '../with-sync-to-route-query-params/with-sync-to-route-query-params.util';
import { EntitiesPaginationLocalState } from './with-entities-local-pagination.model';
import { EntitiesPaginationRemoteMethods } from './with-entities-remote-pagination.model';

export function getWithEntitiesLocalPaginationKeys(config?: {
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
    loadEntitiesPageKey: collection
      ? `load${capitalizedProp}EntitiesPage`
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
  skipLoadingCall?: boolean;
}): QueryMapper<{
  page: string;
}> {
  const { loadEntitiesPageKey, paginationKey } =
    getWithEntitiesLocalPaginationKeys(config);
  const { loadingKey, loadedKey } = getWithCallStatusKeys({
    collection: config?.collection,
  });
  return {
    queryParamsToState: (query, store) => {
      const page = query.page;

      if (page) {
        const loadEntitiesPage = store[
          loadEntitiesPageKey
        ] as EntitiesPaginationRemoteMethods<unknown>['loadEntitiesPage'];
        const loading = store[loadingKey] as Signal<boolean>;
        const loaded = store[loadedKey] as Signal<boolean>;
        const loaded$ = toObservable(loaded);

        toObservable(loading)
          .pipe(
            startWith(loading()),
            filter((v) => v), // wait until loading becomes true
            take(1),
            concatMap(() =>
              loaded$.pipe(
                startWith(loaded()),
                filter((v) => v), // wait until loaded becomes true
                take(1),
              ),
            ),
            takeUntilDestroyed(),
          )
          .subscribe(() => {
            loadEntitiesPage({
              pageIndex: +page - 1,
              skipLoadingCall: config?.skipLoadingCall,
            });
          });
      }
    },
    stateToQueryParams: (store) => {
      const pagination = store[paginationKey] as Signal<
        EntitiesPaginationLocalState['entitiesPagination']
      >;
      return pagination
        ? computed(() => ({
            page: (pagination().currentPage + 1).toString(),
          }))
        : null;
    },
  };
}
