import {
  EnvironmentInjector,
  inject,
  runInInjectionContext,
  Signal,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import {
  EmptyFeatureResult,
  patchState,
  signalStoreFeature,
  SignalStoreFeature,
  SignalStoreFeatureResult,
  withHooks,
  WritableStateSource,
} from '@ngrx/signals';
import {
  EntityComputed,
  EntityState,
  NamedEntityComputed,
  NamedEntityState,
  SelectEntityId,
  setAllEntities,
} from '@ngrx/signals/entities';
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
import {
  NamedSetEntitiesResult,
} from '../with-entities-pagination/with-entities-local-pagination.model';
import { getWithEntitiesRemotePaginationKeys } from '../with-entities-pagination/with-entities-remote-pagination.util';
import { withFeatureFactory } from '../with-feature-factory/with-feature-factory';
import {
  FeatureConfigFactory,
  getFeatureConfig,
  StoreSource,
} from '../with-feature-factory/with-feature-factory.model';

/**
 * Generates a onInit hook that fetches entities from a remote source
 * when the [collection]Loading is true, by calling the fetchEntities function
 * and if successful, it will call set[Collection]Loaded and also set the entities
 * to the store using the setAllEntities method or the setEntitiesPagedResult method
 * if it exists (comes from withEntitiesRemotePagination),
 * if an error occurs it will set the error to the store using set[Collection]Error with the error.
 *
 * Requires withEntities and withCallStatus to be present in the store.
 *
 * @param config - Configuration object or factory function that returns the configuration object
 * @param config.fetchEntities - A function that fetches the entities from a remote source, the return type can be an array of entities or an object with entities and total
 * @param config.collection - The collection name
 * @param config.onSuccess - A function that is called when the fetchEntities is successful
 * @param config.mapError - A function to transform the error before setting it to the store, requires withCallStatus errorType to be set
 * @param config.onError - A function that is called when the fetchEntities fails
 * @param config.selectId - The function to use to select the id of the entity
 *
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
  Entity,
  Collection extends string = '',
  Error = unknown,
>(
  config: FeatureConfigFactory<
    Input,
    {
      collection?: Collection;
      fetchEntities: (
        store: StoreSource<Input>,
      ) =>
        | Observable<
            Input['methods'] extends NamedSetEntitiesResult<
              Collection,
              infer ResultParam
            >
              ? ResultParam
              : Entity[] | { entities: Entity[] }
          >
        | Promise<
            Input['methods'] extends NamedSetEntitiesResult<
              Collection,
              infer ResultParam
            >
              ? ResultParam
              : Entity[] | { entities: Entity[] }
          >;
      mapPipe?: 'switchMap' | 'concatMap' | 'exhaustMap';
      onSuccess?: (
        result: Input['methods'] extends NamedSetEntitiesResult<
          Collection,
          infer ResultParam
        >
          ? ResultParam
          : Entity[] | { entities: Entity[] },
      ) => void;
      mapError?: (error: unknown) => Error;
      onError?: (error: Error) => void;
      entity?: Entity;
      selectId?: SelectEntityId<Entity>;
    }
  >,
): SignalStoreFeature<
  Input &
    (Collection extends ''
      ? {
          state: EntityState<Entity> & CallStatusState;
          computed: EntityComputed<Entity> & CallStatusComputed<Error>;
          methods: CallStatusMethods<Error>;
        }
      : {
          state: NamedEntityState<Entity, Collection> &
            NamedCallStatusState<Collection>;
          computed: NamedEntityComputed<Entity, Collection> &
            NamedCallStatusComputed<Collection, Error>;
          methods: NamedCallStatusMethods<Collection, Error>;
        }),
  EmptyFeatureResult
> {
  return withFeatureFactory((_store: StoreSource<Input>) => {
    const {
      collection,
      fetchEntities,
      onSuccess,
      onError,
      mapError,
      mapPipe: mapPipeType,
      selectId,
    } = getFeatureConfig(config, _store);
    const { loadingKey, setErrorKey, setLoadedKey } = getWithCallStatusKeys({
      prop: collection,
    });
    const { setEntitiesPagedResultKey } = getWithEntitiesRemotePaginationKeys({
      collection,
    });

    return signalStoreFeature(
      withHooks(
        (
          store: Record<string, Signal<unknown>>,
          environmentInjector = inject(EnvironmentInjector),
        ) => {
          const loading = store[loadingKey] as Signal<boolean>;
          const setLoaded = store[setLoadedKey] as () => void;
          const setError = store[setErrorKey] as (error: unknown) => void;
          const setEntitiesPagedResult = store[
            setEntitiesPagedResultKey
          ] as (result: { entities: Entity[] }) => void;
          return {
            onInit: () => {
              const loading$ = toObservable(loading);
              const mapPipe = mapPipeType ? mapPipes[mapPipeType] : switchMap;

              loading$
                .pipe(
                  filter(Boolean),
                  mapPipe(() =>
                    runInInjectionContext(environmentInjector, () =>
                      from(fetchEntities(store as StoreSource<Input>)),
                    ).pipe(
                      map((result) => {
                        if (setEntitiesPagedResult)
                          setEntitiesPagedResult(
                            result as { entities: Entity[] },
                          );
                        else {
                          const entities = Array.isArray(result)
                            ? result
                            : (result as { entities: Entity[] }).entities;
                          patchState(
                            store as WritableStateSource<object>,
                            collection
                              ? setAllEntities(entities as Entity[], {
                                  collection,
                                  selectId:
                                    selectId ??
                                    ((entity) => (entity as any).id),
                                })
                              : setAllEntities(entities as Entity[], {
                                  selectId:
                                    selectId ??
                                    ((entity) => (entity as any).id as string),
                                }),
                          );
                        }
                        setLoaded();
                        if (onSuccess) onSuccess(result);
                      }),
                      first(),
                      catchError((error: unknown) => {
                        const e = mapError ? mapError(error) : error;
                        setError(e);
                        if (onError) onError(e as Error);
                        return of();
                      }),
                    ),
                  ),
                )
                .subscribe();
            },
          };
        },
      ),
    );
  }) as any;
}
const mapPipes = {
  switchMap: switchMap,
  concatMap: concatMap,
  exhaustMap: exhaustMap,
};
