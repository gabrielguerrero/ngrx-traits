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
} from './with-calls.model';
import { getWithCallKeys } from './with-calls.util';

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
 *       mapPipe: 'switchMap', // default is 'exhaustMap'
 *       onSuccess: (result) => {
 *       // do something with the result
 *       },
 *       onError: (error) => {
 *       // do something with the error
 *       },
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
    store: Prettify<
      SignalStoreSlices<Input['state']> &
        Input['signals'] &
        Input['methods'] &
        StateSignal<Prettify<Input['state']>>
    >,
  ) => Calls,
): SignalStoreFeature<
  Input,
  Input & {
    state: NamedCallStatusState<keyof Calls & string> & {
      [K in keyof Calls as Calls[K] extends CallConfig
        ? Calls[K]['resultProp'] extends string
          ? Calls[K]['resultProp']
          : `${K & string}Result`
        : `${K & string}Result`]: ExtractCallResultType<Calls[K]> | undefined;
    };
    signals: NamedCallStatusComputed<keyof Calls & string>;
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
              const { callStatusKey } = getWithCallStatusKeys({
                prop: callName,
              });
              const { resultPropKey, callNameKey } = getWithCallKeys({
                callName,
                resultProp: isCallConfig(call)
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
                          patchState(state, {
                            [resultPropKey]: result,
                          });
                          setLoaded();
                          isCallConfig(call) &&
                            call.onSuccess &&
                            call.onSuccess(result);
                        }),
                        first(),
                        catchError((error: unknown) => {
                          setError(error);
                          isCallConfig(call) &&
                            call.onError &&
                            call.onError(error);
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
