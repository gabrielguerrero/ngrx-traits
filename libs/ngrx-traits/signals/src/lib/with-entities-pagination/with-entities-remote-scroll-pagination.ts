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
  addEntities,
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
import { getWithEntitiesInfinitePaginationKeys } from './with-entities-infinite-pagination.util';
import { loadEntitiesPageFactory } from './with-entities-remote-pagination.util';
import {
  EntitiesPaginationInfiniteComputed,
  EntitiesPaginationInfiniteMethods,
  EntitiesPaginationInfiniteState,
  InfinitePaginationState,
  NamedEntitiesPaginationInfiniteComputed,
  NamedEntitiesPaginationInfiniteMethods,
  NamedEntitiesPaginationInfiniteState,
} from './with-entities-remote-scroll-pagination.model';

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
 *   store.productsPagination // { currentPage: number, requestPage: number, pageSize: 5, total: number, pagesToCache: number, cache: { start: number, end: number } } used internally
 *  // generates the following computed signals
 *  store.productsPageInfo // {  pageIndex: number, total: number, pageSize: 5, pagesCount: number, hasPrevious: boolean, hasNext: boolean, loading: boolean }
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
    state: EntitiesPaginationInfiniteState;
    signals: EntitiesPaginationInfiniteComputed;
    methods: EntitiesPaginationInfiniteMethods<Entity>;
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
 *   store.productsPagination // { currentPage: number, requestPage: number, pageSize: 5, total: number, pagesToCache: number, cache: { start: number, end: number } } used internally
 *  // generates the following computed signals
 *  store.productsPageInfo // {  pageIndex: number, total: number, pageSize: 5, pagesCount: number, hasPrevious: boolean, hasNext: boolean, loading: boolean }
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
    state: NamedEntitiesPaginationInfiniteState<Collection>;
    signals: NamedEntitiesPaginationInfiniteComputed<Entity, Collection>;
    methods: NamedEntitiesPaginationInfiniteMethods<Entity, Collection>;
  }
>;

export function withEntitiesRemoteScrollPagination<
  Entity extends { id: string | number },
  Collection extends string,
>({
  pageSize = 10,
  pagesToCache = 3,
  ...config
}: {
  pageSize?: number;
  pagesToCache?: number;
  entity?: Entity;
  collection?: Collection;
} = {}): SignalStoreFeature<any, any> {
  const { loadingKey, setLoadingKey } = getWithCallStatusKeys({
    prop: config.collection,
  });
  const { clearEntitiesCacheKey } = getWithEntitiesKeys(config);

  const {
    loadEntitiesNextPageKey,
    loadEntitiesFirstPageKey,
    loadEntitiesPreviousPageKey,
    entitiesPageInfoKey,
    setEntitiesLoadResultKey,
    entitiesPagedRequestKey,
    paginationKey,
  } = getWithEntitiesInfinitePaginationKeys(config);

  return signalStoreFeature(
    withState({
      [paginationKey]: {
        pageSize,
        currentPage: 0,
        requestPage: 0,
        pagesToCache,
        total: undefined,
        cache: {
          start: 0,
          end: 0,
        },
      },
    }),
    withComputed((state: Record<string, Signal<unknown>>) => {
      const loading = state[loadingKey] as Signal<boolean>;
      const pagination = state[
        paginationKey
      ] as Signal<InfinitePaginationState>;

      const entitiesPageInfo = computed(() => {
        const pagesCount =
          pagination().total && pagination().total! > 0
            ? Math.ceil(pagination().total! / pagination().pageSize)
            : undefined;
        return {
          pageIndex: pagination().currentPage,
          total: pagination().total,
          pageSize: pagination().pageSize,
          pagesCount,
          hasPrevious: pagination().currentPage - 1 >= 0,
          hasNext:
            pagesCount && pagination().total && pagination().total! > 0
              ? pagination().currentPage + 1 < pagesCount
              : true,
          loading:
            loading() && pagination().requestPage === pagination().currentPage,
        };
      });
      const entitiesPagedRequest = computed(() => ({
        startIndex: pagination().pageSize * pagination().requestPage,
        size: pagination().pageSize * pagination().pagesToCache,
        page: pagination().requestPage,
      }));
      return {
        [entitiesPageInfoKey]: entitiesPageInfo,
        [entitiesPagedRequestKey]: entitiesPagedRequest,
      };
    }),
    withMethods((state: Record<string, Signal<unknown>>) => {
      const pagination = state[
        paginationKey
      ] as Signal<InfinitePaginationState>;
      const { loadEntitiesPage } = loadEntitiesPageFactory(
        state,
        loadingKey,
        paginationKey,
        setLoadingKey,
      );
      // TODO refactor some of this code is repeated in remote pagination
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
                  total: 0,
                  cache: { start: 0, end: 0 },
                  currentPage: 0,
                  requestPage: 0,
                },
              },
            );
          },
        ),
        [setEntitiesLoadResultKey]: (entities: Entity[], total: number) => {
          patchState(
            state as StateSignal<object>,
            config.collection
              ? addEntities(entities, {
                  collection: config.collection,
                })
              : addEntities(entities),
            {
              [paginationKey]: {
                ...pagination(),
                total,
                cache: {
                  ...pagination().cache,
                  end: pagination().cache.end + entities.length,
                },
              },
            },
          );
        },
        [loadEntitiesNextPageKey]: () => {
          loadEntitiesPage({ pageIndex: pagination().currentPage + 1 });
        },
        [loadEntitiesPreviousPageKey]: () => {
          loadEntitiesPage({
            pageIndex:
              pagination().currentPage > 0 ? pagination().currentPage - 1 : 0,
          });
        },
        [loadEntitiesFirstPageKey]: () => {
          loadEntitiesPage({ pageIndex: 0 });
        },
      };
    }),
  );
}
