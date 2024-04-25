import { Signal } from '@angular/core';

import {
  NamedSetEntitiesResult,
  SetEntitiesResult,
} from './with-entities-local-pagination.model';

export type ScrollPaginationState = {
  bufferSize: number;
  hasMore: boolean;
};
export type EntitiesScrollPaginationState = {
  entitiesScrollCache: ScrollPaginationState;
};
export type NamedEntitiesScrollPaginationState<Collection extends string> = {
  [K in Collection as `${K}ScrollCache`]: ScrollPaginationState;
};
export type EntitiesScrollPaginationComputed = {
  entitiesPagedRequest: Signal<{
    startIndex: number;
    size: number;
  }>;
};
export type NamedEntitiesScrollPaginationComputed<
  Entity,
  Collection extends string,
> = {
  [K in Collection as `${K}PagedRequest`]: Signal<{
    startIndex: number;
    size: number;
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
  [K in Collection as `loadMore${Capitalize<string & K>}`]: () => void;
};
