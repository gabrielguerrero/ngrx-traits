import { Signal } from '@angular/core';

export type EntitiesPaginationLocalState = {
  entitiesPagination: {
    currentPage: number;
    pageSize: number;
  };
};
export type NamedEntitiesPaginationLocalState<Collection extends string> = {
  [K in Collection as `${K}Pagination`]: {
    currentPage: number;
    pageSize: number;
  };
};
export type EntitiesPaginationLocalComputed<Entity> = {
  entitiesCurrentPage: Signal<{
    entities: Entity[];
    pageIndex: number;
    total: number | undefined;
    pageSize: number;
    pagesCount: number | undefined;
    hasPrevious: boolean;
    hasNext: boolean;
  }>;
};
export type NamedEntitiesPaginationLocalComputed<
  Entity,
  Collection extends string,
> = {
  [K in Collection as `${K}CurrentPage`]: Signal<{
    entities: Entity[];
    pageIndex: number;
    total: number | undefined;
    pageSize: number;
    pagesCount: number | undefined;
    hasPrevious: boolean;
    hasNext: boolean;
  }>;
};
export type EntitiesPaginationLocalMethods = {
  loadEntitiesPage: (options: { pageIndex: number }) => void;
};
export type NamedEntitiesPaginationLocalMethods<Collection extends string> = {
  [K in Collection as `load${Capitalize<string & K>}Page`]: (options: {
    pageIndex: number;
  }) => void;
};
