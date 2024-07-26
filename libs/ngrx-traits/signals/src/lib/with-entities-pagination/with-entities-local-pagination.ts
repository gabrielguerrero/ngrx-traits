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
import { EntityState, NamedEntityState } from '@ngrx/signals/entities';
import { EntityComputed, NamedEntityComputed } from '@ngrx/signals/entities';

import { getWithEntitiesKeys } from '../util';
import { getWithEntitiesFilterEvents } from '../with-entities-filter/with-entities-filter.util';
import { getWithEntitiesLocalSortEvents } from '../with-entities-sort/with-entities-local-sort.util';
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
  EntitiesPaginationLocalComputed,
  EntitiesPaginationLocalMethods,
  EntitiesPaginationLocalState,
  NamedEntitiesPaginationLocalComputed,
  NamedEntitiesPaginationLocalMethods,
  NamedEntitiesPaginationLocalState,
} from './with-entities-local-pagination.model';
import {
  getWithEntitiesLocalPaginationEvents,
  getWithEntitiesLocalPaginationKeys,
} from './with-entities-local-pagination.util';

/**
 * Generates necessary state, computed and methods for local pagination of entities in the store.
 *
 * Requires withEntities to be present in the store.
 * @param configFactory - The configuration object for the feature or a factory function that receives the store and returns the configuration object
 * @param configFactory.pageSize - The number of entities to show per page
 * @param configFactory.currentPage - The current page to show
 * @param configFactory.entity - The entity type
 * @param configFactory.collection - The name of the collection
 *
 * @example
 * const entity = type<Product>();
 * const collection = 'products';
 * export const ProductsLocalStore = signalStore(
 *   { providedIn: 'root' },
 *   // required withEntities
 *   withEntities({ entity, collection }),
 *   withEntitiesLocalPagination({
 *     entity,
 *     collection,
 *     pageSize: 5,
 *   }),
 *
 *   // generates the following signals
 *   store.productsPagination // { currentPage: 0, pageSize: 5 }
 *   // generates the following computed signals
 *   store.productsCurrentPage // { entities: Product[], pageIndex: 0, total: 10, pageSize: 5, pagesCount: 2, hasPrevious: false, hasNext: true }
 *   // generates the following methods
 *   store.loadProductsPage // ({ pageIndex: number }) => void
 */

export function withEntitiesLocalPagination<
  Input extends SignalStoreFeatureResult,
  Entity,
  Collection extends string = '',
>(
  configFactory: FeatureConfigFactory<
    Input,
    {
      pageSize?: number;
      currentPage?: number;
      entity: Entity;
      collection?: Collection;
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
        state: EntitiesPaginationLocalState;
        computed: EntitiesPaginationLocalComputed<Entity>;
        methods: EntitiesPaginationLocalMethods;
      }
    : {
        state: NamedEntitiesPaginationLocalState<Collection>;
        computed: NamedEntitiesPaginationLocalComputed<Entity, Collection>;
        methods: NamedEntitiesPaginationLocalMethods<Collection>;
      }
> {
  return withFeatureFactory((store: StoreSource<Input>) => {
    const {
      pageSize = 10,
      currentPage = 0,
      ...config
    } = getFeatureConfig(configFactory, store);
    const { entitiesKey } = getWithEntitiesKeys(config);
    const { loadEntitiesPageKey, entitiesCurrentPageKey, paginationKey } =
      getWithEntitiesLocalPaginationKeys(config);
    const { entitiesFilterChanged } = getWithEntitiesFilterEvents(config);
    const { entitiesLocalPageChanged } =
      getWithEntitiesLocalPaginationEvents(config);
    const { entitiesLocalSortChanged } = getWithEntitiesLocalSortEvents(config);

    function setCurrentPage(
      state: Record<string, Signal<unknown>>,
      pageIndex: number,
      pageSize?: number,
    ) {
      const { entitiesKey } = getWithEntitiesKeys(config);
      const entities = state[entitiesKey] as Signal<Entity[]>;
      const pagination = state[paginationKey] as Signal<{
        pageSize: number;
        currentPage: number;
      }>;
      const size = pageSize ?? pagination().pageSize;
      const startIndex = pageIndex * size;
      const currentPage =
        startIndex >= 0 && startIndex < entities().length
          ? pageIndex
          : pagination().currentPage;

      patchState(state as WritableStateSource<object>, {
        [paginationKey]: {
          ...pagination(),
          currentPage,
          pageSize: size,
        },
      });
    }

    return signalStoreFeature(
      withState({
        [paginationKey]: {
          pageSize,
          currentPage,
        },
      }),
      withComputed((state: Record<string, Signal<unknown>>) => {
        const entities = state[entitiesKey] as Signal<Entity[]>;
        const pagination = state[paginationKey] as Signal<{
          pageSize: number;
          currentPage: number;
        }>;
        const entitiesCurrentPage = computed(() => {
          const page = pagination().currentPage;
          const startIndex = page * pagination().pageSize;
          let endIndex = startIndex + pagination().pageSize;
          endIndex =
            endIndex < entities().length ? endIndex : entities().length;
          const pageEntities = entities().slice(startIndex, endIndex);
          const total = entities().length;
          const pagesCount =
            total && total! > 0
              ? Math.ceil(total! / pagination().pageSize)
              : undefined;
          return {
            entities: pageEntities,
            pageIndex: pagination().currentPage,
            total: total,
            pageSize: pagination().pageSize,
            pagesCount,
            hasPrevious: pagination().currentPage - 1 >= 0,
            hasNext:
              pagesCount && total && total! > 0
                ? pagination().currentPage + 1 < pagesCount
                : true,
          };
        });
        return {
          [entitiesCurrentPageKey]: entitiesCurrentPage,
        };
      }),
      withEventHandler((state) => [
        onEvent(entitiesFilterChanged, entitiesLocalSortChanged, () => {
          setCurrentPage(state, 0);
        }),
      ]),

      withMethods((state: Record<string, Signal<unknown>>) => {
        return {
          [loadEntitiesPageKey]: ({
            pageIndex,
            pageSize,
          }: {
            pageIndex: number;
            pageSize?: number;
          }) => {
            setCurrentPage(state, pageIndex, pageSize);
            broadcast(state, entitiesLocalPageChanged({ pageIndex }));
          },
        };
      }),
    );
  }) as any;
}
