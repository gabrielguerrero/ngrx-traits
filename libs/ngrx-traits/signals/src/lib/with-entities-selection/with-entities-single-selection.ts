import { computed, Signal } from '@angular/core';
import {
  patchState,
  signalStoreFeature,
  SignalStoreFeature,
  withComputed,
  withMethods,
  withState,
  WritableStateSource,
} from '@ngrx/signals';
import {
  EntityComputed,
  EntityMap,
  EntityState,
  NamedEntityComputed,
  NamedEntityState,
} from '@ngrx/signals/entities';

import { getWithEntitiesKeys } from '../util';
import { getWithEntitiesFilterEvents } from '../with-entities-filter/with-entities-filter.util';
import { getWithEntitiesRemoteSortEvents } from '../with-entities-sort/with-entities-remote-sort.util';
import {
  onEvent,
  withEventHandler,
} from '../with-event-handler/with-event-handler';
import {
  EntitiesSingleSelectionComputed,
  EntitiesSingleSelectionMethods,
  EntitiesSingleSelectionState,
  NamedEntitiesSingleSelectionComputed,
  NamedEntitiesSingleSelectionMethods,
  NamedEntitiesSingleSelectionState,
} from './with-entities-single-selection.model';
import { getEntitiesSingleSelectionKeys } from './with-entities-single-selection.util';

/**
 * Generates state, computed and methods for single selection of entities.
 *
 * Requires withEntities to be present before this function.
 * @param config
 * @param config.collection - The collection name
 * @param config.entity - The entity type
 * @param config.clearOnFilter - Clear the selected entity when the filter changes (default: true)
 * @param config.clearOnRemoteSort - Clear the selected entity when the remote sort changes (default: true)
 *
 * @example
 * const entity = type<Product>();
 * const collection = 'products';
 * export const store = signalStore(
 *   { providedIn: 'root' },
 *   // Required withEntities and withCallStatus
 *   withEntities({ entity, collection }),
 *   withCallStatus({ prop: collection, initialValue: 'loading' }),
 *
 *   withEntitiesSingleSelection({
 *     entity,
 *     collection,
 *   }),
 *  );
 *
 *  // generates the following signals
 *  store.productsIdSelected // string | number | undefined
 *  // generates the following computed signals
 *  store.productsEntitySelected // Entity | undefined
 *  // generates the following methods
 *  store.selectProductEntity // (config: { id: string | number }) => void
 *  store.deselectProductEntity // (config: { id: string | number }) => void
 *  store.toggleProductEntity // (config: { id: string | number }) => void
 */
export function withEntitiesSingleSelection<
  Entity,
  Collection extends string,
>(config?: {
  entity: Entity;
  collection: Collection;
  clearOnFilter?: boolean;
  clearOnRemoteSort?: boolean;
}): SignalStoreFeature<
  {
    state: NamedEntityState<Entity, Collection>;
    computed: NamedEntityComputed<Entity, Collection>;
    methods: {};
  },
  {
    state: NamedEntitiesSingleSelectionState<Collection>;
    computed: NamedEntitiesSingleSelectionComputed<Entity, Collection>;
    methods: NamedEntitiesSingleSelectionMethods<Collection>;
  }
>;

/**
 * Generates state, computed and methods for single selection of entities.
 *
 * Requires withEntities to be present before this function.
 * @param config
 * @param config.collection - The collection name
 * @param config.entity - The entity type
 * @param config.clearOnFilter - Clear the selected entity when the filter changes (default: true)
 * @param config.clearOnRemoteSort - Clear the selected entity when the remote sort changes (default: true)
 * @example
 * const entity = type<Product>();
 * const collection = 'products';
 * export const store = signalStore(
 *   { providedIn: 'root' },
 *   // Required withEntities and withCallStatus
 *   withEntities({ entity, collection }),
 *   withCallStatus({ prop: collection, initialValue: 'loading' }),
 *
 *   withEntitiesSingleSelection({
 *     entity,
 *     collection,
 *   }),
 *  );
 *
 *  // generates the following signals
 *  store.productsIdSelected // string | number | undefined
 *  // generates the following computed signals
 *  store.productsEntitySelected // Entity | undefined
 *  // generates the following methods
 *  store.selectProductEntity // (config: { id: string | number }) => void
 *  store.deselectProductEntity // (config: { id: string | number }) => void
 *  store.toggleProductEntity // (config: { id: string | number }) => void
 */

export function withEntitiesSingleSelection<Entity>(config?: {
  entity: Entity;
  clearOnFilter?: boolean;
  clearOnRemoteSort?: boolean;
}): SignalStoreFeature<
  {
    state: EntityState<Entity>;
    computed: EntityComputed<Entity>;
    methods: {};
  },
  {
    state: EntitiesSingleSelectionState;
    computed: EntitiesSingleSelectionComputed<Entity>;
    methods: EntitiesSingleSelectionMethods;
  }
>;
export function withEntitiesSingleSelection<
  Entity,
  Collection extends string,
>(config?: {
  entity: Entity;
  collection?: Collection;
  clearOnFilter?: boolean;
  clearOnRemoteSort?: boolean;
}): SignalStoreFeature<any, any> {
  const { entityMapKey } = getWithEntitiesKeys(config);
  const {
    selectedEntityKey,
    selectEntityKey,
    deselectEntityKey,
    toggleEntityKey,
    selectedIdKey,
  } = getEntitiesSingleSelectionKeys(config);

  const { entitiesFilterChanged } = getWithEntitiesFilterEvents(config);
  const { entitiesRemoteSortChanged } = getWithEntitiesRemoteSortEvents(config);

  return signalStoreFeature(
    withState({ [selectedIdKey]: undefined }),
    withComputed((state: Record<string, Signal<unknown>>) => {
      const entityMap = state[entityMapKey] as Signal<EntityMap<Entity>>;
      const selectedId = state[selectedIdKey] as Signal<
        string | number | undefined
      >;
      return {
        [selectedEntityKey]: computed(() => {
          const id = selectedId();
          return id ? entityMap()[id] : undefined;
        }),
      };
    }),
    withMethods((state: Record<string, Signal<unknown>>) => {
      const entityMap = state[entityMapKey] as Signal<EntityMap<Entity>>;
      const selectedId = state[selectedIdKey] as Signal<
        string | number | undefined
      >;
      const deselectEntity = () => {
        patchState(state as WritableStateSource<object>, {
          [selectedIdKey]: undefined,
        });
      };
      return {
        [selectEntityKey]: ({ id }: { id: string | number }) => {
          patchState(state as WritableStateSource<object>, {
            [selectedIdKey]: entityMap()[id] ? id : undefined,
          });
        },
        [deselectEntityKey]: deselectEntity,
        [toggleEntityKey]: ({ id }: { id: string | number }) => {
          patchState(state as WritableStateSource<object>, {
            [selectedIdKey]: selectedId() === id ? undefined : id,
          });
        },
      };
    }),
    withEventHandler((state) => {
      const clearOnFilter = config?.clearOnFilter ?? true;
      const clearOnRemoteSort = config?.clearOnRemoteSort ?? true;
      const events = [];
      if (clearOnFilter) {
        events.push(
          onEvent(entitiesFilterChanged, () => {
            const deselectEntity = state[deselectEntityKey] as () => void;
            deselectEntity();
          }),
        );
      }
      if (clearOnRemoteSort) {
        events.push(
          onEvent(entitiesRemoteSortChanged, () => {
            const deselectEntity = state[deselectEntityKey] as () => void;
            deselectEntity();
          }),
        );
      }
      return events;
    }),
  );
}
