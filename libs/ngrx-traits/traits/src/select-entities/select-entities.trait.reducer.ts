import {
  LoadEntitiesActions,
  LoadEntitiesKeyedConfig,
} from '../load-entities/load-entities.model';
import {
  SortEntitiesActions,
  SortEntitiesKeyedConfig,
} from '../sort-entities/sort-entities.model';
import {
  ƟLoadEntitiesSelectEntitiesState,
  SelectEntitiesMutators,
  SelectEntitiesActions,
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
): ƟLoadEntitiesSelectEntitiesState<Entity> {
  return {
    ...previousInitialState,
    selectedIds: {},
  };
}

export function createSelectEntitiesTraitReducer<
  Entity,
  S extends ƟLoadEntitiesSelectEntitiesState<Entity>
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
    S extends ƟLoadEntitiesSelectEntitiesState<Entity>
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
      allMutators.multiSelect(id, state)
    ),
    on(allActions.deselectEntities, (state, { id }) =>
      allMutators.multiDeselect(id, state)
    ),
    on(allActions.toggleSelectEntities, (state, { id }) =>
      allMutators.multiToggleSelect(id, state)
    ),
    on(allActions.toggleSelectAllEntities, (state) =>
      allMutators.toggleSelectAll(state)
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
      allMutators.multiClearSelection(state)
    ),
    ...insertIf<S>(allActions.removeAllEntities, () =>
      on(allActions.removeAllEntities, (state) =>
        allMutators.multiClearSelection(state)
      )
    ),
    ...insertIf<S>(sortRemote, () =>
      on(allActions.sortEntities, (state) =>
        allMutators.multiClearSelection(state)
      )
    ),
    ...insertIf<S>(allActions.filterEntities, () =>
      on(allActions.filterEntities, (state) =>
        allMutators.multiClearSelection(state)
      )
    ),
    ...insertIf<S>(!allActions.loadEntitiesPageSuccess, () =>
      on(allActions.loadEntitiesSuccess, (state) =>
        allMutators.multiClearSelection(state)
      )
    ),
    ...insertIf<S>(
      !!allActions.loadEntitiesPageSuccess && paginationCacheType === 'partial',
      () =>
        on(allActions.loadEntitiesPageSuccess, (state) =>
          allMutators.multiClearSelection(state)
        )
    )
  );
}
