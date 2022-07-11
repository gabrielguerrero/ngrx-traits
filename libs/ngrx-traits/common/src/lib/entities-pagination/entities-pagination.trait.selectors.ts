import { createSelector } from '@ngrx/store';
import {
  CacheType,
  EntitiesPaginationSelectors,
  EntitiesPaginationState,
  PageModel,
} from './entities-pagination.model';
import {
  LoadEntitiesSelectors,
  LoadEntitiesState,
} from '../load-entities/load-entities.model';
import { FilterEntitiesKeyedConfig } from '../filter-entities/filter-entities.model';

export function createPaginationTraitSelectors<Entity>(
  previousSelectors: LoadEntitiesSelectors<Entity>,
  allConfigs: FilterEntitiesKeyedConfig<Entity, unknown>
): EntitiesPaginationSelectors<Entity> {
  const { selectEntitiesList, isEntitiesLoading } = previousSelectors;

  const filterFunction = allConfigs?.filter?.filterFn;

  function selectPagination(
    state: LoadEntitiesState<Entity> & EntitiesPaginationState
  ) {
    return state.pagination;
  }
  const selectPaginationFiltered: (
    state: LoadEntitiesState<Entity> & EntitiesPaginationState
  ) => EntitiesPaginationState['pagination'] = filterFunction
    ? createSelector(
        selectEntitiesList,
        selectPagination,
        (entities, pagination) => {
          return {
            ...pagination,
            total: entities.length,
            cache: {
              ...pagination.cache,
              start: 0,
              end: entities.length,
            },
          };
        }
      )
    : selectPagination;

  const selectEntitiesCurrentPageList = createSelector(
    selectEntitiesList,
    selectPaginationFiltered,
    (entities: Entity[], pagination) => {
      const page = pagination.currentPage;
      const startIndex = page * pagination.pageSize - pagination.cache.start;
      let endIndex = startIndex + pagination.pageSize;
      endIndex =
        endIndex < pagination.cache.end ? endIndex : pagination.cache.end;
      return entities.slice(startIndex, endIndex);
    }
  );

  const selectEntitiesCurrentPageInfo = createSelector(
    selectPaginationFiltered,
    (pagination) => {
      const pagesCount =
        pagination.total && pagination.total > 0
          ? Math.ceil(pagination.total / pagination.pageSize)
          : undefined;
      return {
        pageIndex: pagination.currentPage,
        total: pagination.total,
        pageSize: pagination.pageSize,
        pagesCount,
        hasPrevious: pagination.currentPage - 1 >= 0,
        hasNext:
          pagesCount && pagination.total && pagination.total > 0
            ? pagination.currentPage + 1 < pagesCount
            : true,
        cacheType: pagination.cache.type,
      };
    }
  );

  function isEntitiesPageInCache(
    page: number,
    pagination: {
      currentPage: number;
      requestPage: number;
      pageSize: number;
      total?: number;
      pagesToCache: number;
      cache: { type: CacheType; start: number; end: number };
    }
  ) {
    const startIndex = page * pagination.pageSize;
    let endIndex = startIndex + pagination.pageSize - 1;
    endIndex =
      pagination.total && endIndex > pagination.total
        ? pagination.total - 1
        : endIndex;
    return (
      startIndex >= pagination.cache.start && endIndex <= pagination.cache.end
    );
  }

  const isEntitiesCurrentPageInCache = createSelector(
    selectPaginationFiltered,
    (pagination) => {
      const page = pagination.currentPage;
      return isEntitiesPageInCache(page, pagination);
    }
  );
  const isEntitiesNextPageInCache = createSelector(
    selectPaginationFiltered,
    (pagination) => {
      const page = pagination.currentPage + 1;
      return isEntitiesPageInCache(page, pagination);
    }
  );
  const isLoadingEntitiesCurrentPage = createSelector(
    isEntitiesLoading,
    selectPagination,
    (isLoading, pagination) =>
      isLoading && pagination.requestPage === pagination.currentPage
  );

  const selectEntitiesCurrentPage = createSelector(
    selectEntitiesCurrentPageList,
    selectEntitiesCurrentPageInfo,
    isLoadingEntitiesCurrentPage,
    (entities, pageInfo, isLoading) =>
      ({
        entities,
        isLoading,
        ...pageInfo,
      } as PageModel<Entity>)
  );

  const selectEntitiesPagedRequest = createSelector(
    selectPagination,
    (pagination) => ({
      startIndex: pagination.pageSize * pagination.requestPage,
      size: pagination.pageSize * pagination.pagesToCache,
      page: pagination.requestPage,
    })
  );

  const selectors = {
    selectEntitiesCurrentPageList,
    isEntitiesNextPageInCache,
    isEntitiesCurrentPageInCache,
    selectEntitiesCurrentPage,
    selectEntitiesPagedRequest,
    selectEntitiesCurrentPageInfo,
    isLoadingEntitiesCurrentPage,
  };
  return selectors;
}
