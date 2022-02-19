import { Dictionary } from '@ngrx/entity';
import { LoadEntitiesState } from '../load-entities/load-entities.model';
import { ActionCreator, TypedAction } from '@ngrx/store/src/models';

export interface SelectEntitiesState {
  selectedIds: Dictionary<boolean>;
}
/**
 * @internal
 */
export interface ƟLoadEntitiesSelectEntitiesState<Entity>
  extends LoadEntitiesState<Entity>,
    SelectEntitiesState {}

export type SelectEntitiesActions = {
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

export type SelectEntitiesSelectors<T> = {
  isAllEntitiesSelected: (
    state: ƟLoadEntitiesSelectEntitiesState<T>
  ) => Selected;
  selectEntitiesIdsSelectedMap: (
    state: ƟLoadEntitiesSelectEntitiesState<T>
  ) => Dictionary<boolean>;
  selectEntitiesIdsSelectedList: (
    state: ƟLoadEntitiesSelectEntitiesState<T>
  ) => number[] | string[];
  selectEntitiesSelectedMap: (
    state: ƟLoadEntitiesSelectEntitiesState<T>
  ) => Dictionary<T>;
  selectEntitiesSelectedList: (
    state: ƟLoadEntitiesSelectEntitiesState<T>
  ) => T[];
  selectTotalSelectedEntities: (
    state: ƟLoadEntitiesSelectEntitiesState<T>
  ) => number;
};

export type SelectEntitiesMutators<T> = {
  multiSelect: <S extends ƟLoadEntitiesSelectEntitiesState<T>>(
    id: number | string,
    state: S
  ) => S;

  multiDeselect<S extends ƟLoadEntitiesSelectEntitiesState<T>>(
    id: number | string,
    state: S
  ): S;

  multiToggleSelect<S extends ƟLoadEntitiesSelectEntitiesState<T>>(
    id: number | string,
    state: S
  ): S;

  toggleSelectAll<S extends ƟLoadEntitiesSelectEntitiesState<T>>(state: S): S;

  multiClearSelection<S extends ƟLoadEntitiesSelectEntitiesState<T>>(
    state: S
  ): S;
};

export type Selected = 'all' | 'some' | 'none';
