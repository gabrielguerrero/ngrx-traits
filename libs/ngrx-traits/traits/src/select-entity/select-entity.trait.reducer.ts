import { createReducer, on } from '@ngrx/store';
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
  SelectEntityActions,
  SelectEntityKeyedConfig,
  SelectEntityMutators,
  SelectEntityState,
} from './select-entity.model';
import { CrudEntitiesActions } from '../crud-entities/crud-entities.model';
import { insertIf } from 'ngrx-traits';
import {
  EntitiesPaginationActions,
  EntitiesPaginationKeyedConfig,
} from '../entities-pagination/entities-pagination.model';
import { FilterEntitiesActions } from '../filter-entities';
import { createSelectEntityTraitActions } from './select-entity.trait.actions';

export function createSelectEntityInitialState<Entity>(
  previousInitialState: any,
  allConfigs: SelectEntityKeyedConfig
): LoadEntitiesState<Entity> & SelectEntityState {
  const selectedId = allConfigs.singleSelection?.selectedId;
  return {
    ...previousInitialState,
    selectedId,
  };
}
export function createSelectEntityTraitReducer<
  Entity,
  S extends LoadEntitiesState<Entity> & SelectEntityState
>(
  initialState: S,
  allActions: SelectEntityActions &
    CrudEntitiesActions<Entity> &
    SortEntitiesActions<Entity> &
    EntitiesPaginationActions &
    FilterEntitiesActions<any> &
    LoadEntitiesActions<Entity>,
  allMutators: SelectEntityMutators<Entity>,
  allConfigs: SelectEntityKeyedConfig &
    LoadEntitiesKeyedConfig<Entity> &
    EntitiesPaginationKeyedConfig &
    SortEntitiesKeyedConfig<Entity>
) {
  const { adapter } = allConfigs.loadEntities!;

  const sortRemote = allConfigs.sort?.remote;
  const paginationCacheType = allConfigs.pagination?.cacheType;

  return createReducer(
    initialState,
    on(allActions.selectEntity, (state, { id }) =>
      allMutators.selectEntity(id, state)
    ),
    on(allActions.deselectEntity, (state) => allMutators.deselectEntity(state)),
    on(allActions.toggleSelectEntity, (state, { id }) =>
      allMutators.toggleSelectEntity(id, state)
    ),
    ...insertIf<S>(allActions.removeAllEntities, () =>
      on(allActions.removeAllEntities, (state) =>
        allMutators.deselectEntity(state)
      )
    ),
    ...insertIf<S>(sortRemote, () =>
      on(allActions.sortEntities, (state) => allMutators.deselectEntity(state))
    ),
    ...insertIf<S>(allActions.filterEntities, () =>
      on(allActions.filterEntities, (state) =>
        allMutators.deselectEntity(state)
      )
    ),
    ...insertIf<S>(!allActions.loadEntitiesPageSuccess, () =>
      on(allActions.loadEntitiesSuccess, (state) =>
        allMutators.deselectEntity(state)
      )
    ),
    ...insertIf<S>(
      !!allActions.loadEntitiesPageSuccess && paginationCacheType === 'partial',
      () =>
        on(allActions.loadEntitiesPageSuccess, (state) =>
          allMutators.deselectEntity(state)
        )
    ),
    ...insertIf<S>(allActions.removeEntities, () =>
      on(allActions.removeEntities, (state, { keys }) => {
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
    ...insertIf<S>(allActions.updateEntities, () =>
      on(allActions.updateEntities, (state, { updates }) => {
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
