import {
  LoadEntitiesActions,
  LoadEntitiesKeyedConfig,
} from '../load-entities/load-entities.model';
import { SortActions, SortKeyedConfig } from '../sort/sort.model';
import {
  EntityAndMultipleSelectionState,
  MultipleSelectionMutators,
  MultiSelectActions,
} from './multi-selection.model';
import { CrudActions } from '../crud/crud.model';
import { Update } from '@ngrx/entity/src/models';
import { insertIf } from 'ngrx-traits';
import { createReducer, on } from '@ngrx/store';
import {
  PaginationActions,
  PaginationKeyedConfig,
} from '../pagination/pagination.model';
import { FilterActions } from '../filter';

export function createMultiSelectionInitialState<Entity>(
  previousInitialState: any
): EntityAndMultipleSelectionState<Entity> {
  return {
    ...previousInitialState,
    selectedIds: {},
  };
}

export function createMultiSelectionTraitReducer<
  Entity,
  S extends EntityAndMultipleSelectionState<Entity>
>(
  initialState: S,
  allActions: MultiSelectActions &
    CrudActions<Entity> &
    SortActions<Entity> &
    LoadEntitiesActions<Entity> &
    FilterActions<any> &
    PaginationActions,
  allMutators: MultipleSelectionMutators<Entity>,
  allConfigs: LoadEntitiesKeyedConfig<Entity> &
    PaginationKeyedConfig &
    SortKeyedConfig<Entity>
) {
  const { adapter } = allConfigs.loadEntities!;
  const sortRemote = allConfigs.sort?.remote;
  const paginationCacheType = allConfigs.pagination?.cacheType;

  function updateSelectedIdsChanged<
    S extends EntityAndMultipleSelectionState<Entity>
  >(state: S, updates: Update<Entity>[]) {
    const changedIds = updates.reduce((acc, updated) => {
      const id = adapter.selectId(updated.changes as Entity);
      if (id && id !== updated.id && state.selectedIds[updated.id] != null) {
        acc.push(updated);
        return acc;
      }
      return acc;
    }, [] as Update<Entity>[]);
    if (changedIds.length) {
      const selectedIds = { ...state.selectedIds };
      changedIds.forEach((updated) => {
        const id = adapter.selectId(updated.changes as Entity);
        const value = selectedIds[updated.id];
        delete selectedIds[updated.id];
        selectedIds[id] = value;
      });
      return { ...state, selectedIds };
    }

    return state;
  }

  return createReducer(
    initialState,
    on(allActions.multiSelect, (state, { id }) =>
      allMutators.multiSelect(id, state)
    ),
    on(allActions.multiDeselect, (state, { id }) =>
      allMutators.multiDeselect(id, state)
    ),
    on(allActions.multiToggleSelect, (state, { id }) =>
      allMutators.multiToggleSelect(id, state)
    ),
    on(allActions.toggleSelectAll, (state) =>
      allMutators.toggleSelectAll(state)
    ),
    ...insertIf<S>(allActions.remove, () =>
      on(allActions.remove, (state, { keys }) => {
        const selectedIds = { ...state.selectedIds };
        keys.forEach((v: string | number) => {
          delete selectedIds[v];
        });
        return { ...state, selectedIds };
      })
    ),
    ...insertIf<S>(allActions.update, () =>
      on(allActions.update, (state, { updates }) =>
        updateSelectedIdsChanged(state, updates)
      )
    ),
    on(allActions.multiClearSelection, (state) =>
      allMutators.multiClearSelection(state)
    ),
    ...insertIf<S>(allActions.removeAll, () =>
      on(allActions.removeAll, (state) =>
        allMutators.multiClearSelection(state)
      )
    ),
    ...insertIf<S>(sortRemote, () =>
      on(allActions.sort, (state) => allMutators.multiClearSelection(state))
    ),
    ...insertIf<S>(allActions.filter, () =>
      on(allActions.filter, (state) => allMutators.multiClearSelection(state))
    ),
    ...insertIf<S>(!allActions.loadPageSuccess, () =>
      on(allActions.fetchSuccess, (state) =>
        allMutators.multiClearSelection(state)
      )
    ),
    ...insertIf<S>(
      !!allActions.loadPageSuccess && paginationCacheType === 'partial',
      () =>
        on(allActions.loadPageSuccess, (state) =>
          allMutators.multiClearSelection(state)
        )
    )
  );
}
