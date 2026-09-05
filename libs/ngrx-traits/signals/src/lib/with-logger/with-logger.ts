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

type LoggerFilter<Input extends SignalStoreFeatureResult> =
  | ((store: StateSignals<Input['state']> & Input['props']) => any)
  | readonly (keyof (StateSignals<Input['state']> & Input['props']))[];

/**
 * Log the state of the store on every change, optionally filter the signals to log
 * the filter prop can receive an array with the names of the props to filter, or you can provide a function
 * which receives the store as an argument and should return the object to log, if any of the props in the object is a signal
 * it will log the value of the signal, the returned value can also be a non object value like a nested signal value.
 * If showDiff is true it will log the diff of the state on every change.
 *
 * @param name - The name of the store to log
 * @param config - optional filter and showDiff options
 *
 * @example
 *
 *  const Store = signalStore(
 *     withState(() => ({ prop1: 1, prop2: 2 })),
 *     withComputed(({ prop1, prop2 }) => ({
 *       prop3: computed(() => prop1() + prop2()),
 *     })),
 *     // by default it will log all state and computed signals
 *     withLogger('Store'),
 *   );
 *
 *  // logs on every change:
 *  // Store store initialized:  { prop1: 1, prop2: 2, prop3: 3 }
 *  // Store store changed:  { prop1: 5, prop2: 2, prop3: 7 }
 *
 * @example
 *
 *  const Store = signalStore(
 *     withState(() => ({ prop1: 1, prop2: 2 })),
 *     withComputed(({ prop1, prop2 }) => ({
 *       prop3: computed(() => prop1() + prop2()),
 *     })),
 *     withLogger('Store', {
 *       // you can filter with an array of keys
 *       filter: ['prop1', 'prop2'],
 *       // or you can filter with a function
 *       // filter: ({ prop1, prop2 }) => ({ prop1, prop2 }),
 *       // the function can also return nested signals or their values
 *       // filter: ({ myObject }) => ({ x: myObject.x }),
 *       // filter: ({ myObject }) => myObject.x(),
 *     }),
 *   );
 *
 * @example
 *  // showDiff logs what changed between the previous and the current state
 *  const Store = signalStore(
 *     withState(() => ({ prop1: 1, prop2: 2 })),
 *     withLogger('Store', { showDiff: true }),
 *   );
 *
 *  // after patchState(store, { prop1: 5 }) logs:
 *  // Store store changed:  { prop1: 5, prop2: 2 }
 *  // Store store changes diff :
 *  // - prop1: 1
 *  // + prop1: 5
 */
export function withLogger<Input extends SignalStoreFeatureResult>(
  name: string,
  config?: {
    filter?: LoggerFilter<Input>;
    showDiff?: boolean;
  },
): SignalStoreFeature<Input, EmptyFeatureResult>;
/**
 * @deprecated Pass the name as the first argument instead, the rest of the options
 * stay in the config object, e.g. `withLogger('Store', { filter: ['prop1'], showDiff: true })`.
 *
 * @param config - object with the name of the store to log, and the optional filter and showDiff options
 */
export function withLogger<Input extends SignalStoreFeatureResult>(config: {
  name: string;
  filter?: LoggerFilter<Input>;
  showDiff?: boolean;
}): SignalStoreFeature<Input, EmptyFeatureResult>;
export function withLogger<Input extends SignalStoreFeatureResult>(
  nameOrConfig:
    | string
    | {
        name: string;
        filter?: LoggerFilter<Input>;
        showDiff?: boolean;
      },
  config?: {
    filter?: LoggerFilter<Input>;
    showDiff?: boolean;
  },
): SignalStoreFeature<Input, EmptyFeatureResult> {
  const { name, filter, showDiff } =
    typeof nameOrConfig === 'string'
      ? { name: nameOrConfig, ...config }
      : nameOrConfig;
  return signalStoreFeature(
    type<Input>(),
    withHooks({
      onInit(store) {
        function evaluateSignals(source: any, keys?: string[], sort?: boolean) {
          return typeof source === 'object'
            ? (sort ? Object.keys(source).sort() : Object.keys(source)).reduce(
                (acc, key) => {
                  if (!keys || keys.includes(key)) {
                    if (isSignal(source[key])) {
                      acc[key] = source[key]();
                    } else if (typeof source[key] != 'function') {
                      // if not signal only log values that are not methods
                      acc[key] = source[key];
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
            ? evaluateSignals(store, undefined, true)
            : typeof filter === 'function'
              ? evaluateSignals(
                  filter(
                    store as StateSignals<Input['state']> & Input['props'],
                  ),
                )
              : evaluateSignals(store, filter as unknown as string[]);
        });
        let lastState: any = undefined;
        let initialized = false;
        effect(() => {
          const state = signalsComputed();
          console.log(
            `${name} store ${initialized ? 'changed' : 'initialized'}: `,
            state,
          );
          if (showDiff && initialized)
            deepDiff(`${name} store changes diff :`, lastState, state);
          lastState = state;
          initialized = true;
        });
      },
    }),
  );
}
