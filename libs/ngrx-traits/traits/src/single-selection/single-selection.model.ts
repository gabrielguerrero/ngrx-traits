import { ActionCreator, TypedAction } from '@ngrx/store/src/models';
import { KeyedConfig } from 'ngrx-traits';
import { LoadEntitiesState } from '../load-entities/load-entities.model';

export interface SingleSelectionState {
  selectedId?: number | string;
}
export interface EntityAndSingleSelectionState<T>
  extends LoadEntitiesState<T>,
    SingleSelectionState {}

export type SingleSelectionActions = {
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

export type SingleSelectionSelectors<T> = {
  selectEntityIdSelected: (
    state: EntityAndSingleSelectionState<T>
  ) => string | number | undefined;
  selectEntitySelected: (
    state: EntityAndSingleSelectionState<T>
  ) => T | undefined;
};

export type SingleSelectionMutators<T> = {
  select<S extends EntityAndSingleSelectionState<T>>(
    id: string | number,
    state: S
  ): S;
  deselect<S extends EntityAndSingleSelectionState<T>>(state: S): S;
  toggleSelect<S extends EntityAndSingleSelectionState<T>>(
    id: string | number,
    state: S
  ): S;
};

export interface SingleSelectionConfig {
  selectedId?: string | number;
}

export const singleSelectionTraitKey = 'singleSelection';
export type SingleSelectionKeyedConfig = KeyedConfig<
  typeof singleSelectionTraitKey,
  SingleSelectionConfig
>;
