import { createReducer, on } from '@ngrx/store';
import {
  LoadEntitiesActions,
  LoadEntitiesKeyedConfig,
} from '../load-entities/load-entities.model';
import {
  SortEntitiesActions,
  SortEntitiesKeyedConfig,
} from '../sort-entities/sort-entities.model';
import {
  ƟLoadEntitiesSelectEntiyState,
  SelectEntityActions,
  SelectEntityKeyedConfig,
  SelectEntityMutators,
} from './select-entity.model';
import { CrudEntitiesActions } from '../crud-entities/crud-entities.model';
import { insertIf } from 'ngrx-traits';
import {
  EntitiesPaginationActions,
  EntitiesPaginationKeyedConfig,
} from '../pagination/pagination.model';
import { FilterEntitiesActions } from '../filter-entities';

export function createSingleSelectionInitialState<Entity>(
  previousInitialState: any,
  allConfigs: SelectEntityKeyedConfig
): ƟLoadEntitiesSelectEntiyState<Entity> {
  const selectedId = allConfigs.singleSelection?.selectedId;
  return {
    ...previousInitialState,
    selectedId,
  };
}
export function createSingleSelectionTraitReducer<
  Entity,
  S extends ƟLoadEntitiesSelectEntiyState<Entity>
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
      allMutators.select(id, state)
    ),
    on(allActions.deselectEntity, (state) => allMutators.deselect(state)),
    on(allActions.toggleSelectEntity, (state, { id }) =>
      allMutators.toggleSelect(id, state)
    ),
    ...insertIf<S>(allActions.removeAllEntities, () =>
      on(allActions.removeAllEntities, (state) => allMutators.deselect(state))
    ),
    ...insertIf<S>(sortRemote, () =>
      on(allActions.sortEntities, (state) => allMutators.deselect(state))
    ),
    ...insertIf<S>(allActions.filterEntities, () =>
      on(allActions.filterEntities, (state) => allMutators.deselect(state))
    ),
    ...insertIf<S>(!allActions.loadEntitiesPageSuccess, () =>
      on(allActions.loadEntitiesSuccess, (state) => allMutators.deselect(state))
    ),
    ...insertIf<S>(
      !!allActions.loadEntitiesPageSuccess && paginationCacheType === 'partial',
      () =>
        on(allActions.loadEntitiesPageSuccess, (state) =>
          allMutators.deselect(state)
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
