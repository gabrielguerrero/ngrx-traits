import {
  EntitiesPaginationConfig,
  EntitiesPaginationKeyedConfig,
  EntitiesPaginationMutators,
  EntitiesPaginationSelectors,
  entitiesPaginationTraitKey,
} from './pagination.model';
import { createPaginationTraitSelectors } from './pagination.trait.selectors';
import { createPaginationTraitActions } from './pagination.trait.actions';
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
} from './pagination.trait.reducer';
import { createPaginationTraitEffects } from './pagination.trait.effects';
import { createTraitFactory } from 'ngrx-traits';
import { CrudEntitiesActions } from '../crud-entities/crud-entities.model';
import { createPaginationTraitMutators } from './pagination.trait.mutators';
import { ƟPaginationActions } from './pagination.model.internal';
import {
  TraitActionsFactoryConfig,
  TraitInitialStateFactoryConfig,
  TraitSelectorsFactoryConfig,
} from 'ngrx-traits';

/**
 * Generates ngrx code to paginate an list of entities, this has 3 cache `cacheType`
 * - 'full': The full result is cache in memory and split in pages to render, useful
 * for small result but not so small that requires been render in pages
 * - 'partial': Backend returns partial results because is are to big, this has a cache a few pages forward
 * to avoid calling the backend on each page, the cache is clean when a new loadEntities is required
 * - 'grow': Similar to partial that the backend returns partial result, but in this case the cache grows,
 * after each loadEntities the cache is appended to the previous cache, this mode is ideal for infinite scrolls,
 * where you will only call loadNextPage.
 * To make the pagination experience smoother the loadEntities to get new pages is done when the current page is change to
 * the last cached page.
 * @param config
 * @param config.cacheType - Default to 'full', change the cache mode
 * @param config.pageSize - Default to 20, number of entities on  each page
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
 *      addLoadEntities<Todo>(),
 *      addPagination<Todo>()
 *    )({
 *      actionsGroupKey: '[Todos]',
 *      featureSelector: createFeatureSelector<TestState>>(
 *        'todos',
 *      ),
 *    });
 * // will generate  the following actions and selectors, plus the ones generated by other traits
 * traits.actions.loadPage({index})
 * traits.actions.loadPageSuccess()
 * traits.actions.loadPageFail()
 * traits.actions.loadNextPage()
 * traits.actions.loadPreviousPage()
 * traits.actions.loadFirstPage()
 * traits.actions.loadLastPage()
 * traits.actions.clearPagesCache()
 *
 * // page param is optional and defaults to current page
 * traits.selectors.isPageInCache({page})
 * traits.selectors.selectPageEntities({page})
 * traits.selectors.isLoadingPage({page})
 * // prefer isLoadingPage over isLoading which will return true even
 * // if the page loading is not the current one
 * traits.selectors.selectPage({page})
 * traits.selectors.selectPagedRequest()// use in effects to get paging parameter
 * traits.selectors.selectPageInfo()
 */
export function addEntitiesPagination<Entity>({
  cacheType = 'full',
  pageSize = 20,
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
    actions: ({ actionsGroupKey }: TraitActionsFactoryConfig) =>
      createPaginationTraitActions(actionsGroupKey),
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
          FilterEntitiesActions<Entity> &
          LoadEntitiesActions<Entity> &
          CrudEntitiesActions<Entity>,
        allSelectors as EntitiesPaginationSelectors<Entity> &
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
        allSelectors as EntitiesPaginationSelectors<Entity> &
          LoadEntitiesSelectors<Entity>
      ),
  });
}