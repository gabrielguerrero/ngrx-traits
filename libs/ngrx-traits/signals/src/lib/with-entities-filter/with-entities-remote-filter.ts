import { Signal } from '@angular/core';
import {
  patchState,
  signalStoreFeature,
  SignalStoreFeature,
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

import type {
  CallStateMethods,
  NamedCallStateMethods,
} from '../with-call-status/with-call-status';
import { getWithCallStatusKeys } from '../with-call-status/with-call-status.util';
import {
  debounceFilterPipe,
  getWithEntitiesFilterKeys,
} from './with-entities-filter.util';
import type {
  EntitiesFilterMethods,
  EntitiesFilterState,
  NamedEntitiesFilterMethods,
  NamedEntitiesFilterState,
} from './with-entities-local-filter';

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
 * //       if (productsLoading()) {
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
 *   // generates the following signals
 *  store.productsFilter // { name: string } stored filter
 *  // generates the following methods
 *  store.filterProductsEntities  // (options: { filter: { name: string }, debounce?: number, patch?: boolean, forceLoad?: boolean }) => void
 */
export function withEntitiesRemoteFilter<
  Entity extends { id: string | number },
  Filter extends Record<string, unknown>,
>(options: {
  defaultFilter: Filter;
  entity?: Entity;
}): SignalStoreFeature<
  {
    state: EntityState<Entity>;
    signals: EntitySignals<Entity>;
    methods: CallStateMethods;
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
 * //       if (productsLoading()) {
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
 *  // generates the following signals
 *  store.productsFilter // { name: string } stored filter
 *  // generates the following methods
 *  store.filterProductsEntities  // (options: { filter: { name: string }, debounce?: number, patch?: boolean, forceLoad?: boolean }) => void
 */

export function withEntitiesRemoteFilter<
  Entity extends { id: string | number },
  Collection extends string,
  Filter extends Record<string, unknown>,
>(options: {
  defaultFilter: Filter;
  entity?: Entity;
  collection?: Collection;
}): SignalStoreFeature<
  {
    state: NamedEntityState<Entity, any>;
    signals: NamedEntitySignals<Entity, Collection>;
    methods: NamedCallStateMethods<Collection>;
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
  const { filterKey, filterEntitiesKey } = getWithEntitiesFilterKeys(config);
  return signalStoreFeature(
    withState({ [filterKey]: defaultFilter }),
    withMethods((state: Record<string, Signal<unknown>>) => {
      const setLoading = state[setLoadingKey] as () => void;
      const filter = state[filterKey] as Signal<Filter>;

      return {
        [filterEntitiesKey]: rxMethod<{
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
            }),
          ),
        ),
      };
    }),
  );
}
