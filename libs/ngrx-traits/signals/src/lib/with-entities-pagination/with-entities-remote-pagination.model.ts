import { Signal } from '@angular/core';

import {
  EntitiesPaginationLocalMethods,
  NamedEntitiesPaginationLocalMethods,
} from './with-entities-local-pagination.model';

export type PaginationState = {
  currentPage: number;
  requestPage: number;
  pageSize: number;
  total: number | undefined;
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
  [K in Collection as `${K}Pagination`]: PaginationState;
};
export type EntitiesPaginationRemoteComputed<Entity> = {
  entitiesCurrentPage: Signal<{
    entities: Entity[];
    pageIndex: number;
    total: number | undefined;
    pageSize: number;
    pagesCount: number | undefined;
    hasPrevious: boolean;
    hasNext: boolean;
    isLoading: boolean;
  }>;
  entitiesPagedRequest: Signal<{
    startIndex: number;
    size: number;
    page: number;
  }>;
};
export type NamedEntitiesPaginationRemoteComputed<
  Entity,
  Collection extends string,
> = {
  [K in Collection as `${K}PagedRequest`]: Signal<{
    startIndex: number;
    size: number;
    page: number;
  }>;
} & {
  [K in Collection as `${K}CurrentPage`]: Signal<{
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
export type EntitiesPaginationRemoteMethods<Entity> =
  EntitiesPaginationLocalMethods & {
    setEntitiesLoadedResult: (entities: Entity[], total: number) => void;
  };
export type NamedEntitiesPaginationSetResultMethods<
  Entity,
  Collection extends string,
> = {
  [K in Collection as `set${Capitalize<string & K>}LoadedResult`]: (
    entities: Entity[],
    total: number,
  ) => void;
};
export type NamedEntitiesPaginationRemoteMethods<
  Entity,
  Collection extends string,
> = NamedEntitiesPaginationLocalMethods<Collection> & {
  [K in Collection as `set${Capitalize<string & K>}LoadedResult`]: (
    entities: Entity[],
    total: number,
  ) => void;
};
