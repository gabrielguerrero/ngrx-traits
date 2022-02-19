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

export interface SortEntitiesState<T> {
  sort: {
    current: Sort<T>;
    default: Sort<T>;
  };
}
/**
 * @internal
 */
export interface ƟLoadEntitiesSortEntitiesState<T>
  extends LoadEntitiesState<T>,
    SortEntitiesState<T> {}

export type SortEntitiesActions<T> = {
  sortEntities: ActionCreator<
    string,
    (props: Sort<T>) => Sort<T> & TypedAction<string>
  >;
  /**
   * Sets the default sort back
   */
  resetEntitiesSort: ActionCreator<string, () => TypedAction<string>>;
};

export type SortEntitiesSelectors<T> = {
  selectEntitiesSort: (state: ƟLoadEntitiesSortEntitiesState<T>) => Sort<T>;
};

export type SortEntitiesMutators<T> = {
  sortEntities<S extends ƟLoadEntitiesSortEntitiesState<T>>(
    { active, direction }: Sort<T>,
    state: S
  ): S;
};

export const sortTraitKey = 'sort';

export interface SortEntitiesConfig<T> {
  defaultSort: Sort<T>;
  remote?: boolean;
}

export type SortEntitiesKeyedConfig<T> = KeyedConfig<
  typeof sortTraitKey,
  SortEntitiesConfig<T>
>;
