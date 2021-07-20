import { Predicate, Update } from '@ngrx/entity/src/models';
import { EntityAndStatusState } from '../load-entities/load-entities.model';
import { ActionCreator } from '@ngrx/store';
import { TypedAction } from '@ngrx/store/src/models';

export enum ChangeType {
  CREATED = 'c',
  UPDATED = 'u',
  DELETED = 'd',
}
export interface Change<T> {
  id: string | number;
  changeType: ChangeType;
  entityChanges?: Partial<T>;
}
export interface EntityChange<T> {
  entity: T;
  changeType: ChangeType;
}
export interface CrudState<T> {
  changes: Change<T>[];
}
export interface EntityAndCrudState<T>
  extends EntityAndStatusState<T>,
    CrudState<T> {}

export type CrudActions<T> = {
  add: ActionCreator<
    string,
    (...entities: T[]) => { entities: T[] } & TypedAction<string>
  >;
  remove: ActionCreator<
    string,
    (
      ...keys: string[] | number[]
    ) => { keys: string[] | number[] } & TypedAction<string>
  >;
  update: ActionCreator<
    string,
    (...updates: Update<T>[]) => { updates: Update<T>[] } & TypedAction<string>
  >;
  upsert: ActionCreator<
    string,
    (...entities: T[]) => { entities: T[] } & TypedAction<string>
  >;

  removeAll: ActionCreator<
    string,
    (
      predicate?: Predicate<T>
    ) => { predicate?: Predicate<T> } & TypedAction<string>
  >;
  clearChanges: ActionCreator<string, () => TypedAction<string>>;
};

export type CrudSelectors<T> = {
  selectChanges: (state: EntityAndCrudState<T>) => Change<T>[];
  selectAllChanges: (
    state: EntityAndCrudState<T>,
    props: { type: ChangeType }
  ) => EntityChange<T>[];
  /**
   * filters redundant changes ideal for a batch update
   * if you add and remove the same and items this changes are remove from the list
   * if you add and then update one or more time, the updates are discarded
   * if you update one or more time and then remove, the updates are discarded
   * @param state
   */
  selectFilteredChanges: (state: EntityAndCrudState<T>) => Change<T>[];
  /**
   * Returns the entities plus the kind of change
   * @param state
   */
  selectAllFilteredChanges: (state: EntityAndCrudState<T>) => EntityChange<T>[];
};

export type CrudMutators<T> = {
  add<S extends EntityAndCrudState<T>>(entities: T[], state: S): S;

  remove<S extends EntityAndCrudState<T>>(keys: string[], state: S): S;
  remove<S extends EntityAndCrudState<T>>(keys: number[], state: S): S;
  remove<S extends EntityAndCrudState<T>>(predicate: Predicate<T>, state: S): S;

  removeAll<S extends EntityAndCrudState<T>>(state: S): S;

  clearChanges<S extends EntityAndCrudState<T>>(state: S): S;

  update<S extends EntityAndCrudState<T>>(updates: Update<T>[], state: S): S;
  upsert<S extends EntityAndCrudState<T>>(entities: T[], state: S): S;
};

export interface CrudConfig {
  storeChanges?: boolean;
}
export const crudTraitKey = 'crud';

export interface CrudKeyedConfig {
  crud?: CrudConfig;
}
