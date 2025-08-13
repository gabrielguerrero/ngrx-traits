import { computed, effect, Signal, untracked } from '@angular/core';
import {
  deepComputed,
  patchState,
  signalStoreFeature,
  SignalStoreFeature,
  SignalStoreFeatureResult,
  withComputed,
  withHooks,
  withMethods,
  withState,
  WritableStateSource,
} from '@ngrx/signals';
import {
  EntityMap,
  EntityProps,
  EntityState,
  NamedEntityProps,
  NamedEntityState,
  SelectEntityId,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { map, pipe, tap } from 'rxjs';

import { getWithEntitiesKeys, insertIf } from '../util';
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
  EntitiesFilterComputed,
  NamedEntitiesFilterComputed,
} from './with-entities-local-filter.model';
import {
  EntitiesRemoteFilterMethods,
  NamedEntitiesRemoteFilterMethods,
} from './with-entities-remote-filter.model';

/**
 * Generates necessary state and methods to do remote and local filtering of entities in the store,
 * the generated filter[Collection]Entities method will filter the entities by calling set[Collection]Loading() if the isRemoteFilter returns true
 * and if false will call the filterFn to filter the entities locally.
 *
 * For the remote case you should either create an effect that listens to [Collection]Loading can call the api with the [Collection]Filter params
 * or use withEntitiesLoadingCall to call the api with the [Collection]Filter params. filter[Collection]Entities
 * is debounced by default, you can change the debounce by using the debounce option filter[Collection]Entities or changing the defaultDebounce prop in the config.
 *
 * In case you dont want filter[Collection]Entities to call set[Collection]Loading() (which triggers a fetchEntities), you can pass skipLoadingCall: true to filter[Collection]Entities.
 * Useful in cases where you want to further change the state before manually calling set[Collection]Loading() to trigger a fetch of entities.
 *
 * Requires withEntities and withCallStatus to be present before this function.
 * @param configFactory - The configuration object for the feature or a factory function that receives the store and returns the configuration object
 * @param configFactory.defaultFilter - The default filter to be used
 * @param configFactory.defaultDebounce - The default debounce time to be used, if not set it will default to 300ms
 * @param configFactory.filterFn - The function to filter the entities
 * @param configFactory.isRemoteFilter - The function to determine if the filter is remote or local
 * @param configFactory.entity - The entity type to be used
 * @param configFactory.collection - The optional collection name to be used
 * @param configFactory.selectId - The optional function to select the id of the entity
 *
 * @example
 * const entity = type<Product>();
 * const collection = 'products';
 * export const store = signalStore(
 *   { providedIn: 'root' },
 *   // requires withEntities and withCallStatus to be used
 *   withEntities({ entity, collection }),
 *   withCallStatus({ prop: collection, initialValue: 'loading' }),
 *   withEntitiesHybridFilter({
 *     entity,
 *     collection,
 *     defaultFilter: { name: '' , category: ''},
 *     filterFn: (entity, filter) =>
 *        (!filter.name || entity.name.toLowerCase().includes(filter.name.toLowerCase()))
 *     // in this case the filter will call setProductsLoading() if the category changes, othewise
 *     // it will filter the entities locally using filterFn
 *     isRemoteFilter: (previous, current) => {
 *          return previous.category !== current.category;
 *     }
 *   }),
 *   // after you can use withEntitiesLoadingCall to connect the filter to
 *   // the api call, or do it manually as shown after
 *    withEntitiesLoadingCall({
 *     collection,
 *     fetchEntities: ({ productsFilter }) => {
 *       return inject(ProductService)
 *         .getProducts({
 *           category: productsFilter().category,
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
 * //                  category: productsFilter().category,
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
 *  store.productsFilter // { search: string , category: string }
 *  // generates the following methods
 *  store.filterProductsEntities  // (options: { filter: { search: string, category: string }, debounce?: number, patch?: boolean, forceLoad?: boolean, skipLoadingCall?:boolean }) => void
 *  store.resetProductsFilter  // () => void
 */
export function withEntitiesHybridFilter<
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
      selectId?: SelectEntityId<Entity>;
      filterFn: (entity: NoInfer<Entity>, filter: NoInfer<Filter>) => boolean;
      isRemoteFilter: (
        previous: NoInfer<Filter>,
        current: NoInfer<Filter>,
      ) => boolean;
    }
  >,
): SignalStoreFeature<
  Input &
    (Collection extends ''
      ? {
          state: EntityState<Entity>;
          props: EntityProps<Entity>;
          methods: CallStatusMethods;
        }
      : {
          state: NamedEntityState<Entity, Collection>;
          props: NamedEntityProps<Entity, Collection>;
          methods: NamedCallStatusMethods<Collection>;
        }),
  Collection extends ''
    ? {
        state: {};
        props: EntitiesFilterComputed<Filter>;
        methods: EntitiesRemoteFilterMethods<Filter>;
      }
    : {
        state: {};
        props: NamedEntitiesFilterComputed<Collection, Filter>;
        methods: NamedEntitiesRemoteFilterMethods<Collection, Filter>;
      }
> {
  return withFeatureFactory((store: StoreSource<Input>) => {
    const { defaultFilter, ...config } = getFeatureConfig(configFactory, store);
    const filterFn = config.filterFn;
    const { entityMapKey, idsKey } = getWithEntitiesKeys(config);
    const { setLoadingKey, loadedKey } = getWithCallStatusKeys({
      prop: config.collection,
    });
    const {
      filterKey,
      filterEntitiesKey,
      resetEntitiesFilterKey,
      isEntitiesFilterChangedKey,
      computedFilterKey,
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
          [computedFilterKey]: deepComputed(() => filter()),
        };
      }),
      withEventHandler(),
      withMethods((state: Record<string, Signal<unknown>>) => {
        const setLoading = state[setLoadingKey] as () => void;
        const isLoaded = state[loadedKey] as Signal<boolean>;
        const filter = state[filterKey] as Signal<Filter>;
        const entitiesMap = state[entityMapKey] as Signal<EntityMap<Entity>>;
        // we create a computed entities that relies on the entitiesMap instead of
        // using the computed state.entities from the withEntities , because this local filter is going to replace
        // the ids array of the state with the filtered ids array, and the state.entities depends on it,
        // so hour filter function needs the full list of entities always which will be always so we get them from entityMap
        const entities = computed(() => Object.values(entitiesMap()));
        const filterEntities = rxMethod<
          | {
              filter: Filter;
              debounce?: number;
              patch?: boolean;
              forceLoad?: boolean;
              skipLoadingCall?: boolean;
            }
          | undefined
        >(
          pipe(
            map(
              (options) =>
                // if no options are provided, we use the default filter
                // and forceLoad
                options ?? {
                  filter: filter(),
                  debounce: config.defaultDebounce,
                  forceLoad: true,
                },
            ),
            debounceFilterPipe(filter, config.defaultDebounce),
            tap((value) => {
              const isRemote = config.isRemoteFilter(value.filter, filter()) || !isLoaded();

              patchState(state as WritableStateSource<any>, {
                [filterKey]: value.filter,
              });
              if (!isRemote || value?.forceLoad) {
                const newEntities = entities().filter((entity) => {
                  return filterFn(entity, value.filter);
                });
                patchState(state as WritableStateSource<any>, {
                  [idsKey]: newEntities.map((entity) =>
                    config.selectId
                      ? config.selectId(entity)
                      : (entity as any)['id'],
                  ),
                });
              }
              broadcast(state, entitiesFilterChanged(value));
              if (isRemote && !value?.skipLoadingCall) setLoading?.();
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
      withHooks((state: Record<string, unknown>) => {
        const { loadedKey } = getWithCallStatusKeys({
          prop: config?.collection,
        });
        const loaded = state[loadedKey] as Signal<boolean>;
        const filter = state[filterKey] as Signal<Filter>;
        return {
          onInit: () => {
            const filterEntities = state[filterEntitiesKey] as (options: {
              filter: Filter;
              debounce?: number;
              patch?: boolean;
              forceLoad?: boolean;
              skipLoadingCall?: boolean;
            }) => void;
            effect(() => {
              if (loaded()) {
                untracked(() => {
                  filterEntities({
                    filter: filter(),
                    debounce: 0,
                    forceLoad: true,
                    skipLoadingCall: true,
                  });
                });
              }
            });
          },
        };
      }),
    );
  }) as any;
}
