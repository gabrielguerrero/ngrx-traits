import { Comparer, EntityAdapter, EntityState, IdSelector } from '@ngrx/entity';

import { ActionCreator, TypedAction } from '@ngrx/store/src/models';
import { Dictionary } from '@ngrx/entity/src/models';
import { KeyedConfig } from 'ngrx-traits';

export type Status = 'loading' | 'success' | 'fail';

export interface StatusState {
  status?: Status;
}

export interface EntityAndStatusState<T> extends EntityState<T>, StatusState {}

export type LoadEntitiesActions<T> = {
  /**
   * load entities from backend
   */
  fetch: ActionCreator<string, () => TypedAction<string>>;
  /**
   * entities where loaded successfully
   */
  fetchSuccess: ActionCreator<
    string,
    (props: {
      entities: T[];
      total?: number;
    }) => { entities: T[]; total?: number } & TypedAction<string>
  >;
  /**
   * entities failed loading
   */
  fetchFail: ActionCreator<
    string,
    (props: { error?: string }) => { error?: string } & TypedAction<string>
  >;
};

export type LoadEntitiesSelectors<T> = {
  /**
   * returns all ids of the entities in an array
   * @param state
   */
  selectIds: (state: EntityAndStatusState<T>) => string[] | number[];
  /**
   * returns all entities in a map with the id as key of the map
   * @param state
   */
  selectEntities: (state: EntityAndStatusState<T>) => Dictionary<T>;
  /**
   * returns all entities in an array
   * @param state
   */
  selectAll: (state: EntityAndStatusState<T>) => T[];
  /**
   * returns the total number of entities
   * @param state
   */
  selectTotal: (state: EntityAndStatusState<T>) => number;
  /**
   * is currently loading entities
   * @param state
   */
  isLoading: (state: EntityAndStatusState<T>) => boolean;
  /**
   * were the entities loaded successfully
   * @param state
   */
  isSuccess: (state: EntityAndStatusState<T>) => boolean;
  /**
   * did the entities fail loading
   * @param state
   */
  isFail: (state: EntityAndStatusState<T>) => boolean;
};

export type LoadEntitiesMutators<T> = {
  /**
   * set or replace all entities currently in store
   * @param entities
   * @param state
   */
  setAll<S extends EntityAndStatusState<T>>(entities: T[], state: S): S;
};

export type GenericActionCreator = ActionCreator<
  string,
  (...args: unknown[]) => TypedAction<string>
>;

export const loadEntitiesTraitKey = 'loadEntities';

export type LoadEntitiesConfig<T = unknown> = {
  /**
   * Function that returns the id of an entity if not set it attempts to return the values
   * of a property call id, this is pass to @ngrx/entity EntityAdapter
   */
  selectId?: IdSelector<T>;
  /**
   *  Default sort function for to @ngrx/entity EntityAdapter
   */
  sortComparer?: false | Comparer<T>;
  /**
   *  @ngrx/entity EntityAdapter
   */
  adapter: EntityAdapter<T>;
};

export type LoadEntitiesKeyedConfig<T> = KeyedConfig<
  typeof loadEntitiesTraitKey,
  LoadEntitiesConfig<T>
>;