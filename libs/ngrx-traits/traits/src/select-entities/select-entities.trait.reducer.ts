import {
  LoadEntitiesActions,
  LoadEntitiesKeyedConfig,
  LoadEntitiesState,
} from '../load-entities/load-entities.model';
import {
  SortEntitiesActions,
  SortEntitiesKeyedConfig,
} from '../sort-entities/sort-entities.model';
import {
  SelectEntitiesMutators,
  SelectEntitiesActions,
  SelectEntitiesState,
} from './select-entities.model';
import { CrudEntitiesActions } from '../crud-entities/crud-entities.model';
import { Update } from '@ngrx/entity/src/models';
import { insertIf } from 'ngrx-traits';
import { createReducer, on } from '@ngrx/store';
import {
  EntitiesPaginationActions,
  EntitiesPaginationKeyedConfig,
} from '../entities-pagination/entities-pagination.model';
import { FilterEntitiesActions } from '../filter-entities';

export function createSelectEntitiesInitialState<Entity>(
  previousInitialState: any
): LoadEntitiesState<Entity> & SelectEntitiesState {
  return {
    ...previousInitialState,
    selectedIds: {},
  };
}

export function createSelectEntitiesTraitReducer<
  Entity,
  S extends LoadEntitiesState<Entity> & SelectEntitiesState
>(
  initialState: S,
  allActions: SelectEntitiesActions &
    CrudEntitiesActions<Entity> &
    SortEntitiesActions<Entity> &
    LoadEntitiesActions<Entity> &
    FilterEntitiesActions<any> &
    EntitiesPaginationActions,
  allMutators: SelectEntitiesMutators<Entity>,
  allConfigs: LoadEntitiesKeyedConfig<Entity> &
    EntitiesPaginationKeyedConfig &
    SortEntitiesKeyedConfig<Entity>
) {
  const { adapter } = allConfigs.loadEntities!;
  const sortRemote = allConfigs.sort?.remote;
  const paginationCacheType = allConfigs.pagination?.cacheType;

  function updateSelectedIdsChanged<
    S extends LoadEntitiesState<Entity> & SelectEntitiesState
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
    on(allActions.selectEntities, (state, { id }) =>
      allMutators.selectEntities(id, state)
    ),
    on(allActions.deselectEntities, (state, { id }) =>
      allMutators.deselectEntities(id, state)
    ),
    on(allActions.toggleSelectEntities, (state, { id }) =>
      allMutators.toggleSelectEntities(id, state)
    ),
    on(allActions.toggleSelectAllEntities, (state) =>
      allMutators.toggleSelectAllEntities(state)
    ),
    ...insertIf<S>(allActions.removeEntities, () =>
      on(allActions.removeEntities, (state, { keys }) => {
        const selectedIds = { ...state.selectedIds };
        keys.forEach((v: string | number) => {
          delete selectedIds[v];
        });
        return { ...state, selectedIds };
      })
    ),
    ...insertIf<S>(allActions.updateEntities, () =>
      on(allActions.updateEntities, (state, { updates }) =>
        updateSelectedIdsChanged(state, updates)
      )
    ),
    on(allActions.clearEntitiesSelection, (state) =>
      allMutators.clearEntitiesSelection(state)
    ),
    ...insertIf<S>(allActions.removeAllEntities, () =>
      on(allActions.removeAllEntities, (state) =>
        allMutators.clearEntitiesSelection(state)
      )
    ),
    ...insertIf<S>(sortRemote, () =>
      on(allActions.sortEntities, (state) =>
        allMutators.clearEntitiesSelection(state)
      )
    ),
    ...insertIf<S>(allActions.filterEntities, () =>
      on(allActions.filterEntities, (state) =>
        allMutators.clearEntitiesSelection(state)
      )
    ),
    ...insertIf<S>(!allActions.loadEntitiesPageSuccess, () =>
      on(allActions.loadEntitiesSuccess, (state) =>
        allMutators.clearEntitiesSelection(state)
      )
    ),
    ...insertIf<S>(
      !!allActions.loadEntitiesPageSuccess && paginationCacheType === 'partial',
      () =>
        on(allActions.loadEntitiesPageSuccess, (state) =>
          allMutators.clearEntitiesSelection(state)
        )
    )
  );
}
