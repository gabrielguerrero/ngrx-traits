import {
  EnvironmentInjector,
  inject,
  runInInjectionContext,
  signal,
  Signal,
  untracked,
} from '@angular/core';
import {
  patchState,
  signalStoreFeature,
  SignalStoreFeature,
  SignalStoreFeatureResult,
  withHooks,
  withMethods,
  WritableStateSource,
} from '@ngrx/signals';
import { SelectEntityId, setAllEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  asapScheduler,
  catchError,
  concatMap,
  debounceTime,
  exhaustMap,
  first,
  from,
  map,
  Observable,
  of,
  pipe,
  switchMap,
} from 'rxjs';

import { createCallResource } from '../call-resource/call-resource';
import {
  EntitiesCallStatusRequirement,
  RequireEntities,
  RequireEntitiesCallStatus,
} from '../feature-requirements.model';
import { getWithEntitiesKeys } from '../util';
import { CallStatus } from '../with-call-status/with-call-status.model';
import {
  getWithCallStatusEvents,
  getWithCallStatusKeys,
} from '../with-call-status/with-call-status.util';
import { getWithEntitiesRemotePaginationKeys } from '../with-entities-pagination/with-entities-remote-pagination.util';
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
  ExpectedFetchEntitiesResult,
  FetchEntitiesResult,
  NamedEntitiesResourceMethods,
} from './with-entities-loading-call.model';

type EntitiesLoadingCallResult<Collection extends string, Entity, Error> = {
  state: {};
  props: {};
  methods: NamedEntitiesResourceMethods<Collection, Entity, Error>;
};

/**
 * Generates a onInit hook that fetches entities from a remote source
 * when the [Collection]Loading is true, by calling the fetchEntities function
 * and if successful, it will call set[Collection]Loaded and also set the entities
 * to the store using the setAllEntities method or the setEntitiesPagedResult method
 * if it exists (comes from withEntitiesRemotePagination),
 * if an error occurs it will set the error to the store using set[Collection]Error with the error.
 *
 * Requires withEntities and withCallStatus to be present in the store.
 *
 * Also generates an `entitiesResource()` (or `[collection]EntitiesResource()`)
 * method, a factory of an Angular Resource view of the entities and their
 * loading call for components: value (the entities), status, error, isLoading
 * and hasValue(). To fetch again call set[Collection]Loading().
 *
 * @param config - The full feature config or — in the two-argument form — just the entityConfig (`entityConfig({ entity, collection, selectId })`)
 * @param config.fetchEntities - A function that fetches the entities from a remote source, the return type can be an array of entities or an object with entities and total
 * @param config.collection - The collection name
 * @param config.onSuccess - A function that is called when the fetchEntities is successful
 * @param config.mapError - A function to transform the error before setting it to the store, requires withCallStatus errorType to be set
 * @param config.onError - A function that is called when the fetchEntities fails
 * @param config.selectId - The function to use to select the id of the entity
 * @param config.storeResult - Whether to automatically store the fetched entities in the store (default: true). When false, entities are not stored, but setLoaded and onSuccess are still called, useful when you want to handle storing in onSuccess yourself
 * @param options - Two-argument form only: the behavior options, or a factory that receives the store and returns them
 *
 *
 * @example
 * const productEntityConfig = entityConfig({
 *   entity: type<Product>(),
 *   collection: 'product',
 * });
 * export const ProductsRemoteStore = signalStore(
 *   { providedIn: 'root' },
 *   // requires at least withEntities and withCallStatus
 *   withEntities(productEntityConfig),
 *   withCallStatus(productEntityConfig, { initialValue: 'loading' }),
 *   // other features
 *   withEntitiesRemoteFilter(productEntityConfig, {
 *     defaultFilter: { name: '' },
 *   }),
 *   withEntitiesRemotePagination(productEntityConfig, {
 *     pageSize: 5,
 *     pagesToCache: 2,
 *   }),
 *   withEntitiesRemoteSort(productEntityConfig, {
 *     defaultSort: { field: 'name', direction: 'asc' },
 *   }),
 *   // now we add the withEntitiesLoadingCall, in this case any time the filter,
 *   // pagination or sort changes they call set[Collection]Loading() which then
 *   // triggers the onInit effect that checks if [Collection]Loading(), if true
 *   // then calls fetchEntities function
 *   withEntitiesLoadingCall(productEntityConfig, ({ productEntitiesFilter, productEntitiesPagedRequest, productEntitiesSort }) => ({
 *     fetchEntities: () => {
 *       return inject(ProductService)
 *         .getProducts({
 *           search: productEntitiesFilter().name,
 *           take: productEntitiesPagedRequest().size,
 *           skip: productEntitiesPagedRequest().startIndex,
 *           sortColumn: productEntitiesSort().field,
 *           sortAscending: productEntitiesSort().direction === 'asc',
 *         })
 *         .pipe(
 *           map((d) => ({
 *             entities: d.resultList,
 *             total: d.total,
 *           })),
 *         );
 *     },
 *   })),
 *
 * @example
 * // in a component, the resource view of the entities
 * products = this.store.productEntitiesResource();
 * // in the template
 * // @if (products.isLoading()) { <mat-spinner /> }
 * // @for (product of products.value(); track product.id) { ... }
 * // <button (click)="store.setProductEntitiesLoading()">Refresh</button>
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
        | Observable<ExpectedFetchEntitiesResult<Input, Collection, Entity>>
        | Promise<ExpectedFetchEntitiesResult<Input, Collection, Entity>>;
      mapPipe?: 'switchMap' | 'concatMap' | 'exhaustMap';
      onSuccess?: (
        result: FetchEntitiesResult<Input, Collection, Entity>,
      ) => void;
      mapError?: (error: unknown) => Error;
      onError?: (error: Error) => void;
      entity?: Entity;
      selectId?: SelectEntityId<Entity>;
      storeResult?: boolean;
    }
  >,
): SignalStoreFeature<
  Input &
    RequireEntities<Input, Entity, Collection, 'withEntitiesLoadingCall'> &
    RequireEntitiesCallStatus<
      Input,
      Collection,
      'withEntitiesLoadingCall',
      EntitiesCallStatusRequirement<Collection, Error>
    >,
  EntitiesLoadingCallResult<Collection, Entity, Error>
>;
export function withEntitiesLoadingCall<
  Input extends SignalStoreFeatureResult,
  Entity,
  Collection extends string = '',
  Error = unknown,
>(
  entityConfig: {
    entity: Entity;
    collection?: Collection;
    selectId?: SelectEntityId<NoInfer<Entity>>;
  },
  options: FeatureConfigFactory<
    Input,
    {
      fetchEntities: (
        store: StoreSource<Input>,
      ) =>
        | Observable<ExpectedFetchEntitiesResult<Input, Collection, Entity>>
        | Promise<ExpectedFetchEntitiesResult<Input, Collection, Entity>>;
      mapPipe?: 'switchMap' | 'concatMap' | 'exhaustMap';
      onSuccess?: (
        result: FetchEntitiesResult<Input, Collection, Entity>,
      ) => void;
      mapError?: (error: unknown) => Error;
      onError?: (error: Error) => void;
      storeResult?: boolean;
      entity?: never;
      collection?: never;
      selectId?: never;
    }
  >,
): SignalStoreFeature<
  Input &
    RequireEntities<Input, Entity, Collection, 'withEntitiesLoadingCall'> &
    RequireEntitiesCallStatus<
      Input,
      Collection,
      'withEntitiesLoadingCall',
      EntitiesCallStatusRequirement<Collection, Error>
    >,
  EntitiesLoadingCallResult<Collection, Entity, Error>
>;
export function withEntitiesLoadingCall<
  Input extends SignalStoreFeatureResult,
  Entity,
  Collection extends string = '',
  Error = unknown,
>(
  configOrFactory: FeatureConfigFactory<Input, Record<string, any>>,
  options?: FeatureConfigFactory<Input, Record<string, any>>,
): SignalStoreFeature<any, any> {
  const config = combineFeatureConfig(configOrFactory, options);
  return withFeatureFactory(
    (
      _store: StoreSource<Input>,
      environmentInjector = inject(EnvironmentInjector),
    ) => {
      const {
        collection,
        fetchEntities,
        onSuccess,
        onError,
        mapError,
        mapPipe: mapPipeType,
        selectId,
        storeResult = true,
      } = getFeatureConfig(config, _store) as {
        collection?: Collection;
        fetchEntities: (
          store: StoreSource<Input>,
        ) => Observable<unknown> | Promise<unknown>;
        mapPipe?: 'switchMap' | 'concatMap' | 'exhaustMap';
        onSuccess?: (result: unknown) => void;
        mapError?: (error: unknown) => Error;
        onError?: (error: Error) => void;
        selectId?: SelectEntityId<Entity>;
        storeResult?: boolean;
      };
      const {
        loadingKey,
        setErrorKey,
        setLoadedKey,
        setLoadingKey,
        callStatusKey,
        errorKey,
      } = getWithCallStatusKeys({
        collection,
      });
      const { entitiesKey } = getWithEntitiesKeys({ collection });
      const resourceKey = collection
        ? `${collection}EntitiesResource`
        : 'entitiesResource';
      const { setEntitiesPagedResultKey } = getWithEntitiesRemotePaginationKeys(
        {
          collection,
        },
      );
      const { callLoading } = getWithCallStatusEvents({ prop: collection });

      // whether a fetch has produced entities at least once, for the resource
      // view: it is what tells a reload from a first load, and neither the
      // status and isLoaded (both 'loading' at that point) nor the entities
      // (they start as an empty array) can say. A latch, never reset
      const hasLoadedOnce = signal(false);
      const setLoaded = () => {
        hasLoadedOnce.set(true);
        (_store[setLoadedKey] as () => void)();
      };
      const setLoading = _store[setLoadingKey] as () => void;
      const setError = _store[setErrorKey] as (error: unknown) => void;
      const setEntities = (entities: Entity[]) =>
        patchState(
          _store as WritableStateSource<object>,
          collection
            ? setAllEntities(entities, {
                collection,
                selectId: selectId ?? ((entity) => (entity as any).id),
              })
            : setAllEntities(entities, {
                selectId:
                  selectId ?? ((entity) => (entity as any).id as string),
              }),
        );
      const setEntitiesPagedResult = _store[
        setEntitiesPagedResultKey
      ] as (result: { entities: Entity[] }) => void;

      const mapPipe = mapPipeType ? mapPipes[mapPipeType] : switchMap;
      const loadEntities = rxMethod<void>(
        pipe(
          debounceTime(0, asapScheduler),
          mapPipe(() =>
            runInInjectionContext(environmentInjector, () =>
              from(fetchEntities(_store)),
            ).pipe(
              map((result) => {
                if (storeResult) {
                  if (setEntitiesPagedResult)
                    setEntitiesPagedResult(result as { entities: Entity[] });
                  else {
                    const entities = Array.isArray(result)
                      ? result
                      : (result as { entities: Entity[] }).entities;
                    setEntities(entities as Entity[]);
                  }
                }
                setLoaded();
                if (onSuccess)
                  onSuccess(
                    result as FetchEntitiesResult<Input, Collection, Entity>,
                  );
              }),
              first(),
              catchError((error: unknown) => {
                const e = mapError ? mapError(error) : error;
                setError(e);
                console.error(`${collection ?? ''} fetchEntities fail `, e);
                if (onError) onError(e as Error);
                return of();
              }),
            ),
          ),
        ),
      );
      const storeSignals = _store as unknown as Record<string, Signal<unknown>>;
      const loading = storeSignals[loadingKey] as Signal<boolean>;
      return signalStoreFeature(
        withEventHandler(() => [onEvent(callLoading, () => loadEntities())]),
        withHooks(() => ({
          onInit: () => {
            if (loading()) loadEntities();
          },
        })),
        withMethods(() => ({
          [resourceKey]: () => {
            const callStatus = storeSignals[
              callStatusKey
            ] as Signal<CallStatus>;
            // a status the store was already given, hydrated from the server
            // or from storage, counts as loaded: no fetch ran here, but
            // there are entities on screen
            if (untracked(callStatus) === 'loaded') hasLoadedOnce.set(true);
            return createCallResource<Entity[], Error>({
              value: storeSignals[entitiesKey] as Signal<Entity[]>,
              callStatus,
              error: storeSignals[errorKey] as Signal<Error | undefined>,
              isLoading: loading,
              hasLoadedOnce,
            });
          },
        })),
      );
    },
  ) as any;
}
const mapPipes = {
  switchMap: switchMap,
  concatMap: concatMap,
  exhaustMap: exhaustMap,
};
