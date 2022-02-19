import { ActionCreator, TypedAction } from '@ngrx/store/src/models';
import { KeyedConfig } from 'ngrx-traits';
import { LoadEntitiesState } from '../load-entities/load-entities.model';

export interface SelectEntityState {
  selectedId?: number | string;
}
/**
 * @internal
 */
export interface ƟLoadEntitiesSelectEntiyState<T>
  extends LoadEntitiesState<T>,
    SelectEntityState {}

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
    state: ƟLoadEntitiesSelectEntiyState<T>
  ) => string | number | undefined;
  selectEntitySelected: (
    state: ƟLoadEntitiesSelectEntiyState<T>
  ) => T | undefined;
};

export type SelectEntityMutators<T> = {
  select<S extends ƟLoadEntitiesSelectEntiyState<T>>(
    id: string | number,
    state: S
  ): S;
  deselect<S extends ƟLoadEntitiesSelectEntiyState<T>>(state: S): S;
  toggleSelect<S extends ƟLoadEntitiesSelectEntiyState<T>>(
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
