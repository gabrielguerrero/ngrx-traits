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
  EntityId,
  EntityMap,
  EntitySignals,
  NamedEntitySignals,
} from '@ngrx/signals/entities/src/models';
import { StateSignal } from '@ngrx/signals/src/state-signal';

import { capitalize, getWithEntitiesKeys } from '../util';
import { getWithEntitiesFilterKeys } from '../with-entities-filter/with-entities-filter.util';
import { getWithEntitiesLocalPaginationKeys } from '../with-entities-local-pagination/with-entities-local-pagination.util';
import { getWithEntitiesSortKeys } from '../with-entities-sort/with-entities-sort.util';

export type EntitiesMultiSelectionState = {
  selectedIdsMap: Record<string | number, boolean>;
};
export type NamedEntitiesMultiSelectionState<Collection extends string> = {
  [K in Collection as `${K}SelectedIdsMap`]: Record<string | number, boolean>;
};

export type EntitiesMultiSelectionComputed<Entity> = {
  selectedEntities: Signal<Entity[]>;
  isAllEntitiesSelected: Signal<'all' | 'none' | 'some'>;
};
export type NamedEntitiesMultiSelectionComputed<
  Entity,
  Collection extends string,
> = {
  [K in Collection as `${K}SelectedEntities`]: Signal<Entity[]>;
} & {
  [K in Collection as `isAll${Capitalize<string & K>}Selected`]: Signal<
    'all' | 'none' | 'some'
  >;
};
export type EntitiesMultiSelectionMethods = {
  selectEntities: (
    options: { id: string | number } | { ids: (string | number)[] },
  ) => void;
  deselectEntities: (
    options: { id: string | number } | { ids: (string | number)[] },
  ) => void;
  toggleSelectEntities: (
    options: { id: string | number } | { ids: (string | number)[] },
  ) => void;
  toggleSelectAllEntities: () => void;
  clearEntitiesSelection: () => void;
};
export type NamedEntitiesMultiSelectionMethods<Collection extends string> = {
  [K in Collection as `select${Capitalize<string & K>}Entities`]: (
    options: { id: string | number } | { ids: (string | number)[] },
  ) => void;
} & {
  [K in Collection as `deselect${Capitalize<string & K>}Entities`]: (
    options: { id: string | number } | { ids: (string | number)[] },
  ) => void;
} & {
  [K in Collection as `toggleSelect${Capitalize<string & K>}Entities`]: (
    options: { id: string | number } | { ids: (string | number)[] },
  ) => void;
} & {
  [K in Collection as `toggleSelectAll${Capitalize<
    string & K
  >}Entities`]: () => void;
};

function getEntitiesMultiSelectionKeys(config?: { collection?: string }) {
  const collection = config?.collection;
  const capitalizedProp = collection && capitalize(collection);
  return {
    selectedIdsMapKey: collection
      ? `${config.collection}SelectedIdsMap`
      : 'selectedIdsMap',
    selectedEntitiesKey: collection
      ? `${config.collection}SelectedEntities`
      : 'selectedEntities',
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
export function withEntitiesMultiSelection<
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
  const { entityMapKey, idsKey } = getWithEntitiesKeys(config);
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
          patchState(state as StateSignal<object>, {
            [selectedIdsMapKey]: {},
          });
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
    withHooks({
      onInit: (input) => {
        // we need reset the selections if to 0 when the filter or sorting changes
        if (filterKey in input || sortKey in input) {
          const filter = input[filterKey] as Signal<any>;
          const sort = input[sortKey] as Signal<any>;
          const clearEntitiesSelection = input[
            clearEntitiesSelectionKey
          ] as EntitiesMultiSelectionMethods['clearEntitiesSelection'];
          const previousFilter = filter?.();
          effect(
            () => {
              // we need to call filter or sort signals if available so
              // this effect gets call when they change
              sort?.();
              const newFilter = filter?.();
              // reset the selection if the filter changed or there is pagination
              if (input[paginationKey] || newFilter !== previousFilter) {
                clearEntitiesSelection();
              }
            },
            { allowSignalWrites: true },
          );
        }
      },
    }),
  );
}
