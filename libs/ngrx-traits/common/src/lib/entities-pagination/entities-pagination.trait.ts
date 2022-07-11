import {
  EntitiesPaginationConfig,
  EntitiesPaginationKeyedConfig,
  EntitiesPaginationMutators,
  EntitiesPaginationSelectors,
  entitiesPaginationTraitKey,
} from './entities-pagination.model';
import { createPaginationTraitSelectors } from './entities-pagination.trait.selectors';
import { createPaginationTraitActions } from './entities-pagination.trait.actions';
import {
  FilterEntitiesActions,
  FilterEntitiesKeyedConfig,
} from '../filter-entities/filter-entities.model';
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
} from './entities-pagination.trait.reducer';
import { createPaginationTraitEffects } from './entities-pagination.trait.effects';
import { createTraitFactory } from '@ngrx-traits/core';
import { CrudEntitiesActions } from '../crud-entities/crud-entities.model';
import { createPaginationTraitMutators } from './entities-pagination.trait.mutators';
import {
  ƟEntitiesPaginationSelectors,
  ƟPaginationActions,
} from './entities-pagination.model.internal';
import {
  TraitActionsFactoryConfig,
  TraitInitialStateFactoryConfig,
  TraitSelectorsFactoryConfig,
} from '@ngrx-traits/core';
import { ƟFilterEntitiesActions } from '../filter-entities/filter-entities.model.internal';

/**
 * Generates ngrx code to paginate an list of entities, this has 3 cache `cacheType`
 * - 'full': The full result is cache in memory and split in pages to render, useful
 * for small result but not so small that requires been render in pages
 * - 'partial': Backend returns partial results because is are to big, this has a cache a few pages forward
 * to avoid calling the backend on each page, the cache is clean when a new loadEntities is required
 * - 'grow': Similar to partial that the backend returns partial result, but in this case the cache grows,
 * after each loadEntities the cache is appended to the previous cache, this mode is ideal for infinite scrolls,
 * where you will only call loadNextPage.
 * To make the pagination experience smoother the loadEntities action is fired when the current page is equal
 * to the last cached page, so while the user is reading the page more pages are being loading in the background.
 * @param config
 * @param config.cacheType - Default to 'partial', change the cache mode
 * @param config.pageSize - Default to 10, number of entities on  each page
 * @param config.currentPage - Default to 0, starting page
 * @param config.pagesToCache - Default to 3, used in partial and grow cache mode, is the number of
 * extra pages kept in cache to avoid calling the backend on each page
 *
 * @example
 * // The following trait config
 *
 * export interface TestState
 * extends EntityAndStatusState<Todo>,SingleSelectionState{}
 *
 *    const traits = createEntityFeatureFactory(
 *      addLoadEntitiesTrait<Todo>(),
 *      addEntitiesPaginationTrait<Todo>()
 *    )({
 *      actionsGroupKey: '[Todos]',
 *      featureSelector: createFeatureSelector<TestState>>(
 *        'todos',
 *      ),
 *    });
 *
 * //   adds following props to the state:
 * //    pagination: {
 * //       currentPage: number;
 * //       requestPage: number;
 * //       pageSize: number;
 * //       total?: number;
 * //       pagesToCache: number;
 * //       cache: {
 * //         type: 'full' | 'partial' | 'grow';
 * //         start: number;
 * //         end: number;
 * //       }
 * //     }
 *
 * // generated actions
 * traits.actions.loadTodosPage({index})
 * traits.actions.loadTodosPageSuccess()
 * traits.actions.loadTodosPageFail()
 * traits.actions.loadTodosNextPage()
 * traits.actions.loadTodosPreviousPage()
 * traits.actions.loadTodosFirstPage()
 * traits.actions.loadTodosLastPage()
 * traits.actions.clearTodosPagesCache()
 * // generated selectors
 * traits.selectors.isTodosPageInCache()
 * traits.selectors.selectPageTodosList()
 * traits.selectors.isLoadingTodosPage()
 * // use isLoadingTodosPage over isLoadingTodos (which will return true even
 * // if the page loading is not the current one)
 * traits.selectors.selectTodosPage()
 * traits.selectors.selectTodosPagedRequest()// use in effects to get paging parameter
 * traits.selectors.selectTodosPageInfo()
 */
export function addEntitiesPaginationTrait<Entity>({
  cacheType = 'partial',
  pageSize = 10,
  currentPage = 0,
  pagesToCache = 3,
}: EntitiesPaginationConfig = {}) {
  return createTraitFactory({
    key: entitiesPaginationTraitKey,
    depends: [loadEntitiesTraitKey],
    config: {
      cacheType,
      pageSize,
      currentPage,
      pagesToCache,
    } as EntitiesPaginationConfig,
    actions: ({ actionsGroupKey, entitiesName }: TraitActionsFactoryConfig) =>
      createPaginationTraitActions(actionsGroupKey, entitiesName),
    selectors: ({
      previousSelectors,
      allConfigs,
    }: TraitSelectorsFactoryConfig) =>
      createPaginationTraitSelectors<Entity>(
        previousSelectors as LoadEntitiesSelectors<Entity>,
        allConfigs as EntitiesPaginationKeyedConfig &
          FilterEntitiesKeyedConfig<Entity, unknown>
      ),
    mutators: ({ allSelectors, allConfigs }) =>
      createPaginationTraitMutators<Entity>(
        allSelectors as EntitiesPaginationSelectors<Entity> &
          LoadEntitiesSelectors<Entity>,
        allConfigs as EntitiesPaginationKeyedConfig &
          LoadEntitiesKeyedConfig<Entity>
      ),
    initialState: ({
      previousInitialState,
      allConfigs,
    }: TraitInitialStateFactoryConfig) =>
      createPaginationInitialState<Entity>(
        previousInitialState,
        allConfigs as EntitiesPaginationKeyedConfig
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
          ƟFilterEntitiesActions<Entity> &
          LoadEntitiesActions<Entity> &
          CrudEntitiesActions<Entity>,
        allSelectors as ƟEntitiesPaginationSelectors<Entity> &
          LoadEntitiesSelectors<Entity>,
        allMutators as EntitiesPaginationMutators<Entity> &
          LoadEntitiesMutators<Entity>,
        allConfigs as FilterEntitiesKeyedConfig<Entity, unknown> &
          LoadEntitiesKeyedConfig<Entity> &
          EntitiesPaginationKeyedConfig
      ),
    effects: ({ allActions, allSelectors }) =>
      createPaginationTraitEffects(
        allActions as ƟPaginationActions &
          FilterEntitiesActions<Entity> &
          LoadEntitiesActions<Entity> &
          CrudEntitiesActions<Entity>,
        allSelectors as ƟEntitiesPaginationSelectors<Entity> &
          LoadEntitiesSelectors<Entity>
      ),
  });
}
