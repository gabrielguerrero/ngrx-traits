import { Signal } from '@angular/core';
import {
  patchState,
  signalStoreFeature,
  SignalStoreFeature,
  SignalStoreFeatureResult,
  withMethods,
  withState,
  WritableStateSource,
} from '@ngrx/signals';
import { EntityState, NamedEntityState } from '@ngrx/signals/entities';
import { EntityProps, NamedEntityProps } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap } from 'rxjs';

import {
  CallStatusMethods,
  NamedCallStatusMethods,
} from '../with-call-status/with-call-status.model';
import { getWithCallStatusKeys } from '../with-call-status/with-call-status.util';
import {
  broadcast,
  withEventHandler,
} from '../with-event-handler/with-event-handler';
import { withFeatureFactory } from '../with-feature-factory/with-feature-factory';
import {
  FeatureConfigFactory,
  getFeatureConfig,
  StoreSource,
} from '../with-feature-factory/with-feature-factory.model';
import { Sort } from './with-entities-local-sort.model';
import {
  EntitiesSortState,
  NamedEntitiesSortState,
} from './with-entities-local-sort.model';
import {
  EntitiesRemoteSortMethods,
  NamedEntitiesRemoteSortMethods,
} from './with-entities-remote-sort.model';
import { getWithEntitiesRemoteSortEvents } from './with-entities-remote-sort.util';
import { getWithEntitiesSortKeys } from './with-entities-sort.util';

/**
 * Generates state, signals, and methods to sort entities remotely. When the sort method sort[Collection]Entities is called it will store the sort
 * and call set[Collection]Loading, and you should either create an effect that listens to [Collection]Loading
 * and call the api with the [Collection]Sort params and use wither setAllEntities if is not paginated or set[Collection]Result if is paginated
 * with the sorted result that come from the backend, plus changing the status  and set errors is needed.
 * or use withEntitiesLoadingCall to call the api with the [Collection]Sort params which handles setting
 * the result and errors automatically.
 *
 *  In case you dont want sort[Collection]Entities to call set[Collection]Loading() (which triggers a fetchEntities), you can pass skipLoadingCall: true to sort[Collection]Entities.
 * Useful in cases where you want to further change the state before manually calling set[Collection]Loading() to trigger a fetch of entities.
 *
 * Requires withEntities and withCallStatus to be present before this function.
 *
 * @param configFactory - The configuration object for the feature or a factory function that receives the store and returns the configuration object
 * @param configFactory.defaultSort - The default sort to use when the store is initialized
 * @param configFactory.entity - The entity type
 * @param configFactory.collection - The collection name
 *
 * @example
 * const entity = type<Product>();
 * const collection = 'product';
 * export const store = signalStore(
 *   { providedIn: 'root' },
 *   // required withEntities and withCallStatus
 *   withEntities({ entity, collection }),
 *   withCallStatus({ collection, initialValue: 'loading' }),
 *
 *   withEntitiesRemoteSort({
 *     entity,
 *     collection,
 *     defaultSort: { field: 'name', direction: 'asc' },
 *   }),
 *   // after you can use withEntitiesLoadingCall to connect the filter to
 *   // the api call, or do it manually as shown after
 *    withEntitiesLoadingCall({
 *     collection,
 *     fetchEntities: ({ productEntitiesSort }) => {
 *       return inject(ProductService)
 *         .getProducts({
 *           sortColumn: productEntitiesSort().field,
 *           sortAscending: productEntitiesSort().direction === 'asc',
 *         })
 *     },
 *   }),
 * // withEntitiesLoadingCall is the same as doing the following:
 * // withHooks(({ productEntitiesSort, isProductEntitiesLoading, setProductEntitiesError, ...state }) => ({
 * //   onInit: async () => {
 * //     effect(() => {
 * //       if (isProductEntitiesLoading()) {
 * //         inject(ProductService)
 * //             .getProducts({
 * //                 sortColumn: productEntitiesSort().field,
 * //                 sortAscending: productEntitiesSort().direction === 'asc',
 * //              })
 * //           .pipe(
 * //             takeUntilDestroyed(),
 * //             tap((res) =>
 * //               patchState(
 * //                 state,
 * //                 setAllEntities(res.resultList, { collection: 'product' }),
 * //               ),
 * //             ),
 * //             catchError((error) => {
 * //               setProductEntitiesError(error);
 * //               return EMPTY;
 * //             }),
 * //           )
 * //           .subscribe();
 * //       }
 * //     });
 * //   },
 *  })),
 *
 * // generate the following signals
 * store.productEntitiesSort // the current sort
 * // and the following methods
 * store.sortProductEntities // (options: { sort: Sort<Entity>; , skipLoadingCall?:boolean}) => void;
 */
export function withEntitiesRemoteSort<
  Input extends SignalStoreFeatureResult,
  Entity,
  Collection extends string = '',
>(
  configFactory: FeatureConfigFactory<
    Input,
    {
      entity: Entity;
      defaultSort: Sort<Entity>;
      collection?: Collection;
    }
  >,
): SignalStoreFeature<
  Input &
    (Collection extends ''
      ? {
          state: EntityState<Entity>;
          props: EntityProps<Entity>;
          methods: CallStatusMethods;
        }
      : {
          state: NamedEntityState<Entity, Collection>;
          props: NamedEntityProps<Entity, Collection>;
          methods: NamedCallStatusMethods<`${Collection}Entities`>;
        }),
  Collection extends ''
    ? {
        state: EntitiesSortState<Entity>;
        props: {};
        methods: EntitiesRemoteSortMethods<Entity>;
      }
    : {
        state: NamedEntitiesSortState<Entity, Collection>;
        props: {};
        methods: NamedEntitiesRemoteSortMethods<Entity, Collection>;
      }
> {
  return withFeatureFactory((store: StoreSource<Input>) => {
    const { defaultSort, ...config } = getFeatureConfig(configFactory, store);
    const { setLoadingKey } = getWithCallStatusKeys({
      collection: config.collection,
    });
    const { sortKey, sortEntitiesKey } = getWithEntitiesSortKeys(config);
    const { entitiesRemoteSortChanged } =
      getWithEntitiesRemoteSortEvents(config);
    return signalStoreFeature(
      withState({ [sortKey]: defaultSort }),
      withEventHandler(),
      withMethods((state: Record<string, Signal<unknown>>) => {
        const setLoading = state[setLoadingKey] as () => void;
        return {
          [sortEntitiesKey]: rxMethod<{
            sort?: Sort<Entity>;
            skipLoadingCall?: boolean;
          }>(
            pipe(
              tap((options) => {
                const newSort = options?.sort;
                const skipLoadingCall = options?.skipLoadingCall;
                const sort = newSort ?? (state[sortKey]() as Sort<Entity>);
                patchState(state as WritableStateSource<object>, {
                  [sortKey]: sort,
                });
                broadcast(state, entitiesRemoteSortChanged({ sort }));
                if (!skipLoadingCall) setLoading();
              }),
            ),
          ),
        };
      }),
    );
  }) as any;
}
