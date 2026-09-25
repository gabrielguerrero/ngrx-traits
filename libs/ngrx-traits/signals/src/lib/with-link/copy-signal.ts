import {
  assertInInjectionContext,
  computed,
  effect,
  EffectRef,
  EventEmitter,
  Injector,
  OutputEmitterRef,
  untracked,
  WritableSignal,
} from '@angular/core';

import { EqualOption, resolveEqual } from './with-link.util';

/**
 * Thrown by the `skip` passed to the source function, and caught around the
 * call. Module-private, so nothing else can produce or observe it.
 */
const SKIP = Symbol('copySignal.skip');

/** Marks a value not seen yet, distinct from any value the source could
 * produce — `undefined` is a value a signal can hold. */
const NOTHING = Symbol('copySignal.nothing');

/**
 * Rejects the value being read, from anywhere in the source function: nothing
 * is copied, and the target is left as it is.
 */
type Skip = () => never;

/** What a copy can go to: a writable signal, an `output()`, or an EventEmitter. */
type CopyTarget<T> = WritableSignal<T> | OutputEmitterRef<T> | EventEmitter<T>;

type CopySignalOptions<T> = {
  /**
   * Decides when two values are the same: a value equal to the last one the
   * source produced is not copied again, and one equal to what the target
   * already holds is not written. Defaults to comparing by content — `Object.is` for
   * primitives, element by element for arrays, structurally for plain
   * objects — since a source that rebuilds an object on every read is never
   * reference-equal to itself. The structural compare is JSON-based, so a
   * nested `Date`, `Map`, `Set` or class instance is flattened and two
   * different ones can compare equal; pass an `equal` that knows them, or
   * 'reference'.
   *
   * Override with a function or a premade name: 'reference', 'array'
   * (shallow, order sensitive), 'set' (order insensitive), 'stringify', a
   * property to compare by ('id'), or 'array.id' / 'set.id' per element.
   */
  equal?: EqualOption<T>;
  /**
   * Injector for the effect watching the source. Defaults to the current
   * injection context, which is where `copySignal` must be called without it.
   */
  injector?: Injector;
};

/**
 * @experimental
 * Copies a signal into another signal, an `output()` or an EventEmitter, and
 * keeps it up to date: the value at call time is copied, and every change
 * after that.
 *
 * The source is a signal, or a function reading signals — tracked like a
 * `computed`, so to copy from several signals, or from part of one, read them
 * in it. The function is also where a value is mapped into what the target
 * expects, and where it can be rejected by calling `skip()`: nothing is
 * copied, and the target is left as it is.
 *
 * `equal` decides when two values are the same: a value equal to the last one
 * the source produced is not copied again, and one equal to what the target
 * already holds is not written. The second only applies to a writable target, which can be
 * edited on its own; an `output()` holds nothing to compare against.
 *
 * Nothing is written back, so the target can be edited on its own. An edit
 * survives until the source produces a different value: a source that
 * recomputes to one equal to the last it produced, or returns to it after a
 * `skip()`, leaves the target alone.
 *
 * A writable signal gets the value at call time right away. An `output()` or
 * EventEmitter gets it on the effect's first run instead: called in a field
 * initializer, the parent's binding is not listening yet, and an emit made
 * then would be lost — and, being the last value read, never emitted again.
 *
 * Requires an injection context (field initializer or constructor), since an
 * effect is created, unless an `injector` is passed.
 *
 * @param source - Signal copied from, or a `(skip) => value` function reading
 *   signals, to map or reject what is copied
 * @param target - WritableSignal that is set, or `output()` / EventEmitter
 *   that is emitted
 * @param options.equal - Equality guard, a function, a premade name ('array',
 *   'set', 'stringify'), a property to compare by ('id'), or the same per
 *   element of an array ('array.id', 'set.id')
 * @param options.injector - Injector for the effect, when called outside an
 *   injection context
 * @returns The `EffectRef` of the effect watching the source; destroy it to
 *   stop copying
 *
 * @example
 * // Mirror an input into a model of the same type
 * // copySignal(this.search, this.searchModel);
 *
 * @example
 * // Map into the target's type, and skip the values it should not see
 * // filterChange = output<string>();
 * // copySignal((skip) => this.filter().search || skip(), this.filterChange);
 *
 * @example
 * // Several signals into one target
 * // copySignal(
 * //   () => ({ search: this.search(), page: this.page() }),
 * //   this.filter, // WritableSignal<{ search: string; page: number }>
 * // );
 *
 * @example
 * // A premade equality for an array of ids
 * // copySignal(() => this.selected().map((p) => p.id), this.selectedIds, {
 * //   equal: 'array',
 * // });
 */
// The target is the only thing T is inferred from, and the source is checked
// against it rather than widening it. It has to be that way round: `set` and
// `emit` take their value as a method parameter, so targets compare
// bivariantly and would accept a value of any related type — wider, narrower
// or nullable — and then hold the wrong shape. A function's return type is
// covariant, which is exactly the rule wanted: a narrower source is accepted,
// one that is wider or unrelated is not. A Signal<T> is a () => T, so it fits
// the same parameter as the function form.
export function copySignal<T>(
  source: (skip: Skip) => NoInfer<T>,
  target: CopyTarget<T>,
  options?: NoInfer<CopySignalOptions<T>>,
): EffectRef {
  // before anything is written: the copy below runs synchronously for a
  // writable target, and without this the effect at the end would be the
  // first to notice there is no injection context — after the target was
  // already set
  if (!options?.injector) assertInInjectionContext(copySignal);

  const equal = resolveEqual(options?.equal);

  // a target with `set` is a writable signal, so it is also readable and can
  // be asked what it holds. An output() or EventEmitter only has emit(), and
  // holds nothing that could differ from the last value read
  const readableTarget =
    typeof (target as WritableSignal<T>).set === 'function'
      ? (target as WritableSignal<T>)
      : undefined;
  const push = readableTarget
    ? (value: T) => readableTarget.set(value)
    : (value: T) => (target as OutputEmitterRef<T>).emit(value);

  // the last value the source produced that was not skipped. Compared against
  // before the target is, so a recompute that changes nothing — or a return
  // to this value after a skip — is not copied over an edit made to the
  // target in between
  let lastRead: T | typeof NOTHING = NOTHING;

  // runs the source, turning a `skip()` into the SKIP marker so it works
  // anywhere in the function, not only in a return. Only the sentinel is
  // caught — any other error propagates unchanged
  const read = (): T | typeof SKIP => {
    try {
      return source(() => {
        throw SKIP;
      });
    } catch (error) {
      if (error === SKIP) return SKIP;
      throw error;
    }
  };

  const copy = (value: T | typeof SKIP) => {
    if (value === SKIP) return;
    if (lastRead !== NOTHING && equal(value, lastRead)) return;
    lastRead = value;
    // a writable target can have been edited since, possibly to this value
    // already. An emit-only one has no state of its own, so the check above
    // is all there is — what it was last given is always the last read
    if (readableTarget && equal(value, readableTarget())) return;
    push(value);
  };

  // memoized: for a writable target, the synchronous copy below and the
  // effect's first run must see the very same value, not two builds of it. A function source that
  // rebuilds its value — an array of fresh objects, a Date — could otherwise
  // fail `equal` against itself and be copied twice, overwriting whatever the
  // target was set to in between. The signals the source reads, up to a
  // skip(), are its dependencies; an error it throws is cached and rethrown
  const current = computed(read);

  // the value at call time is copied synchronously, so the target agrees with
  // the source before the first tick — an effect alone would leave it stale
  // until then. The effect below dedupes against it, so its first run does
  // not copy the same value again. Not for an emit-only target: in a field
  // initializer the parent's binding is not listening yet, so the emit would
  // be lost and, as the last value read, never repeated. The effect's first
  // run happens after the listener is attached
  if (readableTarget) untracked(() => copy(current()));

  return effect(
    () => {
      const value = current();
      untracked(() => copy(value));
    },
    { injector: options?.injector },
  );
}
