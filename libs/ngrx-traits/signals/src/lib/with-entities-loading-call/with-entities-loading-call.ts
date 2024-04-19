import {
  EnvironmentInjector,
  inject,
  runInInjectionContext,
  Signal,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import {
  patchState,
  signalStoreFeature,
  SignalStoreFeature,
  withHooks,
} from '@ngrx/signals';
import {
  EntityState,
  NamedEntityState,
  setAllEntities,
} from '@ngrx/signals/entities';
import {
  EntitySignals,
  NamedEntitySignals,
} from '@ngrx/signals/entities/src/models';
import type {
  EmptyFeatureResult,
  SignalStoreFeatureResult,
  SignalStoreSlices,
} from '@ngrx/signals/src/signal-store-models';
import {
  catchError,
  concatMap,
  exhaustMap,
  first,
  from,
  map,
  Observable,
  of,
  switchMap,
} from 'rxjs';
import { filter } from 'rxjs/operators';

import {
  CallStatusComputed,
  CallStatusMethods,
  CallStatusState,
  NamedCallStatusComputed,
  NamedCallStatusMethods,
  NamedCallStatusState,
} from '../with-call-status/with-call-status.model';
import { getWithCallStatusKeys } from '../with-call-status/with-call-status.util';
import { EntitiesPaginationRemoteMethods } from '../with-entities-pagination/with-entities-remote-pagination.model';
import { getWithEntitiesRemotePaginationKeys } from '../with-entities-pagination/with-entities-remote-pagination.util';

/**
 * Generates a onInit hook that fetches entities from a remote source
 * when the [collection]Loading is true, by calling the fetchEntities function
 * and if successful, it will call set[Collection]Loaded and also set the entities
 * to the store using the setAllEntities method or the setEntitiesResult method
 * if it exists (comes from withEntitiesRemotePagination),
 * if an error occurs it will set the error to the store using set[Collection]Error with the error.
 * Requires withEntities and withCallStatus to be present in the store.
 * @param config - Configuration object
 * @param config.fetchEntities - A function that fetches the entities from a remote source the return type
 * @param config.collection - The collection name
 * can be an array of entities or an object with entities and total
 *
 * @example
 * export const ProductsRemoteStore = signalStore(
 *   { providedIn: 'root' },
 *   // requires at least withEntities and withCallStatus
 *   withEntities({ entity, collection }),
 *   withCallStatus({ prop: collection, initialValue: 'loading' }),
 *   // other features
 *   withEntitiesRemoteFilter({
 *     entity,
 *     collection,
 *     defaultFilter: { name: '' },
 *   }),
 *   withEntitiesRemotePagination({
 *     entity,
 *     collection,
 *     pageSize: 5,
 *     pagesToCache: 2,
 *   }),
 *   withEntitiesRemoteSort({
 *     entity,
 *     collection,
 *     defaultSort: { field: 'name', direction: 'asc' },
 *   }),
 *   // now we add the withEntitiesLoadingCall, in this case any time the filter,
 *   // pagination or sort changes they call set[Collection]Loading() which then
 *   // triggers the onInit effect that checks if [collection]Loading(), if true
 *   // then calls fetchEntities function
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
 */
export function withEntitiesLoadingCall<
  Input extends SignalStoreFeatureResult,
  Entity extends { id: string | number },
>({
  fetchEntities,
}: {
  fetchEntities: (
    store: SignalStoreSlices<Input['state']> &
      Input['signals'] &
      Input['methods'],
  ) =>
    | Observable<
        Input['methods'] extends EntitiesPaginationRemoteMethods<Entity>
          ? { entities: Entity[]; total: number }
          : Entity[] | { entities: Entity[] } // should this be { entities: Entity[];} for consistency?
      >
    | Promise<
        Input['methods'] extends EntitiesPaginationRemoteMethods<Entity>
          ? { entities: Entity[]; total: number }
          : Entity[] | { entities: Entity[] }
      >;
  mapPipe?: 'switchMap' | 'concatMap' | 'exhaustMap';
}): SignalStoreFeature<
  Input & {
    state: EntityState<Entity> & CallStatusState;
    signals: EntitySignals<Entity> & CallStatusComputed;
    methods: CallStatusMethods;
  },
  EmptyFeatureResult
>;

/**
 * Generates a onInit hook that fetches entities from a remote source
 * when the [collection]Loading is true, by calling the fetchEntities function
 * and if successful, it will call set[Collection]Loaded and also set the entities
 * to the store using the setAllEntities method or the setEntitiesResult method
 * if it exists (comes from withEntitiesRemotePagination),
 * if an error occurs it will set the error to the store using set[Collection]Error with the error.
 * Requires withEntities and withCallStatus to be present in the store.
 * @param config - Configuration object
 * @param config.fetchEntities - A function that fetches the entities from a remote source the return type
 * @param config.collection - The collection name
 * can be an array of entities or an object with entities and total
 *
 * @example
 * export const ProductsRemoteStore = signalStore(
 *   { providedIn: 'root' },
 *   // requires at least withEntities and withCallStatus
 *   withEntities({ entity, collection }),
 *   withCallStatus({ prop: collection, initialValue: 'loading' }),
 *   // other features
 *   withEntitiesRemoteFilter({
 *     entity,
 *     collection,
 *     defaultFilter: { name: '' },
 *   }),
 *   withEntitiesRemotePagination({
 *     entity,
 *     collection,
 *     pageSize: 5,
 *     pagesToCache: 2,
 *   }),
 *   withEntitiesRemoteSort({
 *     entity,
 *     collection,
 *     defaultSort: { field: 'name', direction: 'asc' },
 *   }),
 *   // now we add the withEntitiesLoadingCall, in this case any time the filter,
 *   // pagination or sort changes they call set[Collection]Loading() which then
 *   // triggers the onInit effect that checks if [collection]Loading(), if true
 *   // then calls fetchEntities function
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
 */

export function withEntitiesLoadingCall<
  Input extends SignalStoreFeatureResult,
  Entity extends { id: string | number },
  Collection extends string,
>({
  fetchEntities,
}: {
  // entity?: Entity; // is this needed? entity can come from the method fetchEntities return type
  collection: Collection;
  fetchEntities: (
    store: SignalStoreSlices<Input['state']> &
      Input['signals'] &
      Input['methods'],
  ) =>
    | Observable<
        Entity[] | { entities: Entity[]; total?: number }
        // // TODO bellow is not working as expected
        // Input['methods'] extends NamedEntitiesPaginationSetResultMethods<
        //   Entity,
        //   Collection
        // >
        //   ? { entities: Entity[]; total: number } & Prettify<
        //       NamedEntitiesPaginationSetResultMethods<Entity, Collection>
        //     >
        //   : Entity[] | { entities: Entity[] }
      >
    | Promise<
        Entity[] | { entities: Entity[]; total?: number }
        // TODO bellow is not working as expected
        // Input['methods'] extends NamedEntitiesPaginationRemoteSetResult<
        //   Entity,
        //   Collection
        // >
        //   ? { entities: Entity[]; total: number }
        //   : Entity[] | { entities: Entity[] }
      >;
  mapPipe?: 'switchMap' | 'concatMap' | 'exhaustMap';
}): SignalStoreFeature<
  Input & {
    state: NamedEntityState<Entity, Collection> &
      NamedCallStatusState<Collection>;
    signals: NamedEntitySignals<Entity, Collection> &
      NamedCallStatusComputed<Collection>;
    methods: NamedCallStatusMethods<Collection>;
  },
  EmptyFeatureResult
>;

export function withEntitiesLoadingCall<
  Input extends SignalStoreFeatureResult,
  Entity extends { id: string | number },
  Collection extends string,
>({
  collection,
  fetchEntities,
  ...config
}: {
  entity?: Entity; // is this needed? entity can come from the method fetchEntities return type
  collection?: Collection;
  fetchEntities: (
    store: SignalStoreSlices<Input['state']> &
      Input['signals'] &
      Input['methods'],
  ) => Observable<any> | Promise<any>;
  mapPipe?: 'switchMap' | 'concatMap' | 'exhaustMap';
}): SignalStoreFeature<Input, EmptyFeatureResult> {
  const { loadingKey, setErrorKey, setLoadedKey } = getWithCallStatusKeys({
    prop: collection,
  });
  const { setEntitiesResultKey } = getWithEntitiesRemotePaginationKeys({
    collection,
  });
  return (store) => {
    const loading = store.signals[loadingKey] as Signal<boolean>;
    const setLoaded = store.methods[setLoadedKey] as () => void;
    const setError = store.methods[setErrorKey] as (error: unknown) => void;
    const setEntitiesResult = store.methods[setEntitiesResultKey] as (result: {
      entities: Entity[];
      total: number;
    }) => void;

    return signalStoreFeature(
      withHooks({
        onInit: (state, environmentInjector = inject(EnvironmentInjector)) => {
          const loading$ = toObservable(loading);
          const mapPipe = config.mapPipe ? mapPipes[config.mapPipe] : switchMap;

          loading$
            .pipe(
              filter(Boolean),
              mapPipe(() =>
                runInInjectionContext(environmentInjector, () =>
                  from(
                    fetchEntities({
                      ...store.slices,
                      ...store.signals,
                      ...store.methods,
                    } as SignalStoreSlices<Input['state']> &
                      Input['signals'] &
                      Input['methods']),
                  ),
                ).pipe(
                  map((result) => {
                    if (Array.isArray(result)) {
                      patchState(
                        state,
                        collection
                          ? setAllEntities(result as Entity[], {
                              collection,
                            })
                          : setAllEntities(result),
                      );
                    } else {
                      const { entities, total } = result;
                      if (setEntitiesResult)
                        setEntitiesResult({ entities, total });
                      else
                        patchState(
                          state,
                          collection
                            ? setAllEntities(entities as Entity[], {
                                collection,
                              })
                            : setAllEntities(entities),
                        );
                    }
                    setLoaded();
                  }),
                  catchError((error: unknown) => {
                    setError(error);
                    setLoaded();
                    return of();
                  }),
                  first(),
                ),
              ),
            )
            .subscribe();
        },
      }),
    )(store); // we execute the factory so we can pass the input
  };
}
const mapPipes = {
  switchMap: switchMap,
  concatMap: concatMap,
  exhaustMap: exhaustMap,
};
