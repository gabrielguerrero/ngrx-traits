import { WritableSignal } from '@angular/core';
import {
  patchState,
  signalMethod,
  SignalStoreFeature,
  signalStoreFeature,
  SignalStoreFeatureResult,
  withHooks,
  withProps,
} from '@ngrx/signals';

import { withFeatureFactory } from '../with-feature-factory/with-feature-factory';
import { StoreSource } from '../with-feature-factory/with-feature-factory.model';
import { delegatedSignal } from './delegate-signal';

export type DelegatedSignalConfig<
  Input extends SignalStoreFeatureResult,
  K extends keyof Input['state'],
> = {
  source: K;
  update?: (
    value: WritableSignal<Input['state'][NoInfer<K>]>,
    store: StoreSource<Input>,
  ) => void;
};

export type DelegatedSignalConfigWithComputed<
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
 *     update: (signal, store) => {
 *       store.filterEntities(signal());
 *     },
 *   }),
 * );
 *
 * // generates the following props
 * store.filterDelegated // WritableSignal<{ search: string }>
 */
// Overload: string shorthand
export function withDelegatedSignal<
  Input extends SignalStoreFeatureResult,
  K extends keyof Input['state'] & string,
>(
  source: K,
): SignalStoreFeature<
  Input,
  {
    state: {};
    props: { [P in `${K}Delegated`]: WritableSignal<Input['state'][K]> };
    methods: {};
  }
>;

// Overload: config object with name
export function withDelegatedSignal<
  Input extends SignalStoreFeatureResult,
  K extends keyof Input['state'] & string,
  N extends string,
>(
  config: DelegatedSignalConfig<Input, K> & { name: N },
): SignalStoreFeature<
  Input,
  {
    state: {};
    props: {
      [P in N as `${string & N}`]: WritableSignal<Input['state'][K]>;
    };
    methods: {};
  }
>;

// Overload: config object with computation and update
export function withDelegatedSignal<
  Input extends SignalStoreFeatureResult,
  T,
  N extends string,
>(
  config: DelegatedSignalConfigWithComputed<Input, T> & {
    name: N;
  },
): SignalStoreFeature<
  Input,
  {
    state: {};
    props: {
      [P in N as `${string & N}`]: WritableSignal<T>;
    };
    methods: {};
  }
>;

// // overload without name
export function withDelegatedSignal<
  Input extends SignalStoreFeatureResult,
  K extends keyof Input['state'] & string,
>(
  config: DelegatedSignalConfig<Input, K>,
): SignalStoreFeature<
  Input,
  {
    state: {};
    props: {
      [P in K as `${P}Delegated`]: WritableSignal<Input['state'][K]>;
    };
    methods: {};
  }
>;

// Implementation
export function withDelegatedSignal<Input extends SignalStoreFeatureResult>(
  configOrSource:
    | string
    | (DelegatedSignalConfig<Input, any> & { name?: string })
    | ({
        name: string;
      } & DelegatedSignalConfigWithComputed<Input, any>),
): SignalStoreFeature<Input, any> {
  return withFeatureFactory((store) => {
    // computation + update overload (no source key)
    if (
      typeof configOrSource === 'object' &&
      'computation' in configOrSource
    ) {
      const { name, computation, update } =
        configOrSource as DelegatedSignalConfigWithComputed<Input, any> & {
          name: string;
        };
      const delegated = delegatedSignal({
        computation: () => computation(store as any),
        update: (value) => update(value, store as any),
      });
      return signalStoreFeature(
        withProps(() => ({ [name]: delegated }) as any),
      );
    }

    // source-based overloads
    const config: {
      name?: string;
      source: string;
      update?: (value: WritableSignal<any>, store: any) => void;
    } =
      typeof configOrSource === 'string'
        ? {
            source: configOrSource,
          }
        : (configOrSource as any);

    const propName = config.name ?? `${config.source}Delegated`;
    const sourceKey = config.source;
    const source = (store as any)[sourceKey];

    const update = config.update;

    const updateFn = update
      ? signalMethod((value: any) => {
          update(source, store as any);
        })
      : signalMethod((value: any) => {
          patchState(store as any, { [sourceKey]: value });
        });

    const linked = delegatedSignal({
      computation: () => source(),
      update: (value) => updateFn?.(value),
    });

    return signalStoreFeature(
      withProps(() => ({ [propName]: linked }) as any),
      withHooks(() => ({
        onInit: () => {
          if (updateFn) {
            updateFn(() => linked());
          }
        },
      })),
    );
  }) as any;
}
