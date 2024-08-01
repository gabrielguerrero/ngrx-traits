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
import { getWithCallStatusKeys } from './with-call-status.util';

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
 *  withCallStatus({ prop: 'users', })
 *  // other valid configurations
 *  // withCallStatus()
 *  // withCallStatus({ collection: 'users', initialValue: 'loading' , errorType: type<string>()})
 *  )
 *
 *  // generates the following signals
 *  store.usersCallStatus // 'init' | 'loading' | 'loaded' | { error: unknown }
 *  // generates the following computed signals
 *  store.isUsersLoading // boolean
 *  store.isUsersLoaded // boolean
 *  store.usersError // unknown | null
 *  // generates the following methods
 *  store.setUsersLoading // () => void
 *  store.setUsersLoaded // () => void
 *  store.setUsersError // (error?: unknown) => void
 */

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
): SignalStoreFeature<
  Input & { state: {}; computed: {}; methods: {} },
  Prop extends ''
    ? {
        state: CallStatusState;
        computed: CallStatusComputed<Error>;
        methods: CallStatusMethods<Error>;
      }
    : {
        state: NamedCallStatusState<Prop>;
        computed: NamedCallStatusComputed<Prop, Error>;
        methods: NamedCallStatusMethods<Prop, Error>;
      }
> {
  return withFeatureFactory((store: StoreSource<Input>) => {
    const config = getFeatureConfig(configFactory, store);

    const prop = 'prop' in config ? config.prop : config.collection;
    const {
      callStatusKey,
      errorKey,
      loadedKey,
      loadingKey,
      setLoadingKey,
      setLoadedKey,
      setErrorKey,
    } = getWithCallStatusKeys({ prop });

    return signalStoreFeature(
      withState({ [callStatusKey]: config.initialValue ?? 'init' }),
      withComputed((state: Record<string, Signal<unknown>>) => {
        const callState = state[callStatusKey] as Signal<CallStatus>;

        return {
          [loadingKey]: computed(() => {
            return callState() === 'loading';
          }),
          [loadedKey]: computed(() => callState() === 'loaded'),
          [errorKey]: computed(() => {
            const v = callState();
            return typeof v === 'object' ? v.error : undefined;
          }),
        };
      }),
      withMethods((store) => ({
        [setLoadingKey]: () =>
          patchState(store, { [callStatusKey]: 'loading' }),
        [setLoadedKey]: () => patchState(store, { [callStatusKey]: 'loaded' }),
        [setErrorKey]: (error?: unknown) =>
          patchState(store, { [callStatusKey]: { error } }),
      })),
    );
  }) as any;
}
