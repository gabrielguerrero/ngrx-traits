import {
  PaginationConfig,
  PaginationKeyedConfig,
  PaginationMutators,
  PaginationSelectors,
  paginationTraitKey,
} from './pagination.model';
import { createPaginationTraitSelectors } from './pagination.trait.selectors';
import { createPaginationTraitActions } from './pagination.trait.actions';
import { FilterActions, FilterKeyedConfig } from '../filter/filter.model';
import {
  LoadEntitiesActions,
  LoadEntitiesKeyedConfig,
  LoadEntitiesMutators,
  LoadEntitiesSelectors,
  loadEntitiesTraitKey,
} from '../load-entities/load-entities.model';
import {
  createPaginationInitialState,
  createPaginationTraitReducer,
} from './pagination.trait.reducer';
import { createPaginationTraitEffects } from './pagination.trait.effects';
import { createTraitFactory } from 'ngrx-traits';
import { CrudActions } from '../crud/crud.model';
import { createPaginationTraitMutators } from './pagination.trait.mutators';
import { ƟPaginationActions } from './pagination.model.internal';
import {
  TraitActionsFactoryConfig,
  TraitInitialStateFactoryConfig,
  TraitSelectorsFactoryConfig,
} from 'ngrx-traits';

export function addPagination<Entity>({
  cacheType = 'full',
  pageSize = 20,
  currentPage = 0,
  pagesToCache = 3,
}: PaginationConfig = {}) {
  return createTraitFactory({
    key: paginationTraitKey,
    depends: [loadEntitiesTraitKey],
    config: {
      cacheType,
      pageSize,
      currentPage,
      pagesToCache,
    } as PaginationConfig,
    actions: ({ actionsGroupKey }: TraitActionsFactoryConfig) =>
      createPaginationTraitActions(actionsGroupKey),
    selectors: ({
      previousSelectors,
      allConfigs,
    }: TraitSelectorsFactoryConfig) =>
      createPaginationTraitSelectors<Entity>(
        previousSelectors as LoadEntitiesSelectors<Entity>,
        allConfigs as PaginationKeyedConfig & FilterKeyedConfig<Entity, unknown>
      ),
    mutators: ({ allSelectors, allConfigs }) =>
      createPaginationTraitMutators<Entity>(
        allSelectors as PaginationSelectors<Entity> &
          LoadEntitiesSelectors<Entity>,
        allConfigs as PaginationKeyedConfig & LoadEntitiesKeyedConfig<Entity>
      ),
    initialState: ({
      previousInitialState,
      allConfigs,
    }: TraitInitialStateFactoryConfig) =>
      createPaginationInitialState<Entity>(
        previousInitialState,
        allConfigs as PaginationKeyedConfig
      ),
    reducer: ({
      initialState,
      allActions,
      allSelectors,
      allMutators,
      allConfigs,
    }) =>
      createPaginationTraitReducer(
        initialState,
        allActions as ƟPaginationActions &
          FilterActions<Entity> &
          LoadEntitiesActions<Entity> &
          CrudActions<Entity>,
        allSelectors as PaginationSelectors<Entity> &
          LoadEntitiesSelectors<Entity>,
        allMutators as PaginationMutators<Entity> &
          LoadEntitiesMutators<Entity>,
        allConfigs as FilterKeyedConfig<Entity, unknown> &
          LoadEntitiesKeyedConfig<Entity> &
          PaginationKeyedConfig
      ),
    effects: ({ allActions, allSelectors }) =>
      createPaginationTraitEffects(
        allActions as ƟPaginationActions &
          FilterActions<Entity> &
          LoadEntitiesActions<Entity> &
          CrudActions<Entity>,
        allSelectors as PaginationSelectors<Entity> &
          LoadEntitiesSelectors<Entity>
      ),
  });
}
