import { Signal } from '@angular/core';
import {
  patchState,
  signalStoreFeature,
  SignalStoreFeature,
  withMethods,
  withState,
  WritableStateSource,
} from '@ngrx/signals';
import { EntityState, NamedEntityState } from '@ngrx/signals/entities';
import {
  EntityComputed,
  NamedEntityComputed,
} from '@ngrx/signals/entities/src/models';
import { Prettify } from '@ngrx/signals/src/ts-helpers';

import {
  CallStatusMethods,
  NamedCallStatusMethods,
} from '../with-call-status/with-call-status.model';
import { getWithCallStatusKeys } from '../with-call-status/with-call-status.util';
import {
  broadcast,
  withEventHandler,
} from '../with-event-handler/with-event-handler';
import type { Sort } from './with-entities-local-sort.model';
import {
  EntitiesSortState,
  NamedEntitiesSortState,
} from './with-entities-local-sort.model';
import {
  EntitiesRemoteSortMethods,
  NamedEntitiesRemoteSortMethods,
} from './with-entities-remote-sort.model';
import { getWithEntitiesRemoteSortEvents } from './with-entities-remote-sort.util';
import { getWithEntitiesSortKeys } from './with-entities-sort.util';

/**
 * Generates state, signals, and methods to sort entities remotely. When the sort method sort[collection]Entities is called it will store the sort
 * and call set[Collection]Loading, and you should either create an effect that listens to [collection]Loading
 * and call the api with the [collection]Sort params and use wither setAllEntities if is not paginated or set[Collection]Result if is paginated
 * with the sorted result that come from the backend, plus changing the status  and set errors is needed.
 * or use withEntitiesLoadingCall to call the api with the [collection]Sort params which handles setting
 * the result and errors automatically.
 *
 *  In case you dont want sort[collection]Entities to call set[collection]Loading() (which triggers a fetchEntities), you can pass skipLoadingCall: true to sort[collection]Entities.
 * Useful in cases where you want to further change the state before manually calling set[collection]Loading() to trigger a fetch of entities.
 *
 * Requires withEntities and withCallStatus to be present before this function.
 *
 * @param config
 * @param config.defaultSort - The default sort to use when the store is initialized
 * @param config.entity - The entity type
 * @param config.collection - The collection name
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
 *   withEntitiesRemoteSort({
 *     entity,
 *     collection,
 *     defaultSort: { field: 'name', direction: 'asc' },
 *   }),
 *   // after you can use withEntitiesLoadingCall to connect the filter to
 *   // the api call, or do it manually as shown after
 *    withEntitiesLoadingCall({
 *     collection,
 *     fetchEntities: ({ productsSort }) => {
 *       return inject(ProductService)
 *         .getProducts({
 *           sortColumn: productsSort().field,
 *           sortAscending: productsSort().direction === 'asc',
 *         })
 *     },
 *   }),
 * // withEntitiesLoadingCall is the same as doing the following:
 * // withHooks(({ productsSort, productsLoading, setProductsError, ...state }) => ({
 * //   onInit: async () => {
 * //     effect(() => {
 * //       if (isProductsLoading()) {
 * //         inject(ProductService)
 * //             .getProducts({
 * //                 sortColumn: productsSort().field,
 * //                 sortAscending: productsSort().direction === 'asc',
 * //              })
 * //           .pipe(
 * //             takeUntilDestroyed(),
 * //             tap((res) =>
 * //               patchState(
 * //                 state,
 * //                 setAllEntities(res.resultList, { collection: 'products' }),
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
 * // generate the following signals
 * store.productsSort // the current sort
 * // and the following methods
 * store.sortProductsEntities // (options: { sort: Sort<Entity>; , skipLoadingCall?:boolean}) => void;
 */
export function withEntitiesRemoteSort<
  Entity,
  Collection extends string,
>(config: {
  entity: Entity;
  defaultSort: Sort<Entity>;
  collection: Collection;
}): SignalStoreFeature<
  {
    state: NamedEntityState<Entity, Collection>;
    computed: NamedEntityComputed<Entity, Collection>;
    methods: NamedCallStatusMethods<Collection>;
  },
  {
    state: NamedEntitiesSortState<Entity, Collection>;
    computed: {};
    methods: NamedEntitiesRemoteSortMethods<Entity, Collection>;
  }
>;

/**
 * Generates state, signals, and methods to sort entities remotely. When the sort method sort[collection]Entities is called it will store the sort
 * and call set[Collection]Loading, and you should either create an effect that listens to [collection]Loading
 * and call the api with the [collection]Sort params and use wither setAllEntities if is not paginated or set[Collection]Result if is paginated
 * with the sorted result that come from the backend, plus changing the status  and set errors is needed.
 * or use withEntitiesLoadingCall to call the api with the [collection]Sort params which handles setting
 * the result and errors automatically.
 *
 *  In case you dont want sort[collection]Entities to call set[collection]Loading() (which triggers a fetchEntities), you can pass skipLoadingCall: true to sort[collection]Entities.
 * Useful in cases where you want to further change the state before manually calling set[collection]Loading() to trigger a fetch of entities.
 *
 * Requires withEntities and withCallStatus to be present before this function.
 *
 * @param config
 * @param config.defaultSort - The default sort to use when the store is initialized
 * @param config.entity - The entity type
 * @param config.collection - The collection name
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
 *   withEntitiesRemoteSort({
 *     entity,
 *     collection,
 *     defaultSort: { field: 'name', direction: 'asc' },
 *   }),
 *   // after you can use withEntitiesLoadingCall to connect the filter to
 *   // the api call, or do it manually as shown after
 *    withEntitiesLoadingCall({
 *     collection,
 *     fetchEntities: ({ productsSort }) => {
 *       return inject(ProductService)
 *         .getProducts({
 *           sortColumn: productsSort().field,
 *           sortAscending: productsSort().direction === 'asc',
 *         })
 *     },
 *   }),
 * // withEntitiesLoadingCall is the same as doing the following:
 * // withHooks(({ productsSort, productsLoading, setProductsError, ...state }) => ({
 * //   onInit: async () => {
 * //     effect(() => {
 * //       if (isProductsLoading()) {
 * //         inject(ProductService)
 * //             .getProducts({
 * //                 sortColumn: productsSort().field,
 * //                 sortAscending: productsSort().direction === 'asc',
 * //              })
 * //           .pipe(
 * //             takeUntilDestroyed(),
 * //             tap((res) =>
 * //               patchState(
 * //                 state,
 * //                 setAllEntities(res.resultList, { collection: 'products' }),
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
 * // generate the following signals
 * store.productsSort // the current sort
 * // and the following methods
 * store.sortProductsEntities // (options: { sort: Sort<Entity>; , skipLoadingCall?:boolean}) => void;
 */
export function withEntitiesRemoteSort<Entity>(config: {
  defaultSort: Sort<Entity>;
  entity: Entity;
}): SignalStoreFeature<
  {
    state: EntityState<Entity>;
    computed: EntityComputed<Entity>;
    methods: CallStatusMethods;
  },
  {
    state: EntitiesSortState<Entity>;
    computed: {};
    methods: EntitiesRemoteSortMethods<Entity>;
  }
>;

export function withEntitiesRemoteSort<Entity, Collection extends string>({
  defaultSort,
  ...config
}: {
  entity: Entity;
  collection?: Collection;
  defaultSort: Sort<Entity>;
}): SignalStoreFeature<any, any> {
  const { setLoadingKey } = getWithCallStatusKeys({
    prop: config.collection,
  });
  const { sortKey, sortEntitiesKey } = getWithEntitiesSortKeys(config);
  const { entitiesRemoteSortChanged } = getWithEntitiesRemoteSortEvents(config);
  return signalStoreFeature(
    withState({ [sortKey]: defaultSort }),
    withEventHandler(),
    withMethods((state: Record<string, Signal<unknown>>) => {
      const setLoading = state[setLoadingKey] as () => void;
      return {
        [sortEntitiesKey]: ({
          sort: newSort,
          skipLoadingCall,
        }: {
          sort: Sort<Entity>;
          skipLoadingCall?: boolean;
        }) => {
          patchState(state as WritableStateSource<object>, {
            [sortKey]: newSort,
          });
          if (!skipLoadingCall) setLoading();
          broadcast(state, entitiesRemoteSortChanged({ sort: newSort }));
        },
      };
    }),
  );
}
