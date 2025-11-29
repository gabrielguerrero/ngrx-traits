import { Signal } from '@angular/core';
import { Observable } from 'rxjs';

import { FilterOptions } from './with-entities-local-filter.model';

export type EntitiesRemoteFilterMethods<Filter> = {
  filterEntities: (
    options?:
      | (FilterOptions<Filter> & { skipLoadingCall?: boolean })
      | Observable<FilterOptions<Filter> & { skipLoadingCall?: boolean }>
      | Signal<FilterOptions<Filter> & { skipLoadingCall?: boolean }>,
  ) => void;
  resetEntitiesFilter: (options?: {
    debounce?: number;
    forceLoad?: boolean;
    skipLoadingCall?: boolean;
  }) => void;
};
export type NamedEntitiesRemoteFilterMethods<
  Collection extends string,
  Filter,
> = {
  [K in Collection as `filter${Capitalize<string & K>}Entities`]: (
    options?:
      | (FilterOptions<Filter> & { skipLoadingCall?: boolean })
      | Observable<FilterOptions<Filter> & { skipLoadingCall?: boolean }>
      | Signal<FilterOptions<Filter> & { skipLoadingCall?: boolean }>,
  ) => void;
} & {
  [K in Collection as `reset${Capitalize<string & K>}EntitiesFilter`]: (options?: {
    debounce?: number;
    forceLoad?: boolean;
    skipLoadingCall?: boolean;
  }) => void;
};
