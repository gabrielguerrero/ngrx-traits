import { computed, effect, Signal } from '@angular/core';
import {
  patchState,
  signalStoreFeature,
  SignalStoreFeature,
  withComputed,
  withHooks,
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

import { capitalize, getWithEntitiesKeys } from '../util';
import { getWithEntitiesFilterKeys } from '../with-entities-filter/with-entities-filter.util';
import { getWithEntitiesLocalPaginationKeys } from '../with-entities-pagination/with-entities-local-pagination.util';
import { getWithEntitiesSortKeys } from '../with-entities-sort/with-entities-sort.util';

export type EntitiesSingleSelectionState = {
  entitiesSelectedId?: string | number;
};
export type NamedEntitiesSingleSelectionState<Collection extends string> = {
  [K in Collection as `${K}SelectedId`]?: string | number;
};

export type EntitiesSingleSelectionComputed<Entity> = {
  entitiesSelectedEntity: Signal<Entity | undefined>;
};
export type NamedEntitiesSingleSelectionComputed<
  Entity,
  Collection extends string,
> = {
  [K in Collection as `${K}SelectedEntity`]: Signal<Entity | undefined>;
};
export type EntitiesSingleSelectionMethods = {
  selectEntity: (options: { id: string | number }) => void;
  deselectEntity: (options: { id: string | number }) => void;
  toggleEntity: (options: { id: string | number }) => void;
};
export type NamedEntitiesSingleSelectionMethods<Collection extends string> = {
  [K in Collection as `select${Capitalize<string & K>}Entity`]: (options: {
    id: string | number;
  }) => void;
} & {
  [K in Collection as `deselect${Capitalize<string & K>}Entity`]: (options: {
    id: string | number;
  }) => void;
} & {
  [K in Collection as `toggle${Capitalize<string & K>}Entity`]: (options: {
    id: string | number;
  }) => void;
};

function getEntitiesSingleSelectionKeys(config?: { collection?: string }) {
  const collection = config?.collection;
  const capitalizedProp = collection && capitalize(collection);
  return {
    selectedIdKey: collection
      ? `${config.collection}SelectedId`
      : 'entitiesSelectedId',
    selectedEntityKey: collection
      ? `${config.collection}SelectedEntity`
      : 'entitiesSelectedEntity',
    selectEntityKey: collection
      ? `select${capitalizedProp}Entity`
      : 'selectEntity',
    deselectEntityKey: collection
      ? `deselect${capitalizedProp}Entity`
      : 'deselectEntity',
    toggleEntityKey: collection
      ? `toggle${capitalizedProp}Entity`
      : 'toggleEntity',
  };
}

/**
 * Generates state, computed and methods for single selection of entities. Requires withEntities to be present before this function.
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
 *  store.productsSelectedId // string | number | undefined
 *  // generates the following computed signals
 *  store.productsSelectedEntity // Entity | undefined
 *  // generates the following methods
 *  store.selectProductEntity // (options: { id: string | number }) => void
 *  store.deselectProductEntity // (options: { id: string | number }) => void
 *  store.toggleProductEntity // (options: { id: string | number }) => void
 */

export function withEntitiesSingleSelection<
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
    state: EntitiesSingleSelectionState;
    signals: EntitiesSingleSelectionComputed<Entity>;
    methods: EntitiesSingleSelectionMethods;
  }
>;
/**
 * Generates state, computed and methods for single selection of entities. Requires withEntities to be present before this function.
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
 *  store.productsSelectedId // string | number | undefined
 *  // generates the following computed signals
 *  store.productsSelectedEntity // Entity | undefined
 *  // generates the following methods
 *  store.selectProductEntity // (options: { id: string | number }) => void
 *  store.deselectProductEntity // (options: { id: string | number }) => void
 *  store.toggleProductEntity // (options: { id: string | number }) => void
 */
export function withEntitiesSingleSelection<
  Entity extends { id: string | number },
  Collection extends string,
>(options: {
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
    state: NamedEntitiesSingleSelectionState<Collection>;
    signals: NamedEntitiesSingleSelectionComputed<Entity, Collection>;
    methods: NamedEntitiesSingleSelectionMethods<Collection>;
  }
>;
export function withEntitiesSingleSelection<
  Entity extends { id: string | number },
  Collection extends string,
>(config: {
  entity?: Entity;
  collection?: Collection;
}): SignalStoreFeature<any, any> {
  const { entityMapKey } = getWithEntitiesKeys(config);
  const { filterKey } = getWithEntitiesFilterKeys(config);
  const { sortKey } = getWithEntitiesSortKeys(config);
  const { paginationKey } = getWithEntitiesLocalPaginationKeys(config);
  const {
    selectedEntityKey,
    selectEntityKey,
    deselectEntityKey,
    toggleEntityKey,
    selectedIdKey,
  } = getEntitiesSingleSelectionKeys(config);
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
      return {
        [selectEntityKey]: ({ id }: { id: string | number }) => {
          patchState(state as StateSignal<object>, {
            [selectedIdKey]: id,
          });
        },
        [deselectEntityKey]: () => {
          patchState(state as StateSignal<object>, {
            [selectedIdKey]: undefined,
          });
        },
        [toggleEntityKey]: ({ id }: { id: string | number }) => {
          patchState(state as StateSignal<object>, {
            [selectedIdKey]: selectedId() === id ? undefined : id,
          });
        },
      };
    }),
    withHooks((store) => ({
      onInit: () => {
        // we need reset the selections if to 0 when the filter changes or sorting changes and is paginated
        if (filterKey in store || sortKey in store) {
          const filter = store[filterKey] as Signal<unknown>;
          const sort = store[sortKey] as Signal<unknown>;
          const deselectEntity = store[deselectEntityKey] as () => void;
          let lastFilter = filter?.();
          let lastSort = sort?.();
          /** TODO: there is a small problem here when used together with withSyncToWebStorage an filter or sorting
           the stored selection will get cleared because this logic detects the sorting and the filtering changing
           from the default value to the stored value and resets the selection */
          effect(
            () => {
              if (
                (store[paginationKey] && lastSort !== sort?.()) ||
                lastFilter !== filter?.()
              ) {
                console.log(
                  'resetting selection',
                  store[paginationKey] && lastSort !== sort?.(),
                  lastFilter !== filter?.(),
                  { filter: filter?.(), sort: sort?.(), lastFilter, lastSort },
                );
                lastFilter = filter?.();
                lastSort = sort?.();
                deselectEntity();
              }
            },
            { allowSignalWrites: true },
          );
        }
      },
    })),
  );
}
