/* eslint-disable @typescript-eslint/no-empty-interface */
import { LoadEntitiesState } from '../load-entities';

import { ActionCreator, TypedAction } from '@ngrx/store/src/models';

export type CacheType = 'full' | 'partial' | 'grow';
export interface EntitiesPaginationState {
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

export type EntitiesPaginationActions = {
  loadEntitiesPage: ActionCreator<
    string,
    (props: {
      index: number;
      forceLoad?: boolean;
    }) => { index: number; forceLoad?: boolean } & TypedAction<string>
  >;
  loadEntitiesPageSuccess: ActionCreator<string, () => TypedAction<string>>;
  loadEntitiesPageFail: ActionCreator<string, () => TypedAction<string>>;
  loadEntitiesNextPage: ActionCreator<string, () => TypedAction<string>>;
  loadEntitiesPreviousPage: ActionCreator<string, () => TypedAction<string>>;
  loadEntitiesFirstPage: ActionCreator<
    string,
    (forceLoad?: boolean) => { forceLoad?: boolean } & TypedAction<string>
  >;
  loadEntitiesLastPage: ActionCreator<string, () => TypedAction<string>>;
  clearEntitiesPagesCache: ActionCreator<string, () => TypedAction<string>>;
};

export type EntitiesPaginationSelectors<T> = {
  isEntitiesPageInCache: (
    state: LoadEntitiesState<T> & EntitiesPaginationState,
    props?: { page?: number }
  ) => boolean;
  selectPageEntitiesList: (
    state: LoadEntitiesState<T> & EntitiesPaginationState,
    props?: { page?: number }
  ) => T[];
  selectEntitiesPage: (
    state: LoadEntitiesState<T> & EntitiesPaginationState,
    props?: { page?: number }
  ) => PageModel<T>;
  selectEntitiesPagedRequest: (
    state: LoadEntitiesState<T> & EntitiesPaginationState
  ) => PagedRequest;
  selectEntitiesPageInfo: (
    state: LoadEntitiesState<T> & EntitiesPaginationState
  ) => PageInfoModel;
  isLoadingEntitiesPage: (
    state: LoadEntitiesState<T> & EntitiesPaginationState
  ) => boolean;
};

export type EntitiesPaginationMutators<T> = {
  mergePaginatedEntities<
    S extends LoadEntitiesState<T> & EntitiesPaginationState
  >(
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

export const entitiesPaginationTraitKey = 'pagination';

export interface EntitiesPaginationConfig {
  cacheType?: CacheType;
  pageSize?: number;
  currentPage?: number;
  pagesToCache?: number;
}

export interface EntitiesPaginationKeyedConfig {
  pagination?: EntitiesPaginationConfig;
}
