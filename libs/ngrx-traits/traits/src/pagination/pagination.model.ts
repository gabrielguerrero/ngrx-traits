/* eslint-disable @typescript-eslint/no-empty-interface */
import { LoadEntitiesState } from '../load-entities';

import { ActionCreator, TypedAction } from '@ngrx/store/src/models';

export type CacheType = 'full' | 'partial' | 'grow';
export interface PaginationState {
  pagination: {
    currentPage: number;
    requestPage: number;
    pageSize: number;
    total?: number;
    pagesToCache: number;
    cache: {
      type: CacheType;
      start: number;
      end: number;
    };
  };
}

export interface EntityAndPaginationState<T>
  extends LoadEntitiesState<T>,
    PaginationState {}

export type PaginationActions = {
  loadPage: ActionCreator<
    string,
    (props: {
      index: number;
      forceLoad?: boolean;
    }) => { index: number; forceLoad?: boolean } & TypedAction<string>
  >;
  loadPageSuccess: ActionCreator<string, () => TypedAction<string>>;
  loadPageFail: ActionCreator<string, () => TypedAction<string>>;
  loadNextPage: ActionCreator<string, () => TypedAction<string>>;
  loadPreviousPage: ActionCreator<string, () => TypedAction<string>>;
  loadFirstPage: ActionCreator<
    string,
    (forceLoad?: boolean) => { forceLoad?: boolean } & TypedAction<string>
  >;
  loadLastPage: ActionCreator<string, () => TypedAction<string>>;
  clearPagesCache: ActionCreator<string, () => TypedAction<string>>;
};

export type PaginationSelectors<T> = {
  isPageInCache: (
    state: EntityAndPaginationState<T>,
    props?: { page?: number }
  ) => boolean;
  selectPageEntities: (
    state: EntityAndPaginationState<T>,
    props?: { page?: number }
  ) => T[];
  selectPage: (
    state: EntityAndPaginationState<T>,
    props?: { page?: number }
  ) => PageModel<T>;
  selectPagedRequest: (state: EntityAndPaginationState<T>) => PagedRequest;
  selectPageInfo: (state: EntityAndPaginationState<T>) => PageInfoModel;
  isLoadingPage: (state: EntityAndPaginationState<T>) => boolean;
};

export type PaginationMutators<T> = {
  mergePaginatedEntities<S extends EntityAndPaginationState<T>>(
    entities: T[],
    total: number | undefined,
    state: S
  ): S;
};

export interface PageModel<T> {
  entities: T[];
  pageIndex: number;
  total: number | undefined;
  pageSize: number;
}

export interface PageInfoModel {
  pageIndex: number;
  total: number | undefined;
  pageSize: number;
  pagesCount: number | undefined;
  hasPrevious: boolean;
  hasNext: boolean;
  cacheType: CacheType;
}

export interface PagedRequest {
  startIndex: number;
  size: number;
  page: number;
}

export const paginationTraitKey = 'pagination';

export interface PaginationConfig {
  cacheType?: CacheType;
  pageSize?: number;
  currentPage?: number;
  pagesToCache?: number;
}

export interface PaginationKeyedConfig {
  pagination?: PaginationConfig;
}
