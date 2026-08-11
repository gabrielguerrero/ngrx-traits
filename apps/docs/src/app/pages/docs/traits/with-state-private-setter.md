---
name: withStatePrivateSetter
order: 21
---

# withStatePrivateSetter

Like [withStateSetter](./with-state-setter), but the generated setters are private: for each provided state prop it generates a `_set<Prop>()` method. Because the name starts with an underscore, `@ngrx/signals` removes it from the store's public type, so it is only callable from inside the store.

Use it when a prop should be publicly readable but only writable from within the store.

The generated methods behave exactly like the ones from `withStateSetter`: they are [signalMethod](https://ngrx.io/guide/signals/signal-method)s, so they accept a plain value or a signal (keeping the state in sync), and also an updater function `(current) => next` for partial updates.

## Import

Import the withStatePrivateSetter trait from `@ngrx-traits/signals`.

```ts
import { withStatePrivateSetter } from '@ngrx-traits/signals';
```

## Examples

### Basic usage

```typescript
const Store = signalStore(
  withState({
    filter: '',
    d: 12,
  }),
  // generates _setFilter()
  withStatePrivateSetter('filter'),
  withMethods((store) => ({
    clearFilter: () => store._setFilter(''), // usable inside the store
  })),
);

store.filter(); // readable from outside
store.clearFilter();
store._setFilter('x'); // compile error: not part of the public store type
```

> The method still exists at runtime; the underscore prefix hides it at the type level only.

### Props that already start with an underscore

The visibility of the generated setter comes from which trait you call, never from the prop name. A leading underscore in the prop name is dropped, so `withStatePrivateSetter('filter')` and `withStatePrivateSetter('_filter')` both generate `_setFilter` (never `__setFilter`), just like `withStateSetter` always generates the public `setFilter` for either prop.

> This means a store that declares both `filter` and `_filter` cannot generate setters for both, they would collide on the same method name.

### Partial updates and signals

```typescript
store._setFilter((filter) => filter.trim()); // updater fn
store._setFilter(this.filterInput); // keeps state in sync with a signal
```

The same rules as `withStateSetter` apply: updaters are told apart from reactive fns by arity, an updater must declare its parameter (`(current) => ...`), while a zero-arg fn like `() => this.x()` is treated as a reactive computation.

## API

```typescript
withStatePrivateSetter(...keys)
```

| Property  | Description                                          | Type       |
| --------- | ---------------------------------------------------- | ---------- |
| `...keys` | Names of state props to generate private setters for | `string[]` |

### Generated setter method

```typescript
_set<Prop>(input: T | Signal<T> | (() => T) | ((current: T) => T), config?: { injector?: Injector }): EffectRef
```

| Property | Description                                                                          | Type                                                 |
| -------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| `input`  | A plain value, a signal/reactive fn (kept in sync), or an updater `(current) => next` | `T \| Signal<T> \| (() => T) \| ((current: T) => T)` |
| `config` | Optional injector, needed when calling with a signal outside an injection context     | `{ injector?: Injector }`                            |

## Methods

```typescript
// for withStatePrivateSetter('filter', 'd')
{
  _setFilter: (input, config?) => EffectRef;
  _setD: (input, config?) => EffectRef;
}
```

## State

No state signals are generated.

## Props

No props are generated.
