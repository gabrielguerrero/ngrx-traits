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
import { SelectEntityId } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { isObservable, map, Observable, pipe, tap } from 'rxjs';

import { RequireEntities } from '../feature-requirements.model';
import { getWithEntitiesKeys } from '../util';
import { getWithCallStatusKeys } from '../with-call-status/with-call-status.util';
import { getWithEntitiesFilterEvents } from '../with-entities-filter/with-entities-filter.util';
import {
  broadcast,
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
  CdkSort,
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

export { sortData };
/**
 * Generates necessary state, computed and methods for sorting locally entities in the store.
 *
 * Requires withEntities to be present before this function
 * @param configFactory - The full feature config or a factory that receives the store and returns it, or — in the two-argument form — just the entityConfig (`entityConfig({ entity, collection, selectId })`)
 * @param configFactory.defaultSort - The default sort to be applied to the entities
 * @param configFactory.entity - The type entity to be used
 * @param configFactory.collection - The name of the collection for which will be sorted
 * @param configFactory.selectId - The function to use to select the id of the entity
 * @param configFactory.sortFunction - Optional custom function use to sort the entities
 * @param options - Two-argument form only: the behavior options, or a factory that receives the store and returns them
 *
 * @example
 * const productEntityConfig = entityConfig({
 *   entity: type<Product>(),
 *   collection: 'product',
 * });
 * export const store = signalStore(
 *   { providedIn: 'root' },
 *   withEntities(productEntityConfig),
 *   withEntitiesLocalSort(productEntityConfig, {
 *     defaultSort: { field: 'name', direction: 'asc' },
 *   }),
 * );
 * // generates the following signals
 * store.productEntitiesSort - the current sort applied to the products
 * // generates the following methods
 * store.sortProductEntities({ sort: { field: 'name', direction: 'asc' } }) - sorts the products entities
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
      sortFunction?: (entities: Entity[], sort: Sort<Entity>) => Entity[];
    }
  >,
): SignalStoreFeature<
  Input & RequireEntities<Input, Entity, Collection, 'withEntitiesLocalSort'>,
  Collection extends ''
    ? {
        state: EntitiesSortState<Entity>;
        props: {};
        methods: EntitiesSortMethods<Entity>;
      }
    : {
        state: NamedEntitiesSortState<Entity, Collection>;
        props: {};
        methods: NamedEntitiesSortMethods<Entity, Collection>;
      }
>;
export function withEntitiesLocalSort<
  Input extends SignalStoreFeatureResult,
  Entity,
  Collection extends string = '',
>(
  entityConfig: {
    entity: Entity;
    collection?: Collection;
    selectId?: SelectEntityId<NoInfer<Entity>>;
  },
  options: FeatureConfigFactory<
    Input,
    {
      defaultSort: Sort<NoInfer<Entity>>;
      sortFunction?: (
        entities: NoInfer<Entity>[],
        sort: Sort<NoInfer<Entity>>,
      ) => NoInfer<Entity>[];
      entity?: never;
      collection?: never;
      selectId?: never;
    }
  >,
): SignalStoreFeature<
  Input & RequireEntities<Input, Entity, Collection, 'withEntitiesLocalSort'>,
  Collection extends ''
    ? {
        state: EntitiesSortState<Entity>;
        props: {};
        methods: EntitiesSortMethods<Entity>;
      }
    : {
        state: NamedEntitiesSortState<Entity, Collection>;
        props: {};
        methods: NamedEntitiesSortMethods<Entity, Collection>;
      }
>;
export function withEntitiesLocalSort<
  Input extends SignalStoreFeatureResult,
  Entity,
  Collection extends string = '',
>(
  configOrFactory: FeatureConfigFactory<Input, Record<string, any>>,
  options?: FeatureConfigFactory<Input, Record<string, any>>,
): SignalStoreFeature<any, any> {
  const configFactory = combineFeatureConfig(configOrFactory, options);
  return withFeatureFactory((store: StoreSource<Input>) => {
    const { defaultSort, ...config } = getFeatureConfig(
      configFactory,
      store,
    ) as {
      defaultSort: Sort<Entity>;
      entity: Entity;
      collection?: Collection;
      selectId?: SelectEntityId<Entity>;
      sortFunction?: (entities: Entity[], sort: Sort<Entity>) => Entity[];
    };
    const { entitiesKey, idsKey } = getWithEntitiesKeys(config);
    const { sortEntitiesKey, sortKey } = getWithEntitiesSortKeys(config);
    const { entitiesLocalSortChanged } = getWithEntitiesLocalSortEvents(config);

    return signalStoreFeature(
      withState({ [sortKey]: defaultSort }),
      withEventHandler(),
      withMethods((state: Record<string, Signal<unknown>>) => {
        const _sortEntities = rxMethod<{
          sort?: Sort<Entity> | CdkSort<Entity>;
          _emitEvent?: boolean;
        }>(
          pipe(
            tap((options) => {
              let newSort = options?.sort;
              if (newSort && 'active' in newSort)
                newSort = {
                  field: newSort.active,
                  direction: newSort.direction,
                };
              const sort = newSort ?? (state[sortKey]() as Sort<Entity>);
              patchState(state as WritableStateSource<object>, {
                [sortKey]: sort,
                [idsKey]: (config?.sortFunction
                  ? config.sortFunction(state[entitiesKey]() as Entity[], sort)
                  : sortData(state[entitiesKey]() as Entity[], sort)
                ).map((entity) =>
                  config.selectId
                    ? config.selectId(entity)
                    : (entity as any).id,
                ),
              });
              if (options?._emitEvent !== false)
                broadcast(state, entitiesLocalSortChanged({ sort }));
            }),
          ),
        );
        function normalizeToWrapped(options: unknown): {
          sort: Sort<Entity> | CdkSort<Entity>;
        } {
          if (
            options &&
            typeof options === 'object' &&
            ('field' in options || 'active' in options)
          ) {
            return { sort: options as Sort<Entity> | CdkSort<Entity> };
          }
          return options as { sort: Sort<Entity> | CdkSort<Entity> };
        }
        return {
          [sortEntitiesKey]: (options?: unknown) => {
            if (isObservable(options)) {
              return _sortEntities(
                (options as Observable<unknown>).pipe(
                  map((v) => normalizeToWrapped(v)),
                ),
              );
            }
            if (typeof options === 'function') {
              return _sortEntities(() =>
                normalizeToWrapped((options as () => unknown)()),
              );
            }
            return _sortEntities(normalizeToWrapped(options));
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
          collection: config?.collection,
        });
        const loaded = state[loadedKey] as Signal<boolean> | undefined;
        return {
          onInit: () => {
            if (loaded) {
              const sortEntities = state[sortEntitiesKey] as (options?: {
                _emitEvent?: boolean;
              }) => void;
              effect(() => {
                if (loaded()) {
                  untracked(() => {
                    sortEntities({ _emitEvent: false });
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
