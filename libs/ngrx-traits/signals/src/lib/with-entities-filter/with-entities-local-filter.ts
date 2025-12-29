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
} from './with-entities-filter.util';
import {
  EntitiesFilterComputed,
  EntitiesFilterMethods,
  NamedEntitiesFilterComputed,
  NamedEntitiesFilterMethods,
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
 *  store.resetProductEntitiesFilter  // () => void
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
  Input &
    (Collection extends ''
      ? {
          state: EntityState<Entity>;
          props: EntityProps<Entity>;
          methods: {};
        }
      : {
          state: NamedEntityState<Entity, Collection>;
          props: NamedEntityProps<Entity, Collection>;
          methods: {};
        }),
  Collection extends ''
    ? {
        state: {};
        props: EntitiesFilterComputed<Filter>;
        methods: EntitiesFilterMethods<Filter>;
      }
    : {
        state: {};
        props: NamedEntitiesFilterComputed<Collection, Filter>;
        methods: NamedEntitiesFilterMethods<Collection, Filter>;
      }
> {
  return withFeatureFactory((store: StoreSource<Input>) => {
    const { filterFn, defaultFilter, ...config } = getFeatureConfig(
      configFactory,
      store,
    );
    const { entityMapKey, idsKey } = getWithEntitiesKeys(config);
    const { entitiesFilterChanged } = getWithEntitiesFilterEvents(config);
    const {
      filterEntitiesKey,
      filterKey,
      resetEntitiesFilterKey,
      isEntitiesFilterChangedKey,
      computedFilterKey,
    } = getWithEntitiesFilterKeys(config);
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
              }) => void;
              effect(() => {
                if (loaded()) {
                  untracked(() => {
                    filterEntities({
                      filter: filter(),
                      debounce: 0,
                      forceLoad: true,
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
