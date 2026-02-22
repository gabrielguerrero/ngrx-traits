import { Signal } from '@angular/core';
import { Observable } from 'rxjs';

import { RxMethodRef } from '../with-calls/with-calls.model';

export type EntitiesFilterState<Filter> = { entitiesFilter: Filter };
export type NamedEntitiesFilterState<Collection extends string, Filter> = {
  [K in Collection as `${K}EntitiesFilter`]: Filter;
};
export type EntitiesFilterComputed = {
  isEntitiesFilterChanged: Signal<boolean>;
};

export type NamedEntitiesFilterComputed<Collection extends string, Filter> = {
  [K in Collection as `is${Capitalize<string & K>}EntitiesFilterChanged`]: Signal<boolean>;
};

export type FilterOptions<Filter> =
  | Filter
  | {
      filter: Filter;
      debounce?: number;
      patch?: false | undefined;
      forceLoad?: boolean;
    }
  | {
      filter: Partial<Filter>;
      debounce?: number;
      patch: true;
      forceLoad?: boolean;
    };
export type EntitiesFilterMethods<Filter, Entity> = {
  filterEntities: {
    (
      options?: FilterOptions<Filter>,
    ): Promise<
      | { value: Signal<Entity[]>; ok: true }
      | { error: Signal<unknown>; ok: false }
    >;
    (
      options?:
        | (() => FilterOptions<Filter>)
        | Observable<FilterOptions<Filter>>,
    ): RxMethodRef;
  };
  resetEntitiesFilter: () => void;
};
export type NamedEntitiesFilterMethods<
  Collection extends string,
  Filter,
  Entity,
> = {
  [K in Collection as `filter${Capitalize<string & K>}Entities`]: {
    (
      options?: FilterOptions<Filter>,
    ): Promise<
      | { value: Signal<Entity[]>; ok: true }
      | { error: Signal<unknown>; ok: false }
    >;
    (
      options?:
        | (() => FilterOptions<Filter>)
        | Observable<FilterOptions<Filter>>,
    ): RxMethodRef;
  };
} & {
  [K in Collection as `reset${Capitalize<string & K>}EntitiesFilter`]: () => void;
};
