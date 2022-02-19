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
  selectEntities: ActionCreator<
    string,
    (props: {
      id: number | string;
    }) => { id: number | string } & TypedAction<string>
  >;
  deselectEntities: ActionCreator<
    string,
    (props: {
      id: number | string;
    }) => { id: number | string } & TypedAction<string>
  >;
  toggleSelectEntities: ActionCreator<
    string,
    (props: {
      id: number | string;
    }) => { id: number | string } & TypedAction<string>
  >;
  toggleSelectAllEntities: ActionCreator<string, () => TypedAction<string>>;
  clearEntitiesSelection: ActionCreator<string, () => TypedAction<string>>;
};

export type MultipleSelectionSelectors<T> = {
  isAllEntitiesSelected: (
    state: EntityAndMultipleSelectionState<T>
  ) => Selected;
  selectEntitiesIdsSelectedMap: (
    state: EntityAndMultipleSelectionState<T>
  ) => Dictionary<boolean>;
  selectEntitiesIdsSelectedList: (
    state: EntityAndMultipleSelectionState<T>
  ) => number[] | string[];
  selectEntitiesSelectedMap: (
    state: EntityAndMultipleSelectionState<T>
  ) => Dictionary<T>;
  selectEntitiesSelectedList: (
    state: EntityAndMultipleSelectionState<T>
  ) => T[];
  selectTotalSelectedEntities: (
    state: EntityAndMultipleSelectionState<T>
  ) => number;
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
