import {
  computed,
  effect,
  isWritableSignal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { SIGNAL } from '@angular/core/primitives/signals';
import {
  patchState,
  signalMethod,
  SignalStoreFeature,
  signalStoreFeature,
  SignalStoreFeatureResult,
  withMethods,
  withProps,
} from '@ngrx/signals';

import { withFeatureFactory } from '../with-feature-factory/with-feature-factory';
import { StoreSource } from '../with-feature-factory/with-feature-factory.model';

export type LinkConfig<
  Input extends SignalStoreFeatureResult,
  K extends keyof Input['state'],
> = {
  source: K;
  update: (
    value: Input['state'][NoInfer<K>],
    store: StoreSource<Input>,
  ) => void;
};

export type LinkConfigWithComputed<
  Input extends SignalStoreFeatureResult,
  T,
> = {
  computation: (store: StoreSource<Input>) => T;
  update: (value: T, store: StoreSource<Input>) => void;
};

/**
 * Creates a WritableSignal delegated to a store state property via a delegatedSignal.
 * When the source state changes, the delegated signal updates automatically.
 * Optionally syncs changes back to the store.
 *
 * @param configOrSource - A state key string or a DelegatedSignalConfig object
 * @param configOrSource.source - The state key to link to
 * @param configOrSource.name - Optional custom prop name, defaults to `${source}Delegated`
 * @param configOrSource.update - Sync strategy: undefined will patchState by default,
 *   or a custom callback `(signal, store) => void`.
 *
 * @example
 * // String shorthand - creates `filterDelegated` prop, auto-patches state on change
 * const Store = signalStore(
 *   withState({ filter: { search: '' } }),
 *   withDelegatedSignal('filter'),
 * );
 * // store.filterDelegated.set({ search: 'shoes' });
 * // store.filter() => { search: 'shoes' }
 *
 * @example
 * // Config object - custom update callback
 * const Store = signalStore(
 *   withState({ filter: { search: '' } }),
 *   withDelegatedSignal({
 *     source: 'filter',
 *     update: (value, store) => {
 *       store.filterEntities(value);
 *     },
 *   }),
 * );
 *
 * // generates the following props
 * store.filterDelegated // WritableSignal<{ search: string }>
 */
// Overload: string shorthand
export function withLink<
  Input extends SignalStoreFeatureResult,
  K extends keyof Input['state'] & string,
>(
  source: K,
): SignalStoreFeature<
  Input,
  {
    state: {};
    props: {};
    methods: {
      [P in `link${Capitalize<string & K>}`]: (
        source?: Signal<Input['state'][K]>,
      ) => WritableSignal<Input['state'][K]>;
    };
  }
>;
// // overload without name
export function withLink<
  Input extends SignalStoreFeatureResult,
  K extends keyof Input['state'] & string,
>(
  config: LinkConfig<Input, K>,
): SignalStoreFeature<
  Input,
  {
    state: {};
    props: {};
    methods: {
      [P in `link${Capitalize<string & K>}`]: (
        source?: Signal<Input['state'][K]>,
      ) => WritableSignal<Input['state'][K]>;
    };
  }
>;
export function withLink<
  Input extends SignalStoreFeatureResult,
  K,
  T extends string,
>(
  config: LinkConfigWithComputed<Input, K> & { name: T },
): SignalStoreFeature<
  Input,
  {
    state: {};
    props: {};
    methods: {
      [P in `link${Capitalize<string & T>}`]: (
        source?: Signal<K>,
      ) => WritableSignal<K>;
    };
  }
>;

export function withLink<Input extends SignalStoreFeatureResult>(
  configOrSource:
    | string
    | LinkConfig<Input, any>
    | LinkConfigWithComputed<Input, any>,
): SignalStoreFeature<Input, any> {
  return withFeatureFactory((store) => {
    // source-based overloads
    const config: {
      name?: string;
      source: string;
      update?: (value: any, store: any) => void;
    } =
      typeof configOrSource === 'string'
        ? {
            source: configOrSource,
          }
        : (configOrSource as any);

    const sourceKey = config.source;
    const source =
      typeof configOrSource === 'object' && 'computation' in configOrSource
        ? () => configOrSource.computation(store as any)
        : (store as any)[sourceKey];

    const update = config.update;

    const updateFn = update
      ? signalMethod((value: any) => {
          update(value, store as any);
        })
      : signalMethod((value: any) => {
          patchState(store as any, { [sourceKey]: value });
        });

    const name = config.name || sourceKey;
    const linkMethodName = `link${name.charAt(0).toUpperCase()}${name.slice(1)}`;

    return signalStoreFeature(
      withMethods(() => ({
        [linkMethodName]: (syncSignal?: Signal<any>) => {
          if (syncSignal) {
            updateFn(syncSignal);
            if (isWritableSignal(syncSignal)) {
              effect(() => {
                syncSignal.set(source());
              });
            }
            return syncSignal;
          } else {
            const linked = delegatedSignal({
              computation: () => source(),
              update: (value) => {
                updateFn?.(value);
              },
            });
            return linked;
          }
        },
      })),
    );
  }) as any;
}

function delegatedSignal<T>(options: {
  computation: () => T;
  update: (value: T) => void;
}): WritableSignal<T> {
  const internalSignal = computed(options.computation);

  const res: WritableSignal<T> = Object.assign(() => internalSignal(), {
    [SIGNAL]: internalSignal[SIGNAL],
    set: (value: T) => options.update(value),
    update: (updateFn: (value: T) => T) => {
      const newValue = updateFn(internalSignal());
      options.update(newValue);
    },
    asReadonly: () => internalSignal,
  } as WritableSignal<T>);
  return res;
}
