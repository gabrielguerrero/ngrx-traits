import { EntityAndStatusState } from '../load-entities/load-entities.model';
import { ActionCreator, TypedAction } from '@ngrx/store/src/models';
export interface FilterState<F> {
  filters?: F;
}
export interface EntityAndFilterState<T, F>
  extends EntityAndStatusState<T>,
    FilterState<F> {}
declare type FilterPatchConditionalType<F, P> = P extends true ? Partial<F> : F;
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
export declare type FilterActions<F> = {
  filter: ActionCreator<string, FilterActionOverload<F>>;
};
export declare type FilterSelectors<T, F> = {
  selectFilter: (state: EntityAndFilterState<T, F>) => F | undefined;
};
export declare type FilterMutators<T, F> = {
  setFilters<S extends EntityAndFilterState<T, F>>(
    filter: F | undefined,
    state: S
  ): S;
};
export declare const filterTraitKey = 'filter';
export declare type FilterConfig<T, F> = {
  defaultFilter?: F;
  filterFn?: (filter: F, entity: T) => boolean;
  defaultDebounceTime?: number;
};
export declare type FilterKeyedConfig<T, F> = {
  filter?: FilterConfig<T, F>;
};
export {};
