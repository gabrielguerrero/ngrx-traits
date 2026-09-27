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
import { EntityId, EntityMap, SelectEntityId } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap } from 'rxjs';

import {
  LiteralCollection,
  NamedEntitiesRequirement,
  RequireEntities,
} from '../feature-requirements.model';
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
import { EntitySelectionId } from './with-entities-selection.model';
import {
  EntitiesSingleSelectionComputed,
  EntitiesSingleSelectionMethods,
  EntitiesSingleSelectionState,
  NamedEntitiesSingleSelectionComputed,
  NamedEntitiesSingleSelectionMethods,
  NamedEntitiesSingleSelectionState,
} from './with-entities-single-selection.model';
import { getEntitiesSingleSelectionKeys } from './with-entities-single-selection.util';

type EntitiesSingleSelectionFeature<
  Entity,
  Collection extends string,
  Id extends EntityId,
> = Collection extends ''
  ? UnnamedEntitiesSingleSelectionFeature<Entity, Id>
  : NamedEntitiesSingleSelectionFeature<Entity, Collection, Id>;
type UnnamedEntitiesSingleSelectionFeature<Entity, Id extends EntityId> = {
  state: EntitiesSingleSelectionState<Id>;
  props: EntitiesSingleSelectionComputed<Entity>;
  methods: EntitiesSingleSelectionMethods<Id>;
};
type NamedEntitiesSingleSelectionFeature<
  Entity,
  Collection extends string,
  Id extends EntityId,
> = {
  state: NamedEntitiesSingleSelectionState<Collection, Id>;
  props: NamedEntitiesSingleSelectionComputed<Entity, Collection>;
  methods: NamedEntitiesSingleSelectionMethods<Collection, Id>;
};

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
 *  // ids are typed from the entity's `id` prop, or string | number when the
 *  // config has a selectId
 *  store.productIdSelected // Product['id'] | undefined
 *  // generates the following computed signals
 *  store.productEntitySelected // Entity | undefined
 *  // generates the following methods
 *  store.selectProductEntity // (config: { id: Product['id'] }) => void
 *  store.deselectProductEntity // () => void
 *  store.toggleSelectProductEntity // (config: { id: Product['id'] }) => void
 */

// the two args version is split into literal collection, generic collection
// and no collection overloads instead of using a Collection extends ''
// conditional, typescript can not resolve that conditional when Collection is
// a generic param, which breaks custom generic store features (issue #92), the
// literal overload keeps the readable missing feature error
export function withEntitiesSingleSelection<
  Input extends SignalStoreFeatureResult,
  Entity,
  Collection extends string,
  SelectId extends SelectEntityId<NoInfer<Entity>> | undefined = undefined,
>(
  entityConfig: {
    entity: Entity;
    collection: LiteralCollection<Collection>;
    // not used at runtime, only for the id type (string | number with it).
    // The NoInfer member types an inline arrow, SelectId records its presence
    selectId?: NoInfer<SelectEntityId<Entity>> | SelectId;
  },
  options?: FeatureConfigFactory<
    Input,
    {
      clearOnFilter?: boolean;
      clearOnRemoteSort?: boolean;
      defaultSelectedId?: NoInfer<EntitySelectionId<Entity, SelectId>>;
      entity?: never;
      collection?: never;
      selectId?: never;
    }
  >,
): SignalStoreFeature<
  Input &
    RequireEntities<Input, Entity, Collection, 'withEntitiesSingleSelection'>,
  NamedEntitiesSingleSelectionFeature<
    Entity,
    Collection,
    EntitySelectionId<Entity, SelectId>
  >
>;
export function withEntitiesSingleSelection<
  Input extends SignalStoreFeatureResult,
  Entity,
  Collection extends string,
  SelectId extends SelectEntityId<NoInfer<Entity>> | undefined = undefined,
>(
  entityConfig: {
    entity: Entity;
    collection: Collection;
    // not used at runtime, only for the id type (string | number with it).
    // The NoInfer member types an inline arrow, SelectId records its presence
    selectId?: NoInfer<SelectEntityId<Entity>> | SelectId;
  },
  options?: FeatureConfigFactory<
    Input,
    {
      clearOnFilter?: boolean;
      clearOnRemoteSort?: boolean;
      defaultSelectedId?: NoInfer<EntitySelectionId<Entity, SelectId>>;
      entity?: never;
      collection?: never;
      selectId?: never;
    }
  >,
): SignalStoreFeature<
  Input & NamedEntitiesRequirement<Entity, Collection>,
  NamedEntitiesSingleSelectionFeature<
    Entity,
    Collection,
    EntitySelectionId<Entity, SelectId>
  >
>;
export function withEntitiesSingleSelection<
  Input extends SignalStoreFeatureResult,
  Entity,
  SelectId extends SelectEntityId<NoInfer<Entity>> | undefined = undefined,
>(
  entityConfig: {
    entity: Entity;
    collection?: never;
    // not used at runtime, only for the id type (string | number with it).
    // The NoInfer member types an inline arrow, SelectId records its presence
    selectId?: NoInfer<SelectEntityId<Entity>> | SelectId;
  },
  options?: FeatureConfigFactory<
    Input,
    {
      clearOnFilter?: boolean;
      clearOnRemoteSort?: boolean;
      defaultSelectedId?: NoInfer<EntitySelectionId<Entity, SelectId>>;
      entity?: never;
      collection?: never;
      selectId?: never;
    }
  >,
): SignalStoreFeature<
  Input & RequireEntities<Input, Entity, '', 'withEntitiesSingleSelection'>,
  UnnamedEntitiesSingleSelectionFeature<
    Entity,
    EntitySelectionId<Entity, SelectId>
  >
>;
// the one arg version is declared after the two args ones, so a config
// without options resolves to the two args overloads, that also work when
// Collection is a generic param (issue #92)
export function withEntitiesSingleSelection<
  Input extends SignalStoreFeatureResult,
  Entity,
  Collection extends string = '',
  SelectId extends SelectEntityId<NoInfer<Entity>> | undefined = undefined,
>(
  configFactory: FeatureConfigFactory<
    Input,
    {
      entity: Entity;
      collection?: Collection;
      // not used at runtime, only for the id type (string | number with it).
      // The NoInfer member types an inline arrow, SelectId records its presence
      selectId?: NoInfer<SelectEntityId<Entity>> | SelectId;
      clearOnFilter?: boolean;
      clearOnRemoteSort?: boolean;
      defaultSelectedId?: NoInfer<EntitySelectionId<Entity, SelectId>>;
    }
  >,
): SignalStoreFeature<
  Input &
    RequireEntities<Input, Entity, Collection, 'withEntitiesSingleSelection'>,
  EntitiesSingleSelectionFeature<
    Entity,
    Collection,
    EntitySelectionId<Entity, SelectId>
  >
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
            return id != null ? entityMap()[id] : undefined;
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
