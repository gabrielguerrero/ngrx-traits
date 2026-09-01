---
name: withLink
order: 19
---

# withLink

Generates a `link<Name>()` method that connects store state to component signals like `input()`, `model()` and Angular Signal Forms. The method returns a `WritableSignal` that is a live view of the store: reading it reads the state, writing it updates the store (via `patchState` by default, or a custom `set` callback, e.g. to call a store method like `filterEntities` instead).

The method takes an options object, which can also connect an external signal, in one of three ways:

- `syncWith`: two-way sync, requires a `WritableSignal` (e.g. `model()`).
- `readFrom`: one-way external → store. Accepts any signal, including a writable one you only write yourself (e.g. a `model()` set on a button click) — the store reads it and never writes back. Also accepts a function receiving the previous value, to merge a partial signal into it.
- `writeTo`: one-way store → external. A `WritableSignal` that is set, or a function called with each committed change (e.g. to emit an output).

`readFrom` and `writeTo` combine into a two-way sync with a mapping in each direction (e.g. a `model()` whose type differs from the store's); `syncWith` is mutually exclusive with both, and `initialValueFrom` only applies to it.

Both sync directions are guarded by `equal`, so writes only happen when the value actually changed — this prevents echo loops when `set` transforms the value (e.g. normalizes or sorts it).

Besides a function, `equal` accepts the name of a premade comparison — `'array'`, `'set'`, `'stringify'` — or a property to compare by, like `'id'` on an object and `'array.id'` / `'set.id'` on an array of them (see [Premade equality](#premade-equality)).

The first argument names the generated method and doubles as the state key to link to (with autocompletion), unless `computation` is provided in the options — then it is just a custom name and the value is derived from the store.

## Premade withLink for entities

If you want to work with the ngrx traits withEntities\* store features, be sure to check the following premade withLink store features for them:

- [withLinkEntitiesFilter](/docs/traits/with-link-entities-filter)
- [withLinkEntitiesSort](/docs/traits/with-link-entities-sort)
- [withLinkEntitiesSingleSelection](/docs/traits/with-link-entities-single-selection)
- [withLinkEntitiesMultiSelection](/docs/traits/with-link-entities-multi-selection)

> `syncWith`, `readFrom`, `writeTo` and `updateStoreWhen` each require an injection context (field initializer or constructor), because effects are created to keep things in sync. The plain no-arg form has no such requirement.

## Examples

### State key (default patchState)

```typescript
const Store = signalStore(
  withState({ filter: { search: '' } }),
  // generates linkFilter(), writing patches the filter state
  withLink('filter'),
);

// In component
store = inject(Store);
filter = this.store.linkFilter();

// filter() => { search: '' }
filter.set({ search: 'shoes' });
// store.filter() => { search: 'shoes' }
```

### Custom set callback

Route writes through a store method instead of patching state directly:

```typescript
const productEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'product',
});

const ProductsStore = signalStore(
  withEntities(productEntityConfig),
  withEntitiesLocalFilter(productEntityConfig, {
    defaultFilter: { search: '' },
    filterFn: (entity, filter) => !filter?.search || entity.name.toLowerCase().includes(filter.search.toLowerCase()),
  }),
  // generates linkProductEntitiesFilter()
  withLink('productEntitiesFilter', {
    set: (value, store) => store.filterProductEntities({ filter: value }),
  }),
);
```

### Two-way sync with a model()

```typescript
@Component({
  /* ... */
})
export class ProductSelectComponent {
  store = inject(ProductsStore);

  // when the parent writes the model, the store updates;
  // when the store changes, the model (and the parent) updates
  selectedId = model<string | undefined>(undefined);
  linked = this.store.linkProductIdSelected({ syncWith: this.selectedId });
}
```

### One-way: the store only reads the signal

Use `readFrom` when the component owns the writes — a `model()` the parent (or a button) sets, that the store should read but never overwrite:

```typescript
@Component({
  template: `
    <input [value]="draft().search" (input)="onInput($event)" />
    <button (click)="apply()">Apply</button>
  `,
})
export class ProductSearchComponent {
  store = inject(ProductsStore);

  // written locally, pushed to the store only when the button sets it
  draft = model<{ search: string }>({ search: '' });

  // the store reads draft, and never writes back to it
  linked = this.store.linkProductEntitiesFilter({ readFrom: this.draft });
}
```

`readFrom` accepts a `WritableSignal` on purpose: it is about the direction of the sync, not about whether the signal can be written. Use it for `input()` too, which is read-only anyway.

### Merging a partial signal with readFrom

`readFrom` also accepts a function that receives the previous linked value, so an external signal that only covers part of the state can be merged into it:

```typescript
@Component({
  /* ... */
})
export class ProductListComponent {
  store = inject(ProductsStore);

  // only search comes from the parent,
  // the store filter is { search: string; category: string }
  search = input<string>('');

  linked = this.store.linkProductEntitiesFilter({
    readFrom: (prev) => ({ ...prev, search: this.search() }),
  });
}
```

The signals the function reads are tracked; the previous value is not — a store change alone does not re-run the merge, but the next external change merges into the latest value. With `updateStoreWhen`, `prev` is the buffer, so pending edits the gate is holding back are preserved by the merge.

### One-way out: pushing store changes with writeTo

`writeTo` is the opposite direction: every change committed to the store is pushed out, either by setting a `WritableSignal` or by calling a function with the new value. The value at link time is not pushed — only changes after that. Use the function form to emit an output:

```typescript
@Component({
  /* ... */
})
export class ProductSearchComponent {
  store = inject(ProductsStore);

  filterChange = output<{ search: string }>();

  linked = this.store.linkProductEntitiesFilter({
    writeTo: (value) => this.filterChange.emit(value),
  });
}
```

`writeTo` cannot be combined with `syncWith` (which already writes back), but it combines with `readFrom` — see the next section.

### Two-way sync with a model() of a different type

When an external `model()` does not match the store's type, `syncWith` cannot be used directly. Combine `readFrom` with a `computed` that maps the model into the store's type, and `writeTo` with a function mapping store changes back to the model:

```typescript
@Component({
  /* ... */
})
export class ProductSearchComponent {
  store = inject(ProductsStore);

  // the parent works with a plain string,
  // the store state is { search: string }
  search = model<string>('');

  linked = this.store.linkProductEntitiesFilter({
    // in: model -> store type
    readFrom: computed(() => ({ search: this.search() })),
    // out: store type -> model
    writeTo: (value) => this.search.set(value.search),
  });
}
```

On link, the mapped model value is pushed to the store (like `syncWith`'s default `initialValueFrom: 'external'`). The `equal` guard on the store side prevents echo loops between the two mappings.

### Custom name with computation

Use `computation` and `set` to derive the linked value from the store; `set` maps writes back:

```typescript
const Store = signalStore(
  withEntities({ entity: type<Genre>() }),
  withEntitiesMultiSelection({ entity: type<Genre>() }),
  // generates linkSelectedGenreIds()
  withLink('selectedGenreIds', {
    computation: (store) => store.idsSelected(),
    set: (value, store) => store.selectEntities({ ids: value, clearSelectionBeforeSelect: true }),
    // premade equal prevents echo loops, the selection map
    // produces fresh arrays and does not preserve the order
    equal: 'set',
  }),
);
```

### Premade equality

`equal` defaults to comparing by content, chosen from the value at hand: `Object.is` for primitives, element by element for arrays, and structurally for plain objects. Reference equality is the wrong default for a two-way link — a value rebuilt on every read (a `computation` mapping the store, a form producing a fresh object, a spread in `set`) is never equal to its own previous value, so every write re-triggers the read and the link never settles.

The one shape this does not settle on its own is an array whose _elements_ are rebuilt on every read, since arrays are compared element by element and never serialized. For that, and whenever you want different semantics, pass your own `equal` to create your own comparation or the name of one of the premade comparisons:

| Name             | Compares                                                            | Offered for       |
| ---------------- | ------------------------------------------------------------------- | ----------------- |
| `'reference'`    | `Object.is`, opting out of the content comparison                   | any value         |
| `'array'`        | Same length and every element equal by `Object.is`, order sensitive | arrays            |
| `'set'`          | Same elements regardless of order, set semantics                    | arrays            |
| `'stringify'`    | `JSON.stringify(a) === JSON.stringify(b)`, structural               | any value         |
| `'<prop>'`       | `a[prop]` and `b[prop]` by `Object.is`, e.g. `'id'`                 | objects           |
| `'array.<prop>'` | Element by element by that property, order sensitive                | arrays of objects |
| `'set.<prop>'`   | The same property values regardless of order                        | arrays of objects |

All of them are type-checked against the linked value, and the property names are autocompleted from its type — from the element's type for the `array.` and `set.` forms, so an array of entities is compared by id with `equal: 'array.id'` (same ids in the same positions) or `equal: 'set.id'` (same ids, any order), and never by a bare `'id'`, which is only offered for a value that is an object itself.

> The structural comparison is JSON-based, so it only reads what JSON can represent. A `Date`, `Map`, `Set` or class instance nested in the linked value is flattened — two different ones can compare equal, and the update is dropped. Keeping non-serializable values in store state is discouraged for other reasons too (persistence, transfer state, devtools); if you do, pass your own `equal` that knows how to compare them, or `'reference'`.

Use `'stringify'` for objects, or for arrays of objects — it walks the whole value, so key order matters (`{a,b}` and `{b,a}` are not equal) and values JSON can not represent are lost.

```typescript
const Store = signalStore(
  withState({
    filter: { search: '', category: '' },
    ids: [] as string[],
    selectedProduct: undefined as Product | undefined,
    products: [] as Product[],
  }),
  // objects rebuilt on every read
  withLink('filter', { equal: 'stringify' }),
  // a selection is a set, order does not matter
  withLink('ids', { equal: 'set' }),
  // changed only when the id changes, whatever else the product carries
  withLink('selectedProduct', { equal: 'id' }),
  // a list of entities, compared by the ids it holds
  withLink('products', { equal: 'array.id' }),
);
```

A premade name wins over a property of the same name, so a value with a prop called `array`, `set` or `stringify` has to be compared with the exported `equalByKey('stringify')` instead.

The same comparisons are exported as functions — `equalArray`, `equalSet`, `equalStringify`, `equalByKey(prop)` (the `'array.<prop>'` form on arrays) and `equalSetBy(prop)` — for use anywhere an equality function is taken (e.g. a `computed` or a `linkedSignal`).

### Writing from inside the store with \_set&lt;Name&gt;

Besides the link method, `withLink('filter')` generates a `_setFilter()` method that writes through the same path as the linked signal (the `set` callback, or `patchState` by default), including the `equal` guard — a write equal to the current value is skipped. The `_` prefix makes it private to the store: other features and methods can use it, consumers of the store cannot see it:

```typescript
const ProductsStore = signalStore(
  withState({ filter: { search: '', category: '' } }),
  withLink('filter'),
  withMethods((store) => ({
    // an updater receives the current value, for partial changes
    searchProducts: (search: string) => store._setFilter((filter) => ({ ...filter, search })),
    // a plain value replaces it
    clearFilter: () => store._setFilter({ search: '', category: '' }),
  })),
);
```

It is a `signalMethod` (like the setters of [withStateSetter](/docs/traits/with-state-setter)), so it also accepts a signal or reactive fn, and then keeps writing on every change:

```typescript
withMethods((store) => ({
  // the store follows the signal until the returned EffectRef is destroyed
  followFilter: (filter: Signal<ProductFilter>) => store._setFilter(filter),
}));
```

Pass `noSetter: true` to skip it, when the store already has its own method for that write:

```typescript
withLink('productEntitiesFilter', {
  set: (value, store) => store.filterProductEntities({ filter: value }),
  // filterProductEntities already covers this write
  noSetter: true,
});
```

The premade [withLinkEntities\*](#premade-withlink-for-entities) features all pass `noSetter: true` for that reason — the entity traits they build on already expose `filter*`, `sort*` and `select*` methods.

### Choosing the initial value

With `syncWith`, the signal's current value is pushed to the store on link by default. Use `initialValueFrom: 'store'` to write the store value to the signal instead (it is only available with `syncWith` — `readFrom` always pushes to the store, there is nothing to write back to):

```typescript
selectedId = model<string | undefined>(undefined);
linked = this.store.linkProductIdSelected({
  syncWith: this.selectedId,
  initialValueFrom: 'store',
});
```

### Basic usage with Signal Forms

```typescript
const productEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'product',
});

export const ProductsStore = signalStore(
  { providedIn: 'root' },
  withEntities(productEntityConfig),
  withEntitiesLocalFilter(productEntityConfig, {
    defaultFilter: { search: '' },
    filterFn: (entity, filter) => !filter?.search || entity.name.toLowerCase().includes(filter.search.toLowerCase()),
  }),
  // generates linkProductEntitiesFilter()
  withLink('productEntitiesFilter', {
    set: (value, store) => store.filterProductEntities({ filter: value }),
  }),
);
```

```typescript
@Component({
  template: `
    <mat-form-field>
      <mat-label>Search</mat-label>
      <input type="text" matInput [formField]="filterForm.search" />
    </mat-form-field>
  `,
  imports: [MatFormField, MatLabel, MatInput, FormField],
})
export class ProductListComponent {
  store = inject(ProductsStore);

  // typing in the form filters the entities,
  // resetting the filter in the store updates the form
  filterForm = form(this.store.linkProductEntitiesFilter(), (value) => {
    required(value.search);
  });
}
```

Please note that this will set both valid and invalid form data in the store. If you want to only let valid data through, check the next case.

### Only setting validated data in the store with Signal Forms

Pass `updateStoreWhen` to the link method: the returned signal becomes a buffer over the store, and writes only reach it while `updateStoreWhen` returns true. It is checked on each write and again inside an effect, so it is reactive — a write made while the form is valid reaches the store straight away, and a value held back while it was invalid is pushed as soon as it becomes valid:

```ts
export class ProductListComponent {
  store = inject(ProductsStore);

  // buffers the form value, only valid data reaches the store.
  // the `: boolean` annotation is needed because filterForm is declared below,
  // without it typescript reports a circular inference
  formData = this.store.linkProductEntitiesFilter({
    updateStoreWhen: (): boolean => this.filterForm().valid(),
  });

  filterForm = form(this.formData, (value) => {
    required(value.search);
  });
}
```

If the store changes from elsewhere, the buffer resets to the store value (it is a `linkedSignal` over it), so the form follows the store as usual.

With `syncWith`, the external signal only ever receives values that were committed to the store — buffered edits stay local until the gate opens. So a `model()` whose initial value the gate has not accepted yet shows the store value, while the buffer keeps the pending one.

> `updateStoreWhen` requires an injection context (field initializer or constructor), because an effect is created.

### On submission, only setting validated data in the store with Signal Forms

There are two ways for this case:

Use a `linkedSignal` that works as a buffer between the form and the store, but the changes are set in the store on form submission (or by your own method):

```ts
export class ProductListComponent {
  store = inject(ProductsStore);

  storeSignal = this.store.linkProductEntitiesFilter();
  // buffer signal
  formData = linkedSignal(this.storeSignal);

  filterForm = form(
    this.formData,
    (value) => {
      required(value.search);
    },
    {
      // using signal form submission requires the formRoot directive
      submission: {
        action: async () => {
          // submit is only allowed if the form is valid
          this.storeSignal.set(this.formData());
        },
      },
    },
  );

  // or <button (click)="onSubmit()">
  onSubmit() {
    submit(this.filterForm, async () => {
      // submit is only allowed if the form is valid
      this.storeSignal.set(this.formData());
    });
  }
}
```

The second way is not using withLink, and instead reading the store filter signal directly and calling a store method that saves the state or calls the backend. This is very useful because you can handle backend errors:

```ts
export class ProductListComponent {
  store = inject(ProductsStore);

  formData = linkedSignal(this.store.productEntitiesFilter);

  filterForm = form(
    this.formData,
    (value) => {
      required(value.search);
    },
    {
      // using signal form submission requires the formRoot directive
      submission: {
        action: async () => {
          // saveProductsFilter is your own store method that returns a result
          const result = await this.store.saveProductsFilter(this.formData());
          if (!result.ok) {
            return {
              kind: 'server',
              message: result.error as string,
            } satisfies TreeValidationResult;
          }
        },
      },
    },
  );

  // or <button (click)="onSubmit()">
  onSubmit() {
    submit(this.filterForm, async () => {
      const result = await this.store.saveProductsFilter(this.formData());
      if (!result.ok) {
        return {
          kind: 'server',
          message: result.error as string,
        } satisfies TreeValidationResult;
      }
    });
  }
}
```

## API

```typescript
withLink(name, options?)
```

| Property      | Description                                                                    | Type                                                                                                                                                       |
| ------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`        | State key to link to, or a custom name when `computation` is used              | `keyof State \| string`                                                                                                                                    |
| `computation` | Derive the linked value from the store (requires `set`)                        | `(store) => T`                                                                                                                                             |
| `set`         | How writes reach the store; defaults to `patchState(store, { [name]: value })` | `(value, store) => void`                                                                                                                                   |
| `equal`       | Equality guard for both sync directions, defaults to comparing by content      | `(a, b) => boolean` or a name: `'reference'`, `'array'`, `'set'`, `'stringify'`, a prop of the value, or `'array.<prop>'` / `'set.<prop>'` of its elements |
| `noSetter`    | Skip generating the private `_set<Name>()` method, defaults to `false`         | `boolean`                                                                                                                                                  |

### Generated link method

```typescript
link<Name>(options?: LinkOptions<T>): WritableSignal<T>
```

| Property           | Description                                                                                                               | Type                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `syncWith`         | Signal kept in sync both ways: writing it updates the store, store changes are written back to it                         | `WritableSignal<T>`                       |
| `readFrom`         | Signal the store only reads, never written back; or a function receiving the previous value, to merge a partial signal in | `Signal<T> \| (prev: T) => T`             |
| `writeTo`          | Where store changes are pushed: a signal that is set or a function called with the new value                              | `WritableSignal<T> \| (value: T) => void` |
| `initialValueFrom` | With `syncWith`, where the value that wins on link comes from: `'external'` (default) or `'store'`                        | `'external' \| 'store'`                   |
| `updateStoreWhen`  | Gate writes: the returned signal buffers them and only pushes to the store when it returns true                           | `(value: T) => boolean`                   |

`syncWith` is mutually exclusive with `readFrom` and `writeTo` (which combine for a two-way sync with a mapping in each direction), and `initialValueFrom` is only accepted together with `syncWith` — all enforced by the types.

The returned `WritableSignal` is always the store view (or, with `updateStoreWhen`, the buffer over it), never the external signal.

### Generated private setter

```typescript
_set<Name>(input: T | (() => T) | ((current: T) => T), config?: { injector?: Injector }): EffectRef
```

The same write path the linked signal uses, exposed as a store method. The `_` prefix makes it private to the store: other features and methods can write through it, consumers of the store cannot see it.

Like the setters of [withStateSetter](/docs/traits/with-state-setter), it is a `signalMethod`, so it accepts a plain value, a signal or reactive fn (keeping the store in sync with it), or an updater `(current) => next` for partial updates.

## Methods

```typescript
// for withLink('filter')
{
  linkFilter: (options?) => WritableSignal<{ search: string }>;
  // private, only reachable inside the store
  _setFilter: (input, config?) => EffectRef;
}
```

## State

No state signals are generated.

## Props

No props are generated.
