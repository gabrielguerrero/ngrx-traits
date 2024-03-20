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
import { StateSignal } from '@ngrx/signals/src/state-signal';

import { capitalize, getWithEntitiesKeys } from '../util';

export type EntitiesSingleSelectionState = {
  selectedId?: string | number;
};
export type NamedEntitiesSingleSelectionState<Collection extends string> = {
  [K in Collection as `${K}SelectedId`]?: string | number;
};

export type EntitiesSingleSelectionComputed<Entity> = {
  selectedEntity: Signal<Entity | undefined>;
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
    selectedIdKey: collection ? `${config.collection}SelectedId` : 'selectedId',
    selectedEntityKey: collection
      ? `${config.collection}SelectedEntity`
      : 'selectedEntity',
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
  );
}
