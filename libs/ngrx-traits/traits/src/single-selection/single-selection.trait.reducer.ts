import { createReducer, on } from '@ngrx/store';
import {
  LoadEntitiesActions,
  LoadEntitiesKeyedConfig,
} from '../load-entities/load-entities.model';
import { SortActions, SortKeyedConfig } from '../sort/sort.model';
import {
  EntityAndSingleSelectionState,
  SingleSelectionActions,
  SingleSelectionKeyedConfig,
  SingleSelectionMutators,
} from './single-selection.model';
import { CrudActions } from '../crud/crud.model';
import { insertIf } from 'ngrx-traits';
import {
  PaginationActions,
  PaginationKeyedConfig,
} from '../pagination/pagination.model';
import { FilterActions } from '../filter';

export function createSingleSelectionInitialState<Entity>(
  previousInitialState: any,
  allConfigs: SingleSelectionKeyedConfig
): EntityAndSingleSelectionState<Entity> {
  const selectedId = allConfigs.singleSelection?.selectedId;
  return {
    ...previousInitialState,
    selectedId,
  };
}
export function createSingleSelectionTraitReducer<
  Entity,
  S extends EntityAndSingleSelectionState<Entity>
>(
  initialState: S,
  allActions: SingleSelectionActions &
    CrudActions<Entity> &
    SortActions<Entity> &
    PaginationActions &
    FilterActions<any> &
    LoadEntitiesActions<Entity>,
  allMutators: SingleSelectionMutators<Entity>,
  allConfigs: SingleSelectionKeyedConfig &
    LoadEntitiesKeyedConfig<Entity> &
    PaginationKeyedConfig &
    SortKeyedConfig<Entity>
) {
  const { adapter } = allConfigs.loadEntities!;

  const sortRemote = allConfigs.sort?.remote;
  const paginationCacheType = allConfigs.pagination?.cacheType;

  return createReducer(
    initialState,
    on(allActions.select, (state, { id }) => allMutators.select(id, state)),
    on(allActions.deselect, (state) => allMutators.deselect(state)),
    on(allActions.toggleSelect, (state, { id }) =>
      allMutators.toggleSelect(id, state)
    ),
    ...insertIf<S>(allActions.removeAll, () =>
      on(allActions.removeAll, (state) => allMutators.deselect(state))
    ),
    ...insertIf<S>(sortRemote, () =>
      on(allActions.sort, (state) => allMutators.deselect(state))
    ),
    ...insertIf<S>(allActions.filter, () =>
      on(allActions.filter, (state) => allMutators.deselect(state))
    ),
    ...insertIf<S>(!allActions.loadPageSuccess, () =>
      on(allActions.fetchSuccess, (state) => allMutators.deselect(state))
    ),
    ...insertIf<S>(
      !!allActions.loadPageSuccess && paginationCacheType === 'partial',
      () =>
        on(allActions.loadPageSuccess, (state) => allMutators.deselect(state))
    ),
    ...insertIf<S>(allActions.remove, () =>
      on(allActions.remove, (state, { keys }) => {
        const shouldDeselect = keys.some(
          (v: string | number) => v === state.selectedId
        );
        return shouldDeselect
          ? {
              ...state,
              selectedId: undefined,
            }
          : state;
      })
    ),
    ...insertIf<S>(allActions.update, () =>
      on(allActions.update, (state, { updates }) => {
        const change = updates.find((updated) => {
          const id = adapter.selectId(updated.changes as Entity);
          return id && id !== updated.id && state.selectedId === updated.id;
        });
        return change
          ? {
              ...state,
              selectedId: adapter.selectId(change.changes as Entity),
            }
          : state;
      })
    )
  );
}
