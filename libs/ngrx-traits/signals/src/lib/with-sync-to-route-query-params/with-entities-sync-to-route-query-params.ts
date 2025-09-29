import { computed, Signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import {
  EmptyFeatureResult,
  SignalStoreFeature,
  signalStoreFeature,
  SignalStoreFeatureResult,
  type,
  withHooks,
} from '@ngrx/signals';
import {
  EntityProps,
  EntityState,
  NamedEntityProps,
  NamedEntityState,
} from '@ngrx/signals/entities';
import { concatMap, first } from 'rxjs';

import {
  CallStatusComputed,
  CallStatusMethods,
  CallStatusState,
  NamedCallStatusComputed,
  NamedCallStatusMethods,
  NamedCallStatusState,
} from '../with-call-status/with-call-status.model';
import { getWithCallStatusKeys } from '../with-call-status/with-call-status.util';
import {
  FilterQueryMapper,
  getQueryMapperForEntitiesFilter,
} from '../with-entities-filter/with-entities-filter.util';
import { getQueryMapperForEntitiesPagination } from '../with-entities-pagination/with-entities-local-pagination.util';
import { getQueryMapperForSingleSelection } from '../with-entities-selection/with-entities-single-selection.util';
import { getQueryMapperForEntitiesSort } from '../with-entities-sort/with-entities-local-sort.util';
import { StoreSource } from '../with-feature-factory/with-feature-factory.model';
import { withSyncToRouteQueryParams } from './with-sync-to-route-query-params';
import { QueryMapper } from './with-sync-to-route-query-params.util';

/**
 * Syncs entities filter, pagination, sort and single selection to route query params for local or remote entities store features. If a collection is provided, it will be used as a prefix (if non is provided) for the query params.
 * The prefix can be disabled by setting it to false, or changed by providing a string. The filterMapper can be used to customize how the filter object is map to a query params object,
 * when is not provided the filter will use JSON.stringify to serialize the filter object.
 *
 * Requires withEntities and withCallStatus to be present in the store.
 *
 * @param config.collection The collection name to use as a prefix for the query params. If not provided, the collection name will be used.
 * @param config.filterMapper A function to map the filter object to a query params object.
 * @param config.prefix The prefix to use for the query params. If set to false, the prefix will be disabled.
 * @param config.onQueryParamsLoaded A function to be called when the query params are loaded into the store, (only gets called once).
 * @param config.defaultDebounce The default debounce time to use sync the store changes back to the route query params.
 * @param config.skipLoadingCall When true, restoring state from query params will update the store state but will not trigger a backend call to fetch entities. Default is false.
 *
 * @example
 * export const ProductsRemoteStore = signalStore(
 *   { providedIn: 'root' },
 *   // requires at least withEntities and withCallStatus
 *   withEntities({ entity, collection }),
 *   withCallStatus({ prop: collection, initialValue: 'loading' }),
 *   withEntitiesRemoteFilter({
 *     entity,
 *     collection,
 *   }),
 *   withEntitiesRemotePagination({
 *     entity,
 *     collection,
 *   }),
 *   withEntitiesRemoteSort({
 *     entity,
 *     collection,
 *     defaultSort: { field: 'name', direction: 'asc' },
 *   }),
 *   withEntitiesLoadingCall({
 *     collection,
 *     fetchEntities: ({ productsFilter, productsPagedRequest, productsSort }) => {
 *       return inject(ProductService)
 *         .getProducts({
 *           search: productsFilter().name,
 *           take: productsPagedRequest().size,
 *           skip: productsPagedRequest().startIndex,
 *           sortColumn: productsSort().field,
 *           sortAscending: productsSort().direction === 'asc',
 *         })
 *         .pipe(
 *           map((d) => ({
 *             entities: d.resultList,
 *             total: d.total,
 *           })),
 *         );
 *     },
 *   }),
 *   // syncs the entities filter, pagination, sort and single selection to the route query params
 *   withEntitiesSyncToRouteQueryParams({
 *     entity,
 *     collection,
 *   })
 *);
 */
export function withEntitiesSyncToRouteQueryParams<
  Input extends SignalStoreFeatureResult,
  Entity,
  Filter,
  const Collection extends string = '',
  Error = unknown,
>(config: {
  entity: Entity;
  collection?: Collection;
  filterMapper?: FilterQueryMapper<Filter>;
  prefix?: string | false;
  onQueryParamsLoaded?: (store: StoreSource<Input>) => void;
  defaultDebounce?: number;
  restoreOnInit?: boolean;
  skipLoadingCall?: boolean;
}): SignalStoreFeature<
  Input &
    (Collection extends ''
      ? {
          state: EntityState<Entity> & CallStatusState;
          props: EntityProps<Entity> & CallStatusComputed<Error>;
          methods: CallStatusMethods<Error>;
        }
      : {
          state: NamedEntityState<Entity, Collection> &
            NamedCallStatusState<Collection>;
          props: NamedEntityProps<Entity, Collection> &
            NamedCallStatusComputed<Collection, Error>;
          methods: NamedCallStatusMethods<Collection, Error>;
        }),
  {
    state: {};
    props: {};
    methods: {
      loadFromQueryParams: () => void;
    };
  }
> {
  const mappers = [
    getQueryMapperForEntitiesPagination({
      collection: config?.collection,
      skipLoadingCall: config?.skipLoadingCall ?? false,
    }),
    getQueryMapperForEntitiesSort({
      collection: config?.collection,
      skipLoadingCall: config?.skipLoadingCall ?? false,
    }),
    getQueryMapperForEntitiesFilter({
      collection: config?.collection,
      filterMapper: config?.filterMapper,
      skipLoadingCall: config?.skipLoadingCall ?? false,
    }),
    getQueryMapperForSingleSelection(config),
  ];
  const prefixString =
    config?.prefix === false ? undefined : config?.prefix ?? config?.collection;

  const { loadingKey, loadedKey } = getWithCallStatusKeys({
    prop: config?.collection,
  });

  return signalStoreFeature(
    type<Input>(),
    withSyncToRouteQueryParams({
      defaultDebounce: config?.defaultDebounce,
      mappers: prefixString
        ? mappers.map((mapper) =>
            getQueryMapperWithPrefix({ prefix: prefixString, mapper }),
          )
        : mappers,
      restoreOnInit: config?.restoreOnInit ?? true,
    }),
    withHooks((store) => {
      return {
        onInit: () => {
          if (config?.onQueryParamsLoaded) {
            const loading = store[loadingKey] as unknown as Signal<boolean>;
            const loaded = store[loadedKey] as unknown as Signal<boolean>;
            const loaded$ = toObservable(loaded);
            toObservable(loading)
              .pipe(
                first((v) => v),
                concatMap(() => loaded$.pipe(first((v) => v))),
                takeUntilDestroyed(),
              )
              .subscribe(() => {
                config?.onQueryParamsLoaded?.(store);
              });
          }
        },
      };
    }),
  ) as any;
}

export function getQueryMapperWithPrefix(config: {
  prefix: string;
  mapper: QueryMapper<any>;
}): QueryMapper<any> {
  return {
    queryParamsToState: (query, store) => {
      const newQuery = Object.entries(query).reduce(
        (acc, [key, value]) => {
          if (key.startsWith(config.prefix + '-')) {
            const keyWithoutPrefix = key.replace(config?.prefix + '-', '');
            acc[keyWithoutPrefix] = value;
            return acc;
          }
          return acc;
        },
        {} as Record<string, any>,
      );
      config.mapper.queryParamsToState(newQuery, store);
    },
    stateToQueryParams: (store) => {
      const query = config.mapper.stateToQueryParams(store);
      return query
        ? computed(() => {
            return Object.entries(query()).reduce(
              (acc, [key, value]) => {
                acc[config.prefix + '-' + key] = value;
                return acc;
              },
              {} as Record<string, any>,
            );
          })
        : undefined;
    },
  };
}
