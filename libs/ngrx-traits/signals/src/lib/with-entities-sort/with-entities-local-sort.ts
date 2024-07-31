import { effect, Signal, untracked } from '@angular/core';
import {
  patchState,
  signalStoreFeature,
  SignalStoreFeature,
  SignalStoreFeatureResult,
  withHooks,
  withMethods,
  withState,
  WritableStateSource,
} from '@ngrx/signals';
import {
  EntityComputed,
  EntityState,
  NamedEntityComputed,
  NamedEntityState,
  SelectEntityId,
} from '@ngrx/signals/entities';

import { getWithEntitiesKeys } from '../util';
import { getWithCallStatusKeys } from '../with-call-status/with-call-status.util';
import { getWithEntitiesFilterEvents } from '../with-entities-filter/with-entities-filter.util';
import {
  broadcast,
  onEvent,
  withEventHandler,
} from '../with-event-handler/with-event-handler';
import { withFeatureFactory } from '../with-store/with-feature-factory';
import {
  FeatureConfigFactory,
  getFeatureConfig,
  StoreSource,
} from '../with-store/with-feature-factory.model';
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
 * @param configFactory - The configuration object for the feature or a factory function that receives the store and returns the configuration object
 * @param configFactory.defaultSort - The default sort to be applied to the entities
 * @param configFactory.entity - The type entity to be used
 * @param configFactory.collection - The name of the collection for which will be sorted
 * @param configFactory.selectId - The function to use to select the id of the entity
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
  Input extends SignalStoreFeatureResult,
  Entity,
  Collection extends string = '',
>(
  configFactory: FeatureConfigFactory<
    Input,
    {
      defaultSort: Sort<NoInfer<Entity>>;
      entity: Entity;
      collection?: Collection;
      selectId?: SelectEntityId<Entity>;
    }
  >,
): SignalStoreFeature<
  Input &
    (Collection extends ''
      ? {
          state: EntityState<Entity>;
          computed: EntityComputed<Entity>;
          methods: {};
        }
      : {
          state: NamedEntityState<Entity, Collection>;
          computed: NamedEntityComputed<Entity, Collection>;
          methods: {};
        }),
  Collection extends ''
    ? {
        state: EntitiesSortState<Entity>;
        computed: {};
        methods: EntitiesSortMethods<Entity>;
      }
    : {
        state: NamedEntitiesSortState<Entity, Collection>;
        computed: {};
        methods: NamedEntitiesSortMethods<Entity, Collection>;
      }
> {
  return withFeatureFactory((store: StoreSource<Input>) => {
    const { defaultSort, ...config } = getFeatureConfig(configFactory, store);
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
            const sort = newSort ?? (state[sortKey]() as Sort<Entity>);
            patchState(state as WritableStateSource<object>, {
              [sortKey]: sort,
              [idsKey]: sortData(state[entitiesKey]() as Entity[], sort).map(
                (entity) =>
                  config.selectId
                    ? config.selectId(entity)
                    : (entity as any).id,
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
        const { loadedKey } = getWithCallStatusKeys({
          prop: config?.collection,
        });
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
  }) as any;
}
