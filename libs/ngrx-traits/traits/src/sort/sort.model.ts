import { LoadEntitiesState } from '../load-entities/load-entities.model';

import { ActionCreator, TypedAction } from '@ngrx/store/src/models';
import { KeyedConfig } from 'ngrx-traits';

export declare type SortDirection = 'asc' | 'desc' | '';

export interface Sort<T> {
  /** The id of the column being sorted. */
  active: keyof T;
  /** The sort direction. */
  direction: SortDirection;
}

export interface SortState<T> {
  sort: {
    current: Sort<T>;
    default: Sort<T>;
  };
}
export interface EntityAndSortState<T>
  extends LoadEntitiesState<T>,
    SortState<T> {}

export type SortActions<T> = {
  sort: ActionCreator<
    string,
    (props: Sort<T>) => Sort<T> & TypedAction<string>
  >;
  /**
   * Sets the default sort back
   */
  resetSort: ActionCreator<string, () => TypedAction<string>>;
};

export type SortSelectors<T> = {
  selectSort: (state: EntityAndSortState<T>) => Sort<T>;
};

export type SortMutators<T> = {
  sortEntities<S extends EntityAndSortState<T>>(
    { active, direction }: Sort<T>,
    state: S
  ): S;
};

export const sortTraitKey = 'sort';

export interface SortConfig<T> {
  defaultSort: Sort<T>;
  remote?: boolean;
}

export type SortKeyedConfig<T> = KeyedConfig<
  typeof sortTraitKey,
  SortConfig<T>
>;
