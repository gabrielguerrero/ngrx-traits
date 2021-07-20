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
  fetch: ActionCreator<string, () => TypedAction<string>>;
  fetchSuccess: ActionCreator<
    string,
    (props: {
      entities: T[];
      total?: number;
    }) => { entities: T[]; total?: number } & TypedAction<string>
  >;
  fetchFail: ActionCreator<
    string,
    (props: { error?: string }) => { error?: string } & TypedAction<string>
  >;
};

export type LoadEntitiesSelectors<T> = {
  selectIds: (state: EntityAndStatusState<T>) => string[] | number[];
  selectEntities: (state: EntityAndStatusState<T>) => Dictionary<T>;
  selectAll: (state: EntityAndStatusState<T>) => T[];
  selectTotal: (state: EntityAndStatusState<T>) => number;
  isLoading: (state: EntityAndStatusState<T>) => boolean;
  isSuccess: (state: EntityAndStatusState<T>) => boolean;
  isFail: (state: EntityAndStatusState<T>) => boolean;
};

export type LoadEntitiesMutators<T> = {
  setAll<S extends EntityAndStatusState<T>>(entities: T[], state: S): S;
};

export type GenericActionCreator = ActionCreator<
  string,
  (...args: unknown[]) => TypedAction<string>
>;

export const loadEntitiesTraitKey = 'loadEntities';

export type LoadEntitiesConfig<T = unknown> = {
  selectId?: IdSelector<T>;
  sortComparer?: false | Comparer<T>;
  resetOn?: GenericActionCreator[];
  adapter: EntityAdapter<T>;
};

export type LoadEntitiesKeyedConfig<T> = KeyedConfig<
  typeof loadEntitiesTraitKey,
  LoadEntitiesConfig<T>
>;
