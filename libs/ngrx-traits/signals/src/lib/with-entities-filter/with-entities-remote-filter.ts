import { computed, Signal } from '@angular/core';
import {
  patchState,
  signalStoreFeature,
  SignalStoreFeature,
  SignalStoreFeatureResult,
  withComputed,
  withMethods,
  withState,
  WritableStateSource,
} from '@ngrx/signals';
import type {
  EntityComputed,
  EntityState,
  NamedEntityComputed,
  NamedEntityState,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
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
import { withFeatureFactory } from '../with-feature-factory/with-feature-factory';
import {
  FeatureConfigFactory,
  getFeatureConfig,
  StoreSource,
} from '../with-feature-factory/with-feature-factory.model';
import {
  debounceFilterPipe,
  getWithEntitiesFilterEvents,
  getWithEntitiesFilterKeys,
} from './with-entities-filter.util';
import {
  EntitiesFilterState,
  NamedEntitiesFilterState,
} from './with-entities-local-filter.model';
import {
  EntitiesRemoteFilterMethods,
  NamedEntitiesRemoteFilterMethods,
} from './with-entities-remote-filter.model';

/**
 * Generates necessary state, computed and methods for remotely filtering entities in the store,
 * the generated filter[collection]Entities method will filter the entities by calling set[collection]Loading()
 * and you should either create an effect that listens to [collection]Loading can call the api with the [collection]Filter params
 * or use withEntitiesLoadingCall to call the api with the [collection]Filter params
 * and is debounced by default. You can change the debounce by using the debounce option filter[collection]Entities or changing the defaultDebounce prop in the config.
 *
 * In case you dont want filter[collection]Entities to call set[collection]Loading() (which triggers a fetchEntities), you can pass skipLoadingCall: true to filter[collection]Entities.
 * Useful in cases where you want to further change the state before manually calling set[collection]Loading() to trigger a fetch of entities.
 *
 * Requires withEntities and withCallStatus to be present before this function.
 * @param configFactory - The configuration object for the feature or a factory function that receives the store and returns the configuration object
 * @param configFactory.defaultFilter - The default filter to be used
 * @param configFactory.defaultDebounce - The default debounce time to be used, if not set it will default to 300ms
 * @param configFactory.entity - The entity type to be used
 * @param configFactory.collection - The optional collection name to be used
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
 *  store.filterProductsEntities  // (options: { filter: { search: string }, debounce?: number, patch?: boolean, forceLoad?: boolean, skipLoadingCall?:boolean }) => void
 *  store.resetProductsFilter  // () => void
 */
export function withEntitiesRemoteFilter<
  Input extends SignalStoreFeatureResult,
  Entity,
  Filter extends Record<string, unknown>,
  Collection extends string = '',
>(
  configFactory: FeatureConfigFactory<
    Input,
    {
      defaultFilter: Filter;
      defaultDebounce?: number;
      entity: Entity;
      collection?: Collection;
    }
  >,
): SignalStoreFeature<
  Input &
    (Collection extends ''
      ? {
          state: EntityState<Entity>;
          computed: EntityComputed<Entity>;
          methods: CallStatusMethods;
        }
      : {
          state: NamedEntityState<Entity, Collection>;
          computed: NamedEntityComputed<Entity, Collection>;
          methods: NamedCallStatusMethods<Collection>;
        }),
  Collection extends ''
    ? {
        state: EntitiesFilterState<Filter>;
        computed: {};
        methods: EntitiesRemoteFilterMethods<Filter>;
      }
    : {
        state: NamedEntitiesFilterState<Collection, Filter>;
        computed: {};
        methods: NamedEntitiesRemoteFilterMethods<Collection, Filter>;
      }
> {
  return withFeatureFactory((store: StoreSource<Input>) => {
    const { defaultFilter, ...config } = getFeatureConfig(configFactory, store);
    const { setLoadingKey } = getWithCallStatusKeys({
      prop: config.collection,
    });
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
          skipLoadingCall?: boolean;
        }>(
          pipe(
            debounceFilterPipe(filter, config.defaultDebounce),
            tap((value) => {
              patchState(
                state as WritableStateSource<EntitiesFilterState<Filter>>,
                {
                  [filterKey]: value.filter,
                },
              );
              broadcast(state, entitiesFilterChanged(value));
              if (!value?.skipLoadingCall) setLoading();
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
  }) as any;
}
