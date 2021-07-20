import { EntityAndStatusState } from '../load-entities/load-entities.model';

import { ActionCreator, TypedAction } from '@ngrx/store/src/models';

export interface FilterState<F> {
  filters?: F;
}
export interface EntityAndFilterState<T, F>
  extends EntityAndStatusState<T>,
    FilterState<F> {}

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
  } & TypedAction<string>;
  (props?: { filters: F; forceLoad?: boolean }): {
    filters: F;
    forceLoad: boolean;
    patch: boolean;
  } & TypedAction<string>;
}

export type FilterActions<F> = {
  filter: ActionCreator<string, FilterActionOverload<F>>;
};
export type FilterSelectors<T, F> = {
  selectFilter: (state: EntityAndFilterState<T, F>) => F | undefined;
};

export type FilterMutators<T, F> = {
  setFilters<S extends EntityAndFilterState<T, F>>(
    filter: F | undefined,
    state: S
  ): S;
};

export const filterTraitKey = 'filter';

export type FilterConfig<T, F> = {
  defaultFilter?: F;
  filterFn?: (filter: F, entity: T) => boolean;
  defaultDebounceTime?: number;
};

export type FilterKeyedConfig<T, F> = {
  filter?: FilterConfig<T, F>;
};
