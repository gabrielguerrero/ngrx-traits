import { Signal } from '@angular/core';

import {
  NamedSetEntitiesResult,
  SetEntitiesResult,
} from './with-entities-local-pagination.model';
import { DeepSignal } from '@ngrx/signals';

export type ScrollPaginationState = {
  hasMore: boolean;
  pageSize: number;
  pagesToCache: number;
  currentPage: number;
  requestPage: number;
};
export type EntitiesScrollPaginationState = {
  pagination: ScrollPaginationState;
};
export type NamedEntitiesScrollPaginationState<Collection extends string> = {
  [K in Collection as `${K}EntitiesPagination`]: ScrollPaginationState;
};
export type EntitiesScrollPaginationComputed<Entity> = {
  entitiesCurrentPage: DeepSignal<{
    entities: Entity[];
    pageIndex: number;
    pageSize: number;
    hasPrevious: boolean;
    hasNext: boolean;
    isLoading: boolean;
  }>;
  entitiesPagedRequest: DeepSignal<{
    startIndex: number;
    size: number;
  }>;
};
export type NamedEntitiesScrollPaginationComputed<
  Entity,
  Collection extends string,
> = {
  [K in Collection as `${K}EntitiesPagedRequest`]: DeepSignal<{
    startIndex: number;
    size: number;
  }>;
} & {
  [K in Collection as `${K}EntitiesCurrentPage`]: DeepSignal<{
    entities: Entity[];
    pageIndex: number;
    pageSize: number;
    hasPrevious: boolean;
    hasNext: boolean;
    isLoading: boolean;
  }>;
};
export type EntitiesScrollPaginationMethods<Entity> = SetEntitiesResult<
  | {
      entities: Entity[];
      total: number;
    }
  | {
      entities: Entity[];
      hasMore: boolean;
    }
  | {
      entities: Entity[];
    }
> & {
  loadMoreEntities: () => void;
  loadEntitiesNextPage: () => void;
  loadEntitiesPreviousPage: () => void;
  loadEntitiesFirstPage: () => void;
};
export type NamedEntitiesScrollPaginationMethods<
  Entity,
  Collection extends string,
> = NamedSetEntitiesResult<
  Collection,
  | {
      entities: Entity[];
      total: number;
    }
  | {
      entities: Entity[];
      hasMore: boolean;
    }
  | {
      entities: Entity[];
    }
> & {
  [K in Collection as `loadMore${Capitalize<string & K>}Entities`]: () => void;
} & {
  [K in Collection as `load${Capitalize<string & K>}EntitiesNextPage`]: () => void;
} & {
  [K in Collection as `load${Capitalize<string & K>}EntitiesPreviousPage`]: () => void;
} & {
  [K in Collection as `load${Capitalize<string & K>}EntitiesFirstPage`]: () => void;
};
