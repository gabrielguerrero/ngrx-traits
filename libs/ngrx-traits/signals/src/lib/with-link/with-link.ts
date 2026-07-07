import {
  computed,
  effect,
  isWritableSignal,
  Signal,
  untracked,
  WritableSignal,
} from '@angular/core';
import { SIGNAL } from '@angular/core/primitives/signals';
import {
  patchState,
  SignalStoreFeature,
  signalStoreFeature,
  SignalStoreFeatureResult,
  withMethods,
} from '@ngrx/signals';

import { withFeatureFactory } from '../with-feature-factory/with-feature-factory';
import { StoreSource } from '../with-feature-factory/with-feature-factory.model';

export type LinkOptions = {
  /**
   * Which value wins when an external signal is linked.
   * - 'external' (default): the external signal's current value is pushed to the store.
   * - 'store': the store value is written to the external signal (requires a WritableSignal;
   *   ignored for read-only signals, which are always one-way external → store).
   */
  initialValue?: 'store' | 'external';
};

export type LinkSourceOptions<
  Input extends SignalStoreFeatureResult,
  K extends keyof Input['state'],
> = {
  update?: (
    value: Input['state'][NoInfer<K>],
    store: StoreSource<Input>,
  ) => void;
  /**
   * Equality used to suppress redundant syncs in both directions.
   * Defaults to Object.is. Provide a structural comparison when the source
   * produces fresh object/array references (e.g. entity selections).
   */
  equal?: (
    a: Input['state'][NoInfer<K>],
    b: Input['state'][NoInfer<K>],
  ) => boolean;
  computation?: never;
};

export type LinkComputedOptions<Input extends SignalStoreFeatureResult, T> = {
  computation: (store: StoreSource<Input>) => T;
  update: (value: T, store: StoreSource<Input>) => void;
  /**
   * Equality used to suppress redundant syncs in both directions.
   * Defaults to Object.is. Provide a structural comparison when the source
   * produces fresh object/array references (e.g. entity selections).
   */
  equal?: (a: NoInfer<T>, b: NoInfer<T>) => boolean;
};

/**
 * Generates a `link<Name>()` method that connects store state to component
 * signals (inputs, models, signal forms).
 *
 * The first argument names the generated method and doubles as the state key
 * to link to, unless `computation` is provided in the options — then it is
 * just a name and the value is derived from the store.
 *
 * The method always returns a WritableSignal that is a live view of the store:
 * reading it reads the source, writing it calls `update` (or `patchState` by
 * default). Optionally pass an external signal to keep it in sync with the
 * store as well:
 * - WritableSignal (e.g. `model()`): two-way sync.
 * - Read-only Signal (e.g. `input()`): one-way external → store.
 *
 * Both sync directions are guarded by `equal` (default `Object.is`), so writes
 * only happen when the value actually changed — this prevents echo loops when
 * `update` transforms the value.
 *
 * Passing an external signal requires an injection context (field initializer
 * or constructor), because effects are created to keep it in sync. The no-arg
 * form has no such requirement.
 *
 * @param name - State key to link to, or a custom name when `computation` is used
 * @param options.computation - Derive the linked value from the store
 * @param options.update - How writes reach the store; defaults to
 *   `patchState(store, { [name]: value })`, required with `computation`
 * @param options.equal - Equality guard for both sync directions
 *
 * @example
 * // State key - generates linkFilter(), writes patch state
 * const Store = signalStore(
 *   withState({ filter: { search: '' } }),
 *   withLink('filter'),
 * );
 * // in a component:
 * // filterForm = form(this.store.linkFilter());
 *
 * @example
 * // State key with custom update
 * withLink('productEntitiesFilter', {
 *   update: (value, store) => store.filterProductEntities({ filter: value }),
 * });
 *
 * @example
 * // Custom name with computation + update, synced two-way with a model() input
 * withLink('selectedGenreIds', {
 *   computation: (store) => store.genreIdsSelected(),
 *   update: (value, store) =>
 *     store.selectGenreEntities({ ids: value, clearSelectionBeforeSelect: true }),
 *   equal: (a, b) => a.length === b.length && a.every((v, i) => v === b[i]),
 * });
 * // in a component:
 * // value = model<string[]>([]);
 * // valueField = form(this.store.linkSelectedGenreIds(this.value));
 */
// Overload: state key source
export function withLink<
  Input extends SignalStoreFeatureResult,
  K extends keyof Input['state'] & string,
>(
  source: K,
  options?: LinkSourceOptions<Input, K>,
): SignalStoreFeature<
  Input,
  {
    state: {};
    props: {};
    methods: {
      [P in `link${Capitalize<string & K>}`]: (
        external?: Signal<Input['state'][K]>,
        options?: LinkOptions,
      ) => WritableSignal<Input['state'][K]>;
    };
  }
>;
// Overload: custom name with computation
export function withLink<
  Input extends SignalStoreFeatureResult,
  T,
  N extends string,
>(
  name: N,
  options: LinkComputedOptions<Input, T>,
): SignalStoreFeature<
  Input,
  {
    state: {};
    props: {};
    methods: {
      [P in `link${Capitalize<string & N>}`]: (
        external?: Signal<T>,
        options?: LinkOptions,
      ) => WritableSignal<T>;
    };
  }
>;

export function withLink<Input extends SignalStoreFeatureResult>(
  name: string,
  options?: LinkSourceOptions<Input, any> | LinkComputedOptions<Input, any>,
): SignalStoreFeature<Input, any> {
  return withFeatureFactory((store) => {
    const computation = options && 'computation' in options
      ? options.computation
      : undefined;
    const source: () => any = computation
      ? () => computation(store as any)
      : (store as any)[name];

    const equal = options?.equal ?? Object.is;
    const update = options?.update
      ? (value: any) => options.update!(value, store as any)
      : (value: any) => patchState(store as any, { [name]: value });

    const guardedUpdate = (value: any) => {
      if (!equal(value, source())) {
        update(value);
      }
    };

    const linkMethodName = `link${name.charAt(0).toUpperCase()}${name.slice(1)}`;

    return signalStoreFeature(
      withMethods(() => ({
        [linkMethodName]: (external?: Signal<any>, options?: LinkOptions) => {
          if (external) {
            const initialValue = options?.initialValue ?? 'external';
            if (initialValue === 'external') {
              guardedUpdate(untracked(external));
            } else if (isWritableSignal(external)) {
              external.set(untracked(source));
            }
            // external -> store
            effect(() => {
              const value = external();
              untracked(() => guardedUpdate(value));
            });
            // store -> external, only when the external signal is writable
            if (isWritableSignal(external)) {
              effect(() => {
                const value = source();
                untracked(() => {
                  if (!equal(external(), value)) {
                    external.set(value);
                  }
                });
              });
            }
          }
          return delegatedSignal({
            computation: () => source(),
            update: guardedUpdate,
            equal,
          });
        },
      })),
    );
  }) as any;
}

function delegatedSignal<T>(options: {
  computation: () => T;
  update: (value: T) => void;
  equal?: (a: T, b: T) => boolean;
}): WritableSignal<T> {
  const internalSignal = computed(options.computation, {
    equal: options.equal,
  });

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
