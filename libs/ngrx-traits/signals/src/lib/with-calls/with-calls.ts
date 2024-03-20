import {
  computed,
  EnvironmentInjector,
  inject,
  runInInjectionContext,
  Signal,
} from '@angular/core';
import {
  patchState,
  signalStoreFeature,
  SignalStoreFeature,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  SignalStoreFeatureResult,
  SignalStoreSlices,
} from '@ngrx/signals/src/signal-store-models';
import { StateSignal } from '@ngrx/signals/src/state-signal';
import {
  catchError,
  exhaustMap,
  first,
  from,
  map,
  Observable,
  of,
  pipe,
} from 'rxjs';

import {
  CallStatus,
  NamedCallState,
  NamedCallStateComputed,
  NamedCallStateMethods,
} from '../with-call-status/with-call-status';
import { getWithCallStatusKeys } from '../with-call-status/with-call-status.util';
import { getWithCallKeys } from './with-calls.util';

type Call<Params extends readonly any[] = any[], Result = any> = (
  ...args: Params
) => Observable<Result> | Promise<Result>;
type CallConfig<
  Params extends readonly any[] = any[],
  Result = any,
  PropName extends string = string,
> = {
  call: Call<Params, Result>;
  resultProp: PropName;
};

export type ExtractCallResultType<T extends Call | CallConfig> =
  T extends Call<any, infer R>
    ? R
    : T extends CallConfig<any, infer R>
      ? R
      : never;
export type ExtractCallParams<T extends Call | CallConfig> =
  T extends Call<infer P> ? P : T extends CallConfig<infer P> ? P : never;

export function withCalls<
  Input extends SignalStoreFeatureResult,
  const Calls extends Record<string, Call | CallConfig>,
>(
  callsFactory: (
    store: SignalStoreSlices<Input['state']> &
      Input['signals'] &
      Input['methods'],
  ) => Calls,
): SignalStoreFeature<
  Input,
  Input & {
    state: NamedCallState<keyof Calls & string> & {
      [K in keyof Calls as Calls[K] extends CallConfig
        ? Calls[K]['resultProp'] & string
        : `${K & string}Data`]?: ExtractCallResultType<Calls[K]>;
    };
    signals: NamedCallStateComputed<keyof Calls & string>;
    methods: {
      [K in keyof Calls]: (...arg: ExtractCallParams<Calls[K]>) => void;
    };
  }
> {
  return (store) => {
    const calls = callsFactory({
      ...store.slices,
      ...store.signals,
      ...store.methods,
    } as SignalStoreSlices<Input['state']> &
      Input['signals'] &
      Input['methods']);
    const callsState = Object.keys(calls).reduce(
      (acc, callName) => {
        const { callStatusKey } = getWithCallStatusKeys({ prop: callName });
        acc[callStatusKey] = 'init';
        return acc;
      },
      {} as Record<string, any>,
    );

    return signalStoreFeature(
      withState(callsState),
      withComputed((state: Record<string, Signal<unknown>>) => {
        const callsComputed = Object.keys(calls).reduce(
          (acc, callName) => {
            const { loadingKey, loadedKey, errorKey, callStatusKey } =
              getWithCallStatusKeys({ prop: callName });
            const callState = state[callStatusKey] as Signal<CallStatus>;
            acc[loadingKey] = computed(() => callState() === 'loading');
            acc[loadedKey] = computed(() => callState() === 'loaded');
            acc[errorKey] = computed(() => {
              const v = callState();
              return typeof v === 'object' ? v.error : null;
            });

            return acc;
          },
          {} as Record<string, any>,
        );
        return callsComputed;
      }),
      withMethods(
        (state, environmentInjector = inject(EnvironmentInjector)) => {
          const methods = Object.entries(calls).reduce(
            (acc, [callName, call]) => {
              const {
                callStatusKey,
                setLoadingKey,
                setLoadedKey,
                setErrorKey,
              } = getWithCallStatusKeys({ prop: callName });
              const { resultPropKey, callNameKey } = getWithCallKeys({
                callName,
                resultProp: isCallConfig(call)
                  ? call.resultProp
                  : `${callName}Data`,
              });
              const setLoading = () =>
                patchState(store, {
                  [callStatusKey]: 'loading',
                } as StateSignal<object>);
              const setLoaded = () =>
                patchState(store, {
                  [callStatusKey]: 'loaded',
                } as StateSignal<object>);
              const setError = (error: unknown) =>
                patchState(store, {
                  [callStatusKey]: error,
                } as StateSignal<object>);
              acc[setLoadingKey] = () =>
                patchState(store, {
                  [callStatusKey]: 'loading',
                } as StateSignal<object>);
              acc[setLoadedKey] = () =>
                patchState(store, {
                  [callStatusKey]: 'loaded',
                } as StateSignal<object>);
              acc[setErrorKey] = () =>
                patchState(store, {
                  [callStatusKey]: 'fail',
                } as StateSignal<object>);
              acc[callNameKey] = rxMethod<unknown[]>(
                pipe(
                  exhaustMap((params) => {
                    setLoading();
                    return runInInjectionContext(environmentInjector, () => {
                      return from(
                        isCallConfig(call) ? call.call(params) : call(params),
                      ).pipe(
                        map((result) => {
                          patchState(state, {
                            [resultPropKey]: result,
                          });
                          setLoaded();
                        }),
                        catchError((error: unknown) => {
                          setError(error);
                          return of();
                        }),
                        first(),
                      );
                    });
                  }),
                ),
              );
              return acc;
            },
            {} as Record<string, any>,
          );
          return methods;
        },
      ),
    )(store) as any; // not found a nice way to remove this any
  };
}

function isCallConfig(call: Call | CallConfig): call is CallConfig {
  return typeof call === 'object';
}
