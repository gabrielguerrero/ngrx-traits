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
  EntityId,
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
  EntitiesMultiSelectionComputed,
  EntitiesMultiSelectionMethods,
  EntitiesMultiSelectionState,
  NamedEntitiesMultiSelectionComputed,
  NamedEntitiesMultiSelectionMethods,
  NamedEntitiesMultiSelectionState,
} from './with-entities-multi-selection.model';
import { getEntitiesMultiSelectionKeys } from './with-entities-multi-selection.util';

/**
 * Generates state, signals and methods for multi selection of entities.
 * Warning: isAll[Collection]Selected and toggleSelectAll[Collection] wont work
 * correctly in using remote pagination, because they cant select all the data.
 *
 * Requires withEntities to be used before this feature.
 * @param config
 * @param config.entity - the entity type
 * @param config.collection - the collection name
 * @param config.clearOnFilter - Clear the selected entity when the filter changes (default: true)
 * @param config.clearOnRemoteSort - Clear the selected entity when the remote sort changes (default: true)
 *
 * @example
 * const entity = type<Product>();
 * const collection = 'products';
 * export const store = signalStore(
 *   { providedIn: 'root' },
 *   withEntities({ entity, collection }),
 *   withEntitiesMultiSelection({ entity, collection }),
 *   );
 *
 * // generates the following signals
 * store.productsIdsSelectedMap // Record<string | number, boolean>;
 * // generates the following computed signals
 * store.productsEntitiesSelected // Entity[];
 * store.isAllProductsSelected // 'all' | 'none' | 'some';
 * // generates the following methods
 * store.selectProducts // (config: { id: string | number } | { ids: (string | number)[] }) => void;
 * store.deselectProducts // (config: { id: string | number } | { ids: (string | number)[] }) => void;
 * store.toggleSelectProducts // (config: { id: string | number } | { ids: (string | number)[] }) => void;
 * store.toggleSelectAllProducts // () => void;
 */
export function withEntitiesMultiSelection<
  Entity,
  Collection extends string,
>(config: {
  entity: Entity;
  collection: Collection;
  clearOnFilter?: boolean;
  clearOnRemoteSort?: boolean;
}): SignalStoreFeature<
  // TODO: the problem seems be with the state pro, when set to empty
  //  it works but is it has a namedstate it doesnt
  {
    state: NamedEntityState<Entity, any>;
    signals: NamedEntitySignals<Entity, Collection>;
    methods: {};
  },
  {
    state: NamedEntitiesMultiSelectionState<Collection>;
    signals: NamedEntitiesMultiSelectionComputed<Entity, Collection>;
    methods: NamedEntitiesMultiSelectionMethods<Collection>;
  }
>;
/**
 * Generates state, signals and methods for multi selection of entities.
 * Warning: isAll[Collection]Selected and toggleSelectAll[Collection] wont work
 * correctly in using remote pagination, because they cant select all the data.
 *
 * Requires withEntities to be used before this feature.
 * @param config
 * @param config.entity - the entity type
 * @param config.collection - the collection name
 * @param config.clearOnFilter - Clear the selected entity when the filter changes (default: true)
 * @param config.clearOnRemoteSort - Clear the selected entity when the remote sort changes (default: true)
 *
 * @example
 * const entity = type<Product>();
 * const collection = 'products';
 * export const store = signalStore(
 *   { providedIn: 'root' },
 *   withEntities({ entity, collection }),
 *   withEntitiesMultiSelection({ entity, collection }),
 *   );
 *
 * // generates the following signals
 * store.productsIdsSelectedMap // Record<string | number, boolean>;
 * // generates the following computed signals
 * store.productsEntitiesSelected // Entity[];
 * store.isAllProductsSelected // 'all' | 'none' | 'some';
 * // generates the following methods
 * store.selectProducts // (config: { id: string | number } | { ids: (string | number)[] }) => void;
 * store.deselectProducts // (config: { id: string | number } | { ids: (string | number)[] }) => void;
 * store.toggleSelectProducts // (config: { id: string | number } | { ids: (string | number)[] }) => void;
 * store.toggleSelectAllProducts // () => void;
 */
export function withEntitiesMultiSelection<Entity>(config: {
  entity: Entity;
  clearOnFilter?: boolean;
  clearOnRemoteSort?: boolean;
}): SignalStoreFeature<
  {
    state: EntityState<Entity>;
    signals: EntitySignals<Entity>;
    methods: {};
  },
  {
    state: EntitiesMultiSelectionState;
    signals: EntitiesMultiSelectionComputed<Entity>;
    methods: EntitiesMultiSelectionMethods;
  }
>;

export function withEntitiesMultiSelection<
  Entity,
  Collection extends string,
>(config: {
  entity: Entity;
  collection?: Collection;
  clearOnFilter?: boolean;
  clearOnRemoteSort?: boolean;
}): SignalStoreFeature<any, any> {
  const { entityMapKey, idsKey } = getWithEntitiesKeys(config);
  const {
    selectedIdsMapKey,
    selectedEntitiesKey,
    selectedEntitiesIdsKey,
    deselectEntitiesKey,
    toggleSelectEntitiesKey,
    clearEntitiesSelectionKey,
    selectEntitiesKey,
    toggleSelectAllEntitiesKey,
    isAllEntitiesSelectedKey,
  } = getEntitiesMultiSelectionKeys(config);

  const { entitiesFilterChanged } = getWithEntitiesFilterEvents(config);
  const { entitiesRemoteSortChanged } = getWithEntitiesRemoteSortEvents(config);

  return signalStoreFeature(
    withState({ [selectedIdsMapKey]: {} }),
    withComputed((state: Record<string, Signal<unknown>>) => {
      const entityMap = state[entityMapKey] as Signal<EntityMap<Entity>>;
      const idsArray = state[idsKey] as Signal<Entity[]>;
      const selectedIdsMap = state[selectedIdsMapKey] as Signal<
        Record<string | number, boolean>
      >;
      const selectedIdsArray = computed(() =>
        Object.entries(selectedIdsMap()).reduce(
          (aux, [id, selected]) => {
            if (selected && entityMap()[id]) {
              aux.push(id);
            }
            return aux;
          },
          [] as (string | number)[],
        ),
      );
      return {
        [selectedEntitiesIdsKey]: selectedIdsArray,
        [selectedEntitiesKey]: computed(() => {
          return selectedIdsArray().map((id) => entityMap()[id]);
        }),
        [isAllEntitiesSelectedKey]: computed(() => {
          const ids = selectedIdsArray();

          if (ids.length === 0) {
            return 'none';
          }
          if (ids.length === idsArray().length) {
            return 'all';
          }
          return 'some';
        }),
      };
    }),
    withEventHandler((state) => {
      const clearOnFilter = config?.clearOnFilter ?? true;
      const clearOnRemoteSort = config?.clearOnRemoteSort ?? true;
      const events = [];
      if (clearOnFilter) {
        events.push(
          onEvent(entitiesFilterChanged, () => {
            clearEntitiesSelection(state, selectedIdsMapKey);
          }),
        );
      }
      if (clearOnRemoteSort) {
        events.push(
          onEvent(entitiesRemoteSortChanged, () => {
            clearEntitiesSelection(state, selectedIdsMapKey);
          }),
        );
      }
      return events;
    }),
    withMethods((state: Record<string, Signal<unknown>>) => {
      const selectedIdsMap = state[selectedIdsMapKey] as Signal<
        Record<string | number, boolean>
      >;
      const isAllEntitiesSelected = state[isAllEntitiesSelectedKey] as Signal<
        'all' | 'none' | 'some'
      >;

      const idsArray = state[idsKey] as Signal<EntityId[]>;

      return {
        [selectEntitiesKey]: (
          options: { id: string | number } | { ids: (string | number)[] },
        ) => {
          const ids = 'id' in options ? [options.id] : options.ids;
          const idsMap = ids.reduce(
            (acc, id) => {
              acc[id] = true;
              return acc;
            },
            {} as Record<string | number, boolean>,
          );

          patchState(state as StateSignal<object>, {
            [selectedIdsMapKey]: { ...selectedIdsMap(), ...idsMap },
          });
        },
        [deselectEntitiesKey]: (
          options: { id: string | number } | { ids: (string | number)[] },
        ) => {
          const ids = 'id' in options ? [options.id] : options.ids;
          const idsMap = ids.reduce(
            (acc, id) => {
              acc[id] = false;
              return acc;
            },
            {} as Record<string | number, boolean>,
          );
          patchState(state as StateSignal<object>, {
            [selectedIdsMapKey]: { ...selectedIdsMap(), ...idsMap },
          });
        },
        [toggleSelectEntitiesKey]: (
          options: { id: string | number } | { ids: (string | number)[] },
        ) => {
          const ids = 'id' in options ? [options.id] : options.ids;
          const oldIdsMap = selectedIdsMap();
          const idsMap = ids.reduce(
            (acc, id) => {
              acc[id] = !oldIdsMap[id];
              return acc;
            },
            {} as Record<string | number, boolean>,
          );
          patchState(state as StateSignal<object>, {
            [selectedIdsMapKey]: { ...oldIdsMap, ...idsMap },
          });
        },
        [clearEntitiesSelectionKey]: () => {
          clearEntitiesSelection(state, selectedIdsMapKey);
        },
        [toggleSelectAllEntitiesKey]: () => {
          const allSelected = isAllEntitiesSelected();
          if (allSelected === 'all') {
            patchState(state as StateSignal<object>, {
              [selectedIdsMapKey]: {},
            });
          } else {
            const idsMap = idsArray().reduce(
              (acc, id) => {
                acc[id] = true;
                return acc;
              },
              {} as Record<string | number, boolean>,
            );
            patchState(state as StateSignal<object>, {
              [selectedIdsMapKey]: idsMap,
            });
          }
        },
      };
    }),
  );
}
function clearEntitiesSelection(
  state: Record<string, Signal<unknown>>,
  selectedIdsMapKey: string,
) {
  patchState(state as StateSignal<object>, {
    [selectedIdsMapKey]: {},
  });
}
