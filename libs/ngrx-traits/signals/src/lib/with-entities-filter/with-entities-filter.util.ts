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
import { EntitiesRemoteFilterMethods } from './with-entities-remote-filter.model';

export function getWithEntitiesFilterKeys(config?: { collection?: string }) {
  const collection = config?.collection;
  const capitalizedProp = collection && capitalize(collection);
  return {
    filterKey: collection
      ? `${config.collection}EntitiesFilter`
      : 'entitiesFilter',
    filterEntitiesKey: collection
      ? `filter${capitalizedProp}Entities`
      : 'filterEntities',
    isEntitiesFilterChangedKey: collection
      ? `is${capitalizedProp}EntitiesFilterChanged`
      : 'isEntitiesFilterChanged',
    resetEntitiesFilterKey: collection
      ? `reset${capitalizedProp}EntitiesFilter`
      : 'resetEntitiesFilter',
    defaultFilterKey: collection
      ? `_${config.collection}EntitiesDefaultFilter`
      : '_entitiesDefaultFilter',
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
        _emitEvent?: boolean;
      }) =>
        value?.forceLoad || (value.debounce ?? defaultDebounce) == 0
          ? of({})
          : timer(value.debounce ?? defaultDebounce),
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
        !current.skipLoadingCall &&
        !previous?.skipLoadingCall &&
        JSON.stringify(previous?.filter) === JSON.stringify(current?.filter),
    ),
  );
}

export function getWithEntitiesFilterEvents(config?: { collection?: string }) {
  const collection = config?.collection;
  return {
    entitiesFilterChanged: createEvent(
      `${collection}.entitiesFilterChanged`,
      props<{ filter: unknown; skipLoadingCall?: boolean }>(),
    ),
  };
}

export type FilterQueryMapper<Filter, T extends Params = Params> = {
  /**
   * @param defaultFilter the filter the store was created with, to fall back on
   *   for fields the query params do not carry
   * @param currentFilter the filter the store holds right now, to keep the
   *   parts of it the query params say nothing about
   * @returns the filter to apply, or undefined to leave the current one alone
   */
  queryParamsToFilter: (
    query: T,
    defaultFilter: Filter,
    currentFilter: Filter,
  ) => Filter | undefined;
  filterToQueryParams: (filter: Filter) => T | undefined | null;
  /**
   * Merge the restored filter into the current one instead of replacing it,
   * for mappers that only map some of the filter fields. Defaults to false,
   * which replaces the whole filter.
   */
  patch?: boolean;
};

/**
 * Normalizes FilterOptions to always return the {filter, debounce?, ...} format.
 * Handles the case where a raw Filter object is passed directly.
 */
export function toFilterOptions<Filter extends Record<string, unknown>>(
  options: Record<string, unknown>,
  defaultFilter: Filter,
): {
  filter: Filter;
  debounce?: number;
  patch?: boolean;
  forceLoad?: boolean;
  skipLoadingCall?: boolean;
  _emitEvent?: boolean;
} {
  // FilterOptions requires 'filter' key - if missing, it's raw Filter
  if (!('filter' in options)) {
    return { filter: options } as any;
  }

  // filter value can't be null/undefined/primitive in FilterOptions
  // (Filter extends Record<string, unknown>)
  const filterValue = options['filter'];
  if (
    filterValue === null ||
    filterValue === undefined ||
    typeof filterValue !== 'object'
  ) {
    return { filter: options } as any;
  }

  // Check for FilterOptions-specific keys not present in defaultFilter
  const defaultFilterKeys = new Set(Object.keys(defaultFilter));
  const specificKeys = [
    'debounce',
    'patch',
    'forceLoad',
    'skipLoadingCall',
    '_emitEvent',
  ];
  if (specificKeys.some((k) => k in options && !defaultFilterKeys.has(k))) {
    return options as any; // has debounce/patch/etc → FilterOptions
  }

  // Check if filter value's keys overlap with defaultFilter keys
  const filterValueKeys = new Set(
    Object.keys(filterValue as Record<string, unknown>),
  );
  if ([...defaultFilterKeys].some((k) => filterValueKeys.has(k))) {
    return options as any; // FilterOptions
  }

  // Default: raw Filter
  return { filter: options } as any;
}

export function getQueryMapperForEntitiesFilter<Filter>(config?: {
  collection?: string;
  filterMapper?: FilterQueryMapper<Filter>;
  skipLoadingCall?: boolean;
}): QueryMapper<
  typeof config extends { filterMapper: FilterQueryMapper<infer T> }
    ? T
    : { filter: string }
> {
  const { filterEntitiesKey, filterKey, defaultFilterKey } =
    getWithEntitiesFilterKeys(config);

  return {
    queryParamsToState: (query, store, firstLoad) => {
      const defaultFilter = (store[defaultFilterKey] as Signal<Filter>)?.();
      const currentFilter = (store[filterKey] as Signal<Filter>)?.();
      const filter = config?.filterMapper
        ? config?.filterMapper.queryParamsToFilter(
            query,
            defaultFilter,
            currentFilter,
          )
        : query.filter
          ? JSON.parse(query.filter)
          : undefined;

      if (filter) {
        const filterEntities = store[
          filterEntitiesKey
        ] as EntitiesRemoteFilterMethods<any, any>['filterEntities'];
        filterEntities({
          filter,
          // only mappers that ask for it, so the ones that map the whole filter
          // keep replacing it as they always have
          patch: config?.filterMapper?.patch,
          // we forceLoad on first load to ensure filter is set in the store, before fetching data
          // after that it should not force load, to allow history navigation without triggering loading state
          forceLoad: firstLoad,
          // we only allow to skip the loading call on the first load,
          // otherwise history navigation would not work as expected
          skipLoadingCall: firstLoad && config?.skipLoadingCall,
        });
      }
    },
    stateToQueryParams: (store) => {
      const filter = store[filterKey] as Signal<any>;
      return filter
        ? computed(() =>
            config?.filterMapper
              ? (config?.filterMapper.filterToQueryParams(filter()) as any)
              : {
                  filter: JSON.stringify({ ...filter() }),
                },
          )
        : null;
    },
  };
}
