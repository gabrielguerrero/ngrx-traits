import { computed, effect, isSignal } from '@angular/core';
import {
  EmptyFeatureResult,
  SignalStoreFeature,
  signalStoreFeature,
  SignalStoreFeatureResult,
  StateSignals,
  type,
  withHooks,
} from '@ngrx/signals';

import { deepDiff } from './with-logger.util';

/**
 * Log the state of the store on every change, optionally filter the signals to log
 * the filter prop can receive an array with the names of the props to filter, or you can provide a function
 * which receives the store as an argument and should return the object to log, if any of the props in the object is a signal
 * it will log the value of the signal. If showDiff is true it will log the diff of the state on every change.
 *
 * @param name - The name of the store to log
 * @param filter - optional filter function to filter the store signals or an array of keys to filter
 * @param showDiff - optional flag to log the diff of the state on every change
 *
 * @example
 *
 *  const Store = signalStore(
 *     withState(() => ({ prop1: 1, prop2: 2 })),
 *     withComputed(({ prop1, prop2 }) => ({
 *       prop3: computed(() => prop1() + prop2()),
 *     })),
 *     withLogger({
 *       name: 'Store',
 *       // by default it will log all state and computed signals
 *       // or you can filter with an array of keys
 *       // filter: ['prop1', 'prop2'],
 *       // or you can filter with a function
 *       // filter: ({ prop1, prop2 }) => ({ prop1, prop2 }),
 *       // showDiff: true,
 *     }),
 *   );
 */
export function withLogger<Input extends SignalStoreFeatureResult>({
  name,
  filter,
  showDiff,
}: {
  name: string;
  filter?:
    | ((store: StateSignals<Input['state']> & Input['props']) => any)
    | readonly (keyof (StateSignals<Input['state']> & Input['props']))[];
  showDiff?: boolean;
}): SignalStoreFeature<Input, EmptyFeatureResult> {
  return signalStoreFeature(
    type<Input>(),
    withHooks({
      onInit(store) {
        function evaluateSignals(source: any, keys?: string[]) {
          return typeof source === 'object'
            ? Object.keys(source).reduce(
                (acc, key) => {
                  if (!keys || keys.includes(key)) {
                    if (isSignal(store[key])) {
                      acc[key] = store[key]();
                    } else {
                      acc[key] = store[key];
                    }
                  }
                  return acc;
                },
                {} as Record<string, any>,
              )
            : source;
        }

        const signalsComputed = computed(() => {
          return !filter
            ? evaluateSignals(store)
            : typeof filter === 'function'
              ? evaluateSignals(
                  filter(
                    store as StateSignals<Input['state']> & Input['props'],
                  ),
                )
              : evaluateSignals(store, filter as unknown as string[]);
        });
        let lastState: any = undefined;
        effect(() => {
          const state = signalsComputed();
          console.log(`${name} store changed: `, state);

          if (showDiff && lastState)
            deepDiff(`${name} store changes diff :`, lastState, state);
          lastState = state;
        });
      },
    }),
  );
}
