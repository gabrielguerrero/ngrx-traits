import { ActionCreator, TypedAction } from '@ngrx/store/src/models';
import { KeyedConfig } from '@ngrx-traits/core';
import { LoadEntitiesState } from '../load-entities/load-entities.model';

export interface SelectEntityState {
  selectedId?: number | string;
}

export type SelectEntityActions = {
  selectEntity: ActionCreator<
    string,
    (props: {
      id: number | string;
    }) => { id: number | string } & TypedAction<string>
  >;
  deselectEntity: ActionCreator<string, () => TypedAction<string>>;
  toggleSelectEntity: ActionCreator<
    string,
    (props: {
      id: number | string;
    }) => { id: number | string } & TypedAction<string>
  >;
};

export type SelectEntitySelectors<T> = {
  selectEntityIdSelected: (
    state: LoadEntitiesState<T> & SelectEntityState
  ) => string | number | undefined;
  selectEntitySelected: (
    state: LoadEntitiesState<T> & SelectEntityState
  ) => T | undefined;
};

export type SelectEntityMutators<T> = {
  selectEntity<S extends LoadEntitiesState<T> & SelectEntityState>(
    id: string | number,
    state: S
  ): S;
  deselectEntity<S extends LoadEntitiesState<T> & SelectEntityState>(
    state: S
  ): S;
  toggleSelectEntity<S extends LoadEntitiesState<T> & SelectEntityState>(
    id: string | number,
    state: S
  ): S;
};

export interface SelectEntityConfig {
  selectedId?: string | number;
}

export const selectEntityTraitKey = 'singleSelection';
export type SelectEntityKeyedConfig = KeyedConfig<
  typeof selectEntityTraitKey,
  SelectEntityConfig
>;
