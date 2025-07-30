/* eslint-disable @typescript-eslint/no-empty-interface */
import { Action, ActionCreator } from '@ngrx/store';

import { LoadEntitiesState } from '../load-entities';

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
    }) => { index: number; forceLoad?: boolean } & Action<string>
  >;
  loadEntitiesPageSuccess: ActionCreator<string, () => Action<string>>;
  loadEntitiesPageFail: ActionCreator<string, () => Action<string>>;
  loadEntitiesNextPage: ActionCreator<string, () => Action<string>>;
  loadEntitiesPreviousPage: ActionCreator<string, () => Action<string>>;
  loadEntitiesFirstPage: ActionCreator<
    string,
    (forceLoad?: boolean) => { forceLoad?: boolean } & Action<string>
  >;
  loadEntitiesLastPage: ActionCreator<string, () => Action<string>>;
  clearEntitiesPagesCache: ActionCreator<string, () => Action<string>>;
};

export type EntitiesPaginationSelectors<T> = {
  selectEntitiesCurrentPageList: (
    state: LoadEntitiesState<T> & EntitiesPaginationState,
  ) => T[];
  selectEntitiesCurrentPage: (
    state: LoadEntitiesState<T> & EntitiesPaginationState,
  ) => PageModel<T>;
  selectEntitiesPagedRequest: (
    state: LoadEntitiesState<T> & EntitiesPaginationState,
  ) => PagedRequest;
  selectEntitiesCurrentPageInfo: (
    state: LoadEntitiesState<T> & EntitiesPaginationState,
  ) => PageInfoModel;
  isLoadingEntitiesCurrentPage: (
    state: LoadEntitiesState<T> & EntitiesPaginationState,
  ) => boolean;
};

export type EntitiesPaginationMutators<Entity> = {
  mergePaginatedEntities<
    S extends LoadEntitiesState<Entity> & EntitiesPaginationState,
  >(
    entities: Entity[],
    total: number | undefined,
    state: S,
  ): S;
  setEntitiesPage<
    Entity,
    S extends LoadEntitiesState<Entity> & EntitiesPaginationState,
  >(
    state: S,
    index: number,
  ): S;
};

export interface PageModel<T> {
  entities: T[];
  isLoading: boolean;
  pageIndex: number;
  total: number | undefined;
  pageSize: number;
  pagesCount: number | undefined;
  hasPrevious: boolean;
  hasNext: boolean;
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
