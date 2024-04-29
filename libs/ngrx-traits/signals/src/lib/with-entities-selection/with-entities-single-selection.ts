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
import {
  EntityMap,
  EntitySignals,
  NamedEntitySignals,
} from '@ngrx/signals/entities/src/models';
import type { StateSignal } from '@ngrx/signals/src/state-signal';

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
  Entity extends { id: string | number },
>(config?: {
  entity: Entity;
}): SignalStoreFeature<
  {
    state: EntityState<Entity>;
    signals: EntitySignals<Entity>;
    methods: {};
  },
  {
    state: EntitiesSingleSelectionState;
    signals: EntitiesSingleSelectionComputed<Entity>;
    methods: EntitiesSingleSelectionMethods;
  }
>;
/**
 * Generates state, computed and methods for single selection of entities.
 *
 * Requires withEntities to be present before this function.
 * @param config
 * @param config.collection - The collection name
 * @param config.entity - The entity type
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
  Entity extends { id: string | number },
  Collection extends string,
>(config?: {
  entity: Entity;
  collection?: Collection;
}): SignalStoreFeature<
  // TODO: the problem seems be with the state pro, when set to empty
  //  it works but is it has a namedstate it doesnt
  {
    state: NamedEntityState<Entity, any>;
    signals: NamedEntitySignals<Entity, Collection>;
    methods: {};
  },
  {
    state: NamedEntitiesSingleSelectionState<Collection>;
    signals: NamedEntitiesSingleSelectionComputed<Entity, Collection>;
    methods: NamedEntitiesSingleSelectionMethods<Collection>;
  }
>;
export function withEntitiesSingleSelection<
  Entity extends { id: string | number },
  Collection extends string,
>(config?: {
  entity: Entity;
  collection?: Collection;
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
      const selectedId = state[selectedIdKey] as Signal<
        string | number | undefined
      >;
      const deselectEntity = () => {
        patchState(state as StateSignal<object>, {
          [selectedIdKey]: undefined,
        });
      };
      return {
        [selectEntityKey]: ({ id }: { id: string | number }) => {
          patchState(state as StateSignal<object>, {
            [selectedIdKey]: id,
          });
        },
        [deselectEntityKey]: deselectEntity,
        [toggleEntityKey]: ({ id }: { id: string | number }) => {
          patchState(state as StateSignal<object>, {
            [selectedIdKey]: selectedId() === id ? undefined : id,
          });
        },
      };
    }),
    withEventHandler((state) => {
      return [
        onEvent(entitiesFilterChanged, entitiesRemoteSortChanged, () => {
          const deselectEntity = state[deselectEntityKey] as () => void;
          deselectEntity();
        }),
      ];
    }),
  );
}
