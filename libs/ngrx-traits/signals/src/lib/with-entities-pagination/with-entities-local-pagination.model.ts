import { DeepSignal } from '@ngrx/signals';

export type EntitiesPaginationLocalState = {
  entitiesPagination: {
    currentPage: number;
    pageSize: number;
  };
};
export type NamedEntitiesPaginationLocalState<Collection extends string> = {
  [K in Collection as `${K}EntitiesPagination`]: {
    currentPage: number;
    pageSize: number;
  };
};
export type EntitiesPaginationLocalComputed<Entity> = {
  entitiesCurrentPage: DeepSignal<{
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
  [K in Collection as `${K}EntitiesCurrentPage`]: DeepSignal<{
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
  loadEntitiesPage: (options: { pageIndex: number; pageSize?: number }) => void;
};
export type NamedEntitiesPaginationLocalMethods<Collection extends string> = {
  [K in Collection as `load${Capitalize<string & K>}EntitiesPage`]: (options: {
    pageIndex: number;
    pageSize?: number;
  }) => void;
};

export type SetEntitiesResult<ResultParam> = {
  setEntitiesPagedResult: (result: ResultParam) => void;
};
export type NamedSetEntitiesResult<Collection extends string, ResultParam> = {
  [K in Collection as `set${Capitalize<string & K>}EntitiesPagedResult`]: (
    result: ResultParam,
  ) => void;
};
