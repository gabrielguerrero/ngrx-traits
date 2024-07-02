import { computed, Signal } from '@angular/core';
import {
  patchState,
  SignalStoreFeature,
  signalStoreFeature,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';

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
 * @param config - Configuration object
 * @param config.prop - The name of the property for which this represents the call status
 * @param config.initialValue - The initial value of the call status
 * @param config.collection - The name of the collection for which this represents the call status is an alias to prop param
 * @param config.errorType - The type of the error
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
export function withCallStatus<Prop extends string, Error = unknown>(
  config:
    | {
        prop: Prop;
        initialValue?: CallStatus;
        errorType?: Error;
      }
    | {
        collection: Prop;
        initialValue?: CallStatus;
        errorType?: Error;
      },
): SignalStoreFeature<
  { state: {}; signals: {}; methods: {} },
  {
    state: NamedCallStatusState<Prop>;
    signals: NamedCallStatusComputed<Prop, Error>;
    methods: NamedCallStatusMethods<Prop, Error>;
  }
>;
/**
 * Generates necessary state, computed and methods for call progress status to the store
 * @param config - Configuration object
 * @param config.prop - The name of the property for which this represents the call status
 * @param config.initialValue - The initial value of the call status
 * @param config.collection - The name of the collection for which this represents the call status is an alias to prop param
 * @param config.errorType - The type of the error
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
export function withCallStatus<Error = unknown>(config?: {
  initialValue?: CallStatus;
  errorType?: Error;
}): SignalStoreFeature<
  { state: {}; signals: {}; methods: {} },
  {
    state: CallStatusState;
    signals: CallStatusComputed<Error>;
    methods: CallStatusMethods<Error>;
  }
>;

export function withCallStatus<Prop extends string>({
  prop,
  initialValue = 'init',
  collection,
}: {
  prop?: Prop;
  collection?: Prop;
  initialValue?: CallStatus;
} = {}): SignalStoreFeature {
  prop = prop ?? collection;
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
    withState({ [callStatusKey]: initialValue }),
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
      [setLoadingKey]: () => patchState(store, { [callStatusKey]: 'loading' }),
      [setLoadedKey]: () => patchState(store, { [callStatusKey]: 'loaded' }),
      [setErrorKey]: (error?: unknown) =>
        patchState(store, { [callStatusKey]: { error } }),
    })),
  );
}
