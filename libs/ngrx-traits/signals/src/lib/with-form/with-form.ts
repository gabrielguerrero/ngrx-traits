import { linkedSignal } from '@angular/core';
import { FieldTree, form, SchemaOrSchemaFn } from '@angular/forms/signals';
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

export type FormConfig<
  Input extends SignalStoreFeatureResult,
  K extends keyof Input['state'],
> = {
  source: K;
  validation?: SchemaOrSchemaFn<Input['state'][NoInfer<K>]>;
  onChange?:
    | null
    | 'patchState'
    | 'patchStateIfValid'
    | ((
        form: FieldTree<Input['state'][NoInfer<K>]>,
        store: StoreSource<Input>,
      ) => void);
};

/**
 * Creates a signal-based FieldTree form linked to a store state property using Angular's
 * linkedSignal and form() from @angular/forms/signals. When the source state changes,
 * the form resets to the new value. Optionally syncs form changes back to the store.
 *
 * @param configOrSource - A state key string or a FormConfig object
 * @param configOrSource.source - The state key to link the form to
 * @param configOrSource.name - Optional custom prop name, defaults to `${source}Form`
 * @param configOrSource.validation - Optional validation schema or function
 * @param configOrSource.onChange - Sync strategy: `null` (no sync), `'patchState'` (always sync),
 *   `'patchStateIfValid'` (sync only when valid), or a custom callback `(form, store) => void`.
 *   String shorthand defaults to `'patchState'`.
 *
 * @example
 * // String shorthand - creates `userStateForm` prop, auto-patches state on change
 * const Store = signalStore(
 *   withState({ userState: { username: '' } }),
 *   withForm('userState', (v) => {
 *     required(v.username);
 *   }),
 * );
 * // store.userStateForm.username().value.set('john');
 * // store.userState() => { username: 'john' }
 *
 * @example
 * // Config object - custom onChange callback
 * const Store = signalStore(
 *   withState({ filter: { search: '' } }),
 *   withForm({
 *     source: 'filter',
 *     validation: (v) => { required(v.search); },
 *     onChange: (form, store) => {
 *       store.filterEntities(form().value());
 *     },
 *   }),
 * );
 *
 * // generates the following props
 * store.filterForm // FieldTree<{ search: string }>
 */
// Overload: string shorthand
export function withForm<
  Input extends SignalStoreFeatureResult,
  K extends keyof Input['state'] & string,
>(
  source: K,
  validation?: SchemaOrSchemaFn<Input['state'][K]>,
): SignalStoreFeature<
  Input,
  {
    state: {};
    props: { [P in `${K}Form`]: FieldTree<Input['state'][K]> };
    methods: {};
  }
>;

// Overload: config object with name
export function withForm<
  Input extends SignalStoreFeatureResult,
  K extends keyof Input['state'] & string,
  N extends string,
>(
  config: FormConfig<Input, K> & { name: N },
): SignalStoreFeature<
  Input,
  {
    state: {};
    props: { [P in N as `${string & N}`]: FieldTree<Input['state'][K]> };
    methods: {};
  }
>;

// Overload: config object without name
export function withForm<
  Input extends SignalStoreFeatureResult,
  K extends keyof Input['state'] & string,
>(
  config: FormConfig<Input, K>,
): SignalStoreFeature<
  Input,
  {
    state: {};
    props: { [P in K as `${P}Form`]: FieldTree<Input['state'][K]> };
    methods: {};
  }
>;

// Implementation
export function withForm<Input extends SignalStoreFeatureResult>(
  configOrSource: string | FormConfig<Input, any>,
  validation?: SchemaOrSchemaFn<any>,
): SignalStoreFeature<Input, any> {
  return withFeatureFactory((store) => {
    // Normalize config
    const config: {
      name?: string;
      source: string;
      validation?: SchemaOrSchemaFn<any>;
      onChange?:
        | null
        | 'patchState'
        | 'patchStateIfValid'
        | ((form: FieldTree<any>, store: any) => void);
    } =
      typeof configOrSource === 'string'
        ? {
            source: configOrSource,
            validation,
            onChange: 'patchState',
          }
        : (configOrSource as any);

    const propName = config.name ?? `${config.source}Form`;
    const sourceKey = config.source;
    const source = (store as any)[sourceKey];
    const formState = linkedSignal(source);
    const formControl = form(formState, config.validation as any);
    const onChange = config.onChange;

    const onChangeFn = onChange
      ? signalMethod(
          ({ state, form: f }: { state: any; form: FieldTree<any> }) => {
            if (onChange === 'patchState') {
              patchState(store as any, { [sourceKey]: state });
            } else if (onChange === 'patchStateIfValid') {
              f().valid() && patchState(store as any, { [sourceKey]: state });
            } else {
              onChange(f, store as any);
            }
          },
        )
      : null;

    return signalStoreFeature(
      withProps(() => ({ [propName]: formControl }) as any),
      withHooks(() => ({
        onInit: () => {
          if (onChangeFn) {
            onChangeFn(() => ({
              state: formState(),
              form: formControl as FieldTree<any>,
            }));
          }
        },
      })),
    );
  }) as any;
}
