import { createReducer, on } from '@ngrx/store';
import { LoadEntitiesActions, LoadEntitiesKeyedConfig } from '../load-entities';
import {
  ƟLoadEntitiesSortEntitiesState,
  SortEntitiesActions,
  SortEntitiesKeyedConfig,
  SortEntitiesMutators,
} from './sort.model';

export function createSortInitialState<Entity>(
  previousInitialState: any,
  allConfigs: SortEntitiesKeyedConfig<Entity>
): ƟLoadEntitiesSortEntitiesState<Entity> {
  const { defaultSort } = allConfigs.sort!;

  return {
    ...previousInitialState,
    sort: {
      current: defaultSort,
      default: defaultSort,
    },
  };
}

export function createSortTraitReducer<
  Entity,
  S extends ƟLoadEntitiesSortEntitiesState<Entity> = ƟLoadEntitiesSortEntitiesState<Entity>
>(
  initialState: S,
  allActions: SortEntitiesActions<Entity> & LoadEntitiesActions<Entity>,
  allMutators: SortEntitiesMutators<Entity>,
  allConfigs: LoadEntitiesKeyedConfig<Entity> & SortEntitiesKeyedConfig<Entity>
) {
  const { remote } = allConfigs.sort!;

  return createReducer(
    initialState,
    on(allActions.sortEntities, (state, { active, direction }) =>
      !remote
        ? allMutators.sortEntities({ active, direction }, state)
        : {
            ...state,
            sort: { ...state.sort, current: { active, direction } },
          }
    ),
    on(allActions.resetEntitiesSort, (state) =>
      state.sort?.default
        ? !remote
          ? allMutators.sortEntities(state.sort?.default, state)
          : {
              ...state,
              sort: { ...state.sort, current: state.sort?.default },
            }
        : state
    )
  );
}
