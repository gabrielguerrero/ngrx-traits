import { Predicate, Update } from '@ngrx/entity/src/models';
import { LoadEntitiesState } from '../load-entities/load-entities.model';
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
export interface CrudEntitiesState<T> {
  changes: Change<T>[];
}
/**
 * @internal
 */
export interface ƟLoadEntitiesCrudEntitiesState<T>
  extends LoadEntitiesState<T>,
    CrudEntitiesState<T> {}

export type CrudEntitiesActions<T> = {
  addEntities: ActionCreator<
    string,
    (...entities: T[]) => { entities: T[] } & TypedAction<string>
  >;
  removeEntities: ActionCreator<
    string,
    (
      ...keys: string[] | number[]
    ) => { keys: string[] | number[] } & TypedAction<string>
  >;
  updateEntities: ActionCreator<
    string,
    (...updates: Update<T>[]) => { updates: Update<T>[] } & TypedAction<string>
  >;
  upsertEntities: ActionCreator<
    string,
    (...entities: T[]) => { entities: T[] } & TypedAction<string>
  >;

  removeAllEntities: ActionCreator<
    string,
    (
      predicate?: Predicate<T>
    ) => { predicate?: Predicate<T> } & TypedAction<string>
  >;
  clearEntitiesChanges: ActionCreator<string, () => TypedAction<string>>;
};

export type CrudEntitiesSelectors<T> = {
  // /**
  //  * Return all changes made to the list
  //  * @param state
  //  */
  // selectChanges: (state: EntityAndCrudState<T>) => Change<T>[];
  /**
   * Return all changes made to the list plus entities, and can be filtered
   * by change type
   * @param state
   * @param props
   */
  selectEntitiesChangesList: (
    state: ƟLoadEntitiesCrudEntitiesState<T>,
    props: { type: ChangeType }
  ) => EntityChange<T>[];
  // /**
  //  * filters redundant changes ideal for a batch update
  //  * if you add and remove the same and items this changes are remove from the list
  //  * if you add and then update one or more times, the updates are discarded
  //  * if you update one or more times and then remove, the updates are discarded
  //  * @param state
  //  */
  // selectFilteredChanges: (state: EntityAndCrudState<T>) => Change<T>[];
  /**
   * Returns the entities plus the kind of change,
   * filters redundant changes ideal for a batch update
   * if you add and remove the same and items this changes are remove from the list
   * if you add and then update one or more times, the updates are discarded
   * if you update one or more times and then remove, the updates are discarded
   * @param state
   */
  selectFilteredEntitiesChangesList: (
    state: ƟLoadEntitiesCrudEntitiesState<T>
  ) => EntityChange<T>[];
};

export type CrudEntitiesMutators<T> = {
  add<S extends ƟLoadEntitiesCrudEntitiesState<T>>(entities: T[], state: S): S;

  remove<S extends ƟLoadEntitiesCrudEntitiesState<T>>(
    keys: string[],
    state: S
  ): S;
  remove<S extends ƟLoadEntitiesCrudEntitiesState<T>>(
    keys: number[],
    state: S
  ): S;
  remove<S extends ƟLoadEntitiesCrudEntitiesState<T>>(
    predicate: Predicate<T>,
    state: S
  ): S;

  removeAll<S extends ƟLoadEntitiesCrudEntitiesState<T>>(state: S): S;

  clearChanges<S extends ƟLoadEntitiesCrudEntitiesState<T>>(state: S): S;

  update<S extends ƟLoadEntitiesCrudEntitiesState<T>>(
    updates: Update<T>[],
    state: S
  ): S;
  upsert<S extends ƟLoadEntitiesCrudEntitiesState<T>>(
    entities: T[],
    state: S
  ): S;
};

export interface CrudEntitiesConfig {
  storeChanges?: boolean;
}
export const crudEntitiesTraitKey = 'crud';

export interface CrudEntitiesKeyedConfig {
  crud?: CrudEntitiesConfig;
}
