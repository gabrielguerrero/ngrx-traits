import { linkedSignal, WritableSignal } from '@angular/core';
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

export type LinkedSignalConfig<
  Input extends SignalStoreFeatureResult,
  K extends keyof Input['state'],
> = {
  source: K;
  onChange?:
    | null
    | 'patchState'
    | ((
        value: WritableSignal<Input['state'][NoInfer<K>]>,
        store: StoreSource<Input>,
      ) => void);
};

/**
 * Creates a WritableSignal linked to a store state property via Angular's linkedSignal.
 * When the source state changes, the linked signal updates automatically.
 * Optionally syncs changes back to the store.
 *
 * @param configOrSource - A state key string or a LinkedSignalConfig object
 * @param configOrSource.source - The state key to link to
 * @param configOrSource.name - Optional custom prop name, defaults to `${source}Linked`
 * @param configOrSource.onChange - Sync strategy: `null` (no sync), `'patchState'` (always sync),
 *   or a custom callback `(signal, store) => void`. String shorthand defaults to `'patchState'`.
 *
 * @example
 * // String shorthand - creates `filterLinked` prop, auto-patches state on change
 * const Store = signalStore(
 *   withState({ filter: { search: '' } }),
 *   withLinkedSignal('filter'),
 * );
 * // store.filterLinked.set({ search: 'shoes' });
 * // store.filter() => { search: 'shoes' }
 *
 * @example
 * // Config object - custom onChange callback
 * const Store = signalStore(
 *   withState({ filter: { search: '' } }),
 *   withLinkedSignal({
 *     source: 'filter',
 *     onChange: (signal, store) => {
 *       store.filterEntities(signal());
 *     },
 *   }),
 * );
 *
 * // generates the following props
 * store.filterLinked // WritableSignal<{ search: string }>
 */
// Overload: string shorthand
export function withLinkedSignal<
  Input extends SignalStoreFeatureResult,
  K extends keyof Input['state'] & string,
>(
  source: K,
): SignalStoreFeature<
  Input,
  {
    state: {};
    props: { [P in `${K}Linked`]: WritableSignal<Input['state'][K]> };
    methods: {};
  }
>;

// Overload: config object with name
export function withLinkedSignal<
  Input extends SignalStoreFeatureResult,
  K extends keyof Input['state'] & string,
  N extends string,
>(
  config: LinkedSignalConfig<Input, K> & { name: N },
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

// Overload: config object without name
export function withLinkedSignal<
  Input extends SignalStoreFeatureResult,
  K extends keyof Input['state'] & string,
>(
  config: LinkedSignalConfig<Input, K>,
): SignalStoreFeature<
  Input,
  {
    state: {};
    props: {
      [P in K as `${P}Linked`]: WritableSignal<Input['state'][K]>;
    };
    methods: {};
  }
>;

// Implementation
export function withLinkedSignal<Input extends SignalStoreFeatureResult>(
  configOrSource:
    | string
    | (LinkedSignalConfig<Input, any> & { name?: string }),
): SignalStoreFeature<Input, any> {
  return withFeatureFactory((store) => {
    const config: {
      name?: string;
      source: string;
      onChange?:
        | null
        | 'patchState'
        | ((value: WritableSignal<any>, store: any) => void);
    } =
      typeof configOrSource === 'string'
        ? {
            source: configOrSource,
            onChange: 'patchState',
          }
        : (configOrSource as any);

    const propName = config.name ?? `${config.source}Linked`;
    const sourceKey = config.source;
    const source = (store as any)[sourceKey];
    const linked = linkedSignal(source);
    const onChange = config.onChange;

    const onChangeFn = onChange
      ? signalMethod((value: any) => {
          if (onChange === 'patchState') {
            patchState(store as any, { [sourceKey]: value });
          } else {
            onChange(linked, store as any);
          }
        })
      : null;

    return signalStoreFeature(
      withProps(() => ({ [propName]: linked }) as any),
      withHooks(() => ({
        onInit: () => {
          if (onChangeFn) {
            onChangeFn(() => linked());
          }
        },
      })),
    );
  }) as any;
}
