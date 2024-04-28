import { computed, Signal } from '@angular/core';
import {
  patchState,
  signalStoreFeature,
  SignalStoreFeature,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { EntityState, NamedEntityState } from '@ngrx/signals/entities';
import type {
  EntityMap,
  EntitySignals,
  NamedEntitySignals,
} from '@ngrx/signals/entities/src/models';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import type { StateSignal } from '@ngrx/signals/src/state-signal';
import { pipe, tap } from 'rxjs';

import { getWithEntitiesKeys } from '../util';
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
  EntitiesFilterComputed,
  EntitiesFilterMethods,
  EntitiesFilterState,
  NamedEntitiesFilterComputed,
  NamedEntitiesFilterMethods,
  NamedEntitiesFilterState,
} from './with-entities-local-filter.model';

/**
 * Generates necessary state, computed and methods for locally filtering entities in the store,
 * the generated filter[collenction]Entities method will filter the entities based on the filter function
 * and is debounced by default.
 *
 * Requires withEntities to be used.
 *
 * @param config
 * @param config.filterFn - The function that will be used to filter the entities
 * @param config.defaultFilter - The default filter to be used
 * @param config.defaultDebounce - The default debounce time to be used
 * @param config.entity - The entity tye to be used
 * @param config.collection - The optional collection name to be used
 *
 * @example
 * const entity = type<Product>();
 * const collection = 'products';
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
 *  store.productsFilter // { search: string }
 *  // generates the following computed signals
 *  store.isProductsFilterChanged // boolean
 *  // generates the following methods
 *  store.filterProductsEntities  // (options: { filter: { search: string }, debounce?: number, patch?: boolean, forceLoad?: boolean }) => void
 *  store.resetProductsFilter  // () => void
 */
export function withEntitiesLocalFilter<
  Entity extends { id: string | number },
  Filter extends Record<string, unknown>,
>(config: {
  filterFn: (entity: Entity, filter?: Filter) => boolean;
  defaultFilter: Filter;
  defaultDebounce?: number;
  entity?: Entity;
}): SignalStoreFeature<
  {
    state: EntityState<Entity>;
    signals: EntitySignals<Entity>;
    methods: {};
  },
  {
    state: EntitiesFilterState<Filter>;
    signals: EntitiesFilterComputed;
    methods: EntitiesFilterMethods<Filter>;
  }
>;
/**
 * Generates necessary state, computed and methods for locally filtering entities in the store,
 * the generated filter[collenction]Entities method will filter the entities based on the filter function
 * and is debounced by default.
 *
 * Requires withEntities to be used.
 *
 * @param config
 * @param config.filterFn - The function that will be used to filter the entities
 * @param config.defaultFilter - The default filter to be used
 * @param config.defaultDebounce - The default debounce time to be used
 * @param config.collection - The optional collection name to be used
 *
 * @example
 * const entity = type<Product>();
 * const collection = 'products';
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
 *  store.productsFilter // { search: string }
 *  // generates the following computed signals
 *  store.isProductsFilterChanged // boolean
 *  // generates the following methods
 *  store.filterProductsEntities  // (options: { filter: { search: string }, debounce?: number, patch?: boolean, forceLoad?: boolean }) => void
 *  store.resetProductsFilter  // () => void
 */
export function withEntitiesLocalFilter<
  Entity extends { id: string | number },
  Collection extends string,
  Filter extends Record<string, unknown>,
>(config: {
  filterFn: (entity: Entity, filter?: Filter) => boolean;
  defaultFilter: Filter;
  defaultDebounce?: number;
  entity?: Entity;
  collection?: Collection;
}): SignalStoreFeature<
  // TODO: we have a problem  with the state property, when set to any
  // it works but is it has a Collection, some methods are not generated, it seems
  // to only be accessible using store['filterEntities']
  // the workaround doesn't cause any issues, because the signals prop does work and still
  // gives the right error requiring withEntities to be used
  {
    state: NamedEntityState<Entity, any>;
    signals: NamedEntitySignals<Entity, Collection>;
    methods: {};
  },
  {
    state: NamedEntitiesFilterState<Collection, Filter>;
    signals: NamedEntitiesFilterComputed<Collection>;
    methods: NamedEntitiesFilterMethods<Collection, Filter>;
  }
>;

export function withEntitiesLocalFilter<
  Entity extends { id: string | number },
  Collection extends string,
  Filter extends Record<string, unknown>,
>({
  filterFn,
  defaultFilter,
  ...config
}: {
  filterFn: (entity: Entity, filter?: Filter) => boolean;
  defaultFilter: Filter;
  defaultDebounce?: number;
  entity?: Entity;
  collection?: Collection;
}): SignalStoreFeature<any, any> {
  const { entityMapKey, idsKey } = getWithEntitiesKeys(config);
  const { entitiesFilterChanged } = getWithEntitiesFilterEvents(config);
  const {
    filterEntitiesKey,
    filterKey,
    resetEntitiesFilterKey,
    isEntitiesFilterChangedKey,
  } = getWithEntitiesFilterKeys(config);
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
      const filter = state[filterKey] as Signal<Filter>;
      const entitiesMap = state[entityMapKey] as Signal<EntityMap<Entity>>;
      // we create a computed entities that relies on the entitiesMap instead of
      // using the computed state.entities from the withEntities , because this local filter is going to replace
      // the ids array of the state with the filtered ids array, and the state.entities depends on it,
      // so hour filter function needs the full list of entities always which will be always so we get them from entityMap
      const entities = computed(() => Object.values(entitiesMap()));
      const filterEntities = rxMethod<{
        filter: Filter;
        debounce?: number;
        patch?: boolean;
        forceLoad?: boolean;
      }>(
        pipe(
          debounceFilterPipe(filter, config.defaultDebounce),
          tap((value) => {
            const newEntities = entities().filter((entity) => {
              return filterFn(entity, value.filter);
            });
            patchState(
              state as StateSignal<EntitiesFilterState<Filter>>,
              {
                [filterKey]: value.filter,
              },
              {
                [idsKey]: newEntities.map((entity) => entity.id),
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
  );
}
