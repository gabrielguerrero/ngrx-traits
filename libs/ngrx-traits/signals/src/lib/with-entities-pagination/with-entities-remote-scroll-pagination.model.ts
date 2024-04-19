import { Signal } from '@angular/core';

export type ScrollPaginationState = {
  bufferSize: number;
  total: number | undefined;
  hasMore: boolean;
};
export type EntitiesScrollPaginationState = {
  entitiesScrollCache: ScrollPaginationState;
};
export type NamedEntitiesScrollPaginationState<Collection extends string> = {
  [K in Collection as `${K}ScrollCache`]: ScrollPaginationState;
};
export type EntitiesScrollPaginationComputed = {
  entitiesRequest: Signal<{
    startIndex: number;
    size: number;
  }>;
};
export type NamedEntitiesScrollPaginationComputed<
  Entity,
  Collection extends string,
> = {
  [K in Collection as `${K}Request`]: Signal<{
    startIndex: number;
    size: number;
  }>;
};
export type EntitiesScrollPaginationMethods<Entity> = {
  setEntitiesPagedResult: (result: {
    entities: Entity[];
    total: number;
  }) => void;
  loadMoreEntities: () => void;
};
export type NamedEntitiesScrollPaginationMethods<
  Entity,
  Collection extends string,
> = {
  [K in Collection as `set${Capitalize<string & K>}PagedResult`]: (result: {
    entities: Entity[];
    total: number;
  }) => void;
} & {
  [K in Collection as `loadMore${Capitalize<string & K>}`]: () => void;
};
