import { Signal } from '@angular/core';
import { Observable } from 'rxjs';

import { RxMethodRef } from '../with-calls/with-calls.model';
import { FilterOptions } from './with-entities-local-filter.model';

export type EntitiesRemoteFilterMethods<Filter, Entity> = {
  filterEntities: {
    (
      options?: FilterOptions<Filter> & { skipLoadingCall?: boolean },
    ): Promise<{ value: Signal<Entity[]>; ok: true } | { error: Signal<unknown>; ok: false }>;
    (
      options?:
        | Observable<FilterOptions<Filter> & { skipLoadingCall?: boolean }>
        | (() => FilterOptions<Filter>),
    ): RxMethodRef;
  };
  resetEntitiesFilter: (options?: {
    debounce?: number;
    forceLoad?: boolean;
    skipLoadingCall?: boolean;
  }) => void;
};
export type NamedEntitiesRemoteFilterMethods<
  Collection extends string,
  Filter,
  Entity,
> = {
  [K in Collection as `filter${Capitalize<string & K>}Entities`]: {
    (
      options?: FilterOptions<Filter> & { skipLoadingCall?: boolean },
    ): Promise<{ value: Signal<Entity[]>; ok: true } | { error: Signal<unknown>; ok: false }>;
    (
      options?:
        | Observable<FilterOptions<Filter> & { skipLoadingCall?: boolean }>
        | (() => FilterOptions<Filter>),
    ): RxMethodRef;
  };
} & {
  [K in Collection as `reset${Capitalize<string & K>}EntitiesFilter`]: (options?: {
    debounce?: number;
    forceLoad?: boolean;
    skipLoadingCall?: boolean;
  }) => void;
};
