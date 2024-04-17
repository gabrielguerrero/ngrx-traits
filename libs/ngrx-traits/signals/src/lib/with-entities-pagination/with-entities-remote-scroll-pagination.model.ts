import { Signal } from '@angular/core';

import { EntitiesPaginationLocalMethods } from './with-entities-local-pagination.model';

export type InfinitePaginationState = {
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
export type EntitiesPaginationInfiniteState = {
  entitiesPagination: InfinitePaginationState;
};
export type NamedEntitiesPaginationInfiniteState<Collection extends string> = {
  [K in Collection as `${K}Pagination`]: InfinitePaginationState;
};
export type EntitiesPaginationInfiniteComputed = {
  entitiesPageInfo: Signal<{
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
export type NamedEntitiesPaginationInfiniteComputed<
  Entity,
  Collection extends string,
> = {
  [K in Collection as `${K}PagedRequest`]: Signal<{
    startIndex: number;
    size: number;
    page: number;
  }>;
} & {
  [K in Collection as `${K}PageInfo`]: Signal<{
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
export type EntitiesPaginationInfiniteMethods<Entity> =
  EntitiesPaginationLocalMethods & {
    setEntitiesLoadedResult: (entities: Entity[], total: number) => void;
    loadEntitiesNextPage: () => void;
    loadEntitiesPreviousPage: () => void;
    loadEntitiesFirstPage: () => void;
  };
export type NamedEntitiesPaginationInfiniteMethods<
  Entity,
  Collection extends string,
> = {
  [K in Collection as `set${Capitalize<string & K>}LoadedResult`]: (
    entities: Entity[],
    total: number,
  ) => void;
} & {
  [K in Collection as `load${Capitalize<string & K>}NextPage`]: () => void;
} & {
  [K in Collection as `load${Capitalize<string & K>}PreviousPage`]: () => void;
} & {
  [K in Collection as `load${Capitalize<string & K>}FirstPage`]: () => void;
};
