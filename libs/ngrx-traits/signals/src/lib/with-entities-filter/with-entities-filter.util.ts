import { Signal } from '@angular/core';
import {
  concatMap,
  debounce,
  distinctUntilChanged,
  EMPTY,
  of,
  pipe,
  timer,
} from 'rxjs';

import { capitalize } from '../util';

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

export function debounceFilterPipe<Filter, Entity>(filter: Signal<Filter>) {
  return pipe(
    debounce(
      (value: {
        filter: Filter;
        debounce?: number;
        patch?: boolean;
        forceLoad?: boolean;
      }) => (value?.forceLoad ? EMPTY : timer(value.debounce || 300)),
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