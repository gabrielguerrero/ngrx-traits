import { computed, Signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import {
  patchState,
  signalStoreFeature,
  SignalStoreFeature,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  addEntities,
  EntityState,
  NamedEntityState,
  setAllEntities,
} from '@ngrx/signals/entities';
import type {
  EntitySignals,
  NamedEntitySignals,
} from '@ngrx/signals/entities/src/models';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import type { StateSignal } from '@ngrx/signals/src/state-signal';
import { exhaustMap, first, pipe, tap } from 'rxjs';

import { combineFunctions, getWithEntitiesKeys } from '../util';
import {
  CallStatusComputed,
  CallStatusMethods,
  NamedCallStatusComputed,
  NamedCallStatusMethods,
} from '../with-call-status/with-call-status.model';
import { getWithCallStatusKeys } from '../with-call-status/with-call-status.util';
import {
  EntitiesScrollPaginationComputed,
  EntitiesScrollPaginationMethods,
  EntitiesScrollPaginationState,
  NamedEntitiesScrollPaginationComputed,
  NamedEntitiesScrollPaginationMethods,
  NamedEntitiesScrollPaginationState,
  ScrollPaginationState,
} from './with-entities-remote-scroll-pagination.model';
import { getWithEntitiesInfinitePaginationKeys } from './with-entities-remote-scroll-pagination.util';

/**
 * Generates necessary state, computed and methods for remote infinite scroll pagination of entities in the store. The
 * different between this and withEntitiesRemotePagination this will can only got to next and previous page, and the cache
 * of entities keeps growing, ideally for implementing infinite scroll style ui.
 * When the page changes, it will try to load the current page from cache if it's not present,
 * it will call set[collection]Loading(), and you should either create an effect that listens to is[Collection]Loading
 * and call the api with the [collection]PagedRequest params and use set[Collection]LoadResult to set the result
 * and changing the status errors manually
 * or use withEntitiesLoadingCall to call the api with the [collection]PagedRequest params which handles setting
 * the result and errors automatically. Requires withEntities and withCallStatus to be used.
 * Requires withEntities and withCallStatus to be present in the store.
 * @param config
 * @param config.bufferSize - The number of entities loaded each time
 * @param config.entity - The entity type
 * @param config.collection - The name of the collection
 *
 * @example
 * const entity = type<Product>();
 * const collection = 'products';
 * export const store = signalStore(
 *   { providedIn: 'root' },
 *   // required withEntities and withCallStatus
 *   withEntities({ entity, collection }),
 *   withCallStatus({ prop: collection, initialValue: 'loading' }),
 *
 *   withEntitiesRemoteScrollPagination({
 *     entity,
 *     collection,
 *     bufferSize: 5,
 *     pagesToCache: 2,
 *   })
 *   // after you can use withEntitiesLoadingCall to connect the filter to
 *   // the api call, or do it manually as shown after
 *    withEntitiesLoadingCall({
 *     collection,
 *     fetchEntities: ({ productsPagedRequest }) => {
 *       return inject(ProductService)
 *         .getProducts({
 *           take: productsPagedRequest().size,
 *           skip: productsPagedRequest().startIndex,
 *         }).pipe(
 *           map((d) => ({
 *             entities: d.resultList,
 *             total: d.total,
 *           })),
 *         )
 *     },
 *   }),
 * // withEntitiesLoadingCall is the same as doing the following:
 * // withHooks(({ productsLoading, setProductsError, setProductsLoadResult, ...state }) => ({
 * //   onInit: async () => {
 * //     effect(() => {
 * //       if (isProductsLoading()) {
 * //         inject(ProductService)
 * //             .getProducts({
 * //                take: productsPagedRequest().size,
 * //                skip: productsPagedRequest().startIndex,
 * //              })
 * //           .pipe(
 * //             takeUntilDestroyed(),
 * //             tap((res) =>
 * //               patchState(
 * //                 state,
 * //                 setProductsLoadResult(res.resultList, res.total),
 * //               ),
 * //             ),
 * //             catchError((error) => {
 * //               setProductsError(error);
 * //               return EMPTY;
 * //             }),
 * //           )
 * //           .subscribe();
 * //       }
 * //     });
 * //   },
 *  })),
 *
 *  // in your component add
 *  store = inject(ProductsRemoteStore);
 *  dataSource = getInfiniteScrollDataSource(store, { collecrion: 'products' }) // pass this to your cdkVirtualFor see examples section
 *   // generates the following signals
 *   store.productsPagination // { currentPage: number, requestPage: number, bufferSize: 5, total: number, pagesToCache: number, cache: { start: number, end: number } } used internally
 *  // generates the following computed signals
 *  store.productsPageInfo // {  pageIndex: number, total: number, bufferSize: 5, pagesCount: number, hasPrevious: boolean, hasNext: boolean, isLoading: boolean }
 *  store.productsPagedRequest // { startIndex: number, size: number, page: number }
 *  // generates the following methods
 *  store.loadProductsNextPage() // loads next page
 *  store.loadProductsPreviousPage() // loads previous page
 *  store.loadProductsFirstPage() // loads first page
 *  store.setProductsLoadResult(entities: Product[], total: number) // appends the entities to the cache of entities and total
 */
export function withEntitiesRemoteScrollPagination<
  Entity extends { id: string | number },
>(config: {
  bufferSize?: number;
  entity?: Entity;
}): SignalStoreFeature<
  {
    state: EntityState<Entity>;
    signals: EntitySignals<Entity> & CallStatusComputed;
    methods: CallStatusMethods;
  },
  {
    state: EntitiesScrollPaginationState;
    signals: EntitiesScrollPaginationComputed;
    methods: EntitiesScrollPaginationMethods<Entity>;
  }
>;

/**
 * Generates necessary state, computed and methods for remote infinite scroll pagination of entities in the store. The
 * different between this and withEntitiesRemotePagination this will can only got to next and previous page, and the cache
 * of entities keeps growing, ideally for implementing infinite scroll style ui.
 * When the page changes, it will try to load the current page from cache if it's not present,
 * it will call set[collection]Loading(), and you should either create an effect that listens to is[Collection]Loading
 * and call the api with the [collection]PagedRequest params and use set[Collection]LoadResult to set the result
 * and changing the status errors manually
 * or use withEntitiesLoadingCall to call the api with the [collection]PagedRequest params which handles setting
 * the result and errors automatically. Requires withEntities and withCallStatus to be used.
 * Requires withEntities and withCallStatus to be present in the store.
 * @param config
 * @param config.bufferSize - The number of entities to show per page
 * @param config.entity - The entity type
 * @param config.collection - The name of the collection
 *
 * @example
 * const entity = type<Product>();
 * const collection = 'products';
 * export const store = signalStore(
 *   { providedIn: 'root' },
 *   // required withEntities and withCallStatus
 *   withEntities({ entity, collection }),
 *   withCallStatus({ prop: collection, initialValue: 'loading' }),
 *
 *   withEntitiesRemoteScrollPagination({
 *     entity,
 *     collection,
 *     bufferSize: 5,
 *     pagesToCache: 2,
 *   })
 *   // after you can use withEntitiesLoadingCall to connect the filter to
 *   // the api call, or do it manually as shown after
 *    withEntitiesLoadingCall({
 *     collection,
 *     fetchEntities: ({ productsPagedRequest }) => {
 *       return inject(ProductService)
 *         .getProducts({
 *           take: productsPagedRequest().size,
 *           skip: productsPagedRequest().startIndex,
 *         }).pipe(
 *           map((d) => ({
 *             entities: d.resultList,
 *             total: d.total,
 *           })),
 *         )
 *     },
 *   }),
 * // withEntitiesLoadingCall is the same as doing the following:
 * // withHooks(({ productsLoading, setProductsError, setProductsLoadResult, ...state }) => ({
 * //   onInit: async () => {
 * //     effect(() => {
 * //       if (isProductsLoading()) {
 * //         inject(ProductService)
 * //             .getProducts({
 * //                take: productsPagedRequest().size,
 * //                skip: productsPagedRequest().startIndex,
 * //              })
 * //           .pipe(
 * //             takeUntilDestroyed(),
 * //             tap((res) =>
 * //               patchState(
 * //                 state,
 * //                 setProductsLoadResult(res.resultList, res.total),
 * //               ),
 * //             ),
 * //             catchError((error) => {
 * //               setProductsError(error);
 * //               return EMPTY;
 * //             }),
 * //           )
 * //           .subscribe();
 * //       }
 * //     });
 * //   },
 *  })),
 *
 *  // in your component add
 *  store = inject(ProductsRemoteStore);
 *  dataSource = getInfiniteScrollDataSource(store, { collecrion: 'products' }) // pass this to your cdkVirtualFor see examples section
 *   // generates the following signals
 *   store.productsPagination // { currentPage: number, requestPage: number, bufferSize: 5, total: number, pagesToCache: number, cache: { start: number, end: number } } used internally
 *  // generates the following computed signals
 *  store.productsPageInfo // {  pageIndex: number, total: number, bufferSize: 5, pagesCount: number, hasPrevious: boolean, hasNext: boolean, isLoading: boolean }
 *  store.productsPagedRequest // { startIndex: number, size: number, page: number }
 *  // generates the following methods
 *  store.loadProductsNextPage() // loads next page
 *  store.loadProductsPreviousPage() // loads previous page
 *  store.loadProductsFirstPage() // loads first page
 *  store.setProductsLoadResult(entities: Product[], total: number) // appends the entities to the cache of entities and total
 */
export function withEntitiesRemoteScrollPagination<
  Entity extends { id: string | number },
  Collection extends string,
>(config: {
  bufferSize?: number;
  entity?: Entity;
  collection?: Collection;
}): SignalStoreFeature<
  {
    state: NamedEntityState<Entity, any>; // if put Collection the some props get lost and can only be access ['prop'] weird bug
    signals: NamedEntitySignals<Entity, Collection> &
      NamedCallStatusComputed<Collection>;
    methods: NamedCallStatusMethods<Collection>;
  },
  {
    state: NamedEntitiesScrollPaginationState<Collection>;
    signals: NamedEntitiesScrollPaginationComputed<Entity, Collection>;
    methods: NamedEntitiesScrollPaginationMethods<Entity, Collection>;
  }
>;

export function withEntitiesRemoteScrollPagination<
  Entity extends { id: string | number },
  Collection extends string,
>({
  bufferSize = 10,
  pagesToCache = 3,
  ...config
}: {
  bufferSize?: number;
  pagesToCache?: number;
  entity?: Entity;
  collection?: Collection;
} = {}): SignalStoreFeature<any, any> {
  const { loadingKey, setLoadingKey } = getWithCallStatusKeys({
    prop: config.collection,
  });
  const { clearEntitiesCacheKey, entitiesKey } = getWithEntitiesKeys(config);

  const {
    loadMoreEntitiesKey,
    setEntitiesPagedResultKey,
    entitiesRequestKey,
    entitiesScrollCacheKey,
  } = getWithEntitiesInfinitePaginationKeys(config);

  return signalStoreFeature(
    withState({
      [entitiesScrollCacheKey]: {
        total: undefined,
        bufferSize,
        hasMore: true,
      },
    }),
    withComputed((state: Record<string, Signal<unknown>>) => {
      const entities = state[entitiesKey] as Signal<Entity[]>;
      const entitiesScrollCache = state[
        entitiesScrollCacheKey
      ] as Signal<ScrollPaginationState>;

      const entitiesPagedRequest = computed(() => ({
        startIndex: entities().length,
        size: entitiesScrollCache().bufferSize,
      }));
      return {
        [entitiesRequestKey]: entitiesPagedRequest,
      };
    }),
    withMethods((state: Record<string, Signal<unknown>>) => {
      const entitiesScrollCache = state[
        entitiesScrollCacheKey
      ] as Signal<ScrollPaginationState>;

      const isLoading = state[loadingKey] as Signal<boolean>;
      const $loading = toObservable(isLoading);
      const setLoading = state[setLoadingKey] as () => void;
      // TODO refactor some of this code is repeated in remote entitiesScrollCache
      return {
        [clearEntitiesCacheKey]: combineFunctions(
          state[clearEntitiesCacheKey],
          () => {
            patchState(
              state as StateSignal<object>,
              config.collection
                ? setAllEntities([], {
                    collection: config.collection,
                  })
                : setAllEntities([]),
              {
                [entitiesScrollCacheKey]: {
                  ...entitiesScrollCache(),
                  total: 0,
                  hasMore: true,
                },
              },
            );
          },
        ),
        [setEntitiesPagedResultKey]: ({
          entities,
          total,
        }: {
          entities: Entity[];
          total: number;
        }) => {
          const entitiesOld = state[entitiesKey] as Signal<Entity[]>;
          patchState(
            state as StateSignal<object>,
            config.collection
              ? addEntities(entities, {
                  collection: config.collection,
                })
              : addEntities(entities),
            {
              [entitiesScrollCacheKey]: {
                ...entitiesScrollCache(),
                total,
                hasMore: entitiesOld().length + entities.length < total,
              },
            },
          );
        },
        [loadMoreEntitiesKey]: rxMethod<void>(
          pipe(
            exhaustMap(() =>
              $loading.pipe(
                first((loading) => !loading),
                // the previous exhaustMap to not loading ensures the function
                // can not be called multiple time before results are loaded, which could corrupt the cache
                tap(() => {
                  if (entitiesScrollCache().hasMore) setLoading();
                }),
              ),
            ),
          ),
        ),
      };
    }),
  );
}
