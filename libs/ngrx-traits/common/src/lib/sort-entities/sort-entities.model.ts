import { KeyedConfig } from '@ngrx-traits/core';
import { Action } from '@ngrx/store';
import { ActionCreator } from '@ngrx/store';

import { LoadEntitiesState } from '../load-entities/load-entities.model';

export declare type SortDirection = 'asc' | 'desc' | '';

export interface Sort<T> {
  /** The id of the column being sorted. */
  active: keyof T;
  /** The sort direction. */
  direction: SortDirection;
}

export interface SortEntitiesState<T> {
  sort: {
    current: Sort<T>;
    default: Sort<T>;
  };
}

export type SortEntitiesActions<T> = {
  sortEntities: ActionCreator<
    string,
    (props: Sort<T>) => Sort<T> & Action<string>
  >;
  /**
   * Sets the default sort back
   */
  resetEntitiesSort: ActionCreator<string, () => Action<string>>;
};

export type SortEntitiesSelectors<T> = {
  selectEntitiesSort: (
    state: LoadEntitiesState<T> & SortEntitiesState<T>,
  ) => Sort<T>;
};

export type SortEntitiesMutators<T> = {
  sortEntities<S extends LoadEntitiesState<T> & SortEntitiesState<T>>(
    { active, direction }: Sort<T>,
    state: S,
  ): S;
};

export const sortTraitKey = 'sort';

export interface SortEntitiesConfig<T> {
  defaultSort: Sort<T>;
  remote: boolean;
}

export type SortEntitiesKeyedConfig<T> = KeyedConfig<
  typeof sortTraitKey,
  SortEntitiesConfig<T>
>;
