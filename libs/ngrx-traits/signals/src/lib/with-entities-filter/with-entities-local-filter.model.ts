import { Signal } from '@angular/core';
import { DeepSignal } from '@ngrx/signals';
import { Observable } from 'rxjs';

export type EntitiesFilterComputed<Filter> = {
  entitiesFilter: DeepSignal<Filter>;
  isEntitiesFilterChanged: Signal<boolean>;
};

export type NamedEntitiesFilterComputed<Collection extends string, Filter> = {
  [K in Collection as `is${Capitalize<string & K>}FilterChanged`]: Signal<boolean>;
} & { [K in Collection as `${K}Filter`]: DeepSignal<Filter> };

export type FilterOptions<Filter> =
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
export type EntitiesFilterMethods<Filter> = {
  filterEntities: (
    options?:
      | FilterOptions<Filter>
      | Observable<FilterOptions<Filter>>
      | Signal<FilterOptions<Filter>>,
  ) => void;
  resetEntitiesFilter: () => void;
};
export type NamedEntitiesFilterMethods<Collection extends string, Filter> = {
  [K in Collection as `filter${Capitalize<string & K>}Entities`]: (
    options?:
      | FilterOptions<Filter>
      | Observable<FilterOptions<Filter>>
      | Signal<FilterOptions<Filter>>,
  ) => void;
} & {
  [K in Collection as `reset${Capitalize<string & K>}Filter`]: () => void;
};
