import { Action, ActionCreator } from '@ngrx/store';

import { LoadEntitiesState } from '../load-entities/load-entities.model';

export interface FilterEntitiesState<F> {
  filters?: F;
}

type FilterPatchConditionalType<F, P> = P extends true ? Partial<F> : F;

export interface FilterActionOverload<F> {
  <P extends boolean>(props?: {
    filters: FilterPatchConditionalType<F, P>;
    forceLoad?: boolean;
    patch: P;
  }): {
    filters: FilterPatchConditionalType<F, P>;
    forceLoad: boolean;
    patch: P;
  } & Action<string>;
  (props?: { filters: F; forceLoad?: boolean }): {
    filters: F;
    forceLoad: boolean;
    patch: boolean;
  } & Action<string>;
}

export type FilterEntitiesActions<F> = {
  /**
   * Store the filters param (read using selectFilter) and fires the loadEntities action
   * if the filters param has changed, this call is also debounce by default, to disable this
   * behavior you can use the forceLoad param as true or defaultDebounceTime to 0 in the trait config
   * to disable permanently.
   * If the `patch` param is set to true (default is false), the filters are merged with the previous value in the store,
   * otherwise they are replaced.
   */
  filterEntities: ActionCreator<string, FilterActionOverload<F>>;
};
export type FilterEntitiesSelectors<T, F> = {
  /**
   * Returns the stored filters set by the filter action
   * @param state
   */
  selectEntitiesFilter: (
    state: LoadEntitiesState<T> & FilterEntitiesState<F>,
  ) => F | undefined;
};

export type FilterEntitiesMutators<T, F> = {
  setEntitiesFilters<S extends LoadEntitiesState<T> & FilterEntitiesState<F>>(
    filter: F | undefined,
    state: S,
  ): S;
};

export const filterEntitiesTraitKey = 'filter';

export type FilterEntitiesConfig<T, F> = {
  defaultFilter?: F;
  filterFn?: (filter: F, entity: T) => boolean;
  defaultDebounceTime?: number;
  isRemoteFilter?: (previous: F | undefined, current: F | undefined) => boolean;
};

export type FilterEntitiesKeyedConfig<T, F> = {
  filter?: FilterEntitiesConfig<T, F>;
};
