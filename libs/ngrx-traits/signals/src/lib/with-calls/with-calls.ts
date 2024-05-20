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
import { Prettify } from '@ngrx/signals/src/ts-helpers';
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
  NamedCallStatusComputed,
  NamedCallStatusState,
} from '../with-call-status/with-call-status.model';
import { getWithCallStatusKeys } from '../with-call-status/with-call-status.util';
import {
  Call,
  CallConfig,
  ExtractCallParams,
  ExtractCallResultType,
  NamedCallsStatusComputed,
  NamedCallsStatusErrorComputed,
} from './with-calls.model';
import { getWithCallKeys } from './with-calls.util';

/**
 * Generates necessary state, computed and methods to track the progress of the
 * call and store the result of the call. The generated methods are rxMethods with
 * the same name as the original call, which accepts either the original parameters
 * or a Signal or Observable of the same type as the original parameters. The Signal
 * or Observable type will be the type of the first param if it only has one parameter
 * or an array with the same type as the parameters.
 * @param {callsFactory} callsFactory - a factory function that receives the store and returns an object of type {Record<string, Call | CallConfig>} with the calls to be made
 *
 * @example
 *  withCalls(({ productsSelectedEntity }) => ({
 *     loadProductDetail: typedCallConfig({
 *       call: ({ id }: { id: string }) =>
 *         inject(ProductService).getProductDetail(id),
 *       resultProp: 'productDetail',
 *       // storeResult: false, // will omit storing the result, and remove the result prop from the store
 *       mapPipe: 'switchMap', // default is 'exhaustMap'
 *       onSuccess: (result, callParam) => {
 *       // do something with the result
 *       },
 *       mapError: (error, callParam) => {
 *         return // transform the error before storing it
 *       }
 *       onError: (error, callParam) => {
 *       // do something with the error
 *       },
 *     }),
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
 *   store.checkoutError // unknown | null
 *   // generates the following methods
 *   store.loadProductDetail // ({id: string} | Signal<{id: string}> | Observable<{id: string}>) => void
 *   store.checkout // () => void
 *
 */
export function withCalls<
  Input extends SignalStoreFeatureResult,
  const Calls extends Record<string, Call | CallConfig>,
>(
  callsFactory: (
    store: Prettify<
      SignalStoreSlices<Input['state']> &
        Input['signals'] &
        Input['methods'] &
        StateSignal<Prettify<Input['state']>>
    >,
  ) => Calls,
): SignalStoreFeature<
  Input,
  {
    state: NamedCallStatusState<keyof Calls & string> & {
      [K in keyof Calls as Calls[K] extends CallConfig
        ? Calls[K]['storeResult'] extends false
          ? never
          : Calls[K]['resultProp'] extends ''
            ? `${K & string}Result`
            : Calls[K]['resultProp'] & string
        : `${K & string}Result`]: ExtractCallResultType<Calls[K]> | undefined;
    };
    signals: NamedCallsStatusComputed<keyof Calls & string> &
      NamedCallsStatusErrorComputed<Calls>;
    methods: {
      [K in keyof Calls]: Calls[K] extends (() => any) | CallConfig<undefined>
        ? { (): void }
        : {
            (
              param:
                | ExtractCallParams<Calls[K]>
                | Observable<ExtractCallParams<Calls[K]>>
                | Signal<ExtractCallParams<Calls[K]>>,
            ): void;
          };
    };
  }
> {
  return (store) => {
    const { slices, methods, signals, hooks, ...rest } = store;
    const calls = callsFactory({
      ...slices,
      ...signals,
      ...methods,
      ...rest,
    } as Prettify<
      SignalStoreSlices<Input['state']> &
        Input['signals'] &
        Input['methods'] &
        StateSignal<Prettify<Input['state']>>
    >);
    const callsState = Object.entries(calls).reduce(
      (acc, [callName, call]) => {
        const { callStatusKey } = getWithCallStatusKeys({ prop: callName });
        acc[callStatusKey] = 'init';
        const { resultPropKey } = getWithCallKeys({
          callName,
          resultProp:
            isCallConfig(call) && call.resultProp?.length
              ? call.resultProp
              : `${callName}Result`,
        });
        if (!isCallConfig(call) || call.storeResult !== false) {
          acc[resultPropKey] = undefined;
        }
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
              const { callStatusKey } = getWithCallStatusKeys({
                prop: callName,
              });
              const { resultPropKey, callNameKey } = getWithCallKeys({
                callName,
                resultProp:
                  isCallConfig(call) && call.resultProp?.length
                    ? call.resultProp
                    : `${callName}Result`,
              });
              // TODO: fix as any
              const mapPipe =
                isCallConfig(call) && call.mapPipe
                  ? mapPipes[call.mapPipe]
                  : exhaustMap;

              const setLoading = () =>
                patchState(store, {
                  [callStatusKey]: 'loading',
                } as any);
              const setLoaded = () =>
                patchState(store, {
                  [callStatusKey]: 'loaded',
                } as any);
              const setError = (error: unknown) =>
                patchState(store, {
                  [callStatusKey]: { error },
                } as any);

              acc[callNameKey] = rxMethod<unknown[]>(
                pipe(
                  mapPipe((params) => {
                    setLoading();
                    return runInInjectionContext(environmentInjector, () => {
                      return from(
                        isCallConfig(call) ? call.call(params) : call(params),
                      ).pipe(
                        map((result) => {
                          if (
                            !isCallConfig(call) ||
                            call.storeResult !== false
                          ) {
                            patchState(state, {
                              [resultPropKey]: result,
                            });
                          }
                          setLoaded();
                          isCallConfig(call) &&
                            call.onSuccess &&
                            call.onSuccess(result, params);
                        }),
                        first(),
                        catchError((error: unknown) => {
                          const e =
                            (isCallConfig(call) &&
                              call.mapError?.(error, params)) ||
                            error;
                          setError(e);
                          isCallConfig(call) &&
                            call.onError &&
                            call.onError(e, params);
                          return of();
                        }),
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

export function typedCallConfig<
  Param extends any = undefined,
  Result = any,
  PropName extends string = '',
  Error = unknown,
  C extends CallConfig<Param, Result, PropName, Error> = CallConfig<
    Param,
    Result,
    PropName,
    Error
  >,
>(
  config: Omit<CallConfig<Param, Result, PropName, Error>, 'resultProp'> & {
    resultProp?: PropName;
  },
) {
  // this fixes weird issue where typedCallConfig was not generating the right types
  // when CallConfig resultProp was defined
  return { ...config, resultProp: config.resultProp ?? '' } as C;
}
