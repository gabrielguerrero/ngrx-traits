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
