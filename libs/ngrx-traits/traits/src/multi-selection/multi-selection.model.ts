import { Dictionary } from '@ngrx/entity';
import { LoadEntitiesState } from '../load-entities/load-entities.model';
import { ActionCreator, TypedAction } from '@ngrx/store/src/models';

export interface MultipleSelectionState {
  selectedIds: Dictionary<boolean>;
}
export interface EntityAndMultipleSelectionState<Entity>
  extends LoadEntitiesState<Entity>,
    MultipleSelectionState {}

export type MultiSelectActions = {
  multiSelect: ActionCreator<
    string,
    (props: {
      id: number | string;
    }) => { id: number | string } & TypedAction<string>
  >;
  multiDeselect: ActionCreator<
    string,
    (props: {
      id: number | string;
    }) => { id: number | string } & TypedAction<string>
  >;
  multiToggleSelect: ActionCreator<
    string,
    (props: {
      id: number | string;
    }) => { id: number | string } & TypedAction<string>
  >;
  toggleSelectAll: ActionCreator<string, () => TypedAction<string>>;
  multiClearSelection: ActionCreator<string, () => TypedAction<string>>;
};

export type MultipleSelectionSelectors<T> = {
  isAllSelected: (state: EntityAndMultipleSelectionState<T>) => Selected;
  selectIdsSelected: (
    state: EntityAndMultipleSelectionState<T>
  ) => Dictionary<boolean>;
  selectAllIdsSelected: (
    state: EntityAndMultipleSelectionState<T>
  ) => number[] | string[];
  selectEntitiesSelected: (
    state: EntityAndMultipleSelectionState<T>
  ) => Dictionary<T>;
  selectAllSelected: (state: EntityAndMultipleSelectionState<T>) => T[];
  selectTotalSelected: (state: EntityAndMultipleSelectionState<T>) => number;
};

export type MultipleSelectionMutators<T> = {
  multiSelect: <S extends EntityAndMultipleSelectionState<T>>(
    id: number | string,
    state: S
  ) => S;

  multiDeselect<S extends EntityAndMultipleSelectionState<T>>(
    id: number | string,
    state: S
  ): S;

  multiToggleSelect<S extends EntityAndMultipleSelectionState<T>>(
    id: number | string,
    state: S
  ): S;

  toggleSelectAll<S extends EntityAndMultipleSelectionState<T>>(state: S): S;

  multiClearSelection<S extends EntityAndMultipleSelectionState<T>>(
    state: S
  ): S;
};

export type Selected = 'all' | 'some' | 'none';
