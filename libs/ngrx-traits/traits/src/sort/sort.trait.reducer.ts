import { createReducer, on } from '@ngrx/store';
import { LoadEntitiesActions, LoadEntitiesKeyedConfig } from '../load-entities';
import {
  EntityAndSortState,
  SortActions,
  SortKeyedConfig,
  SortMutators,
} from './sort.model';

export function createSortInitialState<Entity>(
  previousInitialState: any,
  allConfigs: SortKeyedConfig<Entity>
): EntityAndSortState<Entity> {
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
  S extends EntityAndSortState<Entity> = EntityAndSortState<Entity>
>(
  initialState: S,
  allActions: SortActions<Entity> & LoadEntitiesActions<Entity>,
  allMutators: SortMutators<Entity>,
  allConfigs: LoadEntitiesKeyedConfig<Entity> & SortKeyedConfig<Entity>
) {
  const { remote } = allConfigs.sort!;

  return createReducer(
    initialState,
    on(allActions.sort, (state, { active, direction }) =>
      !remote
        ? allMutators.sortEntities({ active, direction }, state)
        : {
            ...state,
            sort: { ...state.sort, current: { active, direction } },
          }
    ),
    on(allActions.resetSort, (state) =>
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
