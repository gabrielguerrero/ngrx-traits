import { computed, effect, Signal, untracked } from '@angular/core';
import {
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
import { EntityMap, SelectEntityId } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { map, Observable, pipe, tap } from 'rxjs';

import { RequireEntities } from '../feature-requirements.model';
import { getWithEntitiesKeys } from '../util';
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
  toFilterOptions,
} from './with-entities-filter.util';
import {
  EntitiesFilterComputed,
  EntitiesFilterMethods,
  EntitiesFilterState,
  NamedEntitiesFilterComputed,
  NamedEntitiesFilterMethods,
  NamedEntitiesFilterState,
} from './with-entities-local-filter.model';

/**
 * Generates necessary state, computed and methods for locally filtering entities in the store,
 * the generated filter[Collection]Entities method will filter the entities based on the filter function
 * and is debounced by default.
 *
 * Requires withEntities to be used.
 *
 * @param configFactory - The configuration object for the feature or a factory function that receives the store and returns the configuration object
 * @param configFactory.filterFn - The function that will be used to filter the entities
 * @param configFactory.defaultFilter - The default filter to be used
 * @param configFactory.defaultDebounce - The default debounce time to be used, if not set it will default to 300ms
 * @param configFactory.entity - The entity type to be used
 * @param configFactory.collection - The optional collection name to be used
 * @param configFactory.selectId - The function to use to select the id of the entity
 *
 * @example
 * const entity = type<Product>();
 * const collection = 'product';
 * const store = signalStore(
 *   { providedIn: 'root' },
 *   // requires withEntities to be used
 *   withEntities({ entity, collection }),
 *
 *   withEntitiesLocalFilter({
 *     entity,
 *     collection,
 *     defaultFilter: { search: '' },
 *     filterFn: (entity, filter) =>
 *       !filter?.search || // if there is no search term return all entities
 *       entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
 *   }),
 *  );
 *
 * // generates the following signals
 *  store.productEntitiesFilter // { search: string }
 *  // generates the following methods
 *  store.filterProductEntities  // (options: { filter: { search: string }, debounce?: number, patch?: boolean, forceLoad?: boolean }) => void
 *  store.resetProductEntitiesFilter  // (options?: { newDefaultFilter?: { search: string } }) => void — resets to defaultFilter or to newDefaultFilter if provided, updating the default for future resets
 */
export function withEntitiesLocalFilter<
  Input extends SignalStoreFeatureResult,
  Entity,
  Filter extends Record<string, unknown>,
  Collection extends string = '',
>(
  configFactory: FeatureConfigFactory<
    Input,
    {
      filterFn: (entity: Entity, filter: Filter) => boolean;
      defaultFilter: Filter;
      defaultDebounce?: number;
      entity: Entity;
      collection?: Collection;
      selectId?: SelectEntityId<Entity>;
    }
  >,
): SignalStoreFeature<
  Input & RequireEntities<Input, Entity, Collection, 'withEntitiesLocalFilter'>,
  Collection extends ''
    ? {
        state: EntitiesFilterState<Filter>;
        props: EntitiesFilterComputed<Filter>;
        methods: EntitiesFilterMethods<Filter, Entity>;
      }
    : {
        state: NamedEntitiesFilterState<Collection, Filter>;
        props: NamedEntitiesFilterComputed<Collection, Filter>;
        methods: NamedEntitiesFilterMethods<Collection, Filter, Entity>;
      }
> {
  return withFeatureFactory((store: StoreSource<Input>) => {
    const { filterFn, defaultFilter, ...config } = getFeatureConfig(
      configFactory,
      store,
    );
    const { entityMapKey, idsKey, entitiesKey } = getWithEntitiesKeys(config);
    const { entitiesFilterChanged } = getWithEntitiesFilterEvents(config);
    const {
      filterEntitiesKey,
      filterKey,
      defaultFilterKey,
      resetEntitiesFilterKey,
      isEntitiesFilterChangedKey,
    } = getWithEntitiesFilterKeys(config);
    return signalStoreFeature(
      withState({
        [filterKey]: defaultFilter,
        [defaultFilterKey]: defaultFilter,
      }),
      withComputed((state: Record<string, Signal<unknown>>) => {
        const filter = state[filterKey] as Signal<Filter>;
        const currentDefault = state[defaultFilterKey] as Signal<Filter>;
        return {
          [isEntitiesFilterChangedKey]: computed(() => {
            return (
              JSON.stringify(filter()) !== JSON.stringify(currentDefault())
            );
          }),
        };
      }),
      withEventHandler(),
      withMethods((state: Record<string, Signal<unknown>>) => {
        const filter = state[filterKey] as Signal<Filter>;
        const entitiesMap = state[entityMapKey] as Signal<EntityMap<Entity>>;
        const filteredEntities = state[entitiesKey] as Signal<Entity[]>;
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
              _emitEvent?: boolean;
            }
          | undefined
        >(
          pipe(
            map((options) =>
              // if no options are provided, we use the default filter
              // and forceLoad
              options
                ? toFilterOptions(options, defaultFilter)
                : {
                    filter: filter(),
                    debounce: 0,
                    forceLoad: true,
                  },
            ),
            debounceFilterPipe(filter, config.defaultDebounce),
            tap((value) => {
              const newEntities = entities().filter((entity) => {
                return filterFn(entity, value.filter);
              });
              patchState(
                state as WritableStateSource<any>,
                {
                  [filterKey]: value.filter,
                },
                {
                  [idsKey]: newEntities.map((entity) =>
                    config.selectId
                      ? config.selectId(entity)
                      : (entity as any)['id'],
                  ),
                },
              );
              if (value._emitEvent !== false)
                broadcast(state, entitiesFilterChanged(value));
            }),
          ),
        );
        return {
          [filterEntitiesKey]: (
            options:
              | {
                  filter: Filter;
                  debounce?: number;
                  patch?: boolean;
                  forceLoad?: boolean;
                  _emitEvent?: boolean;
                }
              | undefined,
          ) => {
            if (options instanceof Observable || typeof options === 'function')
              return filterEntities(options);
            filterEntities(options);
            return Promise.resolve({ ok: true, value: filteredEntities });
          },
          [resetEntitiesFilterKey]: (options?: {
            newDefaultFilter?: Filter;
            debounce?: number;
            forceLoad?: boolean;
            skipLoadingCall?: boolean;
          }) => {
            const newDefault = options?.newDefaultFilter;
            if (newDefault) {
              patchState(state as WritableStateSource<any>, {
                [defaultFilterKey]: newDefault,
              });
            }
            const currentDefault =
              newDefault ?? (state[defaultFilterKey] as Signal<Filter>)();
            filterEntities({
              filter: currentDefault,
              debounce: options?.debounce,
              forceLoad: options?.forceLoad,
            });
          },
        };
      }),
      withHooks((state: Record<string, unknown>) => {
        const { loadedKey } = getWithCallStatusKeys({
          collection: config?.collection,
        });
        const loaded = state[loadedKey] as Signal<boolean> | undefined;
        const filter = state[filterKey] as Signal<Filter>;
        return {
          onInit: () => {
            if (loaded) {
              const filterEntities = state[filterEntitiesKey] as (options: {
                filter: Filter;
                debounce?: number;
                patch?: boolean;
                forceLoad?: boolean;
                _emitEvent?: boolean;
              }) => void;
              effect(() => {
                if (loaded()) {
                  untracked(() => {
                    filterEntities({
                      filter: filter(),
                      debounce: 0,
                      forceLoad: true,
                      _emitEvent: false,
                    });
                  });
                }
              });
            }
          },
        };
      }),
    );
  }) as any;
}
