import { createSelector } from '@ngrx/store';
import {
  EntitiesPaginationSelectors,
  EntitiesPaginationState,
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

  const selectPageEntitiesList = createSelector(
    selectEntitiesList,
    selectPaginationFiltered,
    (
      entities: Entity[],
      pagination,
      { page } = { page: pagination.currentPage }
    ) => {
      const startIndex = page * pagination.pageSize - pagination.cache.start;
      let endIndex = startIndex + pagination.pageSize;
      endIndex =
        endIndex < pagination.cache.end ? endIndex : pagination.cache.end;
      return entities.slice(startIndex, endIndex);
    }
  );

  const selectEntitiesPageInfo = createSelector(
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
          pagination.total && pagination.total > 0
            ? pagination.currentPage + 1 < pagesCount!
            : true,
        cacheType: pagination.cache.type,
      };
    }
  );

  const isEntitiesPageInCache = createSelector(
    selectPaginationFiltered,
    (pagination, { page } = { page: pagination.currentPage }) => {
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
  );

  const selectEntitiesPage = createSelector(
    selectPageEntitiesList,
    selectEntitiesPageInfo,
    // props look unsued but they are pass to the selectPageEntities
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (entities, pageInfo, props = { page: pageInfo.pageIndex }) => ({
      entities,
      ...pageInfo,
    })
  );

  const selectEntitiesPagedRequest = createSelector(
    selectPagination,
    (pagination) => ({
      startIndex: pagination.pageSize * pagination.requestPage,
      size: pagination.pageSize * pagination.pagesToCache,
      page: pagination.requestPage,
    })
  );

  const isLoadingEntitiesPage = createSelector(
    isEntitiesLoading,
    selectPagination,
    (isLoading, pagination) =>
      isLoading && pagination.requestPage === pagination.currentPage
  );

  return {
    selectPageEntitiesList,
    isEntitiesPageInCache,
    selectEntitiesPage,
    selectEntitiesPagedRequest,
    selectEntitiesPageInfo,
    isLoadingEntitiesPage,
  };
}
