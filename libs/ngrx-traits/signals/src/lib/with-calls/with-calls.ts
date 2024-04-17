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
import type {
  SignalStoreFeatureResult,
  SignalStoreSlices,
} from '@ngrx/signals/src/signal-store-models';
import type { StateSignal } from '@ngrx/signals/src/state-signal';
import {
  catchError,
  concatMap,
  exhaustMap,
  first,
  from,
  map,
  Observable,
  of,
  pipe,
  switchMap,
} from 'rxjs';

import {
  CallStatus,
  NamedCallState,
  NamedCallStateComputed,
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
  resultProp?: PropName;
  mapPipe?: 'switchMap' | 'concatMap' | 'exhaustMap';
};

export type ExtractCallResultType<T extends Call | CallConfig> =
  T extends Call<any, infer R>
    ? R
    : T extends CallConfig<any, infer R>
      ? R
      : never;
export type ExtractCallParams<T extends Call | CallConfig> =
  T extends Call<infer P> ? P : T extends CallConfig<infer P> ? P : never;

/**
 * Generates necessary state, computed and methods to track the progress of the call
 * and store the result of the call
 * @param callsFactory
 *
 * @example
 *  withCalls(({ productsSelectedEntity }) => ({
 *     loadProductDetail: {
 *       call: ({ id }: { id: string }) =>
 *         inject(ProductService).getProductDetail(id),
 *       resultProp: 'productDetail',
 *     },
 *     checkout: () =>
 *       inject(OrderService).checkout({
 *         productId: productsSelectedEntity()!.id,
 *         quantity: 1,
 *       }),
 *   })),
 *
 *   // generates the following signals
 *   store.loadProductDetailCallStatus // 'init' | 'loading' | 'loaded' | { error: unknown }
 *   store.productDetail // the result of the call
 *   store.checkoutCallStatus // 'init' | 'loading' | 'loaded' | { error: unknown }
 *   store.checkoutResult // the result of the call
 *   // generates the following computed signals
 *   store.isLoadProductDetailLoading // boolean
 *   store.isLoadProductDetailLoaded // boolean
 *   store.loadProductDetailError // string | null
 *   store.isCheckoutLoading // boolean
 *   store.isCheckoutLoaded // boolean
 *   store.checkoutError // string | null
 *   // generates the following methods
 *   store.loadProductDetail // ({id: string}) => void
 *   store.checkout // () => void
 *
 */
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
        ? Calls[K]['resultProp'] extends string
          ? Calls[K]['resultProp']
          : `${K & string}Result`
        : `${K & string}Result`]: ExtractCallResultType<Calls[K]>;
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
    const callsState = Object.entries(calls).reduce(
      (acc, [callName, call]) => {
        const { callStatusKey } = getWithCallStatusKeys({ prop: callName });
        acc[callStatusKey] = 'init';
        const { resultPropKey } = getWithCallKeys({
          callName,
          resultProp: isCallConfig(call)
            ? call.resultProp
            : `${callName}Result`,
        });
        acc[resultPropKey] = undefined;
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
                  : `${callName}Result`,
              });

              const mapPipe =
                isCallConfig(call) && call.mapPipe
                  ? mapPipes[call.mapPipe]
                  : exhaustMap;
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
              acc[setErrorKey] = (error?: unknown) =>
                patchState(store, {
                  [callStatusKey]: { error },
                } as StateSignal<object>);
              acc[callNameKey] = rxMethod<unknown[]>(
                pipe(
                  mapPipe((params) => {
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
const mapPipes = {
  switchMap: switchMap,
  concatMap: concatMap,
  exhaustMap: exhaustMap,
};
