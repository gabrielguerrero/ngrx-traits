---
name: withLink
order: 19
---

# withLink

Generates a `link<Name>()` method that connects store state to component signals like `input()`, `model()` and Angular Signal Forms. The method returns a `WritableSignal` that is a live view of the store: reading it reads the state, writing it updates the store (via `patchState` by default, or a custom `update` callback, e.g. to call a store method like `filterEntities` instead).

The method takes an options object, which can also connect an external signal, in one of three ways:

- `syncWith`: two-way sync, requires a `WritableSignal` (e.g. `model()`).
- `readFrom`: one-way external → store. Accepts any signal, including a writable one you only write yourself (e.g. a `model()` set on a button click) — the store reads it and never writes back. Also accepts a function receiving the previous value, to merge a partial signal into it.
- `writeTo`: one-way store → external. A `WritableSignal` that is set, or a function called with each committed change (e.g. to emit an output).

`readFrom` and `writeTo` combine into a two-way sync with a mapping in each direction (e.g. a `model()` whose type differs from the store's); `syncWith` is mutually exclusive with both, and `initialValue` only applies to it.

Both sync directions are guarded by `equal` (defaults to `Object.is`), so writes only happen when the value actually changed — this prevents echo loops when `update` transforms the value (e.g. normalizes or sorts it).

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

### Custom update callback

Route writes through a store method instead of patching state directly:

```typescript
const ProductsStore = signalStore(
  withEntities({ entity: type<Product>(), collection: 'product' }),
  withEntitiesLocalFilter({
    entity: type<Product>(),
    collection: 'product',
    defaultFilter: { search: '' },
    filterFn: (entity, filter) => !filter?.search || entity.name.toLowerCase().includes(filter.search.toLowerCase()),
  }),
  // generates linkProductEntitiesFilter()
  withLink('productEntitiesFilter', {
    update: (value, store) => store.filterProductEntities({ filter: value }),
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

On link, the mapped model value is pushed to the store (like `syncWith`'s default `initialValue: 'external'`). The `equal` guard on the store side prevents echo loops between the two mappings.

### Custom name with computation

Use `computation` and `update` to derive the linked value from the store; `update` maps writes back:

```typescript
const Store = signalStore(
  withEntities({ entity: type<Genre>() }),
  withEntitiesMultiSelection({ entity: type<Genre>() }),
  // generates linkSelectedGenreIds()
  withLink('selectedGenreIds', {
    computation: (store) => store.idsSelected(),
    update: (value, store) => store.selectEntities({ ids: value, clearSelectionBeforeSelect: true }),
    // structural equal prevents echo loops, the selection map
    // produces fresh arrays with a normalized order
    equal: (a, b) => a.length === b.length && a.every((v, i) => v === b[i]),
  }),
);
```

### Writing from inside the store with \_set&lt;Name&gt;

Besides the link method, `withLink('filter')` generates a `_setFilter()` method that writes through the same path as the linked signal (the `update` callback, or `patchState` by default), including the `equal` guard — a write equal to the current value is skipped. The `_` prefix makes it private to the store: other features and methods can use it, consumers of the store cannot see it:

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
  update: (value, store) => store.filterProductEntities({ filter: value }),
  // filterProductEntities already covers this write
  noSetter: true,
});
```

The premade [withLinkEntities\*](#premade-withlink-for-entities) features all pass `noSetter: true` for that reason — the entity traits they build on already expose `filter*`, `sort*` and `select*` methods.

### Choosing the initial value

With `syncWith`, the signal's current value is pushed to the store on link by default. Use `initialValue: 'store'` to write the store value to the signal instead (it is only available with `syncWith` — `readFrom` always pushes to the store, there is nothing to write back to):

```typescript
selectedId = model<string | undefined>(undefined);
linked = this.store.linkProductIdSelected({
  syncWith: this.selectedId,
  initialValue: 'store',
});
```

### Basic usage with Signal Forms

```typescript
const entity = type<Product>();
const collection = 'product';

export const ProductsStore = signalStore(
  { providedIn: 'root' },
  withEntities({ entity, collection }),
  withEntitiesLocalFilter({
    entity,
    collection,
    defaultFilter: { search: '' },
    filterFn: (entity, filter) => !filter?.search || entity.name.toLowerCase().includes(filter.search.toLowerCase()),
  }),
  // generates linkProductEntitiesFilter()
  withLink('productEntitiesFilter', {
    update: (value, store) => store.filterProductEntities({ filter: value }),
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

Pass `updateStoreWhen` to the link method: the returned signal becomes a buffer over the store, and writes only reach it while `updateStoreWhen` returns true. It is called inside an effect, so it is reactive — a value held back while the form was invalid is pushed as soon as it becomes valid:

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

| Property      | Description                                                                    | Type                     |
| ------------- | ------------------------------------------------------------------------------ | ------------------------ |
| `name`        | State key to link to, or a custom name when `computation` is used              | `keyof State \| string`  |
| `computation` | Derive the linked value from the store (requires `update`)                     | `(store) => T`           |
| `update`      | How writes reach the store; defaults to `patchState(store, { [name]: value })` | `(value, store) => void` |
| `equal`       | Equality guard for both sync directions, defaults to `Object.is`               | `(a, b) => boolean`      |
| `noSetter`    | Skip generating the private `_set<Name>()` method, defaults to `false`         | `boolean`                |

### Generated link method

```typescript
link<Name>(options?: LinkOptions<T>): WritableSignal<T>
```

| Property          | Description                                                                                                               | Type                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `syncWith`        | Signal kept in sync both ways: writing it updates the store, store changes are written back to it                         | `WritableSignal<T>`                       |
| `readFrom`        | Signal the store only reads, never written back; or a function receiving the previous value, to merge a partial signal in | `Signal<T> \| (prev: T) => T`             |
| `writeTo`         | Where store changes are pushed: a signal that is set or a function called with the new value                              | `WritableSignal<T> \| (value: T) => void` |
| `initialValue`    | With `syncWith`, which value wins on link: `'external'` (default) or `'store'`                                            | `'external' \| 'store'`                   |
| `updateStoreWhen` | Gate writes: the returned signal buffers them and only pushes to the store when it returns true                           | `(value: T) => boolean`                   |

`syncWith` is mutually exclusive with `readFrom` and `writeTo` (which combine for a two-way sync with a mapping in each direction), and `initialValue` is only accepted together with `syncWith` — all enforced by the types.

The returned `WritableSignal` is always the delegated store view (or, with `updateStoreWhen`, the buffer over it), never the external signal.

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
