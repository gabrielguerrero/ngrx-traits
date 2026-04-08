import { Signal } from '@angular/core';
import { Observable } from 'rxjs';

import { RxMethodRef } from '../with-calls/with-calls.model';
import { FilterOptions } from './with-entities-local-filter.model';

export type EntitiesRemoteFilterMethods<Filter, Entity> = {
  filterEntities: {
    (
      options?:
        | Observable<FilterOptions<Filter> & { skipLoadingCall?: boolean }>
        | (() => FilterOptions<Filter>),
    ): RxMethodRef;
    (
      options?: FilterOptions<Filter> & { skipLoadingCall?: boolean },
    ): Promise<
      | { value: Signal<Entity[]>; ok: true }
      | { error: Signal<unknown>; ok: false }
    >;
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
      options?:
        | Observable<FilterOptions<Filter> & { skipLoadingCall?: boolean }>
        | (() => FilterOptions<Filter>),
    ): RxMethodRef;
    (
      options?: FilterOptions<Filter> & { skipLoadingCall?: boolean },
    ): Promise<
      | { value: Signal<Entity[]>; ok: true }
      | { error: Signal<unknown>; ok: false }
    >;
  };
} & {
  [K in Collection as `reset${Capitalize<string & K>}EntitiesFilter`]: (options?: {
    debounce?: number;
    forceLoad?: boolean;
    skipLoadingCall?: boolean;
  }) => void;
};
