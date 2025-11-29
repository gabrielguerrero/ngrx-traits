import { DeepSignal } from '@ngrx/signals';

import {
  NamedSetEntitiesResult,
  SetEntitiesResult,
} from './with-entities-local-pagination.model';

export type PaginationState = {
  currentPage: number;
  requestPage: number;
  pageSize: number;
  total: number;
  pagesToCache: number;
  cache: {
    start: number;
    end: number;
  };
};
export type EntitiesPaginationRemoteState = {
  entitiesPagination: PaginationState;
};
export type NamedEntitiesPaginationRemoteState<Collection extends string> = {
  [K in Collection as `${K}EntitiesPagination`]: PaginationState;
};
export type EntitiesPaginationRemoteComputed<Entity> = {
  entitiesCurrentPage: DeepSignal<{
    entities: Entity[];
    pageIndex: number;
    total: number | undefined;
    pageSize: number;
    pagesCount: number | undefined;
    hasPrevious: boolean;
    hasNext: boolean;
    isLoading: boolean;
  }>;
  entitiesPagedRequest: DeepSignal<{
    startIndex: number;
    size: number;
    page: number;
  }>;
};
export type NamedEntitiesPaginationRemoteComputed<
  Entity,
  Collection extends string,
> = {
  [K in Collection as `${K}EntitiesPagedRequest`]: DeepSignal<{
    startIndex: number;
    size: number;
    page: number;
  }>;
} & {
  [K in Collection as `${K}EntitiesCurrentPage`]: DeepSignal<{
    entities: Entity[];
    pageIndex: number;
    total: number | undefined;
    pageSize: number;
    pagesCount: number | undefined;
    hasPrevious: boolean;
    hasNext: boolean;
    isLoading: boolean;
  }>;
};

export type EntitiesPaginationRemoteMethods<Entity> = {
  loadEntitiesPage: (options: {
    pageIndex: number;
    pageSize?: number;
    skipLoadingCall?: boolean;
  }) => void;
} & SetEntitiesResult<{ entities: Entity[]; total: number }>;

export type NamedEntitiesPaginationRemoteMethods<
  Entity,
  Collection extends string,
> = {
  [K in Collection as `load${Capitalize<string & K>}EntitiesPage`]: (options: {
    pageIndex: number;
    pageSize?: number;
    skipLoadingCall?: boolean;
  }) => void;
} & NamedSetEntitiesResult<Collection, { entities: Entity[]; total: number }>;
