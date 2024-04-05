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
  setError: () => void;
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
  [K in Prop as `set${Capitalize<string & K>}Error`]: () => void;
};

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
export function withCallStatus<Prop extends string>(config?: {
  prop: Prop;
  initialValue?: CallStatus;
}): SignalStoreFeature<
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
}: {
  prop?: Prop;
  initialValue?: CallStatus;
} = {}): SignalStoreFeature {
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
