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

import { capitalize, combineFunctions, getWithEntitiesKeys } from '../util';
import { getWithEntitiesFilterKeys } from '../with-entities-filter/with-entities-filter.util';
import { getWithEntitiesLocalPaginationKeys } from '../with-entities-pagination/with-entities-local-pagination.util';
import { getWithEntitiesSortKeys } from '../with-entities-sort/with-entities-sort.util';
import {
  EntitiesMultiSelectionComputed,
  EntitiesMultiSelectionMethods,
  EntitiesMultiSelectionState,
  NamedEntitiesMultiSelectionComputed,
  NamedEntitiesMultiSelectionMethods,
  NamedEntitiesMultiSelectionState,
} from './with-entities-multi-selection.model';

function getEntitiesMultiSelectionKeys(config?: { collection?: string }) {
  const collection = config?.collection;
  const capitalizedProp = collection && capitalize(collection);
  return {
    selectedIdsMapKey: collection
      ? `${config.collection}SelectedIdsMap`
      : 'entitiesSelectedIdsMap',
    selectedEntitiesKey: collection
      ? `${config.collection}SelectedEntities`
      : 'entitiesSelected',
    selectEntitiesKey: collection
      ? `select${capitalizedProp}Entities`
      : 'selectEntities',
    deselectEntitiesKey: collection
      ? `deselect${capitalizedProp}Entities`
      : 'deselectEntities',
    toggleSelectEntitiesKey: collection
      ? `toggleSelect${capitalizedProp}Entities`
      : 'toggleSelectEntities',
    toggleSelectAllEntitiesKey: collection
      ? `toggleSelectAll${capitalizedProp}Entities`
      : 'toggleSelectAllEntities',
    clearEntitiesSelectionKey: collection
      ? `clear${capitalizedProp}Selection`
      : 'clearEntitiesSelection',
    isAllEntitiesSelectedKey: collection
      ? `isAll${capitalizedProp}Selected`
      : 'isAllEntitiesSelected',
  };
}

/**
 * Generates state, signals and methods for multi selection of entities
 * @param config
 * @param config.entity - the entity type
 * @param config.collection - the collection name
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
 * store.productsSelectedIdsMap // Record<string | number, boolean>;
 * // generates the following computed signals
 * store.productsSelectedEntities // Entity[];
 * store.isAllProductsSelected // 'all' | 'none' | 'some';
 * // generates the following methods
 * store.selectProducts // (config: { id: string | number } | { ids: (string | number)[] }) => void;
 * store.deselectProducts // (config: { id: string | number } | { ids: (string | number)[] }) => void;
 * store.toggleSelectProducts // (config: { id: string | number } | { ids: (string | number)[] }) => void;
 * store.toggleSelectAllProducts // () => void;
 */
export function withEntitiesMultiSelection<
  Entity extends { id: string | number },
  Collection extends string,
>(config: {
  entity?: Entity;
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
    state: NamedEntitiesMultiSelectionState<Collection>;
    signals: NamedEntitiesMultiSelectionComputed<Entity, Collection>;
    methods: NamedEntitiesMultiSelectionMethods<Collection>;
  }
>;
export function withEntitiesMultiSelection<
  Entity extends { id: string | number },
>(options: {
  entity?: Entity;
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
/**
 * Generates state, signals and methods for multi selection of entities
 * @param config
 * @param config.entity - the entity type
 * @param config.collection - the collection name
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
 * store.productsSelectedIdsMap // Record<string | number, boolean>;
 * // generates the following computed signals
 * store.productsSelectedEntities // Entity[];
 * store.isAllProductsSelected // 'all' | 'none' | 'some';
 * // generates the following methods
 * store.selectProducts // (config: { id: string | number } | { ids: (string | number)[] }) => void;
 * store.deselectProducts // (config: { id: string | number } | { ids: (string | number)[] }) => void;
 * store.toggleSelectProducts // (config: { id: string | number } | { ids: (string | number)[] }) => void;
 * store.toggleSelectAllProducts // () => void;
 */
export function withEntitiesMultiSelection<
  Entity extends { id: string | number },
  Collection extends string,
>(config: {
  entity?: Entity;
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
    state: NamedEntitiesMultiSelectionState<Collection>;
    signals: NamedEntitiesMultiSelectionComputed<Entity, Collection>;
    methods: NamedEntitiesMultiSelectionMethods<Collection>;
  }
>;
export function withEntitiesMultiSelection<
  Entity extends { id: string | number },
  Collection extends string,
>(config: {
  entity?: Entity;
  collection?: Collection;
}): SignalStoreFeature<any, any> {
  const { entityMapKey, idsKey, clearEntitiesCacheKey } =
    getWithEntitiesKeys(config);
  const {
    selectedIdsMapKey,
    selectedEntitiesKey,
    deselectEntitiesKey,
    toggleSelectEntitiesKey,
    clearEntitiesSelectionKey,
    selectEntitiesKey,
    toggleSelectAllEntitiesKey,
    isAllEntitiesSelectedKey,
  } = getEntitiesMultiSelectionKeys(config);
  const { filterKey } = getWithEntitiesFilterKeys(config);
  const { sortKey } = getWithEntitiesSortKeys(config);
  const { paginationKey } = getWithEntitiesLocalPaginationKeys(config);
  return signalStoreFeature(
    withState({ [selectedIdsMapKey]: {} }),
    withComputed((state: Record<string, Signal<unknown>>) => {
      const entityMap = state[entityMapKey] as Signal<EntityMap<Entity>>;
      const idsArray = state[idsKey] as Signal<Entity[]>;
      const selectedIdsMap = state[selectedIdsMapKey] as Signal<
        Record<string | number, boolean>
      >;
      const selectedIdsArray = computed(() => Object.keys(selectedIdsMap()));
      return {
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
    withMethods((state: Record<string, Signal<unknown>>) => {
      const selectedIdsMap = state[selectedIdsMapKey] as Signal<
        Record<string | number, boolean>
      >;
      const isAllEntitiesSelected = state[isAllEntitiesSelectedKey] as Signal<
        'all' | 'none' | 'some'
      >;

      const idsArray = state[idsKey] as Signal<EntityId[]>;

      const clearEntitiesSelection = () => {
        patchState(state as StateSignal<object>, {
          [selectedIdsMapKey]: {},
        });
      };
      return {
        [clearEntitiesCacheKey]: combineFunctions(
          state[clearEntitiesCacheKey],
          () => {
            clearEntitiesSelection();
          },
        ),
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
        [clearEntitiesSelectionKey]: clearEntitiesSelection,
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
