# Linking store state to components: withLink, withLinkEntities*, withStateSetter

Replaces the deprecated `withInputBindings`.

## withLink

> Experimental — ready to use, API may still change.

`withLink('filter')` generates `linkFilter()`, which returns a `WritableSignal` view of the store:
reading it reads the state, writing it writes to the store (`patchState` by default, or a custom `set`).
That signal is what you hand to a Signal Form, a `model()` or an `input()`.

```typescript
const ProductsStore = signalStore(
  withState({ filter: { search: '' } }),
  withLink('filter'), // generates linkFilter() and the private _setFilter()
);

// component
filter = this.store.linkFilter();
filter.set({ search: 'shoes' }); // store.filter() === { search: 'shoes' }
```

The first argument is the state key to link (autocompleted), unless `computation` is given — then it is
just the method name and the value is derived from the store.

| Option | Description |
|---|---|
| `computation` | `(store) => T` — derive the value instead of reading a state key; requires `set` |
| `set` | `(value, store) => void` — how a write reaches the store; **must write synchronously** |
| `equal` | Equality guard for both directions; defaults to a content comparison |
| `noSetter` | Skip generating `_set<Name>()` |

```typescript
withLink('productEntitiesFilter', {
  // route writes through the store method instead of patchState
  set: (value, store) => store.filterProductEntities({ filter: value, debounce: 0 }),
  noSetter: true,
});
```

`debounce: 0` matters: while a debounced write is in flight the store still reads the old value, so a
write back to it is dropped as redundant and the pending one wins. Debounce the form field instead
(Signal Forms' `debounce(path, ms)`), or call the store method directly.

### Connecting an external signal

Pass one of these to the generated method:

| Option | Direction | Takes |
|---|---|---|
| `syncWith` | both ways | a `WritableSignal` (e.g. `model()`) |
| `readFrom` | external → store | any signal, or `(prev) => T` to merge a partial signal into the current value |
| `writeTo` | store → external | a `WritableSignal` that is set, or an `output()` / `EventEmitter` that is emitted |

`syncWith` excludes `readFrom`/`writeTo`; `readFrom` + `writeTo` combine into a two-way sync with a
separate signal each way. All three create effects, so call the link method in a field initializer or
constructor.

```typescript
selectedId = model<string | number | null>(null);
linked = this.store.linkProductIdSelected({ syncWith: this.selectedId });

// only the parent writes; the store reads and never writes back
search = input<string>('');
linked2 = this.store.linkProductEntitiesFilter({
  readFrom: (prev) => ({ ...prev, search: this.search() }),
});

// push every committed change out
filterChange = output<{ search: string }>();
linked3 = this.store.linkProductEntitiesFilter({ writeTo: this.filterChange });
```

Other options: `readMap` / `writeMap` map between the external and store types (required when the types
differ); both receive a `skip()` that rejects the value. `writeEqual` replaces `equal` on the mapped
outbound side. `initialValueFrom: 'store' | 'external'` (default `'external'`, `syncWith` only) picks
which value wins on link.

### Only committing valid form data

`storeEditsWhen` turns the returned signal into a buffer: writes made through it reach the store only
while the predicate is true, and a held-back value is pushed as soon as it becomes true. It does not
gate values arriving through `readFrom` / `syncWith` — reject those with `skip()` in `readMap`.

```typescript
formData = this.store.linkProductEntitiesFilter({
  // the `: boolean` annotation avoids a circular inference with filterForm below
  storeEditsWhen: (): boolean => this.filterForm().valid(),
});
filterForm = form(this.formData, (path) => required(path.search));
```

### equal

`equal` guards both directions, which is what stops a two-way link echoing. It defaults to a content
comparison (`Object.is` for primitives, element-wise for arrays, structural for plain objects). Pass a
function or a premade name: `'reference'`, `'array'`, `'set'`, `'stringify'`, a property of the value
(`'id'`), or `'array.<prop>'` / `'set.<prop>'` for arrays of objects.

```typescript
withLink('selectedGenreIds', {
  computation: (store) => store.idsSelected(),
  set: (value, store) => store.selectEntities({ ids: value, clearSelectionBeforeSelect: true }),
  equal: 'set', // the selection map rebuilds the array and does not keep the order
});
```

The same comparisons are exported as `equalArray`, `equalSet`, `equalStringify`, `equalByKey(prop)` and
`equalSetBy(prop)`. The structural comparison is JSON-based, so `Date`, `Map`, `Set` and class instances
need their own `equal` (or `'reference'`).

### _set&lt;Name&gt;

`withLink('filter')` also generates `_setFilter()`, private to the store (the `_` prefix hides it from
the public type), writing through the same path and guard. Like the `withStateSetter` setters it is a
`signalMethod`, so it takes a value, a signal (the store then follows it) or an updater `(current) => next`.

## copySignal

> Experimental, like `withLink`.

A standalone function (not a store feature) that copies one signal into a `WritableSignal`, an
`output()` or an `EventEmitter`, and keeps it up to date. Use it for a value that is not a link source
— typically a store `computed` — where `writeTo` does not apply. Needs an injection context, or an
`injector` option.

```typescript
import { copySignal } from '@ngrx-traits/signals';

// mirror an input into a model
copy = copySignal(this.search, this.searchModel);

// a function source is tracked like a computed: combine, map, and skip() what should not be copied
copy2 = copySignal((skip) => this.filter().search || skip(), this.filterChange);

// map to ids, compared with a premade equality
copy3 = copySignal(() => this.selected().map((p) => p.id), this.selectedIds, { equal: 'array' });
```

| Parameter | Description |
|---|---|
| `source` | A signal, or a `(skip) => value` function tracked like a `computed` — maps and rejects in one place |
| `target` | A `WritableSignal` that is set, or an `output()` / `EventEmitter` that is emitted |
| `options.equal` | Same options as `withLink`'s `equal`, compared in the target's type; defaults to comparing by content |
| `options.injector` | Required when called outside an injection context |

- The value at call time is copied immediately to a writable signal. An `output()`/EventEmitter gets it on
  the first change detection instead, once the parent is listening — a field initializer is fine.
- Nothing is written back, so the target can be edited on its own; the edit survives until the source
  produces a different value.
- `skip()` rejects the value being read from anywhere in the source function; signals read before it
  are still tracked.

Typical use — two forms over one `model()`, each linked to its own slice of the store, with the
recombined `computed` copied back out:

```typescript
// store: withLink('contact'), withLink('address'),
//        withComputed(({ contact, address }) => ({ checkout: computed(() => ({ ...contact(), ...address() })) }))

checkout = model<Checkout>({ name: '', email: '', street: '', city: '' });

contactData = this.store.linkContact({
  readFrom: this.checkout,
  readMap: ({ name, email }) => ({ name, email }),
});
addressData = this.store.linkAddress({
  readFrom: this.checkout,
  readMap: ({ street, city }) => ({ street, city }),
});

// neither link uses writeTo: each owns half the object and would push a partial value
copy = copySignal(this.store.checkout, this.checkout);
```

## Premade links for the entity traits

Same options on the generated method, wired to the matching entity trait, with `noSetter: true`. Each one
takes a single config object — `{ entity, collection? }`, so the entity config can be passed as is
(`withLinkEntitiesFilter` also accepts `forceLoad`):

| Feature | Requires | Generates |
|---|---|---|
| `withLinkEntitiesFilter(productEntityConfig)` | a `withEntities*Filter` | `linkProductEntitiesFilter()` → writes through `filterProductEntities` with no debounce |
| `withLinkEntitiesSort(productEntityConfig)` | `withEntitiesLocalSort` / `withEntitiesRemoteSort` | `linkProductEntitiesSort()` |
| `withLinkEntitiesSingleSelection(productEntityConfig)` | `withEntitiesSingleSelection` | `linkProductIdSelected()` — emits `null` when none selected, accepts `undefined` too; `syncWith`/`writeTo` signal must accept `null` or use `writeMap: id => id ?? undefined` |
| `withLinkEntitiesMultiSelection(productEntityConfig)` | `withEntitiesMultiSelection` | `linkProductIdsSelected()` — each write replaces the selection, `[]` clears it |

```typescript
export const ProductsStore = signalStore(
  withEntities(productEntityConfig),
  withEntitiesLocalFilter(productEntityConfig, { defaultFilter: { search: '' }, filterFn }),
  withLinkEntitiesFilter(productEntityConfig),
);

// component
filterForm = form(this.store.linkProductEntitiesFilter(), (path) => required(path.search));
```

Writes through a link are not debounced, so with a remote filter every keystroke bound directly to the
linked signal is one request — debounce the form field, or call `filterProductEntities` yourself.

## withStateSetter / withStatePrivateSetter

Generate setters for state props, without writing a `withMethods` block.

```typescript
signalStore(
  withState({ a: { b: '' }, d: 12, filter: '' }),
  withStateSetter('a', 'd'),          // setA(), setD() — public
  withStatePrivateSetter('filter'),   // _setFilter() — only callable inside the store
);

store.setD(42);
store.setD((d) => d + 1);             // updater, must declare its parameter
store.setD(this.someSignal);          // signalMethod: the state follows the signal
```

- Both are `signalMethod`s: they accept a value, a signal or zero-arg reactive fn, or an updater
  `(current) => next`, and return an `EffectRef`. Outside an injection context pass `{ injector }`.
- An updater is told from a reactive fn by arity — `(current) => ...` is an updater, `() => ...` is reactive.
- A leading underscore in the prop name is dropped: `withStatePrivateSetter('_filter')` still generates
  `_setFilter`. Visibility comes from which trait you call, never from the prop name.
