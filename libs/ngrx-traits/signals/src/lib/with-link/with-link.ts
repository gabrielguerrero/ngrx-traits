import {
  computed,
  effect,
  EffectRef,
  Injector,
  isSignal,
  linkedSignal,
  Signal,
  untracked,
  WritableSignal,
} from '@angular/core';
import {
  patchState,
  signalMethod,
  SignalStoreFeature,
  signalStoreFeature,
  SignalStoreFeatureResult,
  withMethods,
} from '@ngrx/signals';

import { capitalize } from '../util';
import { withFeatureFactory } from '../with-feature-factory/with-feature-factory';
import { StoreSource } from '../with-feature-factory/with-feature-factory.model';
import { EqualOption, resolveEqual } from './with-link.util';

type LinkCommonOptions<T> = {
  /**
   * Gates which writes reach the store. When provided, the returned signal
   * becomes a `linkedSignal` buffer over the source: writes are kept locally
   * and only pushed to the store when `storeEditsWhen(value)` returns true.
   *
   * It is evaluated on every write, and again inside an effect so it stays
   * reactive: a write made while it returns true commits synchronously, and a
   * value held back while it returned false is pushed as soon as its
   * dependencies make it true (e.g. a form becoming valid). Because the write
   * lands in the buffer first, a gate derived from the value itself (such as a
   * form's `valid()`) already sees the new state.
   *
   * It only applies to writes made **through the returned signal** — the form
   * or code editing the buffer. Values arriving from `readFrom` or `syncWith`
   * are written straight to the store and never gated: those options tell the
   * store what to read, and holding their value back would leave the store
   * disagreeing with the signal it was told to follow. It also means the gate
   * is never evaluated while `link<Name>()` runs, so it can safely read a
   * field declared after it, such as a form built from the returned signal.
   *
   * To reject values coming from `readFrom`, do it in the function form,
   * which receives the previous committed value: return the new value to
   * accept it, or `prev` to keep the store as it is. `syncWith` has no such
   * hook — if you need to validate what an external signal supplies, use
   * `readFrom` + `writeTo` instead of `syncWith`, with the check in
   * `readFrom`.
   *
   * A gate that throws surfaces the error from the write that called it, or
   * from the flush effect on the first tick — never from `link<Name>()`.
   *
   * Requires an injection context, since an effect is created.
   */
  storeEditsWhen?: (value: T) => boolean;
};

/**
 * Options of the generated `link<Name>()` method.
 *
 * `syncWith` is mutually exclusive with `readFrom`/`writeTo`: use `syncWith`
 * when the external signal already matches the store type, or the
 * `readFrom` + `writeTo` pair when each direction needs its own mapping.
 */
export type LinkOptions<T = any> =
  | (LinkCommonOptions<T> & {
      /**
       * External signal kept in sync with the store both ways: writing it
       * updates the store, and store changes are written back to it.
       * Requires a WritableSignal (e.g. `model()`).
       */
      syncWith: WritableSignal<T>;
      readFrom?: never;
      writeTo?: never;
      /**
       * Where the value that wins on link comes from.
       * - 'external' (default): the signal's current value is pushed to the store.
       * - 'store': the store value is written to the signal.
       */
      initialValueFrom?: 'store' | 'external';
    })
  | (LinkCommonOptions<T> & {
      /**
       * External signal the store only reads from: its value is pushed to the
       * store, and store changes are never written back. Accepts any signal,
       * including a writable one whose writes you drive yourself
       * (e.g. a `model()` only written on a button click), or a `computed`
       * that maps an external model to the store type.
       *
       * Also accepts a function receiving the previous committed value, to
       * merge a partial external signal into it, e.g.
       * `(prev) => ({ ...prev, search: this.search() })`. The signals it
       * reads are tracked, the previous value is not, so store changes alone
       * do not re-run it; `prev` is always committed state, never a pending
       * edit the gate is holding back. Return `prev` to reject a value —
       * `storeEditsWhen` does not gate what `readFrom` supplies.
       */
      readFrom?: Signal<T> | ((prev: T) => T);
      /**
       * Where store changes are pushed: a WritableSignal that is set, or a
       * function called with the new value — use it to map back to an
       * external model's type, or to emit an output. Only changes after link
       * are pushed, the value at link time is not.
       *
       * Combine with `readFrom` for a two-way sync with a mapping in each
       * direction. Cannot be combined with `syncWith`.
       *
       * With `readFrom`, a value the external side already holds — the last
       * one it supplied, or the last one pushed out — is not pushed again,
       * so an `output()` does not fire on every change its own input drove.
       * Anything else is a change it does not know about, and is pushed.
       */
      writeTo?: WritableSignal<T> | ((value: T) => void);
      syncWith?: never;
      initialValueFrom?: never;
    });

/** The `link<Name>()` method generated by `withLink`. */
export type LinkMethod<T> = (options?: LinkOptions<T>) => WritableSignal<T>;

/**
 * The `_set<Name>()` method generated by `withLink`, the same write path the
 * linked signal uses (the `set` callback, or `patchState` by default),
 * exposed as a store method. The `_` prefix makes it private to the store, so
 * other features and methods can write through it, but consumers cannot.
 *
 * Like the setters of `withStateSetter`, it is a `signalMethod`: it accepts a
 * plain value, a signal/reactive fn (keeping the store in sync with it), or an
 * updater `(current) => next` receiving the current value, for partial updates.
 */
export type LinkSetter<T> = ((
  input: T | (() => T) | ((current: T) => T),
  config?: { injector?: Injector },
) => EffectRef) &
  EffectRef;

/**
 * Methods generated besides `link<Name>()`: the private setter, unless
 * `noSetter: true` was passed.
 */
type LinkSetterMethods<
  NoSetter extends boolean,
  Name extends string,
  T,
> = NoSetter extends true
  ? {}
  : { [P in `_set${Capitalize<Name>}`]: LinkSetter<T> };

export type LinkSourceOptions<
  Input extends SignalStoreFeatureResult,
  K extends keyof Input['state'],
  NoSetter extends boolean = boolean,
> = {
  /**
   * How writes reach the store; defaults to
   * `patchState(store, { [name]: value })`.
   *
   * It must write synchronously: by the time it returns, reading the source
   * must give the new value. Writes are compared against the committed value
   * to skip redundant ones, so while one is still in flight the store reads
   * as the old value and a write back to it is dropped as a no-op — the
   * pending write then wins, undoing the edit. Routing through a debouncing
   * store method (e.g. `filterEntities`) is the usual way to hit this: pass
   * `debounce: 0`. To debounce a form field use Signal Forms'
   * `debounce(path, ms)`, which delays the update reaching the signal rather
   * than the write, and only for updates from a bound control.
   *
   * A `set` that transforms what it is given is called on every write of the
   * raw value — the store settles on the transformed value, so the
   * comparison never matches. Worth knowing if `set` does more than write
   * state.
   */
  set?: (value: Input['state'][NoInfer<K>], store: StoreSource<Input>) => void;
  /**
   * Equality used to suppress redundant syncs in both directions. Defaults
   * to comparing by content — `Object.is` for primitives, element by element
   * for arrays, structurally for plain objects — since a source that
   * rebuilds an object on every read is never reference-equal to itself and
   * the link would never settle. The structural compare is JSON-based, so a
   * nested `Date`, `Map`, `Set` or class instance is flattened and two
   * different ones can compare equal; pass an `equal` that knows them, or
   * 'reference'.
   *
   * Override with a function or a premade name: 'reference', 'array'
   * (shallow, order sensitive), 'set' (order insensitive), 'stringify', a
   * property to compare by ('id'), or 'array.id' / 'set.id' per element.
   */
  equal?: EqualOption<Input['state'][NoInfer<K>]>;
  /**
   * Skip generating the private `_set<Name>()` method, when the store has no
   * use for it — e.g. it already exposes its own method for the same write.
   */
  noSetter?: NoSetter;
  computation?: never;
};

export type LinkComputedOptions<
  Input extends SignalStoreFeatureResult,
  T,
  NoSetter extends boolean = boolean,
> = {
  computation: (store: StoreSource<Input>) => T;
  set: (value: T, store: StoreSource<Input>) => void;
  /**
   * Equality used to suppress redundant syncs in both directions. Defaults
   * to comparing by content — `Object.is` for primitives, element by element
   * for arrays, structurally for plain objects — since a source that
   * rebuilds an object on every read is never reference-equal to itself and
   * the link would never settle. The structural compare is JSON-based, so a
   * nested `Date`, `Map`, `Set` or class instance is flattened and two
   * different ones can compare equal; pass an `equal` that knows them, or
   * 'reference'.
   *
   * Override with a function or a premade name: 'reference', 'array'
   * (shallow, order sensitive), 'set' (order insensitive), 'stringify', a
   * property to compare by ('id'), or 'array.id' / 'set.id' per element.
   */
  equal?: EqualOption<NoInfer<T>>;
  /**
   * Skip generating the private `_set<Name>()` method, when the store has no
   * use for it — e.g. it already exposes its own method for the same write.
   */
  noSetter?: NoSetter;
};

/**
 * @experimental
 * Generates a `link<Name>()` method that connects store state to component
 * signals (inputs, models, signal forms), plus a `_set<Name>()` method — the
 * same write path, private to the store, for other features and methods to
 * write through (see `LinkSetter`), unless `noSetter: true` is passed.
 *
 * The first argument names the generated method and doubles as the state key
 * to link to, unless `computation` is provided in the options — then it is
 * just a name and the value is derived from the store.
 *
 * The method always returns a WritableSignal that is a live view of the store:
 * reading it reads the source, writing it calls `set` (or `patchState` by
 * default). It takes an options object that can also connect an external
 * signal, in one of three ways:
 * - `syncWith`: two-way, requires a WritableSignal (e.g. `model()`).
 * - `readFrom`: one-way external → store, accepts any signal — including a
 *   writable one you only write yourself (e.g. a `model()` set by a button) —
 *   or a function receiving the previous value, to merge a partial signal in.
 * - `writeTo`: one-way store → external, a WritableSignal that is set or a
 *   function called with each committed change (e.g. an `output` emit).
 *
 * `readFrom` and `writeTo` combine into a two-way sync with a mapping in each
 * direction (e.g. a `model()` whose type differs from the store's); `syncWith`
 * is mutually exclusive with both, and `initialValueFrom` only applies to it.
 *
 * Both sync directions are guarded by `equal`, which defaults to comparing
 * by content — see the `equal` option for the premade names it accepts.
 *
 * `syncWith`, `readFrom`, `writeTo` and `storeEditsWhen` each require an
 * injection context (field initializer or constructor), because effects are
 * created to keep things in sync. The plain no-arg form has no such
 * requirement.
 *
 * @param name - State key to link to, or a custom name when `computation` is used
 * @param options.computation - Derive the linked value from the store
 * @param options.set - How writes reach the store; defaults to
 *   `patchState(store, { [name]: value })`, required with `computation`
 * @param options.equal - Equality guard for both sync directions, a function,
 *   a premade name ('array', 'set', 'stringify'), a property to compare by
 *   ('id'), or the same per element of an array ('array.id', 'set.id')
 * @param options.noSetter - Skip generating the private `_set<Name>()` method
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
 * // State key with a custom write
 * withLink('productEntitiesFilter', {
 *   set: (value, store) => store.filterProductEntities({ filter: value }),
 * });
 *
 * @example
 * // Custom name with computation + set, synced two-way with a model() input
 * withLink('selectedGenreIds', {
 *   computation: (store) => store.genreIdsSelected(),
 *   set: (value, store) =>
 *     store.selectGenreEntities({ ids: value, clearSelectionBeforeSelect: true }),
 *   // premade equality; a selection is a set, so order does not matter
 *   equal: 'set',
 * });
 * // in a component:
 * // value = model<string[]>([]);
 * // valueField = form(this.store.linkSelectedGenreIds({ syncWith: this.value }));
 *
 * @example
 * // Premade equality for an object state that is rebuilt on every read
 * withLink('filter', { equal: 'stringify' });
 *
 * @example
 * // Compare by a property, autocompleted from the linked value's type: the
 * // selected product only counts as changed when its id does
 * withLink('selectedProduct', { equal: 'id' });
 *
 * @example
 * // Same, per element of an array: 'array.id' keeps the order significant,
 * // 'set.id' does not
 * withLink('products', { equal: 'array.id' });
 *
 * @example
 * // One way: the store reads the model, writes to it stay local until the
 * // button pushes them
 * // draft = model<string>('');
 * // linked = this.store.linkFilter({ readFrom: this.draft });
 *
 * @example
 * // Merge a partial signal into the previous value: only search is external,
 * // other filter keys are left as they are
 * // search = input<string>(''); // store state is { search: string; category: string }
 * // linked = this.store.linkFilter({
 * //   readFrom: (prev) => ({ ...prev, search: this.search() }),
 * // });
 *
 * @example
 * // Two-way with a model of a different type: map in with a computed,
 * // map back out with a function
 * // search = model<string>(''); // store state is { search: string }
 * // linked = this.store.linkFilter({
 * //   readFrom: computed(() => ({ search: this.search() })),
 * //   writeTo: (value) => this.search.set(value.search),
 * // });
 *
 * @example
 * // Emit committed changes as an output
 * // filterChange = output<{ search: string }>();
 * // linked = this.store.linkFilter({
 * //   writeTo: (value) => this.filterChange.emit(value),
 * // });
 *
 * @example
 * // The private setter, for use inside the store
 * const Store = signalStore(
 *   withState({ filter: { search: '', category: '' } }),
 *   withLink('filter'),
 *   withMethods((store) => ({
 *     // value, updater for a partial change, or a signal to stay in sync with
 *     search: (search: string) => store._setFilter((f) => ({ ...f, search })),
 *   })),
 * );
 *
 * @example
 * // Buffered writes: only valid form data reaches the store
 * // filterForm = form(this.formData, (value) => required(value.search));
 * // formData = this.store.linkFilter({
 * //   // annotated because filterForm is declared below
 * //   storeEditsWhen: (): boolean => this.filterForm().valid(),
 * // });
 */
// Overload: state key source
export function withLink<
  Input extends SignalStoreFeatureResult,
  K extends keyof Input['state'] & string,
  NoSetter extends boolean = false,
>(
  source: K,
  options?: LinkSourceOptions<Input, K, NoSetter>,
): SignalStoreFeature<
  Input,
  {
    state: {};
    props: {};
    methods: {
      [P in `link${Capitalize<string & K>}`]: LinkMethod<Input['state'][K]>;
    } & LinkSetterMethods<NoSetter, K, Input['state'][K]>;
  }
>;
// Overload: custom name with computation
export function withLink<
  Input extends SignalStoreFeatureResult,
  T,
  N extends string,
  NoSetter extends boolean = false,
>(
  name: N,
  options: LinkComputedOptions<Input, T, NoSetter>,
): SignalStoreFeature<
  Input,
  {
    state: {};
    props: {};
    methods: {
      [P in `link${Capitalize<string & N>}`]: LinkMethod<T>;
    } & LinkSetterMethods<NoSetter, N, T>;
  }
>;

export function withLink<Input extends SignalStoreFeatureResult>(
  name: string,
  options?: LinkSourceOptions<Input, any> | LinkComputedOptions<Input, any>,
): SignalStoreFeature<Input, any> {
  return withFeatureFactory((store) => {
    const computation =
      options && 'computation' in options ? options.computation : undefined;
    // memoized: the computation must return the same value while its
    // dependencies are unchanged, or every read produces a fresh value
    // (e.g. a `.map()`), the source never compares equal to itself, and the
    // storeEditsWhen buffer and the store push each other in an endless loop
    const storeSource: () => any = computation
      ? computed(() => computation(store as any))
      : (store as any)[name];

    const equal = resolveEqual(options?.equal as EqualOption<any>);
    const write = options?.set
      ? (value: any) => options.set!(value, store as any)
      : (value: any) => patchState(store as any, { [name]: value });

    // untracked: set/update must never register dependencies when called
    // inside a reactive context, matching WritableSignal semantics — the
    // write itself is wrapped too, since it can read other signals
    // (e.g. filterEntities reads entities())
    const guardedWrite = (value: any) =>
      untracked(() => {
        if (!equal(value, storeSource())) {
          write(value);
        }
      });

    const linkMethodName = `link${capitalize(name)}`;
    const setterMethodName = `_set${capitalize(name)}`;

    return signalStoreFeature(
      withMethods(() => ({
        ...(options?.noSetter
          ? {}
          : { [setterMethodName]: linkSetter(storeSource, guardedWrite) }),
        [linkMethodName]: (options?: LinkOptions) => {
          const linkOptions = options as
            | (LinkCommonOptions<any> & {
                syncWith?: WritableSignal<any>;
                readFrom?: Signal<any> | ((prev: any) => any);
                writeTo?: WritableSignal<any> | ((value: any) => void);
                initialValueFrom?: 'store' | 'external';
              })
            | undefined;
          const storeEditsWhen = linkOptions?.storeEditsWhen;
          // one linkedSignal over the source for both modes. Without a gate
          // writes delegate straight to the store, which stays the single
          // source of truth. With a gate they land in the buffer first, so a
          // gate derived from the value (e.g. a form's valid()) sees the
          // just-written state; a value held back stays buffered until the
          // flush effect below pushes it. storeEditsWhen is untracked here —
          // set must not register deps; its tracking lives in that effect.
          // value already committed synchronously by set. rawSet below marks
          // the flush effect dirty, so that effect still runs after a
          // synchronous commit; without this it would write again whenever
          // the write does not land in storeSource synchronously (a debounced
          // or async set), since its equal(value, storeSource()) guard can
          // not yet see the value. Cleared by the effect on its next run.
          let committedInSet: { value: any } | undefined;
          const linked: WritableSignal<any> = linkedSignal(
            () => storeSource(),
            {
              equal,
              set: (value, rawSet) => {
                if (!storeEditsWhen) return guardedWrite(value);
                rawSet(value);
                if (untracked(() => storeEditsWhen(value))) {
                  committedInSet = { value };
                  guardedWrite(value);
                }
              },
            },
          );

          // what the external side is known to hold. Seeded with the store's
          // value at link time (writeTo pushes changes only), then updated by
          // every value readFrom supplies and every value writeTo pushes out
          let externalHolds: unknown = untracked(storeSource);
          const readFrom = linkOptions?.readFrom;
          if (readFrom) {
            // the function form receives the previous committed value
            // untracked, so a merge can not register the store as a
            // dependency — only the external signals it reads re-run it.
            // The store, not the buffer: the merged value is written straight
            // to the store, so merging a pending buffered edit into it would
            // commit that edit behind the gate's back
            const read = isSignal(readFrom)
              ? () => readFrom()
              : () => readFrom(untracked(storeSource));
            // one way: the store reads the signal, never writes it back.
            // Writes to the store, not through `linked`, so storeEditsWhen
            // never sees it — the gate is about edits made through the
            // returned signal. externalHolds is recorded before the write, so
            // the writeTo effect can not observe the store change ahead of it
            // whatever order the effects run in
            let lastRead: unknown = untracked(read);
            externalHolds = lastRead;
            guardedWrite(lastRead);
            effect(() => {
              const value = read();
              if (equal(value, lastRead)) return;
              lastRead = value;
              externalHolds = value;
              untracked(() => guardedWrite(value));
            });
          }

          if (storeEditsWhen) {
            // flush on gate open: writes commit synchronously in set when the
            // gate is open, so this effect only flushes a value held back
            // while it was closed, or one whose gate opened without a write
            // (async validators, external signals). storeEditsWhen is called
            // tracked so its own dependencies re-run the effect
            effect(() => {
              const value = linked();
              const committed = committedInSet;
              committedInSet = undefined;
              // storeEditsWhen stays outside the skip so its dependencies are
              // registered on every run — the gate must still be able to
              // re-open this effect when it changes without a write
              if (storeEditsWhen(value)) {
                // by reference, not equal: the run this skips is the one
                // rawSet scheduled, which reads back the very object set
                // committedInSet. When the reference does differ the write did
                // land in source, and guardedWrite's own guard already no-ops
                if (committed && Object.is(committed.value, value)) return;
                untracked(() => guardedWrite(value));
              }
            });
          }

          const writeTo = linkOptions?.writeTo;
          if (writeTo) {
            const writeExternal =
              typeof (writeTo as Partial<WritableSignal<any>>).set ===
              'function'
                ? (value: any) => (writeTo as WritableSignal<any>).set(value)
                : (writeTo as (value: any) => void);
            // changes only: the link-time value is not pushed, so an output
            // does not emit spuriously — checked on the first run only, since
            // later a return to it is a real change. Reads the source, not
            // the buffer, so only committed values go out. A value the
            // external side already holds — last supplied by readFrom, or
            // last pushed — is not pushed again, which is what stops an echo
            let linkTime: { value: unknown } | undefined = {
              value: untracked(storeSource),
            };
            effect(() => {
              const value = storeSource();
              const initial = linkTime;
              linkTime = undefined;
              if (initial && equal(value, initial.value)) return;
              if (equal(value, externalHolds)) return;
              externalHolds = value;
              untracked(() => writeExternal(value));
            });
          }

          const syncWith = linkOptions?.syncWith;
          if (syncWith) {
            const initialValueFrom =
              linkOptions?.initialValueFrom ?? 'external';
            // last value seen coming from the external signal, so writes we
            // made to it ourselves are not mistaken for user edits. Both
            // branches below seed it before the effects run
            let lastExternal: unknown;
            if (initialValueFrom === 'external') {
              // straight to the store, not through `linked`: like readFrom,
              // a value the external signal supplies is not an edit made
              // through the returned signal, so storeEditsWhen does not
              // apply to it
              guardedWrite(untracked(syncWith));
              // the initial sync above already applied this value, so the
              // effect below must not apply it again
              lastExternal = untracked(syncWith);
            } else {
              syncWith.set(untracked(storeSource));
              // our own write: without recording it, the effect below would
              // treat its first run as a user edit and force-apply the
              // external snapshot — reverting a store change or clobbering a
              // buffered write made before the first tick
              lastExternal = untracked(storeSource);
            }
            // external -> store, bypassing the gate for the same reason as
            // the seed above
            effect(() => {
              const value = syncWith();
              if (equal(value, lastExternal)) return;
              lastExternal = value;
              untracked(() => guardedWrite(value));
            });
            // store -> external. Reads the source, not the buffer, so an
            // external model() only ever sees values committed to the store.
            effect(() => {
              const value = storeSource();
              untracked(() => {
                if (!equal(syncWith(), value)) {
                  // our own write, not a user edit: recording it keeps the
                  // effect above from writing it straight back
                  lastExternal = value;
                  syncWith.set(value);
                }
              });
            });
          }
          return linked;
        },
      })),
    );
  }) as any;
}

/**
 * Builds the `_set<Name>()` method: a `signalMethod` writing through the
 * link's write path, that also accepts an updater receiving the current value.
 */
function linkSetter<T>(
  source: () => T,
  write: (value: T) => void,
): LinkSetter<T> {
  const setValue = signalMethod<T>((value) => write(value));
  // updaters take the current value as param; signalMethod treats any fn as a
  // zero-arg reactive computation, so route by arity — same as withStateSetter
  const setter = (
    value: T | (() => T) | ((current: T) => T),
    config?: { injector?: Injector },
  ): EffectRef => {
    if (typeof value === 'function' && value.length > 0) {
      write((value as (current: T) => T)(untracked(source)));
      return { destroy: () => void 0 };
    }
    return setValue(value as T | (() => T), config);
  };
  setter.destroy = setValue.destroy;
  return setter as LinkSetter<T>;
}
