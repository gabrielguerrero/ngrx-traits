import { computed, Signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import {
  patchState,
  signalStoreFeature,
  SignalStoreFeature,
  withComputed,
  withMethods,
  withState,
  WritableStateSource,
} from '@ngrx/signals';
import {
  EntityComputed,
  EntityState,
  NamedEntityComputed,
  NamedEntityState,
  SelectEntityId,
  setAllEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { distinctUntilChanged, exhaustMap, first, pipe, tap } from 'rxjs';

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
  EntitiesPaginationRemoteComputed,
  EntitiesPaginationRemoteMethods,
  EntitiesPaginationRemoteState,
  NamedEntitiesPaginationRemoteComputed,
  NamedEntitiesPaginationRemoteMethods,
  NamedEntitiesPaginationRemoteState,
  PaginationState,
} from './with-entities-remote-pagination.model';
import {
  getWithEntitiesRemotePaginationEvents,
  getWithEntitiesRemotePaginationKeys,
} from './with-entities-remote-pagination.util';

/**
 * Generates necessary state, computed and methods for remote pagination of entities in the store.
 * Call load[collection]Page to change the page, it will try to load the new page from cache if it's not present,
 * it will call set[collection]Loading(), and you should either create an effect that listens to [collection]Loading
 * and call the api with the [collection]PagedRequest params and use set[Collection]Result to set the result
 * and changing the status errors manually,
 * or use withEntitiesLoadingCall to call the api with the [collection]PagedRequest params which handles setting
 * the result and errors automatically.
 *
 * In case you dont want load[collection]Page to call set[collection]Loading() (which triggers a fetchEntities), you can pass skipLoadingCall: true to load[collection]Page.
 * Useful in cases where you want to further change the state before manually calling set[collection]Loading() to trigger a fetch of entities.
 *
 * This will keep at least the provided (pagesToCache) pages in memory, so previous pages could be removed from the cache.
 * If you need to keep all previous pages in memory, use withEntitiesRemoteScrollPagination instead.
 *
 * Requires withEntities and withCallStatus to be present in the store.
 * @param config
 * @param config.pageSize - The number of entities to show per page
 * @param config.currentPage - The current page to show
 * @param config.pagesToCache - The number of pages to cache
 * @param config.entity - The entity type
 * @param config.collection - The name of the collection
 * @param config.selectId - The function to use to select the id of the entity
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
 *   withEntitiesRemotePagination({
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
 * //               patchState(
 * //                 state,
 * //                 setProductsPagedResult({ entities: res.resultList, total: res.total } ),
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
 *   // generates the following signals
 *   store.productsPagination // { currentPage: number, requestPage: number, pageSize: 5, total: number, pagesToCache: number, cache: { start: number, end: number } } used internally
 *  // generates the following computed signals
 *  store.productsCurrentPage // { entities: Product[], pageIndex: number, total: number, pageSize: 5, pagesCount: number, hasPrevious: boolean, hasNext: boolean, isLoading: boolean }
 *  store.productsPagedRequest // { startIndex: number, size: number, page: number }
 *  // generates the following methods
 *  store.loadProductsPage({ pageIndex: number, forceLoad?: boolean, skipLoadingCall?:boolean }) // loads the page and sets the requestPage to the pageIndex
 *  store.setProductsPagedResult(entities: Product[], total: number) // appends the entities to the cache of entities and total
 */
export function withEntitiesRemotePagination<
  Entity,
  Collection extends string,
>(config: {
  pageSize?: number;
  currentPage?: number;
  pagesToCache?: number;
  entity: Entity;
  collection: Collection;
  selectId?: SelectEntityId<Entity>;
}): SignalStoreFeature<
  {
    state: NamedEntityState<Entity, Collection>;
    computed: NamedEntityComputed<Entity, Collection> &
      NamedCallStatusComputed<Collection>;
    methods: NamedCallStatusMethods<Collection>;
  },
  {
    state: NamedEntitiesPaginationRemoteState<Collection>;
    computed: NamedEntitiesPaginationRemoteComputed<Entity, Collection>;
    methods: NamedEntitiesPaginationRemoteMethods<Entity, Collection>;
  }
>;

/**
 * Generates necessary state, computed and methods for remote pagination of entities in the store.
 * Call load[collection]Page to change the page, it will try to load the new page from cache if it's not present,
 * it will call set[collection]Loading(), and you should either create an effect that listens to [collection]Loading
 * and call the api with the [collection]PagedRequest params and use set[Collection]Result to set the result
 * and changing the status errors manually,
 * or use withEntitiesLoadingCall to call the api with the [collection]PagedRequest params which handles setting
 * the result and errors automatically.
 *
 * In case you dont want load[collection]Page to call set[collection]Loading() (which triggers a fetchEntities), you can pass skipLoadingCall: true to load[collection]Page.
 * Useful in cases where you want to further change the state before manually calling set[collection]Loading() to trigger a fetch of entities.
 *
 * This will keep at least the provided (pagesToCache) pages in memory, so previous pages could be removed from the cache.
 * If you need to keep all previous pages in memory, use withEntitiesRemoteScrollPagination instead.
 *
 * Requires withEntities and withCallStatus to be present in the store.
 * @param config
 * @param config.pageSize - The number of entities to show per page
 * @param config.currentPage - The current page to show
 * @param config.pagesToCache - The number of pages to cache
 * @param config.entity - The entity type
 * @param config.collection - The name of the collection
 * @param config.selectId - The function to use to select the id of the entity
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
 *   withEntitiesRemotePagination({
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
 * //               patchState(
 * //                 state,
 * //                 setProductsPagedResult({ entities: res.resultList, total: res.total } ),
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
 *   // generates the following signals
 *   store.productsPagination // { currentPage: number, requestPage: number, pageSize: 5, total: number, pagesToCache: number, cache: { start: number, end: number } } used internally
 *  // generates the following computed signals
 *  store.productsCurrentPage // { entities: Product[], pageIndex: number, total: number, pageSize: 5, pagesCount: number, hasPrevious: boolean, hasNext: boolean, isLoading: boolean }
 *  store.productsPagedRequest // { startIndex: number, size: number, page: number }
 *  // generates the following methods
 *  store.loadProductsPage({ pageIndex: number, forceLoad?: boolean, skipLoadingCall?:boolean }) // loads the page and sets the requestPage to the pageIndex
 *  store.setProductsPagedResult(entities: Product[], total: number) // appends the entities to the cache of entities and total
 */
export function withEntitiesRemotePagination<Entity>(config: {
  pageSize?: number;
  currentPage?: number;
  pagesToCache?: number;
  entity: Entity;
  selectId?: SelectEntityId<Entity>;
}): SignalStoreFeature<
  {
    state: EntityState<Entity>;
    computed: EntityComputed<Entity> & CallStatusComputed;
    methods: CallStatusMethods;
  },
  {
    state: EntitiesPaginationRemoteState;
    computed: EntitiesPaginationRemoteComputed<Entity>;
    methods: EntitiesPaginationRemoteMethods<Entity>;
  }
>;

export function withEntitiesRemotePagination<
  Entity,
  Collection extends string,
>({
  pageSize = 10,
  currentPage = 0,
  pagesToCache = 3,
  ...config
}: {
  pageSize?: number;
  currentPage?: number;
  pagesToCache?: number;
  entity: Entity;
  collection?: Collection;
  selectId?: SelectEntityId<Entity>;
}): SignalStoreFeature<any, any> {
  const { loadingKey, setLoadingKey } = getWithCallStatusKeys({
    prop: config.collection,
  });
  const { entitiesKey } = getWithEntitiesKeys(config);

  const {
    loadEntitiesPageKey,
    entitiesCurrentPageKey,
    paginationKey,
    entitiesPagedRequestKey,
    setEntitiesPagedResultKey,
  } = getWithEntitiesRemotePaginationKeys(config);

  const { entitiesFilterChanged } = getWithEntitiesFilterEvents(config);
  const { entitiesRemotePageChanged, entitiesPagedResultsLoaded } =
    getWithEntitiesRemotePaginationEvents(config);
  const { entitiesRemoteSortChanged } = getWithEntitiesRemoteSortEvents(config);

  return signalStoreFeature(
    withState({
      [paginationKey]: {
        pageSize,
        currentPage,
        requestPage: currentPage,
        pagesToCache,
        total: undefined,
        cache: {
          start: 0,
          end: 0,
        },
      },
    }),
    withComputed((state: Record<string, Signal<unknown>>) => {
      const entities = state[entitiesKey] as Signal<Entity[]>;
      const loading = state[loadingKey] as Signal<boolean>;
      const pagination = state[paginationKey] as Signal<PaginationState>;
      const entitiesCurrentPageList = computed(() => {
        const page = pagination().currentPage;
        const startIndex =
          page * pagination().pageSize - pagination().cache.start;
        let endIndex = startIndex + pagination().pageSize;
        endIndex =
          endIndex < pagination().cache.end
            ? endIndex
            : pagination().cache.end + 1;

        return entities().slice(startIndex, endIndex);
      });

      const entitiesCurrentPage = computed(() => {
        const pagesCount =
          pagination().total && pagination().total! > 0
            ? Math.ceil(pagination().total! / pagination().pageSize)
            : undefined;
        return {
          entities: entitiesCurrentPageList(),
          pageIndex: pagination().currentPage,
          total: pagination().total,
          pageSize: pagination().pageSize,
          pagesCount,
          hasPrevious: pagination().currentPage - 1 >= 0,
          hasNext:
            pagesCount && pagination().total && pagination().total! > 0
              ? pagination().currentPage + 1 < pagesCount
              : true,
          isLoading:
            loading() && pagination().requestPage === pagination().currentPage,
        };
      });
      const entitiesPagedRequest = computed(() => ({
        startIndex: pagination().pageSize * pagination().requestPage,
        size: pagination().pageSize * pagination().pagesToCache,
        page: pagination().requestPage,
      }));
      return {
        [entitiesCurrentPageKey]: entitiesCurrentPage,
        [entitiesPagedRequestKey]: entitiesPagedRequest,
      };
    }),
    withEventHandler((state) => [
      onEvent(entitiesFilterChanged, entitiesRemoteSortChanged, () => {
        clearEntitiesCache(state, config);
      }),
    ]),
    withMethods((state: Record<string, Signal<unknown>>) => {
      const pagination = state[paginationKey] as Signal<PaginationState>;
      const entitiesList = state[entitiesKey] as Signal<Entity[]>;
      const isLoading = state[loadingKey] as Signal<boolean>;
      const $loading = toObservable(isLoading);
      const setLoading = state[setLoadingKey] as () => void;

      return {
        [setEntitiesPagedResultKey]: ({
          entities,
          total,
        }: {
          entities: Entity[];
          total: number;
        }) => {
          const isPreloadNextPagesReady =
            pagination().currentPage + 1 === pagination().requestPage;

          const newStart = pagination().currentPage * pagination().pageSize;
          const newEntities = isPreloadNextPagesReady
            ? [...entitiesList(), ...entities]
            : entities;
          patchState(
            state as WritableStateSource<object>,
            config.collection
              ? setAllEntities(newEntities, {
                  collection: config.collection,
                  selectId: config.selectId ?? ((entity) => (entity as any).id),
                })
              : setAllEntities(newEntities, {
                  selectId: config.selectId ?? ((entity) => (entity as any).id),
                }),
            {
              [paginationKey]: {
                ...pagination(),
                total,
                cache: {
                  ...pagination().cache,
                  start: isPreloadNextPagesReady
                    ? pagination().cache.start
                    : newStart,
                  end: isPreloadNextPagesReady
                    ? pagination().cache.end + entities.length - 1
                    : newStart + entities.length - 1,
                },
              },
            },
          );
          broadcast(state, entitiesPagedResultsLoaded());
        },
        [loadEntitiesPageKey]: rxMethod<{
          pageIndex: number;
          pageSize?: number;
          forceLoad?: boolean;
          skipLoadingCall?: boolean;
        }>(
          pipe(
            distinctUntilChanged(
              (previous, current) =>
                !current.forceLoad &&
                previous.pageIndex === current.pageIndex &&
                previous.pageSize === current.pageSize,
            ),
            exhaustMap(({ pageIndex, forceLoad, pageSize, skipLoadingCall }) =>
              $loading.pipe(
                first((loading) => !loading),
                // the previous exhaustMap to not loading ensures the function
                // can not be called multiple time before results are loaded, which could corrupt the cache
                tap(() => {
                  const size = pageSize ?? pagination().pageSize;
                  if (size !== pagination().pageSize)
                    clearEntitiesCache(state, config, size);
                  else
                    patchState(state as WritableStateSource<object>, {
                      [paginationKey]: {
                        ...pagination(),
                        currentPage: pageIndex,
                        pageSize: size,
                        requestPage: pageIndex,
                      },
                    });
                  if (
                    isEntitiesInCache({
                      page: pageIndex,
                      pagination: pagination(),
                    }) &&
                    !forceLoad
                  ) {
                    if (
                      !isEntitiesInCache({
                        page: pageIndex + 1,
                        pagination: pagination(),
                      })
                    ) {
                      // preload next page
                      patchState(state as WritableStateSource<object>, {
                        [paginationKey]: {
                          ...pagination(),
                          currentPage: pageIndex,
                          requestPage: pageIndex + 1,
                        },
                      });

                      if (!skipLoadingCall) setLoading();
                    }
                    broadcast(
                      state,
                      entitiesRemotePageChanged({
                        pageIndex: pagination().currentPage,
                        isPageInCache: true,
                      }),
                    );
                    return;
                  }
                  if (!skipLoadingCall) setLoading();
                  broadcast(
                    state,
                    entitiesRemotePageChanged({
                      pageIndex: pagination().currentPage,
                      isPageInCache: false,
                    }),
                  );
                }),
              ),
            ),
          ),
        ),
      };
    }),
  );
}

function clearEntitiesCache<Entity>(
  state: Record<string, Signal<unknown>>,
  config: { collection?: string },
  pageSize?: number,
) {
  const { paginationKey } = getWithEntitiesRemotePaginationKeys(config);
  const pagination = state[paginationKey] as Signal<PaginationState>;
  patchState(
    state as WritableStateSource<object>,
    config.collection
      ? setAllEntities([], {
          collection: config.collection,
        })
      : setAllEntities([]),
    {
      [paginationKey]: {
        ...pagination(),
        pageSize: pageSize ?? pagination().pageSize,
        total: 0,
        cache: { start: 0, end: 0 },
        currentPage: 0,
        requestPage: 0,
      },
    },
  );
}

function isEntitiesInCache(
  options:
    | {
        page: number;
        pagination: EntitiesPaginationRemoteState['entitiesPagination'];
      }
    | {
        start: number;
        end: number;
        pagination: EntitiesPaginationRemoteState['entitiesPagination'];
      },
) {
  const pagination = options.pagination;
  const startIndex =
    'start' in options ? options.start : options.page * pagination.pageSize;
  let endIndex =
    'end' in options ? options.end : startIndex + pagination.pageSize - 1;
  endIndex =
    pagination.total && endIndex > pagination.total
      ? pagination.total - 1
      : endIndex;
  return (
    startIndex >= pagination.cache.start && endIndex <= pagination.cache.end
  );
}
