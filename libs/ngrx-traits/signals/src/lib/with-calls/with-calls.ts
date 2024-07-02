import {
  computed,
  DestroyRef,
  EnvironmentInjector,
  inject,
  isDevMode,
  runInInjectionContext,
  Signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
  StateSignals,
} from '@ngrx/signals/src/signal-store-models';
import type { StateSignal } from '@ngrx/signals/src/state-signal';
import { Prettify } from '@ngrx/signals/src/ts-helpers';
import {
  catchError,
  concatMap,
  exhaustMap,
  finalize,
  from,
  ignoreElements,
  map,
  merge,
  Observable,
  of,
  pipe,
  share,
  Subject,
  switchMap,
  take,
  takeUntil,
  tap,
  timer,
} from 'rxjs';

import {
  CallStatus,
  NamedCallStatusState,
} from '../with-call-status/with-call-status.model';
import { getWithCallStatusKeys } from '../with-call-status/with-call-status.util';
import {
  Call,
  CallConfig,
  ExtractCallResultType,
  NamedCallsStatusComputed,
  NamedCallsStatusErrorComputed,
  ObservableCall,
} from './with-calls.model';
import { getWithCallKeys } from './with-calls.util';

/**
 * Generates necessary state, computed and methods to track the progress of the
 * call and store the result of the call. The generated methods are rxMethods with
 * the same name as the original call, which accepts either the original parameters
 * or a Signal or Observable of the same type as the original parameters.
 * The original call can only have zero or one parameter, use an object with multiple
 * props as first param if you need more.
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
 *       },
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
 * @warning The default mapPipe is {@link https://www.learnrxjs.io/learn-rxjs/operators/transformation/exhaustmap exhaustMap}. If your call returns an observable that does not complete after the first value is emitted, any changes to the input params will be ignored. Either specify {@link https://www.learnrxjs.io/learn-rxjs/operators/transformation/switchmap switchMap} as mapPipe, or use {@link https://www.learnrxjs.io/learn-rxjs/operators/filtering/take take(1)} or {@link https://www.learnrxjs.io/learn-rxjs/operators/filtering/first first()} as part of your call.
 */
export function withCalls<
  Input extends SignalStoreFeatureResult,
  const Calls extends Record<string, Call | CallConfig>,
>(
  callsFactory: (
    store: Prettify<
      StateSignals<Input['state']> &
        Input['computed'] &
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
    computed: NamedCallsStatusComputed<keyof Calls & string> &
      NamedCallsStatusErrorComputed<Calls>;
    methods: {
      [K in keyof Calls]: Calls[K] extends (...args: infer P) => any
        ? P extends []
          ? () => void
          : {
              (param: P[0]): void;
              (param: Observable<P[0]> | Signal<P[0]>): void;
            }
        : Calls[K] extends CallConfig
          ? Parameters<Calls[K]['call']> extends undefined[]
            ? () => void
            : {
                (...param: Parameters<Calls[K]['call']>): void;
                (
                  param:
                    | Observable<Parameters<Calls[K]['call']>[0]>
                    | Signal<Parameters<Calls[K]['call']>[0]>,
                ): void;
              }
          : never;
    };
  }
> {
  return (store) => {
    const { stateSignals, methods, computedSignals, hooks, ...rest } = store;
    const calls = callsFactory({
      ...stateSignals,
      ...computedSignals,
      ...methods,
      ...rest,
    } as Prettify<
      StateSignals<Input['state']> &
        Input['computed'] &
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

              const callFn = getCallFn(callName, call);

              acc[callNameKey] = rxMethod<unknown[]>(
                pipe(
                  mapPipe((params) => {
                    setLoading();
                    return runInInjectionContext(environmentInjector, () => {
                      return callFn(params).pipe(
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
                        takeUntilDestroyed(),
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

function isCallConfig<Param, Result>(
  call: Call<Param, Result> | CallConfig<Param, Result>,
): call is CallConfig<Param, Result> {
  return typeof call === 'object';
}
const mapPipes = {
  switchMap: switchMap,
  concatMap: concatMap,
  exhaustMap: exhaustMap,
};

export function typedCallConfig<
  Param = undefined,
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

function getCallFn<Param, Result>(
  callName: string,
  call: Call<Param, Result> | CallConfig<Param, Result>,
): ObservableCall<Param, Result> {
  if (isCallConfig(call)) {
    if (!call.mapPipe) {
      return wrapMapPipeWarning(callName, call.call);
    } else {
      return (params) => from(call.call(params));
    }
  } else {
    return wrapMapPipeWarning(callName, call);
  }
}

/**
 * @private
 * Wraps a call with a warning mechanism in dev mode.
 * If the call does not complete after the first value, it logs a warning
 * indicating that the default "exhaustMap" pipe is being used.
 */
function wrapMapPipeWarning<Param, Result>(
  callName: string,
  call: Call<Param, Result>,
): ObservableCall<Param, Result> {
  if (isDevMode()) {
    return (params) => {
      const source$ = from(call(params)).pipe(
        finalize(() => completed$.next()),
        share(),
      );
      const completed$ = new Subject<void>();

      const monitor$ = source$.pipe(
        take(1),
        switchMap(() => timer(100)),
        tap(() => {
          console.warn(
            `withCalls "${callName}" did not complete after the first value and is using the default "exhaustMap" pipe. This means that subsequent values from params will be ignored until the observable completes. Please specify the mapPipe operator or use an observable that completes to avoid this warning.`,
          );
        }),
        takeUntil(completed$),
        ignoreElements(),
      );

      return merge(monitor$, source$);
    };
  } else {
    return (params) => from(call(params));
  }
}
