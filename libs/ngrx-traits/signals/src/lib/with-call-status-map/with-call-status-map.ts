import { computed, Signal } from '@angular/core';
import {
  patchState,
  SignalStoreFeature,
  signalStoreFeature,
  SignalStoreFeatureResult,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';

import { registerCallState } from '../with-all-call-status/with-all-call-status.util';
import { CallStatus } from '../with-call-status/with-call-status.model';
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
import {
  NamedCallStatusMapComputed,
  NamedCallStatusMapMethods,
  NamedCallStatusMapState,
} from './with-call-status-map.model';
import {
  getWithCallStatusMapEvents,
  getWithCallStatusMapKeys,
} from './with-call-status-map.util';

/**
 * Generates necessary state, computed and methods for call progress status but map by a key, allowing to implement
 * calls of the same type that run on parallel each with its own status.
 * @param configFactory - The configuration object for the feature or a factory function that receives the store and returns the configuration object
 * @param configFactory.prop - The name of the property for which this represents the call status
 * @param configFactory.initialValue - The initial value of the call status
 * @param configFactory.collection - The name of the collection for which this represents the call status is an alias to prop param
 * @param configFactory.errorType - The type of the error
 * they do the same thing
 *
 * prop or collection is required
 * @example
 * export const Store = signalStore(
 *   { providedIn: 'root' },
 *   withEntities(orderEntity),
 *   withCallStatusMap({ prop: 'loadDetails' }),
 *   withMethods((store) => ({
 *     loadProducts: rxMethod<{ orderId: string }>(
 *       pipe(
 *         switchMap((params) => {
 *           store.setLoadDetailsLoading(params.orderId);
 *           return inject(OrderService)
 *             .getOrderDetail(params.orderId)
 *             .pipe(
 *               tap((res) =>
 *                 patchState(
 *                   store,
 *                   updateEntity(
 *                     {
 *                       id: params.orderId,
 *                       changes: { items: res.items },
 *                     },
 *                     orderEntity,
 *                   ),
 *                 ),
 *               ),
 *               catchError((error) => {
 *                 store.setLoadDetailsError(params.orderId, error);
 *                 return EMPTY;
 *               }),
 *             );
 *         }),
 *       ),
 *     ),
 *   })),
 * );
 *
 *  // generates the following signals
 *  store.loadDetailsCallStatus // '{[key:string]: init' | 'loading' | 'loaded' | { error: unknown }}
 *  // generates the following computed signals
 *  store.isAnyLoadDetailsLoading() // boolean
 *  store.areAllLoadDetailsLoaded // boolean
 *  store.loadDetailsErrors() // Errors[] | undefined
 *  // generates the following methods
 *  store.isLoadDetailsLoading(key: string) // boolean
 *  store.isLoadDetailsLoaded(key: string) // boolean
 *  store.loadDetailsError(key: string) // unknown | null
 *  store.setLoadDetailsLoading(key: string) // () => void
 *  store.setLoadDetailsLoaded(key: string) // () => void
 *  store.setLoadDetailsError(key: string) // (error?: unknown) => void
 */

export function withCallStatusMap<
  Input extends SignalStoreFeatureResult,
  Prop extends string = '',
  Error = unknown,
>(
  configFactory: FeatureConfigFactory<
    Input,
    {
      initialValue?: Record<string | number, CallStatus>;
      errorType?: Error;
      prop: Prop;
    }
  >,
): SignalStoreFeature<
  Input & { state: {}; props: {}; methods: {} },
  {
    state: NamedCallStatusMapState<Prop>;
    props: NamedCallStatusMapComputed<Prop, Error>;
    methods: NamedCallStatusMapMethods<Prop, Error>;
  }
> {
  return withFeatureFactory((store: StoreSource<Input>) => {
    const config = getFeatureConfig(configFactory, store);

    const prop = config.prop;
    const {
      callStatusKey,
      errorKey,
      loadedKey,
      loadingKey,
      isAnyLoadingKey,
      areAllLoadedKey,
      errorsKey,
      setLoadingKey,
      setLoadedKey,
      setErrorKey,
    } = getWithCallStatusMapKeys({ prop });

    const { callLoaded, callLoading, callError } = getWithCallStatusMapEvents({
      prop,
    });
    return signalStoreFeature(
      withState({ [callStatusKey]: config.initialValue ?? {} }),
      withComputed((state: Record<string, Signal<unknown>>) => {
        const callState = state[callStatusKey] as Signal<
          Record<string, CallStatus>
        >;

        const isAnyLoading = computed(() =>
          Object.values(callState()).some((status) => status === 'loading'),
        );
        const areAllLoaded = computed(() => {
          const values = Object.values(callState());
          return values?.length
            ? values.every((status) => status === 'loaded')
            : false;
        });

        const errors = computed(() => {
          const v = callState();
          const errorsArray = Object.values(v)
            .map((v) => (typeof v === 'object' ? v.error : undefined))
            .filter(Boolean);
          return errorsArray?.length ? errorsArray : undefined;
        });

        registerCallState(store, { loading: isAnyLoading, error: errors });

        return {
          [isAnyLoadingKey]: isAnyLoading,
          [errorsKey]: errors,
          [areAllLoadedKey]: areAllLoaded,
        };
      }),
      withEventHandler(),
      withMethods((store) => {
        const callState = store[callStatusKey] as unknown as Signal<
          Record<string, CallStatus>
        >;
        const isLoading = (id: string) => callState()[id] === 'loading';
        const isLoaded = (id: string) => callState()[id] === 'loaded';
        const error = (id: string) => {
          const v = callState()[id];
          return typeof v === 'object' ? v.error : undefined;
        };
        const setLoading = (id: string) => {
          patchState(store, {
            [callStatusKey]: { ...callState(), [id]: 'loading' },
          } as any);
          broadcast(store, callLoading({ id }));
        };
        const setLoaded = (id: string) => {
          patchState(store, {
            [callStatusKey]: { ...callState(), [id]: 'loaded' },
          } as any);
          broadcast(store, callLoaded({ id }));
        };
        const setError = (id: string, error: unknown) => {
          patchState(store, {
            [callStatusKey]: { ...callState(), [id]: { error } },
          } as any);
          broadcast(store, callError({ id, error }));
        };
        return {
          [loadingKey]: isLoading,
          [loadedKey]: isLoaded,
          [errorKey]: error,
          [setLoadingKey]: setLoading,
          [setLoadedKey]: setLoaded,
          [setErrorKey]: setError,
        };
      }),
    );
  }) as any;
}
