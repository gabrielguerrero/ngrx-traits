import { computed, Signal } from '@angular/core';
import {
  patchState,
  signalStoreFeature,
  SignalStoreFeature,
  SignalStoreFeatureResult,
  withComputed,
  withMethods,
  withState,
  WritableStateSource,
} from '@ngrx/signals';
import { EntityMap } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap } from 'rxjs';

import { RequireEntities } from '../feature-requirements.model';
import { getWithEntitiesKeys } from '../util';
import { getWithEntitiesFilterEvents } from '../with-entities-filter/with-entities-filter.util';
import { getWithEntitiesRemoteSortEvents } from '../with-entities-sort/with-entities-remote-sort.util';
import {
  onEvent,
  withEventHandler,
} from '../with-event-handler/with-event-handler';
import { withFeatureFactory } from '../with-feature-factory/with-feature-factory';
import {
  combineFeatureConfig,
  FeatureConfigFactory,
  getFeatureConfig,
  StoreSource,
} from '../with-feature-factory/with-feature-factory.model';
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
 * @param configFactory - The full feature config or a factory that receives the store and returns it, or — in the two-argument form — just the entityConfig (`entityConfig({ entity, collection })`)
 * @param configFactory.collection - The collection name
 * @param configFactory.entity - The entity type
 * @param configFactory.clearOnFilter - Clear the selected entity when the filter changes (default: true)
 * @param configFactory.clearOnRemoteSort - Clear the selected entity when the remote sort changes (default: true)
 * @param options - Two-argument form only: the behavior options, or a factory that receives the store and returns them
 * @example
 * const productEntityConfig = entityConfig({
 *   entity: type<Product>(),
 *   collection: 'product',
 * });
 * export const store = signalStore(
 *   { providedIn: 'root' },
 *   // Required withEntities and withCallStatus
 *   withEntities(productEntityConfig),
 *   withCallStatus({ prop: 'product', initialValue: 'loading' }),
 *
 *   withEntitiesSingleSelection(productEntityConfig),
 *  );
 *
 *  // generates the following signals
 *  store.productIdSelected // string | number | undefined
 *  // generates the following computed signals
 *  store.productEntitySelected // Entity | undefined
 *  // generates the following methods
 *  store.selectProductEntity // (config: { id: string | number }) => void
 *  store.deselectProductEntity // (config: { id: string | number }) => void
 *  store.toggleProductEntity // (config: { id: string | number }) => void
 */

export function withEntitiesSingleSelection<
  Input extends SignalStoreFeatureResult,
  Entity,
  Collection extends string = '',
>(
  configFactory: FeatureConfigFactory<
    Input,
    {
      entity: Entity;
      collection?: Collection;
      clearOnFilter?: boolean;
      clearOnRemoteSort?: boolean;
      defaultSelectedId?: string | number;
    }
  >,
): SignalStoreFeature<
  Input &
    RequireEntities<Input, Entity, Collection, 'withEntitiesSingleSelection'>,
  Collection extends ''
    ? {
        state: EntitiesSingleSelectionState;
        props: EntitiesSingleSelectionComputed<Entity>;
        methods: EntitiesSingleSelectionMethods;
      }
    : {
        state: NamedEntitiesSingleSelectionState<Collection>;
        props: NamedEntitiesSingleSelectionComputed<Entity, Collection>;
        methods: NamedEntitiesSingleSelectionMethods<Collection>;
      }
>;
export function withEntitiesSingleSelection<
  Input extends SignalStoreFeatureResult,
  Entity,
  Collection extends string = '',
>(
  entityConfig: {
    entity: Entity;
    collection?: Collection;
  },
  options?: FeatureConfigFactory<
    Input,
    {
      clearOnFilter?: boolean;
      clearOnRemoteSort?: boolean;
      defaultSelectedId?: string | number;
      entity?: never;
      collection?: never;
    }
  >,
): SignalStoreFeature<
  Input &
    RequireEntities<Input, Entity, Collection, 'withEntitiesSingleSelection'>,
  Collection extends ''
    ? {
        state: EntitiesSingleSelectionState;
        props: EntitiesSingleSelectionComputed<Entity>;
        methods: EntitiesSingleSelectionMethods;
      }
    : {
        state: NamedEntitiesSingleSelectionState<Collection>;
        props: NamedEntitiesSingleSelectionComputed<Entity, Collection>;
        methods: NamedEntitiesSingleSelectionMethods<Collection>;
      }
>;
export function withEntitiesSingleSelection<
  Input extends SignalStoreFeatureResult,
  Entity,
  Collection extends string = '',
>(
  configOrFactory: FeatureConfigFactory<
    Input,
    {
      entity: Entity;
      collection?: Collection;
      clearOnFilter?: boolean;
      clearOnRemoteSort?: boolean;
      defaultSelectedId?: string | number;
    }
  >,
  options?: FeatureConfigFactory<
    Input,
    {
      clearOnFilter?: boolean;
      clearOnRemoteSort?: boolean;
      defaultSelectedId?: string | number;
    }
  >,
): SignalStoreFeature<any, any> {
  const configFactory = combineFeatureConfig(
    configOrFactory,
    options,
  ) as typeof configOrFactory;
  return withFeatureFactory((store: StoreSource<Input>) => {
    const config = getFeatureConfig(configFactory, store);
    const { entityMapKey } = getWithEntitiesKeys(config);
    const {
      selectedEntityKey,
      selectEntityKey,
      deselectEntityKey,
      toggleEntityKey,
      selectedIdKey,
    } = getEntitiesSingleSelectionKeys(config);

    const { entitiesFilterChanged } = getWithEntitiesFilterEvents(config);
    const { entitiesRemoteSortChanged } =
      getWithEntitiesRemoteSortEvents(config);

    return signalStoreFeature(
      withState({ [selectedIdKey]: config.defaultSelectedId }),
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
          [selectEntityKey]: rxMethod<{ id: string | number } | undefined>(
            pipe(
              tap((item) => {
                if (!item) {
                  deselectEntity();
                  return;
                }
                patchState(state as WritableStateSource<object>, {
                  [selectedIdKey]: item.id,
                });
              }),
            ),
          ),
          [deselectEntityKey]: deselectEntity,
          [toggleEntityKey]: rxMethod<{ id: string | number } | undefined>(
            pipe(
              tap((item) => {
                if (!item) {
                  deselectEntity();
                  return;
                }
                patchState(state as WritableStateSource<object>, {
                  [selectedIdKey]:
                    selectedId() === item.id ? undefined : item.id,
                });
              }),
            ),
          ),
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
  }) as any;
}
