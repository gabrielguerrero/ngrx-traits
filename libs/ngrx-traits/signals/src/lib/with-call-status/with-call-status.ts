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
  CallStatus,
  CallStatusComputed,
  CallStatusMethods,
  CallStatusState,
  NamedCallStatusComputed,
  NamedCallStatusMethods,
  NamedCallStatusState,
} from './with-call-status.model';
import {
  getWithCallStatusEvents,
  getWithCallStatusKeys,
} from './with-call-status.util';

/**
 * Generates necessary state, computed and methods for call progress status to the store
 * @param configFactory - The configuration object for the feature or a factory function that receives the store and returns the configuration object
 * @param configFactory.prop - The name of the property for which this represents the call status
 * @param configFactory.initialValue - The initial value of the call status
 * @param configFactory.collection - The name of the collection for which this represents the call status is an alias to prop param
 * @param configFactory.errorType - The type of the error
 * they do the same thing
 *
 * prop or collection is required
 * @example
 * const store = signalStore(
 *  withCallStatus({ collection: 'user', })
 *  // other valid configurations
 *  // withCallStatus()
 *  // withCallStatus({ collection: 'user', initialValue: 'loading' , errorType: type<string>()})
 *  )
 *
 *  // generates the following signals
 *  store.userEntitiesCallStatus // 'init' | 'loading' | 'loaded' | { error: unknown }
 *  // generates the following computed signals
 *  store.isUserEntitiesLoading // boolean
 *  store.isUserEntitiesLoaded // boolean
 *  store.userEntitiesError // unknown | null
 *  // generates the following methods
 *  store.setUserEntitiesLoading // () => void
 *  store.setUserEntitiesLoaded // () => void
 *  store.setUserEntitiesError // (error?: unknown) => void
 */

// Overload for collection param
export function withCallStatus<
  Input extends SignalStoreFeatureResult,
  Prop extends string,
  Error = unknown,
>(
  configFactory: FeatureConfigFactory<
    Input,
    {
      collection: Prop;
      initialValue?: CallStatus;
      errorType?: Error;
    }
  >,
): SignalStoreFeature<
  Input & { state: {}; props: {}; methods: {} },
  {
    state: NamedCallStatusState<`${Prop}Entities`>;
    props: NamedCallStatusComputed<`${Prop}Entities`, Error>;
    methods: NamedCallStatusMethods<`${Prop}Entities`, Error>;
  }
>;

// Overload for prop param
export function withCallStatus<
  Input extends SignalStoreFeatureResult,
  Prop extends string,
  Error = unknown,
>(
  configFactory: FeatureConfigFactory<
    Input,
    {
      prop: Prop;
      initialValue?: CallStatus;
      errorType?: Error;
    }
  >,
): SignalStoreFeature<
  Input & { state: {}; props: {}; methods: {} },
  {
    state: NamedCallStatusState<Prop>;
    props: NamedCallStatusComputed<Prop, Error>;
    methods: NamedCallStatusMethods<Prop, Error>;
  }
>;

// Overload for no params
export function withCallStatus<
  Input extends SignalStoreFeatureResult,
  Error = unknown,
>(
  configFactory?: FeatureConfigFactory<
    Input,
    {
      initialValue?: CallStatus;
      errorType?: Error;
    }
  >,
): SignalStoreFeature<
  Input & { state: {}; props: {}; methods: {} },
  {
    state: CallStatusState;
    props: CallStatusComputed<Error>;
    methods: CallStatusMethods<Error>;
  }
>;

// Implementation
export function withCallStatus<
  Input extends SignalStoreFeatureResult,
  Prop extends string = '',
  Error = unknown,
>(
  configFactory: FeatureConfigFactory<
    Input,
    {
      prop?: Prop;
      collection?: Prop;
      initialValue?: CallStatus;
      errorType?: Error;
    }
  > = {},
): any {
  return withFeatureFactory((store: StoreSource<Input>) => {
    const config = getFeatureConfig(configFactory, store);

    const isCollection = 'collection' in config;
    const prop = 'prop' in config ? config.prop : config.collection;
    const keysResult = getWithCallStatusKeys({
      ...(isCollection ? { collection: prop } : { prop }),
    });

    const {
      callStatusKey,
      errorKey,
      loadedKey,
      loadingKey,
      setLoadingKey,
      setLoadedKey,
      setErrorKey,
    } = keysResult as any;

    const { callLoaded, callLoading, callError } = getWithCallStatusEvents({
      prop,
    });
    return signalStoreFeature(
      withState({ [callStatusKey]: config.initialValue ?? 'init' }),
      withComputed((state: Record<string, Signal<unknown>>) => {
        const callState = state[callStatusKey] as Signal<CallStatus>;

        const isLoading = computed(() => {
          return callState() === 'loading';
        });
        const isLoaded = computed(() => callState() === 'loaded');
        const error = computed(() => {
          const v = callState();
          return typeof v === 'object' ? v.error : undefined;
        });
        registerCallState(store, { loading: isLoading, error });
        return {
          [loadingKey]: isLoading,
          [loadedKey]: isLoaded,
          [errorKey]: error,
        };
      }),
      withEventHandler(),
      withMethods((store) => ({
        [setLoadingKey]: () => {
          patchState(store, { [callStatusKey]: 'loading' });
          broadcast(store, callLoading());
        },
        [setLoadedKey]: () => {
          patchState(store, { [callStatusKey]: 'loaded' });
          broadcast(store, callLoaded());
        },
        [setErrorKey]: (error?: unknown) => {
          patchState(store, { [callStatusKey]: { error } });
          broadcast(store, callError({ error }));
        },
      })),
    );
  }) as any;
}
