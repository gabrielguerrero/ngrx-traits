import { computed, Signal } from '@angular/core';
import {
  patchState,
  signalStoreFeature,
  SignalStoreFeature,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import type { EntityState, NamedEntityState } from '@ngrx/signals/entities';
import type {
  EntitySignals,
  NamedEntitySignals,
} from '@ngrx/signals/entities/src/models';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import type { StateSignal } from '@ngrx/signals/src/state-signal';
import { pipe, tap } from 'rxjs';

import {
  CallStatusMethods,
  NamedCallStatusMethods,
} from '../with-call-status/with-call-status.model';
import { getWithCallStatusKeys } from '../with-call-status/with-call-status.util';
import {
  broadcast,
  withEventHandler,
} from '../with-event-handler/with-event-handler';
import {
  debounceFilterPipe,
  getWithEntitiesFilterEvents,
  getWithEntitiesFilterKeys,
} from './with-entities-filter.util';
import {
  EntitiesFilterMethods,
  EntitiesFilterState,
  NamedEntitiesFilterMethods,
  NamedEntitiesFilterState,
} from './with-entities-local-filter.model';

/**
 * Generates necessary state, computed and methods for remotely filtering entities in the store,
 * the generated filter[collection]Entities method will filter the entities by calling set[collection]Loading()
 * and you should either create an effect that listens toe [collection]Loading can call the api with the [collection]Filter params
 * or use withEntitiesLoadingCall to call the api with the [collection]Filter params
 * and is debounced by default. Requires withEntities and withCallStatus to be present before this function.
 * @param config
 * @param config.defaultFilter - The default filter to be used
 * @param config.entity - The entity type to be used
 * @param config.collection - The optional collection name to be used
 *
 * @example
 * const entity = type<Product>();
 * const collection = 'products';
 * export const store = signalStore(
 *   { providedIn: 'root' },
 *   // requires withEntities and withCallStatus to be used
 *   withEntities({ entity, collection }),
 *   withCallStatus({ prop: collection, initialValue: 'loading' }),
 *
 *   withEntitiesRemoteFilter({
 *     entity,
 *     collection,
 *     defaultFilter: { name: '' },
 *   }),
 *   // after you can use withEntitiesLoadingCall to connect the filter to
 *   // the api call, or do it manually as shown after
 *    withEntitiesLoadingCall({
 *     collection,
 *     fetchEntities: ({ productsFilter }) => {
 *       return inject(ProductService)
 *         .getProducts({
 *           search: productsFilter().name,
 *         })
 *     },
 *   }),
 * // withEntitiesLoadingCall is the same as doing the following:
 * // withHooks(({ productsLoading, setProductsError, ...state }) => ({
 * //   onInit: async () => {
 * //     effect(() => {
 * //       if (isProductsLoading()) {
 * //         inject(ProductService)
 * //            .getProducts({
 * //                 search: productsFilter().name,
 * //             })
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
 * // generates the following signals
 *  store.productsFilter // { search: string }
 *  // generates the following computed signals
 *  store.isProductsFilterChanged // boolean
 *  // generates the following methods
 *  store.filterProductsEntities  // (options: { filter: { search: string }, debounce?: number, patch?: boolean, forceLoad?: boolean }) => void
 *  store.resetProductsFilter  // () => void
 */
export function withEntitiesRemoteFilter<
  Entity extends { id: string | number },
  Filter extends Record<string, unknown>,
>(config: {
  defaultFilter: Filter;
  entity?: Entity;
}): SignalStoreFeature<
  {
    state: EntityState<Entity>;
    signals: EntitySignals<Entity>;
    methods: CallStatusMethods;
  },
  {
    state: EntitiesFilterState<Filter>;
    signals: {};
    methods: EntitiesFilterMethods<Filter>;
  }
>;
/**
 * Generates necessary state, computed and methods for remotely filtering entities in the store,
 * the generated filter[collection]Entities method will filter the entities by calling set[collection]Loading()
 * and you should either create an effect that listens toe [collection]Loading can call the api with the [collection]Filter params
 * or use withEntitiesLoadingCall to call the api with the [collection]Filter params
 * and is debounced by default. Requires withEntities and withCallStatus to be present before this function.
 * @param config
 * @param config.defaultFilter - The default filter to be used
 * @param config.entity - The entity type to be used
 * @param config.collection - The optional collection name to be used
 *
 * @example
 * const entity = type<Product>();
 * const collection = 'products';
 * export const store = signalStore(
 *   { providedIn: 'root' },
 *   // requires withEntities and withCallStatus to be used
 *   withEntities({ entity, collection }),
 *   withCallStatus({ prop: collection, initialValue: 'loading' }),
 *
 *   withEntitiesRemoteFilter({
 *     entity,
 *     collection,
 *     defaultFilter: { name: '' },
 *   }),
 *   // after you can use withEntitiesLoadingCall to connect the filter to
 *   // the api call, or do it manually as shown after
 *    withEntitiesLoadingCall({
 *     collection,
 *     fetchEntities: ({ productsFilter }) => {
 *       return inject(ProductService)
 *         .getProducts({
 *           search: productsFilter().name,
 *         })
 *     },
 *   }),
 * // withEntitiesLoadingCall is the same as doing the following:
 * // withHooks(({ productsLoading, setProductsError, ...state }) => ({
 * //   onInit: async () => {
 * //     effect(() => {
 * //       if (isProductsLoading()) {
 * //         inject(ProductService)
 * //              .getProducts({
 * //                 search: productsFilter().name,
 * //               })
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
 * // generates the following signals
 *  store.productsFilter // { search: string }
 *  // generates the following computed signals
 *  store.isProductsFilterChanged // boolean
 *  // generates the following methods
 *  store.filterProductsEntities  // (options: { filter: { search: string }, debounce?: number, patch?: boolean, forceLoad?: boolean }) => void
 *  store.resetProductsFilter  // () => void
 */

export function withEntitiesRemoteFilter<
  Entity extends { id: string | number },
  Collection extends string,
  Filter extends Record<string, unknown>,
>(config: {
  defaultFilter: Filter;
  entity?: Entity;
  collection?: Collection;
}): SignalStoreFeature<
  {
    state: NamedEntityState<Entity, string>;
    signals: NamedEntitySignals<Entity, Collection>;
    methods: NamedCallStatusMethods<Collection>;
  },
  {
    state: NamedEntitiesFilterState<Collection, Filter>;
    signals: {};
    methods: NamedEntitiesFilterMethods<Collection, Filter>;
  }
>;
export function withEntitiesRemoteFilter<
  Entity extends { id: string | number },
  Collection extends string,
  Filter extends Record<string, unknown>,
>({
  defaultFilter,
  ...config
}: {
  entity?: Entity;
  collection?: Collection;
  defaultFilter: Filter;
}): SignalStoreFeature<any, any> {
  const { setLoadingKey } = getWithCallStatusKeys({ prop: config.collection });
  const {
    filterKey,
    filterEntitiesKey,
    resetEntitiesFilterKey,
    isEntitiesFilterChangedKey,
  } = getWithEntitiesFilterKeys(config);
  const { entitiesFilterChanged } = getWithEntitiesFilterEvents(config);

  return signalStoreFeature(
    withState({ [filterKey]: defaultFilter }),
    withComputed((state: Record<string, Signal<unknown>>) => {
      const filter = state[filterKey] as Signal<Filter>;
      return {
        [isEntitiesFilterChangedKey]: computed(() => {
          return JSON.stringify(filter()) !== JSON.stringify(defaultFilter);
        }),
      };
    }),
    withEventHandler(),
    withMethods((state: Record<string, Signal<unknown>>) => {
      const setLoading = state[setLoadingKey] as () => void;
      const filter = state[filterKey] as Signal<Filter>;

      const filterEntities = rxMethod<{
        filter: Filter;
        debounce?: number;
        patch?: boolean;
        forceLoad?: boolean;
      }>(
        pipe(
          debounceFilterPipe(filter),
          tap((value) => {
            setLoading();
            patchState(state as StateSignal<EntitiesFilterState<Filter>>, {
              [filterKey]: value.filter,
            });
            broadcast(state, entitiesFilterChanged(value));
          }),
        ),
      );
      return {
        [filterEntitiesKey]: filterEntities,
        [resetEntitiesFilterKey]: () => {
          filterEntities({ filter: defaultFilter });
        },
      };
    }),
  );
}
