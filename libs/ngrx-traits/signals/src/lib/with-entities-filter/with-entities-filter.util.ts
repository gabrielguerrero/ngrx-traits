import { Signal } from '@angular/core';
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
      }) =>
        value?.forceLoad ? of({}) : timer(value.debounce || defaultDebounce),
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
