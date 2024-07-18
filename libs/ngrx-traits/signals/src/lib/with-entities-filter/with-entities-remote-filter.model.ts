export type EntitiesRemoteFilterMethods<Filter> = {
  filterEntities: (
    options:
      | {
          filter: Filter;
          debounce?: number;
          patch?: false | undefined;
          forceLoad?: boolean;
          skipLoadingCall?: boolean;
        }
      | {
          filter: Partial<Filter>;
          debounce?: number;
          patch: true;
          forceLoad?: boolean;
          skipLoadingCall?: boolean;
        },
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
    options:
      | {
          filter: Filter;
          debounce?: number;
          patch?: false | undefined;
          forceLoad?: boolean;
          skipLoadingCall?: boolean;
        }
      | {
          filter: Partial<Filter>;
          debounce?: number;
          patch: true;
          forceLoad?: boolean;
          skipLoadingCall?: boolean;
        },
  ) => void;
} & {
  [K in Collection as `reset${Capitalize<string & K>}Filter`]: (options?: {
    debounce?: number;
    forceLoad?: boolean;
    skipLoadingCall?: boolean;
  }) => void;
};
