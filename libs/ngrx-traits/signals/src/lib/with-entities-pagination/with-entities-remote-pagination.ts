import { computed, Signal } from '@angular/core';
import {
  patchState,
  signalStoreFeature,
  SignalStoreFeature,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  EntityState,
  NamedEntityState,
  setAllEntities,
} from '@ngrx/signals/entities';
import type {
  EntitySignals,
  NamedEntitySignals,
} from '@ngrx/signals/entities/src/models';
import type { StateSignal } from '@ngrx/signals/src/state-signal';

import { combineFunctions, getWithEntitiesKeys } from '../util';
import {
  CallStatusComputed,
  CallStatusMethods,
  NamedCallStatusComputed,
  NamedCallStatusMethods,
} from '../with-call-status/with-call-status.model';
import { getWithCallStatusKeys } from '../with-call-status/with-call-status.util';
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
  getWithEntitiesRemotePaginationKeys,
  loadEntitiesPageFactory,
} from './with-entities-remote-pagination.util';

/**
 * Generates necessary state, computed and methods for remote pagination of entities in the store.
 * When the page changes, it will try to load the current page from cache if it's not present,
 * it will call set[collection]Loading(), and you should either create an effect that listens to [collection]Loading
 * and call the api with the [collection]PagedRequest params and use set[Collection]LoadResult to set the result
 * and changing the status errors manually
 * or use withEntitiesLoadingCall to call the api with the [collection]PagedRequest params which handles setting
 * the result and errors automatically. Requires withEntities and withCallStatus to be present before this function.
 * @param config
 * @param config.pageSize - The number of entities to show per page
 * @param config.currentPage - The current page to show
 * @param config.pagesToCache - The number of pages to cache
 * @param config.entity - The entity type
 * @param config.collection - The name of the collection
 *
 * @example
 * export const ProductsRemoteStore = signalStore(
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
 *   // generates the following signals
 *   store.productsPagination // { currentPage: number, requestPage: number, pageSize: 5, total: number, pagesToCache: number, cache: { start: number, end: number } } used internally
 *  // generates the following computed signals
 *  store.productsCurrentPage // { entities: Product[], pageIndex: number, total: number, pageSize: 5, pagesCount: number, hasPrevious: boolean, hasNext: boolean, isLoading: boolean }
 *  store.productsPagedRequest // { startIndex: number, size: number, page: number }
 *  // generates the following methods
 *  store.loadProductsPage({ pageIndex: number, forceLoad?: boolean }) // loads the page and sets the requestPage to the pageIndex
 *  store.setProductsLoadResult(entities: Product[], total: number) // appends the entities to the cache of entities and total
 */
export function withEntitiesRemotePagination<
  Entity extends { id: string | number },
>(config: {
  pageSize?: number;
  currentPage?: number;
  pagesToCache?: number;
  entity?: Entity;
}): SignalStoreFeature<
  {
    state: EntityState<Entity>;
    signals: EntitySignals<Entity> & CallStatusComputed;
    methods: CallStatusMethods;
  },
  {
    state: EntitiesPaginationRemoteState;
    signals: EntitiesPaginationRemoteComputed<Entity>;
    methods: EntitiesPaginationRemoteMethods<Entity>;
  }
>;
/**
 * Generates necessary state, computed and methods for remote pagination of entities in the store.
 * When the page changes, it will try to load the current page from cache if it's not present,
 * it will call set[collection]Loading(), and you should either create an effect that listens to [collection]Loading
 * and call the api with the [collection]PagedRequest params and use set[Collection]LoadResult to set the result
 * and changing the status errors manually
 * or use withEntitiesLoadingCall to call the api with the [collection]PagedRequest params which handles setting
 * the result and errors automatically. Requires withEntities and withCallStatus to be present before this function.
 * @param config
 * @param config.pageSize - The number of entities to show per page
 * @param config.currentPage - The current page to show
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
 *   // generates the following signals
 *   store.productsPagination // { currentPage: number, requestPage: number, pageSize: 5, total: number, pagesToCache: number, cache: { start: number, end: number } } used internally
 *  // generates the following computed signals
 *  store.productsCurrentPage // { entities: Product[], pageIndex: number, total: number, pageSize: 5, pagesCount: number, hasPrevious: boolean, hasNext: boolean, isLoading: boolean }
 *  store.productsPagedRequest // { startIndex: number, size: number, page: number }
 *  // generates the following methods
 *  store.loadProductsPage({ pageIndex: number, forceLoad?: boolean }) // loads the page and sets the requestPage to the pageIndex
 *  store.setProductsLoadResult(entities: Product[], total: number) // appends the entities to the cache of entities and total
 */

export function withEntitiesRemotePagination<
  Entity extends { id: string | number },
  Collection extends string,
>(config: {
  pageSize?: number;
  currentPage?: number;
  pagesToCache?: number;
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
    state: NamedEntitiesPaginationRemoteState<Collection>;
    signals: NamedEntitiesPaginationRemoteComputed<Entity, Collection>;
    methods: NamedEntitiesPaginationRemoteMethods<Entity, Collection>;
  }
>;
/**
 * Generates necessary state, computed and methods for remote pagination of entities in the store.
 * When the page changes, it will try to load the current page from cache if it's not present,
 * it will call set[collection]Loading(), and you should either create an effect that listens to [collection]Loading
 * and call the api with the [collection]PagedRequest params and use set[Collection]LoadResult to set the result
 * and changing the status errors manually
 * or use withEntitiesLoadingCall to call the api with the [collection]PagedRequest params which handles setting
 * the result and errors automatically. Requires withEntities and withCallStatus to be used.
 * Requires withEntities and withCallStatus to be present in the store.
 * @param config
 * @param config.pageSize - The number of entities to show per page
 * @param config.currentPage - The current page to show
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
 *   // generates the following signals
 *   store.productsPagination // { currentPage: number, requestPage: number, pageSize: 5, total: number, pagesToCache: number, cache: { start: number, end: number } } used internally
 *  // generates the following computed signals
 *  store.productsCurrentPage // { entities: Product[], pageIndex: number, total: number, pageSize: 5, pagesCount: number, hasPrevious: boolean, hasNext: boolean, isLoading: boolean }
 *  store.productsPagedRequest // { startIndex: number, size: number, page: number }
 *  // generates the following methods
 *  store.loadProductsPage({ pageIndex: number, forceLoad?: boolean }) // loads the page and sets the requestPage to the pageIndex
 *  store.setProductsLoadResult(entities: Product[], total: number) // appends the entities to the cache of entities and total
 */
export function withEntitiesRemotePagination<
  Entity extends { id: string | number },
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
  entity?: Entity;
  collection?: Collection;
} = {}): SignalStoreFeature<any, any> {
  const { loadingKey, setLoadingKey } = getWithCallStatusKeys({
    prop: config.collection,
  });
  const { entitiesKey, clearEntitiesCacheKey } = getWithEntitiesKeys(config);

  const {
    loadEntitiesPageKey,
    entitiesCurrentPageKey,
    paginationKey,
    entitiesPagedRequestKey,
    setEntitiesLoadResultKey,
  } = getWithEntitiesRemotePaginationKeys(config);

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
          endIndex < pagination().cache.end ? endIndex : pagination().cache.end;

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
    withMethods((state: Record<string, Signal<unknown>>) => {
      const entities = state[entitiesKey] as Signal<Entity[]>;
      const pagination = state[paginationKey] as Signal<PaginationState>;
      const entitiesList = state[entitiesKey] as Signal<Entity[]>;
      const { loadEntitiesPage } = loadEntitiesPageFactory(
        state,
        loadingKey,
        paginationKey,
        setLoadingKey,
      );
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
                [paginationKey]: {
                  ...pagination(),
                  total: entities.length,
                  cache: { start: 0, end: entities.length },
                  currentPage: 0,
                  requestPage: 0,
                },
              },
            );
          },
        ),
        [setEntitiesLoadResultKey]: (entities: Entity[], total: number) => {
          // TODO extract this function and test all egg cases, like preloading next pages and jumping page
          const isPreloadNextPagesReady =
            pagination().currentPage + 1 === pagination().requestPage;

          const newStart = pagination().currentPage * pagination().pageSize;
          const newEntities = isPreloadNextPagesReady
            ? [...entitiesList(), ...entities]
            : entities;
          patchState(
            state as StateSignal<object>,
            config.collection
              ? setAllEntities(newEntities, {
                  collection: config.collection,
                })
              : setAllEntities(newEntities),
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
                    ? pagination().cache.end + entities.length
                    : newStart + entities.length,
                },
              },
            },
          );
        },
        [loadEntitiesPageKey]: loadEntitiesPage,
      };
    }),
  );
}
