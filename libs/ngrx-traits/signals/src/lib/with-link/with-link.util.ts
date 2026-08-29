/**
 * Shallow, order-sensitive array equality: same length and every element
 * equal by `Object.is`. Use it when the source produces a fresh array on
 * every read (e.g. a `computed` mapping ids), so syncs are only triggered by
 * real changes.
 */
export function equalArray(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  return a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
}

/**
 * Order-insensitive array equality, with set semantics: same elements
 * regardless of position. The size check guards against duplicates making
 * unequal arrays match, but the same values with different duplicate counts
 * (e.g. [x,x,y] vs [x,y,y]) still compare equal — on purpose, this is meant
 * for sources that hold a set, like an entity selection.
 */
export function equalSet(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  const aSet = new Set(a);
  const bSet = new Set(b);
  return aSet.size === bSet.size && a.every((v) => bSet.has(v));
}

/**
 * Structural equality by `JSON.stringify` of both values, for objects and
 * arrays alike. Key order matters (`{a,b}` and `{b,a}` are not equal) and
 * values JSON can not represent are lost, so prefer `'array'` for arrays of
 * primitives; this is the catch-all for nested objects.
 */
export function equalStringify(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Equality by a single property, for values identified by an id: compares
 * `a[key]` and `b[key]` with `Object.is`. On arrays it compares element by
 * element by that same key, in order — an array of entities is equal when it
 * holds the same ids in the same positions, whatever else changed in them
 * (this is what the 'array.<prop>' name resolves to).
 *
 * Non-object values (including a null on one side only) fall back to
 * `Object.is`, so an optional value is handled.
 */
export function equalByKey(key: string): (a: unknown, b: unknown) => boolean {
  return (a, b) => {
    if (Object.is(a, b)) return true;
    if (Array.isArray(a) || Array.isArray(b)) {
      if (!Array.isArray(a) || !Array.isArray(b)) return false;
      return (
        a.length === b.length && a.every((v, i) => equalOneByKey(key, v, b[i]))
      );
    }
    return equalOneByKey(key, a, b);
  };
}

/**
 * Order-insensitive version of `equalByKey` for arrays: the same key values
 * regardless of position, with the set semantics of `equalSet` (this is what
 * the 'set.<prop>' name resolves to).
 */
export function equalSetBy(key: string): (a: unknown, b: unknown) => boolean {
  return (a, b) => {
    if (Object.is(a, b)) return true;
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    return equalSet(
      a.map((v) => keyOf(key, v)),
      b.map((v) => keyOf(key, v)),
    );
  };
}

function keyOf(key: string, value: unknown): unknown {
  return typeof value === 'object' && value
    ? (value as Record<string, unknown>)[key]
    : value;
}

function equalOneByKey(key: string, a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return false;
  return Object.is(keyOf(key, a), keyOf(key, b));
}

/**
 * The default comparison, chosen from the values at hand rather than fixed up
 * front: `Object.is` for primitives, element by element for arrays, and
 * structural for plain objects.
 *
 * A link is a two-way binding, so reference equality is the wrong default for
 * anything but a primitive: a `readFrom` that rebuilds an object out of the
 * state it reads (picking a few props off a bigger one) produces a fresh
 * reference every run, is never equal to its own previous value, and every
 * write it makes re-triggers the read — the link never settles. Comparing by
 * content is what stops that, so it is what happens unless a comparison is
 * asked for by name. Pass `'reference'` to get `Object.is` back.
 *
 * Arrays are compared with `equalArray` and never serialized, so a list stays
 * cheap however long it is — an array whose elements are rebuilt on every
 * read is the one shape this does not settle on its own, and wants an
 * explicit `equal` ('stringify', or 'array.<prop>' to compare by id).
 *
 * Structural comparison is JSON-based, with the caveats of `equalStringify`,
 * and only applies to plain objects: a `Date`, `Map`, `Set` or class instance
 * falls back to `Object.is`, since JSON flattens those to a shape that would
 * call two different values equal and silently drop an update.
 *
 * That check is on the value itself, not on what it contains — one of those
 * nested inside a plain object is still flattened, and two different ones
 * compare equal. Non-serializable values in store state are discouraged for
 * other reasons too; a link over one wants an `equal` of its own.
 */
export function equalAuto(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    return equalArray(a, b);
  }
  if (!isPlainObject(a) || !isPlainObject(b)) return false;
  return safeEqualStringify(a, b);
}

/** An object literal, as opposed to a Date, Map, Set or class instance. */
function isPlainObject(value: unknown): boolean {
  if (typeof value !== 'object' || !value) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

/**
 * `equalStringify` for the default comparison, where a value JSON can not
 * serialize at all (a cycle, a BigInt) must degrade to "not equal" rather
 * than throw out of whatever read or write is in flight.
 */
function safeEqualStringify(a: unknown, b: unknown): boolean {
  try {
    return equalStringify(a, b);
  } catch {
    return false;
  }
}

/** Properties of `T`, when it is an object that is not an array. */
type PropertyName<T> = T extends readonly any[]
  ? never
  : T extends object
    ? keyof NonNullable<T> & string
    : never;

/**
 * Properties of the elements of `T`, prefixed with the comparison to run over
 * the array: 'array.id' compares element by element in order, 'set.id'
 * compares the ids regardless of order.
 */
type ElementPropertyName<T> = T extends readonly (infer E)[]
  ? E extends object
    ?
        | `array.${keyof NonNullable<E> & string}`
        | `set.${keyof NonNullable<E> & string}`
    : never
  : never;

/**
 * Premade equality names accepted wherever a custom `equal` can be given:
 * - 'reference': `Object.is`, the escape hatch from the content-based default
 * - 'array': shallow, order-sensitive element comparison
 * - 'set': order-insensitive element comparison, for selections
 * - 'stringify': structural comparison via JSON.stringify
 * - a property name of the value, e.g. 'id': comparison by that property
 * - 'array.<prop>' / 'set.<prop>' on an array of objects: comparison of the
 *   elements by that property, in order or as a set
 *
 * The array ones are only offered when the value is an array, the property
 * names when it is an object, the prefixed ones when it is an array of them.
 *
 * `unknown extends T` short-circuits all of that while `T` is still
 * unresolved, which is the case on the `computation` form of `withLink`: the
 * value type comes from a context-sensitive callback, typed only on a later
 * inference pass, while `equal` is a plain string checked on the first one.
 * Narrowing against the empty `T` of that first pass pins it to `unknown` for
 * good — the value type collapses and every name is rejected. Accepting any
 * name there costs nothing: `T` is known by the time the argument is checked,
 * so a wrong name or one that does not fit the value is still an error.
 */
export type EqualName<T> = unknown extends T
  ? string
  :
      | 'stringify'
      | 'reference'
      | (T extends readonly any[] ? 'array' | 'set' : never)
      | PropertyName<T>
      | ElementPropertyName<T>;

/** A custom equality function, or the name of a premade one. */
export type EqualOption<T> = ((a: T, b: T) => boolean) | EqualName<T>;

const equals: Record<string, (a: unknown, b: unknown) => boolean> = {
  array: equalArray,
  set: equalSet,
  stringify: equalStringify,
  reference: Object.is,
};

/**
 * Resolves an `equal` option to a function, defaulting to `equalAuto`, which
 * compares by content rather than by reference — pass `'reference'` for
 * `Object.is`.
 *
 * A name that is not one of the premade comparisons is a property name,
 * optionally prefixed with 'array.' or 'set.', so those four win over a
 * property called 'array', 'set', 'stringify' or 'reference' — pass
 * `equalByKey('stringify')` for one of those.
 */
export function resolveEqual<T>(
  equal?: EqualOption<T>,
): (a: T, b: T) => boolean {
  if (!equal) return equalAuto;
  if (typeof equal !== 'string') return equal;
  // an own-property check, not a plain lookup: `equals` inherits
  // Object.prototype, so a property named 'toString' or 'constructor' would
  // otherwise resolve to a prototype member instead of falling through to a
  // comparison by that property — one that reports every value equal, and so
  // drops every write
  const premade =
    (Object.hasOwn(equals, equal) ? equals[equal] : undefined) ??
    (equal.startsWith('array.')
      ? equalByKey(equal.slice('array.'.length))
      : equal.startsWith('set.')
        ? equalSetBy(equal.slice('set.'.length))
        : equalByKey(equal));
  return premade as (a: T, b: T) => boolean;
}
