import { Signal } from '@angular/core';

export type EntitiesFilterState<Filter> = { entitiesFilter: Filter };
export type NamedEntitiesFilterState<Collection extends string, Filter> = {
  [K in Collection as `${K}Filter`]: Filter;
};
export type EntitiesFilterComputed = {
  isEntitiesFilterChanged: Signal<boolean>;
};
export type NamedEntitiesFilterComputed<Collection extends string> = {
  [K in Collection as `is${Capitalize<string & K>}FilterChanged`]: Signal<boolean>;
};
export type EntitiesFilterMethods<Filter> = {
  filterEntities: (
    options:
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
        },
  ) => void;
  resetEntitiesFilter: () => void;
};
export type NamedEntitiesFilterMethods<Collection extends string, Filter> = {
  [K in Collection as `filter${Capitalize<string & K>}Entities`]: (
    options:
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
        },
  ) => void;
} & {
  [K in Collection as `reset${Capitalize<string & K>}Filter`]: () => void;
};
