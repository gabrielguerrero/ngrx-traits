---
name: withStateSetter
order: 20
---

# withStateSetter

Generates a `set<Prop>()` method for each provided state prop that patches the state with the given value. The prop names must be valid state props of the store (with autocompletion).

The generated methods are [signalMethod](https://ngrx.io/guide/signals/signal-method)s, so they accept either a plain value or a signal, keeping the state in sync when given one. They also accept an updater function `(current) => next`, for partial updates.

The generated setters are always public, a leading underscore in the prop name is dropped, so `_filter` generates `setFilter`. To generate a setter only accessible inside the store, use [withStatePrivateSetter](./with-state-private-setter).

## Import

Import the withStateSetter trait from `@ngrx-traits/signals`.

```ts
import { withStateSetter } from '@ngrx-traits/signals';
```

## Examples

### Basic usage

```typescript
const Store = signalStore(
  withState({
    a: { b: '' },
    c: 1,
    d: 12,
  }),
  // generates setA() and setD()
  withStateSetter('a', 'd'),
);

store.setA({ b: 'hello' }); // patchState(store, { a: { b: 'hello' } })
store.setD(42); // patchState(store, { d: 42 })
```

### Partial updates with an updater function

```typescript
store.setA((a) => ({ ...a, b: 'partial' }));
store.setD((d) => d + 1);
```

> Updaters are told apart from reactive fns by arity: an updater must declare its parameter (`(current) => ...`); a zero-arg fn like `() => this.x() * 2` is treated as a reactive computation instead (see below).

### Keeping state in sync with a signal

Because the setters are `signalMethod`s, they can also receive a signal or a zero-arg reactive fn, keeping the state in sync with it:

```typescript
class MyComponent {
  readonly d = input.required<number>();
  readonly store = inject(Store);
  constructor() {
    // state d follows the input from now on
    this.store.setD(this.d);
  }
}
```

## API

```typescript
withStateSetter(...keys)
```

| Property  | Description                                  | Type       |
| --------- | --------------------------------------------- | ---------- |
| `...keys` | Names of state props to generate setters for | `string[]` |

### Generated setter method

```typescript
set<Prop>(input: T | Signal<T> | (() => T) | ((current: T) => T), config?: { injector?: Injector }): EffectRef
```

| Property | Description                                                                          | Type                                          |
| -------- | ------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `input`  | A plain value, a signal/reactive fn (kept in sync), or an updater `(current) => next` | `T \| Signal<T> \| (() => T) \| ((current: T) => T)` |
| `config` | Optional injector, needed when calling with a signal outside an injection context     | `{ injector?: Injector }`                      |

## Methods

```typescript
// for withStateSetter('a', 'd')
{
  setA: (input, config?) => EffectRef;
  setD: (input, config?) => EffectRef;
}
```

## State

No state signals are generated.

## Props

No props are generated.
