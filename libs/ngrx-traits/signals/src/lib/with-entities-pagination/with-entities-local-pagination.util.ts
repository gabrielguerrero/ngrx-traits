import { Signal } from '@angular/core';
import { patchState } from '@ngrx/signals';
import type { StateSignal } from '@ngrx/signals/src/state-signal';

import { capitalize } from '../util';
import {
  createEvent,
  props,
} from '../with-event-handler/with-event-handler.util';

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
export function setCurrentPage(
  state: Record<string, Signal<unknown>>,
  paginationKey: string,
  pageIndex: number,
  pageSize?: number,
) {
  const pagination = state[paginationKey] as Signal<{
    pageSize: number;
    currentPage: number;
  }>;
  patchState(state as StateSignal<object>, {
    [paginationKey]: {
      ...pagination(),
      currentPage: pageIndex,
      pageSize: pageSize ?? pagination().pageSize,
    },
  });
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
