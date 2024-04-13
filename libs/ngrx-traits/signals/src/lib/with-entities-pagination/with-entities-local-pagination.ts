import { computed, effect, Signal } from '@angular/core';
import {
  patchState,
  signalStoreFeature,
  SignalStoreFeature,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  EntityState,
  NamedEntityState,
  setAllEntities,
} from '@ngrx/signals/entities';
import {
  EntitySignals,
  NamedEntitySignals,
} from '@ngrx/signals/entities/src/models';
import type { StateSignal } from '@ngrx/signals/src/state-signal';

import { combineFunctions, getWithEntitiesKeys } from '../util';
import { getWithEntitiesFilterKeys } from '../with-entities-filter/with-entities-filter.util';
import { getWithEntitiesSortKeys } from '../with-entities-sort/with-entities-sort.util';
import { getWithEntitiesLocalPaginationKeys } from './with-entities-local-pagination.util';

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

/**
 * Generates necessary state, computed and methods for local pagination of entities in the store.
 * Requires withEntities to be present in the store.
 * @param config
 * @param config.pageSize - The number of entities to show per page
 * @param config.currentPage - The current page to show
 * @param config.entity - The entity type
 * @param config.collection - The name of the collection
 *
 * @example
 * const entity = type<Product>();
 * const collection = 'products';
 * export const ProductsLocalStore = signalStore(
 *   { providedIn: 'root' },
 *   // required withEntities
 *   withEntities({ entity, collection }),
 *   withEntitiesLocalPagination({
 *     entity,
 *     collection,
 *     pageSize: 5,
 *   }));
 *
 *   // generates the following signals
 *   store.productsPagination // { currentPage: 0, pageSize: 5 }
 *   // generates the following computed signals
 *   store.productsCurrentPage // { entities: Product[], pageIndex: 0, total: 10, pageSize: 5, pagesCount: 2, hasPrevious: false, hasNext: true }
 *   // generates the following methods
 *   store.loadProductsPage // ({ pageIndex: number }) => void
 */
export function withEntitiesLocalPagination<
  Entity extends { id: string | number },
>(config: {
  pageSize?: number;
  currentPage?: number;
  entity?: Entity;
}): SignalStoreFeature<
  {
    state: EntityState<Entity>;
    signals: EntitySignals<Entity>;
    methods: {};
  },
  {
    state: EntitiesPaginationLocalState;
    signals: EntitiesPaginationLocalComputed<Entity>;
    methods: EntitiesPaginationLocalMethods;
  }
>;
/**
 * Generates necessary state, computed and methods for local pagination of entities in the store.
 * Requires withEntities to be present in the store.
 * @param config
 * @param config.pageSize - The number of entities to show per page
 * @param config.currentPage - The current page to show
 * @param config.entity - The entity type
 * @param config.collection - The name of the collection
 *
 * @example
 * const entity = type<Product>();
 * const collection = 'products';
 * export const ProductsLocalStore = signalStore(
 *   { providedIn: 'root' },
 *   // required withEntities
 *   withEntities({ entity, collection }),
 *   withEntitiesLocalPagination({
 *     entity,
 *     collection,
 *     pageSize: 5,
 *   }),
 *
 *   // generates the following signals
 *   store.productsPagination // { currentPage: 0, pageSize: 5 }
 *   // generates the following computed signals
 *   store.productsCurrentPage // { entities: Product[], pageIndex: 0, total: 10, pageSize: 5, pagesCount: 2, hasPrevious: false, hasNext: true }
 *   // generates the following methods
 *   store.loadProductsPage // ({ pageIndex: number }) => void
 */
export function withEntitiesLocalPagination<
  Entity extends { id: string | number },
  Collection extends string,
>(config: {
  pageSize?: number;
  currentPage?: number;
  entity?: Entity;
  collection?: Collection;
}): SignalStoreFeature<
  {
    state: NamedEntityState<Entity, any>; // if put Collection the some props get lost and can only be access ['prop'] weird bug
    signals: NamedEntitySignals<Entity, Collection>;
    methods: {};
  },
  {
    state: NamedEntitiesPaginationLocalState<Collection>;
    signals: NamedEntitiesPaginationLocalComputed<Entity, Collection>;
    methods: NamedEntitiesPaginationLocalMethods<Collection>;
  }
>;

export function withEntitiesLocalPagination<
  Entity extends { id: string | number },
  Collection extends string,
>({
  pageSize = 10,
  currentPage = 0,
  ...config
}: {
  pageSize?: number;
  currentPage?: number;
  entity?: Entity;
  collection?: Collection;
} = {}): SignalStoreFeature<any, any> {
  const { entitiesKey, clearEntitiesCacheKey } = getWithEntitiesKeys(config);
  const { loadEntitiesPageKey, entitiesCurrentPageKey, paginationKey } =
    getWithEntitiesLocalPaginationKeys(config);

  return signalStoreFeature(
    withState({
      [paginationKey]: {
        pageSize,
        currentPage,
      },
    }),
    withComputed((state: Record<string, Signal<unknown>>) => {
      const entities = state[entitiesKey] as Signal<Entity[]>;
      const pagination = state[paginationKey] as Signal<{
        pageSize: number;
        currentPage: number;
      }>;
      const entitiesCurrentPage = computed(() => {
        const page = pagination().currentPage;
        const startIndex = page * pagination().pageSize;
        let endIndex = startIndex + pagination().pageSize;
        endIndex = endIndex < entities().length ? endIndex : entities().length;
        const pageEntities = entities().slice(startIndex, endIndex);
        const total = entities().length;
        const pagesCount =
          total && total! > 0
            ? Math.ceil(total! / pagination().pageSize)
            : undefined;
        return {
          entities: pageEntities,
          pageIndex: pagination().currentPage,
          total: total,
          pageSize: pagination().pageSize,
          pagesCount,
          hasPrevious: pagination().currentPage - 1 >= 0,
          hasNext:
            pagesCount && total && total! > 0
              ? pagination().currentPage + 1 < pagesCount
              : true,
        };
      });
      return {
        [entitiesCurrentPageKey]: entitiesCurrentPage,
      };
    }),
    withMethods((state: Record<string, Signal<unknown>>) => {
      const pagination = state[paginationKey] as Signal<{
        pageSize: number;
        currentPage: number;
      }>;
      return {
        [clearEntitiesCacheKey]: combineFunctions(
          state[clearEntitiesCacheKey],
          () => {
            patchState(state as StateSignal<object>, {
              [paginationKey]: {
                ...pagination(),
                currentPage: 0,
              },
            });
          },
        ),
        [loadEntitiesPageKey]: ({ pageIndex }: { pageIndex: number }) => {
          patchState(state as StateSignal<object>, {
            [paginationKey]: {
              ...pagination(),
              currentPage: pageIndex,
            },
          });
        },
      };
    }),
  );
}
