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
import {
  EntityIdKey,
  EntitySignals,
  NamedEntitySignals,
} from '@ngrx/signals/entities/src/models';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import type { StateSignal } from '@ngrx/signals/src/state-signal';
import { elementAt, exhaustMap, first, pipe, tap } from 'rxjs';

import { getWithEntitiesKeys } from '../util';
import {
  CallStatusComputed,
  CallStatusMethods,
  NamedCallStatusComputed,
  NamedCallStatusMethods,
} from '../with-call-status/with-call-status.model';
import { getWithCallStatusKeys } from '../with-call-status/with-call-status.util';
import { getWithEntitiesFilterEvents } from '../with-entities-filter/with-entities-filter.util';
import { getWithEntitiesRemoteSortEvents } from '../with-entities-sort/with-entities-remote-sort.util';
import {
  broadcast,
  onEvent,
  withEventHandler,
} from '../with-event-handler/with-event-handler';
import {
  EntitiesScrollPaginationComputed,
  EntitiesScrollPaginationMethods,
  EntitiesScrollPaginationState,
  NamedEntitiesScrollPaginationComputed,
  NamedEntitiesScrollPaginationMethods,
  NamedEntitiesScrollPaginationState,
  ScrollPaginationState,
} from './with-entities-remote-scroll-pagination.model';
import {
  getWithEntitiesInfinitePaginationKeys,
  getWithEntitiesScrollPaginationEvents,
} from './with-entities-remote-scroll-pagination.util';

/**
 * Generates necessary state, computed and methods for remote infinite scroll pagination of entities in the store.
 * This is ideal for implementing infinite scroll where the entities cache keeps growing, or for a paginated list that only
 * allows going to the next and previous page because you dont know the total number of entities
 * probably because the data is top big and partitioned in multiple nodes.
 *
 * When the page changes, it will try to load the current page from cache if it's not present,
 * it will call set[collection]Loading(), and you should either create an effect that listens to is[Collection]Loading
 * and call the api with the [collection]PagedRequest params and use set[Collection]Result to set the result
 * and changing the status errors manually
 * or use withEntitiesLoadingCall to call the api with the [collection]PagedRequest params which handles setting
 * the result and errors automatically. Requires withEntities and withCallStatus to be used.
 *
 * The generated set[Collection]Result method will append the entities to the cache of entities,
 * it requires either just set of requested entities set[Collection]Result({ entities }) in which case it will assume there is no more result if you set less entities
 * than the requested buffer size, or you can provide an extra param to the entities, total set[Collection]Result({ entities, total }) so it calculates if there is more
 * or a hasMore param set[Collection]Result({entities, hasMore}) that you can set to false to indicate the end of the entities.
 *
 * Requires withEntities and withCallStatus to be present in the store.
 * @param config
 * @param config.pageSize - The number of entities to show per page
 * @param config.pagesToCache - The number of pages to cache
 * @param config.entity - The entity type
 * @param config.collection - The name of the collection
 * @param config.idKey - The key to use as the id for the entity
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
 *     pageSize: 5,
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
 * // withHooks(({ productsLoading, setProductsError, setProductsPagedResult, ...state }) => ({
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
 * //                 // total is not required, you can use hasMore or none see docs
 * //                 setProductsPagedResult({ entities: res.resultList, total: res.total } )
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
 *  dataSource = getInfiniteScrollDataSource(store, { collection: 'products' }) // pass this to your cdkVirtualFor see examples section
 *   // generates the following signals
 *   store.productsPagination // { currentPage: number,  pageSize: number,  pagesToCache: number, hasMore: boolean } used internally
 *  // generates the following computed signals
 *  store.productsCurrentPage // {  entities: Entity[], pageIndex: number, total: number, pageSize: number,  hasPrevious: boolean, hasNext: boolean, isLoading: boolean }
 *  store.productsPagedRequest // { startIndex: number, size: number }
 *  // generates the following methods
 *  store.loadProductsNextPage() // loads next page
 *  store.loadProductsPreviousPage() // loads previous page
 *  store.loadProductsFirstPage() // loads first page
 *  store.loadMoreProducts() // loads more entities (used for infinite scroll datasource)
 *  store.setProductsPagedResult(entities: Product[], total: number) // appends the entities to the cache of entities and total
 */
export function withEntitiesRemoteScrollPagination<
  Entity,
  Collection extends string,
>(config: {
  entity: Entity;
  collection: Collection;
  pageSize?: number;
  pagesToCache?: number;
  idKey?: EntityIdKey<Entity>;
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
/**
 * Generates necessary state, computed and methods for remote infinite scroll pagination of entities in the store.
 * This is ideal for implementing infinite scroll where the entities cache keeps growing, or for a paginated list that only
 * allows going to the next and previous page because you dont know the total number of entities
 * probably because the data is top big and partitioned in multiple nodes.
 *
 * When the page changes, it will try to load the current page from cache if it's not present,
 * it will call set[collection]Loading(), and you should either create an effect that listens to is[Collection]Loading
 * and call the api with the [collection]PagedRequest params and use set[Collection]Result to set the result
 * and changing the status errors manually
 * or use withEntitiesLoadingCall to call the api with the [collection]PagedRequest params which handles setting
 * the result and errors automatically. Requires withEntities and withCallStatus to be used.
 *
 * The generated set[Collection]Result method will append the entities to the cache of entities,
 * it requires either just set of requested entities set[Collection]Result({ entities }) in which case it will assume there is no more result if you set less entities
 * than the requested buffer size, or you can provide an extra param to the entities, total set[Collection]Result({ entities, total }) so it calculates if there is more
 * or a hasMore param set[Collection]Result({entities, hasMore}) that you can set to false to indicate the end of the entities.
 *
 * Requires withEntities and withCallStatus to be present in the store.
 * @param config
 * @param config.pageSize - The number of entities to show per page
 * @param config.pagesToCache - The number of pages to cache
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
 *     pageSize: 5,
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
 * // withHooks(({ productsLoading, setProductsError, setProductsPagedResult, ...state }) => ({
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
 * //                 // total is not required, you can use hasMore or none see docs
 * //                 setProductsPagedResult({ entities: res.resultList, total: res.total } )
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
 *  dataSource = getInfiniteScrollDataSource(store, { collection: 'products' }) // pass this to your cdkVirtualFor see examples section
 *   // generates the following signals
 *   store.productsPagination // { currentPage: number,  pageSize: number,  pagesToCache: number, hasMore: boolean } used internally
 *  // generates the following computed signals
 *  store.productsCurrentPage // {  entities: Entity[], pageIndex: number, total: number, pageSize: number,  hasPrevious: boolean, hasNext: boolean, isLoading: boolean }
 *  store.productsPagedRequest // { startIndex: number, size: number }
 *  // generates the following methods
 *  store.loadProductsNextPage() // loads next page
 *  store.loadProductsPreviousPage() // loads previous page
 *  store.loadProductsFirstPage() // loads first page
 *  store.loadMoreProducts() // loads more entities (used for infinite scroll datasource)
 *  store.setProductsPagedResult(entities: Product[], total: number) // appends the entities to the cache of entities and total
 */
export function withEntitiesRemoteScrollPagination<Entity>(config: {
  entity: Entity;
  pageSize?: number;
  pagesToCache?: number;
  idKey?: EntityIdKey<Entity>;
}): SignalStoreFeature<
  {
    state: EntityState<Entity>;
    signals: EntitySignals<Entity> & CallStatusComputed;
    methods: CallStatusMethods;
  },
  {
    state: EntitiesScrollPaginationState;
    signals: EntitiesScrollPaginationComputed<Entity>;
    methods: EntitiesScrollPaginationMethods<Entity>;
  }
>;

export function withEntitiesRemoteScrollPagination<
  Entity,
  Collection extends string,
>({
  pageSize = 10,
  pagesToCache = 3,
  ...config
}: {
  entity: Entity;
  collection?: Collection;
  pageSize?: number;
  pagesToCache?: number;
  idKey?: EntityIdKey<Entity>;
}): SignalStoreFeature<any, any> {
  const { loadingKey, setLoadingKey } = getWithCallStatusKeys({
    prop: config.collection,
  });
  const { entitiesKey } = getWithEntitiesKeys(config);

  const {
    loadMoreEntitiesKey,
    setEntitiesPagedResultKey,
    entitiesPagedRequestKey,
    paginationKey,
    loadEntitiesNextPageKey,
    loadEntitiesPreviousPageKey,
    loadEntitiesFirstPageKey,
    entitiesCurrentPageKey,
  } = getWithEntitiesInfinitePaginationKeys(config);

  const { loadingMoreEntities, entitiesResultsLoaded } =
    getWithEntitiesScrollPaginationEvents(config);
  const { entitiesFilterChanged } = getWithEntitiesFilterEvents(config);
  const { entitiesRemoteSortChanged } = getWithEntitiesRemoteSortEvents(config);

  return signalStoreFeature(
    withState({
      [paginationKey]: {
        pageSize,
        pagesToCache,
        currentPage: 0,
        requestPage: 0,
        hasMore: true,
      },
    }),
    withComputed((state: Record<string, Signal<unknown>>) => {
      const entities = state[entitiesKey] as Signal<Entity[]>;
      const loading = state[loadingKey] as Signal<boolean>;
      const pagination = state[paginationKey] as Signal<ScrollPaginationState>;

      const entitiesPagedRequest = computed(() => ({
        startIndex: entities().length,
        size: pagination().pageSize * pagination().pagesToCache,
      }));

      const entitiesCurrentPageList = computed(() => {
        const page = pagination().currentPage;
        const startIndex = page * pagination().pageSize;
        let endIndex = startIndex + pagination().pageSize;
        endIndex = endIndex < entities().length ? endIndex : entities().length;
        return entities().slice(startIndex, endIndex);
      });

      const entitiesCurrentPage = computed(() => {
        return {
          entities: entitiesCurrentPageList(),
          pageIndex: pagination().currentPage,
          pageSize: pagination().pageSize,
          hasPrevious: pagination().currentPage - 1 >= 0,
          hasNext:
            isEntitiesInCache({
              page: pagination().currentPage + 1,
              pagination: pagination(),
              cacheTotal: entities().length,
            }) || pagination().hasMore,
          isLoading:
            loading() && pagination().requestPage === pagination().currentPage,
        };
      });

      return {
        [entitiesCurrentPageKey]: entitiesCurrentPage,
        [entitiesPagedRequestKey]: entitiesPagedRequest,
      };
    }),
    withEventHandler((state) => [
      onEvent(entitiesFilterChanged, entitiesRemoteSortChanged, () => {
        clearEntitiesCache(state, config, paginationKey);
      }),
    ]),
    withMethods((state: Record<string, Signal<unknown>>) => {
      const pagination = state[paginationKey] as Signal<ScrollPaginationState>;
      const isLoading = state[loadingKey] as Signal<boolean>;
      const $loading = toObservable(isLoading);
      const setLoading = state[setLoadingKey] as () => void;
      const entities = state[entitiesKey] as Signal<Entity[]>;

      return {
        [loadEntitiesFirstPageKey]: () => {
          patchState(state as StateSignal<object>, {
            [paginationKey]: {
              ...pagination(),
              currentPage: 0,
              requestPage: 0,
            },
          });
        },
        [loadEntitiesPreviousPageKey]: () => {
          const currentPage = pagination().currentPage;
          if (currentPage > 0) {
            patchState(state as StateSignal<object>, {
              [paginationKey]: {
                ...pagination(),
                currentPage: currentPage - 1,
                requestPage: currentPage - 1,
              },
            });
          }
        },
        [loadEntitiesNextPageKey]: rxMethod<void>(
          pipe(
            exhaustMap(() =>
              $loading.pipe(
                first((loading) => !loading),
                // the previous exhaustMap to not loading ensures the function
                // can not be called multiple time before results are loaded, which could corrupt the cache
                tap(() => {
                  const currentPage = pagination().currentPage;
                  const nextPage = currentPage + 1;
                  if (
                    isEntitiesInCache({
                      page: nextPage,
                      pagination: pagination(),
                      cacheTotal: entities().length,
                    })
                  ) {
                    patchState(state as StateSignal<object>, {
                      [paginationKey]: {
                        ...pagination(),
                        currentPage: nextPage,
                      },
                    });

                    if (
                      !isEntitiesInCache({
                        page: nextPage + 1,
                        pagination: pagination(),
                        cacheTotal: entities().length,
                      })
                    ) {
                      // preload next page
                      patchState(state as StateSignal<object>, {
                        [paginationKey]: {
                          ...pagination(),
                          currentPage: nextPage,
                          requestPage: nextPage + 1,
                        },
                      });
                      setLoading();
                      broadcast(state, loadingMoreEntities());
                    }
                  } else if (pagination().hasMore) {
                    patchState(state as StateSignal<object>, {
                      [paginationKey]: {
                        ...pagination(),
                        currentPage: nextPage,
                      },
                    });
                    setLoading();
                    broadcast(state, loadingMoreEntities());
                  }
                }),
              ),
            ),
          ),
        ),
        [setEntitiesPagedResultKey]: (
          options:
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
              },
        ) => {
          const entities = options.entities;
          const entitiesOld = state[entitiesKey] as Signal<Entity[]>;
          patchState(
            state as StateSignal<object>,
            config.collection
              ? addEntities(entities, {
                  collection: config.collection,
                  idKey: config.idKey ?? ('id' as EntityIdKey<Entity>),
                })
              : addEntities(entities, {
                  idKey: config.idKey ?? ('id' as EntityIdKey<Entity>),
                }),
            {
              [paginationKey]: {
                ...pagination(),
                hasMore:
                  'hasMore' in options
                    ? options.hasMore
                    : 'total' in options
                      ? entitiesOld().length + entities.length < options.total
                      : entities.length ==
                        pagination().pageSize * pagination().pagesToCache,
              },
            },
          );
          broadcast(state, entitiesResultsLoaded());
        },
        [loadMoreEntitiesKey]: rxMethod<void>(
          pipe(
            exhaustMap(() =>
              $loading.pipe(
                first((loading) => !loading),
                // the previous exhaustMap to not loading ensures the function
                // can not be called multiple time before results are loaded, which could corrupt the cache
                tap(() => {
                  if (pagination().hasMore) {
                    setLoading();
                    broadcast(state, loadingMoreEntities());
                  }
                }),
              ),
            ),
          ),
        ),
      };
    }),
  );
}

function clearEntitiesCache(
  state: Record<string, Signal<unknown>>,
  config: { collection?: string },
  paginationKey: string,
) {
  const pagination = state[paginationKey] as Signal<ScrollPaginationState>;
  patchState(
    state as StateSignal<object>,
    config.collection
      ? setAllEntities([], {
          collection: config.collection,
        })
      : setAllEntities([]),
    {
      [paginationKey]: {
        ...pagination(),
        total: 0,
        hasMore: true,
      },
    },
  );
}

function isEntitiesInCache(options: {
  page: number;
  pagination: EntitiesScrollPaginationState['pagination'];
  cacheTotal: number;
}) {
  const pagination = options.pagination;
  const startIndex = options.page * pagination.pageSize;
  const endIndex = startIndex + pagination.pageSize - 1;
  return (
    endIndex <= options.cacheTotal ||
    (!pagination.hasMore && startIndex <= options.cacheTotal) // check for last page
  );
}
