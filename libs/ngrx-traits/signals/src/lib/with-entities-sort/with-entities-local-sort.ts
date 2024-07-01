import { effect, Signal, untracked } from '@angular/core';
import {
  patchState,
  signalStoreFeature,
  SignalStoreFeature,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  EntityState,
  NamedEntityState,
  setAllEntities,
} from '@ngrx/signals/entities';
import {
  EntityComputed,
  NamedEntityComputed,
  SelectEntityId,
} from '@ngrx/signals/entities/src/models';
import type { StateSignal } from '@ngrx/signals/src/state-signal';

import { getWithEntitiesKeys } from '../util';
import { getWithCallStatusKeys } from '../with-call-status/with-call-status.util';
import { getWithEntitiesFilterEvents } from '../with-entities-filter/with-entities-filter.util';
import {
  broadcast,
  onEvent,
  withEventHandler,
} from '../with-event-handler/with-event-handler';
import {
  EntitiesSortMethods,
  EntitiesSortState,
  NamedEntitiesSortMethods,
  NamedEntitiesSortState,
  Sort,
} from './with-entities-local-sort.model';
import {
  getWithEntitiesLocalSortEvents,
  sortData,
} from './with-entities-local-sort.util';
import { getWithEntitiesSortKeys } from './with-entities-sort.util';

/**
 * Generates necessary state, computed and methods for sorting locally entities in the store.
 *
 * Requires withEntities to be present before this function
 * @param config
 * @param config.defaultSort - The default sort to be applied to the entities
 * @param config.entity - The type entity to be used
 * @param config.collection - The name of the collection for which will be sorted
 * @param config.selectId - The function to use to select the id of the entity
 *
 * @example
 * const entity = type<Product>();
 * const collection = 'products';
 * export const store = signalStore(
 *   { providedIn: 'root' },
 *   withEntities({ entity, collection }),
 *   withEntitiesLocalSort({
 *     entity,
 *     collection,
 *     defaultSort: { field: 'name', direction: 'asc' },
 *   }),
 * );
 * // generates the following signals
 * store.productsSort - the current sort applied to the products
 * // generates the following methods
 * store.sortProductsEntities({ sort: { field: 'name', direction: 'asc' } }) - sorts the products entities
 */
export function withEntitiesLocalSort<
  Entity,
  Collection extends string,
>(config: {
  defaultSort: Sort<Entity>;
  entity: Entity;
  collection: Collection;
  selectId?: SelectEntityId<Entity>;
}): SignalStoreFeature<
  {
    state: NamedEntityState<Entity, Collection>;
    computed: NamedEntityComputed<Entity, Collection>;
    methods: {};
  },
  {
    state: NamedEntitiesSortState<Entity, Collection>;
    computed: {};
    methods: NamedEntitiesSortMethods<Collection, Collection>;
  }
>;
/**
 * Generates necessary state, computed and methods for sorting locally entities in the store.
 *
 * Requires withEntities to be present before this function
 * @param config
 * @param config.defaultSort - The default sort to be applied to the entities
 * @param config.entity - The type entity to be used
 * @param config.collection - The name of the collection for which will be sorted
 * @param config.selectId - The function to use to select the id of the entity
 *
 * @example
 * const entity = type<Product>();
 * const collection = 'products';
 * export const store = signalStore(
 *   { providedIn: 'root' },
 *   withEntities({ entity, collection }),
 *   withEntitiesLocalSort({
 *     entity,
 *     collection,
 *     defaultSort: { field: 'name', direction: 'asc' },
 *   }),
 * );
 * // generates the following signals
 * store.productsSort - the current sort applied to the products
 * // generates the following methods
 * store.sortProductsEntities({ sort: { field: 'name', direction: 'asc' } }) - sorts the products entities
 */
export function withEntitiesLocalSort<Entity>(config: {
  defaultSort: Sort<Entity>;
  entity: Entity;
  selectId?: SelectEntityId<Entity>;
}): SignalStoreFeature<
  {
    state: EntityState<Entity>;
    computed: EntityComputed<Entity>;
    methods: {};
  },
  {
    state: EntitiesSortState<Entity>;
    computed: {};
    methods: EntitiesSortMethods<Entity>;
  }
>;
export function withEntitiesLocalSort<Entity, Collection extends string>({
  defaultSort,
  ...config
}: {
  defaultSort: Sort<Entity>;
  entity: Entity;
  collection?: Collection;
  selectId?: SelectEntityId<Entity>;
}): SignalStoreFeature<any, any> {
  const { entitiesKey, idsKey } = getWithEntitiesKeys(config);
  const { sortEntitiesKey, sortKey } = getWithEntitiesSortKeys(config);
  const { entitiesLocalSortChanged } = getWithEntitiesLocalSortEvents(config);

  return signalStoreFeature(
    withState({ [sortKey]: defaultSort }),
    withEventHandler(),
    withMethods((state: Record<string, Signal<unknown>>) => {
      return {
        [sortEntitiesKey]: ({
          sort: newSort,
        }: { sort?: Sort<Entity> } = {}) => {
          const sort = newSort ?? defaultSort;
          patchState(state as StateSignal<object>, {
            [sortKey]: sort,
            [idsKey]: sortData(state[entitiesKey]() as Entity[], sort).map(
              (entity) =>
                config.selectId ? config.selectId(entity) : (entity as any).id,
            ),
          });
          broadcast(state, entitiesLocalSortChanged({ sort }));
        },
      };
    }),
    withEventHandler((state: Record<string, unknown>) => {
      const sortEntities = state[sortEntitiesKey] as () => void;
      const { entitiesFilterChanged } = getWithEntitiesFilterEvents(config);
      return [onEvent(entitiesFilterChanged, () => sortEntities())];
    }),
    withHooks((state: Record<string, unknown>) => {
      const { loadedKey } = getWithCallStatusKeys({ prop: config?.collection });
      const loaded = state[loadedKey] as Signal<boolean> | undefined;
      return {
        onInit: () => {
          if (loaded) {
            const sortEntities = state[sortEntitiesKey] as () => void;
            effect(() => {
              if (loaded()) {
                untracked(() => {
                  sortEntities();
                });
              }
            });
          }
        },
      };
    }),
  );
}
