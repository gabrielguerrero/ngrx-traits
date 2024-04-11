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
  debounceFilterPipe,
  getWithEntitiesFilterKeys,
} from './with-entities-filter.util';

export type EntitiesFilterState<Filter> = { entitiesFilter: Filter };
export type NamedEntitiesFilterState<Collection extends string, Filter> = {
  [K in Collection as `${K}Filter`]: Filter;
};

export type EntitiesFilterComputed = {
  isEntitiesFilterChanged: Signal<boolean>;
};
export type NamedEntitiesFilterComputed<Collection extends string> = {
  [K in Collection as `is${Capitalize<string & K>}FilterChanged`]: Signal<boolean>;
};

export type EntitiesFilterMethods<Filter> = {
  filterEntities: (
    options:
      | {
          filter: Filter;
          debounce?: number;
          patch?: false | undefined;
          forceLoad?: boolean;
        }
      | {
          filter: Partial<Filter>;
          debounce?: number;
          patch: true;
          forceLoad?: boolean;
        },
  ) => void;
  resetEntitiesFilter: () => void;
};
export type NamedEntitiesFilterMethods<Collection extends string, Filter> = {
  [K in Collection as `filter${Capitalize<string & K>}Entities`]: (
    options:
      | {
          filter: Filter;
          debounce?: number;
          patch?: false | undefined;
          forceLoad?: boolean;
        }
      | {
          filter: Partial<Filter>;
          debounce?: number;
          patch: true;
          forceLoad?: boolean;
        },
  ) => void;
} & {
  [K in Collection as `reset${Capitalize<string & K>}Filter`]: () => void;
};

/**
 * Generates necessary state, computed and methods for locally filtering entities in the store,
 * the generated filter[collenction]Entities method will filter the entities based on the filter function
 * and is debounced by default. Requires withEntities to be used.
 *
 * @param config
 * @param config.filterFn - The function that will be used to filter the entities
 * @param config.defaultFilter - The default filter to be used
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
 *  // generates the following signals
 *  store.productsFilter // { search: string }
 *  // generates the following methods signals
 * store.filterProductsEntities  // (options: { filter: { search: string }, debounce?: number, patch?: boolean, forceLoad?: boolean }) => void
 */
export function withEntitiesLocalFilter<
  Entity extends { id: string | number },
  Filter extends Record<string, unknown>,
>(options: {
  filterFn: (entity: Entity, filter?: Filter) => boolean;
  defaultFilter: Filter;
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
 * and is debounced by default. Requires withEntities to be used.
 *
 * @param config
 * @param config.filterFn - The function that will be used to filter the entities
 * @param config.defaultFilter - The default filter to be used
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
 *  // generates the following signals
 *  store.productsFilter // { search: string }
 *  // generates the following methods signals
 * store.filterProductsEntities  // (options: { filter: { search: string }, debounce?: number, patch?: boolean, forceLoad?: boolean }) => void
 */
export function withEntitiesLocalFilter<
  Entity extends { id: string | number },
  Collection extends string,
  Filter extends Record<string, unknown>,
>(options: {
  filterFn: (entity: Entity, filter?: Filter) => boolean;
  defaultFilter: Filter;
  entity?: Entity;
  collection?: Collection;
}): SignalStoreFeature<
  // TODO: the problem seems be with the state pro, when set to any
  //  it works but is it has a namedstate it doesnt
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
  entity?: Entity;
  collection?: Collection;
}): SignalStoreFeature<any, any> {
  const { entityMapKey, idsKey } = getWithEntitiesKeys(config);
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
          debounceFilterPipe(filter),
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
