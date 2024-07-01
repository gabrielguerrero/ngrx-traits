import { Dictionary } from '@ngrx/entity';
import { Action } from '@ngrx/store';
import { ActionCreator } from '@ngrx/store/src/models';

import { LoadEntitiesState } from '../load-entities/load-entities.model';

export interface SelectEntitiesState {
  selectedIds: Dictionary<boolean>;
}

export type SelectEntitiesActions = {
  selectEntities: ActionCreator<
    string,
    (props: { id: number | string }) => { id: number | string } & Action<string>
  >;
  deselectEntities: ActionCreator<
    string,
    (props: { id: number | string }) => { id: number | string } & Action<string>
  >;
  toggleSelectEntities: ActionCreator<
    string,
    (props: { id: number | string }) => { id: number | string } & Action<string>
  >;
  toggleSelectAllEntities: ActionCreator<string, () => Action<string>>;
  clearEntitiesSelection: ActionCreator<string, () => Action<string>>;
};

export type SelectEntitiesSelectors<Entity> = {
  isAllEntitiesSelected: (
    state: LoadEntitiesState<Entity> & SelectEntitiesState,
  ) => Selected;
  selectEntitiesIdsSelectedMap: (
    state: LoadEntitiesState<Entity> & SelectEntitiesState,
  ) => Dictionary<boolean>;
  selectEntitiesIdsSelectedList: (
    state: LoadEntitiesState<Entity> & SelectEntitiesState,
  ) => number[] | string[];
  selectEntitiesSelectedMap: (
    state: LoadEntitiesState<Entity> & SelectEntitiesState,
  ) => Dictionary<Entity>;
  selectEntitiesSelectedList: (
    state: LoadEntitiesState<Entity> & SelectEntitiesState,
  ) => Entity[];
  selectTotalSelectedEntities: (
    state: LoadEntitiesState<Entity> & SelectEntitiesState,
  ) => number;
};

export type SelectEntitiesMutators<Entity> = {
  selectEntities: <S extends LoadEntitiesState<Entity> & SelectEntitiesState>(
    id: number | string,
    state: S,
  ) => S;

  deselectEntities<S extends LoadEntitiesState<Entity> & SelectEntitiesState>(
    id: number | string,
    state: S,
  ): S;

  toggleSelectEntities<
    S extends LoadEntitiesState<Entity> & SelectEntitiesState,
  >(
    id: number | string,
    state: S,
  ): S;

  toggleSelectAllEntities<
    S extends LoadEntitiesState<Entity> & SelectEntitiesState,
  >(
    state: S,
  ): S;

  clearEntitiesSelection<
    S extends LoadEntitiesState<Entity> & SelectEntitiesState,
  >(
    state: S,
  ): S;
};

export type Selected = 'all' | 'some' | 'none';
