import { computed, Signal } from '@angular/core';
import { Params } from '@angular/router';
import {
  concatMap,
  debounce,
  distinctUntilChanged,
  of,
  pipe,
  timer,
} from 'rxjs';

import { capitalize } from '../util';
import {
  createEvent,
  props,
} from '../with-event-handler/with-event-handler.util';
import { QueryMapper } from '../with-sync-to-route-query-params/with-sync-to-route-query-params.util';
import { EntitiesFilterState } from './with-entities-local-filter.model';
import { EntitiesRemoteFilterMethods } from './with-entities-remote-filter.model';

export function getWithEntitiesFilterKeys(config?: { collection?: string }) {
  const collection = config?.collection;
  const capitalizedProp = collection && capitalize(collection);
  return {
    filterKey: collection ? `${config.collection}Filter` : 'entitiesFilter',
    filterEntitiesKey: collection
      ? `filter${capitalizedProp}Entities`
      : 'filterEntities',
    isEntitiesFilterChangedKey: collection
      ? `is${capitalizedProp}FilterChanged`
      : 'isEntitiesFilterChanged',
    resetEntitiesFilterKey: collection
      ? `reset${capitalizedProp}Filter`
      : 'resetEntitiesFilter',
  };
}

export function debounceFilterPipe<Filter>(
  filter: Signal<Filter>,
  defaultDebounce = 300,
) {
  return pipe(
    debounce(
      (value: {
        filter: Filter;
        debounce?: number;
        patch?: boolean;
        forceLoad?: boolean;
        skipLoadingCall?: boolean;
      }) =>
        value?.forceLoad ? of({}) : timer(value.debounce ?? defaultDebounce),
    ),
    concatMap((payload) =>
      payload.patch
        ? of({
            ...payload,
            filter: { ...filter?.(), ...payload?.filter },
          })
        : of(payload),
    ),
    distinctUntilChanged(
      (previous, current) =>
        !current?.forceLoad &&
        JSON.stringify(previous?.filter) === JSON.stringify(current?.filter),
    ),
  );
}

export function getWithEntitiesFilterEvents(config?: { collection?: string }) {
  const collection = config?.collection;
  return {
    entitiesFilterChanged: createEvent(
      `${collection}.entitiesFilterChanged`,
      props<{ filter: unknown }>(),
    ),
  };
}

export type FilterQueryMapper<Filter, T extends Params = Params> = {
  queryParamsToFilter: (query: T) => Filter;
  filterToQueryParams: (filter: Filter) => T | undefined | null;
};

export function getQueryMapperForEntitiesFilter<Filter>(config?: {
  collection?: string;
  filterMapper?: FilterQueryMapper<Filter>;
}): QueryMapper<
  typeof config extends { filterMapper: FilterQueryMapper<infer T> }
    ? T
    : { filter: string }
> {
  const { filterEntitiesKey, filterKey } = getWithEntitiesFilterKeys(config);

  return {
    queryParamsToState: (query, store) => {
      const filter = config?.filterMapper
        ? config?.filterMapper.queryParamsToFilter(query)
        : query.filter
          ? JSON.parse(query.filter)
          : undefined;
      if (filter) {
        const filterEntities = store[
          filterEntitiesKey
        ] as EntitiesRemoteFilterMethods<unknown>['filterEntities'];
        filterEntities({
          filter,
          forceLoad: true,
        });
      }
    },
    stateToQueryParams: (store) => {
      const filter = store[filterKey] as Signal<
        EntitiesFilterState<any>['entitiesFilter']
      >;
      return computed(() =>
        config?.filterMapper
          ? (config?.filterMapper.filterToQueryParams(filter()) as any)
          : {
              filter: JSON.stringify({ ...filter() }),
            },
      );
    },
  };
}
