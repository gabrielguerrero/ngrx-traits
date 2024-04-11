import { computed, Signal } from '@angular/core';
import {
  patchState,
  SignalStoreFeature,
  signalStoreFeature,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';

import { getWithCallStatusKeys } from './with-call-status.util';

export type CallStatus = 'init' | 'loading' | 'loaded' | { error: unknown };

export type CallState = {
  callStatus: CallStatus;
};
export type CallStateComputed = {
  loading: Signal<boolean>;
} & {
  loaded: Signal<boolean>;
} & {
  error: Signal<string | null>;
};
export type CallStateMethods = {
  setLoading: () => void;
} & {
  setLoaded: () => void;
} & {
  setError: (error?: unknown) => void;
};
export type NamedCallState<Prop extends string> = {
  [K in Prop as `${K}CallStatus`]: CallStatus;
};
export type NamedCallStateComputed<Prop extends string> = {
  [K in Prop as `${K}Loading`]: Signal<boolean>;
} & {
  [K in Prop as `${K}Loaded`]: Signal<boolean>;
} & {
  [K in Prop as `${K}Error`]: Signal<string | null>;
};
export type NamedCallStateMethods<Prop extends string> = {
  [K in Prop as `set${Capitalize<string & K>}Loading`]: () => void;
} & {
  [K in Prop as `set${Capitalize<string & K>}Loaded`]: () => void;
} & {
  [K in Prop as `set${Capitalize<string & K>}Error`]: (error?: unknown) => void;
};

/**
 * Generates necessary state, computed and methods for call progress status to the store
 * @param config - Configuration object
 * @param config.prop - The name of the property for which this represents the call status
 * @param config.initialValue - The initial value of the call status
 * @param config.collection - The name of the collection for which this represents the call status is an alias to prop param
 * they do the same thing
 *
 * prop or collection is required
 * @example
 * const store = signalStore(
 *  withCallStatus({ prop: 'users', })
 *  // other valid configurations
 *  // withCallStatus()
 *  // withCallStatus({ collection: 'users', initialValue: 'loading' })
 *  )
 *
 *  // generates the following signals
 *  store.usersCallStatus // 'init' | 'loading' | 'loaded' | { error: unknown }
 *  // generates the following computed signals
 *  store.usersLoading // boolean
 *  store.usersLoaded // boolean
 *  store.usersError // unknown | null
 *  // generates the following methods
 *  store.setUsersLoading // () => void
 *  store.setUsersLoaded // () => void
 *  store.setUsersError // (error?: unknown) => void
 */
export function withCallStatus(config?: {
  initialValue?: CallStatus;
}): SignalStoreFeature<
  { state: {}; signals: {}; methods: {} },
  {
    state: CallState;
    signals: CallStateComputed;
    methods: CallStateMethods;
  }
>;

/**
 * Generates necessary state, computed and methods for call progress status to the store
 * @param config - Configuration object
 * @param config.prop - The name of the property for which this represents the call status
 * @param config.initialValue - The initial value of the call status
 * @param config.collection - The name of the collection for which this represents the call status is an alias to prop param
 * they do the same thing
 *
 * prop or collection is required
 * @example
 * const store = signalStore(
 *  withCallStatus({ prop: 'users', })
 *  // other valid configurations
 *  // withCallStatus()
 *  // withCallStatus({ collection: 'users', initialValue: 'loading' })
 *  )
 *
 *  // generates the following signals
 *  store.usersCallStatus // 'init' | 'loading' | 'loaded' | { error: unknown }
 *  // generates the following computed signals
 *  store.usersLoading // boolean
 *  store.usersLoaded // boolean
 *  store.usersError // unknown | null
 *  // generates the following methods
 *  store.setUsersLoading // () => void
 *  store.setUsersLoaded // () => void
 *  store.setUsersError // (error?: unknown) => void
 */
export function withCallStatus<Prop extends string>(
  config?:
    | {
        prop: Prop;
        initialValue?: CallStatus;
      }
    | {
        collection: Prop;
        initialValue?: CallStatus;
      },
): SignalStoreFeature<
  { state: {}; signals: {}; methods: {} },
  {
    state: NamedCallState<Prop>;
    signals: NamedCallStateComputed<Prop>;
    methods: NamedCallStateMethods<Prop>;
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
          return typeof v === 'object' ? v.error : null;
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
