import { Predicate, Update } from '@ngrx/entity';
import { ActionCreator } from '@ngrx/store';
import { Action } from '@ngrx/store';

import { LoadEntitiesState } from '../load-entities/load-entities.model';

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

export type CrudEntitiesActions<T> = {
  addEntities: ActionCreator<
    string,
    (...entities: T[]) => { entities: T[] } & Action<string>
  >;
  removeEntities: ActionCreator<
    string,
    (
      ...keys: string[] | number[]
    ) => { keys: string[] | number[] } & Action<string>
  >;
  updateEntities: ActionCreator<
    string,
    (...updates: Update<T>[]) => { updates: Update<T>[] } & Action<string>
  >;
  upsertEntities: ActionCreator<
    string,
    (...entities: T[]) => { entities: T[] } & Action<string>
  >;

  removeAllEntities: ActionCreator<
    string,
    (predicate?: Predicate<T>) => { predicate?: Predicate<T> } & Action<string>
  >;
  clearEntitiesChanges: ActionCreator<string, () => Action<string>>;
};

export type CrudEntitiesSelectors<Entity> = {
  /**
   * Return all changes made to the list plus entities, and can be filtered
   * by change type
   * @param state
   * @param props
   */
  selectEntitiesChangesList: (
    state: LoadEntitiesState<Entity> & CrudEntitiesState<Entity>,
  ) => EntityChange<Entity>[];

  /**
   * Returns the entities plus the kind of change,
   * filters redundant changes ideal for a batch update
   * if you add and remove the same and items this changes are remove from the list
   * if you add and then update one or more times, the updates are discarded
   * if you update one or more times and then remove, the updates are discarded
   * @param state
   */
  selectFilteredEntitiesChangesList: (
    state: LoadEntitiesState<Entity> & CrudEntitiesState<Entity>,
  ) => EntityChange<Entity>[];
};

export type CrudEntitiesMutators<Entity> = {
  addEntities<S extends LoadEntitiesState<Entity> & CrudEntitiesState<Entity>>(
    entities: Entity[],
    state: S,
  ): S;

  removeEntities<
    S extends LoadEntitiesState<Entity> & CrudEntitiesState<Entity>,
  >(
    keys: string[],
    state: S,
  ): S;
  removeEntities<
    S extends LoadEntitiesState<Entity> & CrudEntitiesState<Entity>,
  >(
    keys: number[],
    state: S,
  ): S;
  removeEntities<
    S extends LoadEntitiesState<Entity> & CrudEntitiesState<Entity>,
  >(
    predicate: Predicate<Entity>,
    state: S,
  ): S;

  removeAllEntities<
    S extends LoadEntitiesState<Entity> & CrudEntitiesState<Entity>,
  >(
    state: S,
  ): S;

  clearEntitiesChanges<
    S extends LoadEntitiesState<Entity> & CrudEntitiesState<Entity>,
  >(
    state: S,
  ): S;

  updateEntities<
    S extends LoadEntitiesState<Entity> & CrudEntitiesState<Entity>,
  >(
    updates: Update<Entity>[],
    state: S,
  ): S;
  upsertEntities<
    S extends LoadEntitiesState<Entity> & CrudEntitiesState<Entity>,
  >(
    entities: Entity[],
    state: S,
  ): S;
};

export interface CrudEntitiesConfig {
  storeChanges?: boolean;
}
export const crudEntitiesTraitKey = 'crud';

export interface CrudEntitiesKeyedConfig {
  crud?: CrudEntitiesConfig;
}
