---
name: withLink
order: 19
---

# withLink

> **Experimental.** Ready to use, but the API may still change in response to feedback. If you hit a problem, please [open an issue](https://github.com/gabrielguerrero/ngrx-traits/issues).

Generates a `link<Name>()` method that connects store state to component signals like `input()`, `model()` and Angular Signal Forms. The method returns a `WritableSignal` that is a live view of the store: reading it reads the state, writing it updates the store (via `patchState` by default, or a custom `set` callback, e.g. to call a store method like `filterEntities` instead).

The method takes an options object, which can also connect an external signal, in one of three ways:

- `syncWith`: two-way sync, requires a `WritableSignal` (e.g. `model()`).
- `readFrom`: one-way external → store. Accepts any signal, including a writable one you only write yourself (e.g. a `model()` set on a button click) — the store reads it and never writes back. Also accepts a function receiving the previous value, to merge a partial signal into it.
- `writeTo`: one-way store → external. A `WritableSignal` that is set, or an `output()` / `EventEmitter` that is emitted, on each committed change.

`readFrom` and `writeTo` combine into a two-way sync with a signal of its own in each direction; `syncWith` is mutually exclusive with both, and `initialValueFrom` only applies to it.

When the external signal's type is not the store's, `readMap` and `writeMap` map between the two, and either can call `skip()` to reject a value (see [Mapping between types](#mapping-between-types)).

Both sync directions are guarded by `equal`, so writes only happen when the value actually changed — this prevents echo loops when `set` transforms the value (e.g. normalizes or sorts it).

Besides a function, `equal` accepts the name of a premade comparison — `'reference'`, `'array'`, `'set'`, `'stringify'` — or a property to compare by, like `'id'` on an object and `'array.id'` / `'set.id'` on an array of them (see [Equality](#equality)).

The first argument names the generated method and doubles as the state key to link to (with autocompletion), unless `computation` is provided in the options — then it is just a custom name and the value is derived from the store.

## Premade withLink for entities

If you want to work with the ngrx traits withEntities\* store features, be sure to check the following premade withLink store features for them:

- [withLinkEntitiesFilter](/docs/traits/with-link-entities-filter)
- [withLinkEntitiesSort](/docs/traits/with-link-entities-sort)
- [withLinkEntitiesSingleSelection](/docs/traits/with-link-entities-single-selection)
- [withLinkEntitiesMultiSelection](/docs/traits/with-link-entities-multi-selection)

> `syncWith`, `readFrom`, `writeTo` and `storeEditsWhen` each require an injection context (field initializer or constructor), because effects are created to keep things in sync. The plain no-arg form has no such requirement.

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
    set: (value, store) => store.filterProductEntities({ filter: value, debounce: 0 }),
  }),
);
```

`set` must write synchronously — by the time it returns, reading the source has to give the new value.

Redundant writes are skipped by comparing against the committed value. While a write is still in flight the store still reads as the old one, so a write back to that value looks redundant and is dropped, and the pending write wins. That is why the example passes `debounce: 0`: typing `a` and deleting it within the window would otherwise leave the filter on `a`.

To debounce a form field, use Signal Forms' `debounce(path, ms)`, which delays the update reaching the signal at all instead of delaying the write. It only covers updates coming from a bound control — a programmatic `.set()` on the linked signal or model is not debounced. For that, and to debounce anything else, call the debouncing store method (`filterProductEntities`) directly rather than through the link.

A `set` that transforms what it is given (normalizes, trims, sorts) is re-entered for any value the transform rewrites, since writes are compared against what the store settled on: writing `' b '` to a trimming `set` calls it every time, writing `'b'` calls it once. Nothing downstream repeats — `writeTo`, `syncWith` and the store's own consumers all compare against what they already hold — so this only matters when `set` does more than write state, such as firing a request.

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

`readFrom` also accepts a function that receives the previous committed value, so an external signal that only covers part of the state can be merged into it:

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

The signals the function reads are tracked; the previous value is not — a store change alone does not re-run the merge, but the next external change merges into the latest value. `prev` is always the value committed to the store, never a pending edit the `storeEditsWhen` gate is holding back — merging one in would commit it behind the gate's back.

So a gated edit in progress is **lost** when `readFrom` changes the store: the returned signal is a `linkedSignal` over the store, and a newly committed value resets it. A user part-way through an invalid form loses that edit if a parent input feeding `readFrom` changes. (A value equal to the current state writes nothing, so it resets nothing.) Where that matters, keep the external signal out of this link — read it into separate state, or drive it from an explicit user action.

### One-way out: pushing store changes with writeTo

`writeTo` is the opposite direction: every change committed to the store is pushed out. It takes a **sink**, not a callback — a `WritableSignal` (`model()`, `signal()`) that is set, or an `output()` / `EventEmitter` that is emitted. The value at link time is not pushed, only changes after it:

```typescript
@Component({
  /* ... */
})
export class ProductSearchComponent {
  store = inject(ProductsStore);

  filterChange = output<{ search: string }>();

  linked = this.store.linkProductEntitiesFilter({
    writeTo: this.filterChange,
  });
}
```

`writeTo` cannot be combined with `syncWith` (which already writes back), but it combines with `readFrom` — see the next section.

Redundant pushes are dropped, and the comparison happens with the store value or **after `writeMap`** if set, in the type the external side actually sees. With a mapping that drops part of the state, a change the parent could never observe never reaches it:

```typescript
// store state is { search: string; page: number }, the parent only wants search
searchChange = output<string>();

linked = this.store.linkProductEntitiesFilter({
  writeTo: this.searchChange,
  writeMap: (filter) => filter.search,
});
// paging from 1 to 2 to 3 with the same search emits nothing
```

How "already holds" is decided depends on the sink:

- A **writable sink** is readable, so it is simply asked: a mapped value it already holds is never set again, even if the parent put it there itself.
- An **emit-only sink** (`output()`, `EventEmitter`) cannot be read, so the link remembers what it last gave it: the link-time value, whatever `readFrom` supplied (through `writeMap`), and everything it emitted. The guarantee is deliberately one-sided — **at most one redundant emit per value, never a missed one** — because a redundant emit is noise the parent can ignore, while a missed one diverges for good.

### Mapping between types

When the external signal's type is not the store's, `readMap` and `writeMap` map between them. Here the parent works with a plain search string while the store keeps a `{ search: string }` filter, so each direction needs a map:

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
    // the same model both ways, with a map in each direction
    readFrom: this.search,
    readMap: (search) => ({ search }),
    writeTo: this.search,
    writeMap: (filter) => filter.search,
  });
}
```

The types require a map, but only **in the direction the value does not already fit** — which here is both, since a `string` is not a `{ search: string }` and neither is the reverse.

Change the parent's signal to `{ search: string; page: number }` and only one direction still needs one. Coming in, that object already has everything the store's filter needs, so `readMap` can go. Going out, the store's `{ search }` has no `page`, so `writeMap` stays required:

```typescript
// the parent's signal is { search: string; page: number }
this.store.linkProductEntitiesFilter({ readFrom: this.parentFilter }); // fine, no readMap
this.store.linkProductEntitiesFilter({ writeTo: this.parentFilter }); // error: writeMap is required
```

On link, the mapped model value is pushed to the store (like `syncWith`'s default `initialValueFrom: 'external'`), and nothing is pushed back out. The same pair works on `syncWith` when one signal covers both directions.

Both maps receive a second argument, `skip`, which **rejects** the value they were given. Call it from anywhere in the function, not only in a return:

```typescript
// the store's selection is optional, the model is not:
// a deselect leaves the last value in place
protected idSelected = this.store.linkGenreIdSelected({
  readFrom: () => this.value(),
  writeTo: this.value,
  writeMap: (id, skip) => (id ? (id as Genre) : skip()),
});
```

- `writeMap` skipping means nothing is pushed out for that store value.
- `readMap` skipping means the value is rejected and the store is left as it is — this is how you validate what an external signal supplies, on `readFrom` and `syncWith` alike.

```typescript
linked = this.store.linkProductEntitiesFilter({
  readFrom: this.search,
  readMap: (search, skip) => (search.length >= 3 ? { search } : skip()),
});
```

A mapped side is compared in the external type, so `equal` only partly carries over, and `writeEqual` can replace it on the way out — see [Equality across maps](#equality-across-maps).

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

### Equality

`equal` decides when a value counts as changed. A write equal to what the store already holds is skipped — `set` (or `patchState`) is not called — and a store value equal to what the external signal already has is not pushed out. That is what stops a two-way link from echoing forever.

It defaults to comparing by content, chosen from the value at hand: `Object.is` for primitives, element by element for arrays, and structurally for plain objects. Reference equality would be the wrong default — a value rebuilt on every read (a `computation` mapping the store, a form producing a fresh object, a spread in `set`) is never equal to its own previous value, so every write re-triggers the read and the link never settles.

The one shape the default does not settle is an array whose _elements_ are rebuilt on every read, since array elements are compared by `Object.is`. For that, and whenever you want different semantics, pass your own function or the name of a premade comparison:

| Name             | Compares                                                            | Offered for       |
| ---------------- | ------------------------------------------------------------------- | ----------------- |
| `'reference'`    | `Object.is`, opting out of the content comparison                   | any value         |
| `'array'`        | Same length and every element equal by `Object.is`, order sensitive | arrays            |
| `'set'`          | Same elements regardless of order, set semantics                    | arrays            |
| `'stringify'`    | `JSON.stringify(a) === JSON.stringify(b)`, structural               | any value         |
| `'<prop>'`       | `a[prop]` and `b[prop]` by `Object.is`, e.g. `'id'`                 | objects           |
| `'array.<prop>'` | Element by element by that property, order sensitive                | arrays of objects |
| `'set.<prop>'`   | The same property values regardless of order                        | arrays of objects |

All of them are type-checked against the linked value, and property names autocomplete from its type — from the element's type for the `array.` and `set.` forms. So an array of entities is compared by id with `equal: 'array.id'` (same ids, same positions) or `'set.id'` (same ids, any order); a bare `'id'` is only offered when the value is an object itself.

```typescript
const Store = signalStore(
  withState({
    rows: [] as { label: string; value: number }[],
    ids: [] as string[],
    selectedProduct: undefined as Product | undefined,
    products: [] as Product[],
  }),
  // an array of objects with no id, rebuilt on every read
  withLink('rows', { equal: 'stringify' }),
  // a selection is a set, order does not matter
  withLink('ids', { equal: 'set' }),
  // changed only when the id changes, whatever else the product carries
  withLink('selectedProduct', { equal: 'id' }),
  // a list of entities, compared by the ids it holds
  withLink('products', { equal: 'array.id' }),
);
```

> The structural comparison (the default for plain objects, and `'stringify'`) is JSON-based: key order matters (`{a,b}` and `{b,a}` are not equal), and a `Date`, `Map`, `Set` or class instance nested in the value is flattened — two different ones can compare equal, and the update is dropped. Keeping non-serializable values in store state is discouraged for other reasons too (persistence, transfer state, devtools); if you do, pass your own `equal` that knows how to compare them, or `'reference'`.

A premade name wins over a property of the same name, so a value with a prop called `array`, `set` or `stringify` has to be compared with the exported `equalByKey('stringify')` instead or your own equal implementation.

The same comparisons are exported as functions — `equalArray`, `equalSet`, `equalStringify`, `equalByKey(prop)` (the `'array.<prop>'` form on arrays) and `equalSetBy(prop)` — for use anywhere an equality function is taken (e.g. a `computed` or a `linkedSignal`).

#### Equality across maps

`equal` is written against the store's type. With  `writeMap`, the side being mapped is compared in the external type instead, so only a name that does not depend on the type carries over — `'reference'`, `'stringify'`, and `'array'` / `'set'` while both values are still arrays. A property name or a custom function falls back to the default content comparison on that side.

That fallback is usually fine. The exception is a `writeMap` returning an **array of objects**, the shape the default cannot settle: nothing on the outbound side dedupes, and the link-time value is pushed out on the first tick. For that, pass `writeEqual` on the link call — it takes the same options as `equal`, checked against what `writeMap` returns, so `'id'` and `'array.id'` autocomplete from the external type:

```typescript
linked = this.store.linkSelectedIds({
  writeTo: this.selectionChange,
  writeMap: (ids) => ids.map((id) => ({ id })),
  writeEqual: 'array.id',
});
```

There is no `readEqual`: whatever `readMap` returns is already in the store's type, so `equal` guards it on the way in.

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

Pass `storeEditsWhen` to the link method: the returned signal becomes a buffer over the store, and writes only reach it while `storeEditsWhen` returns true. It is checked on each write and again inside an effect, so it is reactive — a write made while the form is valid reaches the store straight away, and a value held back while it was invalid is pushed as soon as it becomes valid:

```ts
export class ProductListComponent {
  store = inject(ProductsStore);

  // buffers the form value, only valid data reaches the store.
  // the `: boolean` annotation is needed because filterForm is declared below,
  // without it typescript reports a circular inference
  formData = this.store.linkProductEntitiesFilter({
    storeEditsWhen: (): boolean => this.filterForm().valid(),
  });

  filterForm = form(this.formData, (value) => {
    required(value.search);
  });
}
```

If the store changes from elsewhere, the buffer resets to the store value (it is a `linkedSignal` over it), so the form follows the store as usual.

With `syncWith`, the external signal only ever receives values that were committed to the store — buffered edits stay local until the gate opens.

#### The gate only applies to writes through the returned signal

`storeEditsWhen` gates what the form (or your own code) writes into the buffer. Values arriving from `readFrom` or `syncWith` are written straight to the store and are never gated — those options tell the store which signal to follow, and holding their value back would leave the store disagreeing with the signal it was told to read.

That also means the gate is never called while `link<Name>()` runs, so it can safely read a field declared after it, like the `filterForm` above.

To reject values coming from `readFrom` or `syncWith`, call `skip()` in `readMap` (see [Mapping between types](#mapping-between-types)):

```ts
linked = this.store.linkProductEntitiesFilter({
  readFrom: (prev) => ({ ...prev, search: this.search() }),
  readMap: (filter, skip) => (filter.search.length >= 3 ? filter : skip()),
});
```

Because those values write through, they also reset the buffer, discarding an edit the gate is currently holding — see [Merging a partial signal with readFrom](#merging-a-partial-signal-with-readfrom).

> `storeEditsWhen` requires an injection context (field initializer or constructor), because an effect is created.

### Submitting a form with Signal Forms

`withLink` can really simplify complex forms, especially when there is derived data, calls that need to run while the form is being filled in, or the form has to sync with `model()` inputs or outputs. Link the form to the store, and the store can derive from and react to each field as it changes, like the example below. Submit with a [withCalls](/docs/traits/with-calls) call passed the stored value, rather than calling the backend from `set` — `set` has to write synchronously, and a call lets you await the result and show its errors in the form:

```ts
export const RegisterUserStore = signalStore(
  withState({ registration: { name: '', email: '', password: '' } }),
  // generates linkRegistration()
  withLink('registration'),
  withComputed(({ registration }) => ({
    // derived as the user types
    passwordStrength: computed(() => scorePassword(registration().password)),
  })),
  withCalls(({ registration }) => ({
    // runs whenever the email changes, cancelling a check still in flight
    checkEmail: callConfig({
      call: (email: string) => inject(UserService).checkEmail(email),
      callWith: () => registration().email || undefined,
      mapPipe: 'switchMap',
    }),
    registerUser: callConfig({
      call: (data: Registration) => inject(UserService).register(data),
      mapError: (error) => (error as HttpErrorResponse).error.message,
    }),
  })),
);
```

```ts
export class RegisterUserComponent {
  store = inject(RegisterUserStore);

  registerForm = form(this.store.linkRegistration(), (path) => {
    required(path.name);
    email(path.email);
    // the email only reaches the store, and the check, once typing pauses
    debounce(path.email, 300);
    // checkEmailResult() is { email, available }, from the check above
    validate(path.email, ({ value }) => {
      const check = this.store.checkEmailResult();
      return check?.email === value() && !check.available
        ? { kind: 'emailTaken', message: 'Email already taken' }
        : undefined;
    });
    minLength(path.password, 6);
  });

  onSubmit() {
    submit(this.registerForm, async () => {
      // the store already holds the form value
      const result = await this.store.registerUser(this.store.registration());
      if (!result.ok) {
        return {
          kind: 'server',
          fieldTree: this.registerForm.email,
          message: result.error() as string,
        } satisfies TreeValidationResult;
      }
    });
  }
}
```

For very simple forms that only submit, you might not need `withLink`, like the case below. Keep the form value in the component — a `signal`, or a `linkedSignal` over store state when it starts from there — and pass it to the call on submit:

```ts
// route: /profile/:id
export const ProfileStore = signalStore(
  withRoute(({ params }) => ({ id: params['id'] as string })),
  withCalls(({ id }) => ({
    // loads into profile() whenever the id param changes
    loadProfile: callConfig({
      call: (id: string) => inject(ProfileService).getProfile(id),
      callWith: id,
      resultProp: 'profile',
      defaultResult: { name: '', email: '' },
    }),
  })),
  withCalls((store) => ({
    saveProfile: callConfig({
      call: (profile: Profile) => inject(ProfileService).save(store.id(), profile),
      storeResult: false,
      // only a saved profile reaches the store
      onSuccess: (_, profile) => patchState(store, { profile }),
      mapError: (error) => (error as HttpErrorResponse).error.message,
    }),
  })),
);
```

```ts
export class ProfileComponent {
  store = inject(ProfileStore);

  // a buffer that starts from the loaded profile,
  // and resets whenever it changes (a new id, or a save)
  formData = linkedSignal(this.store.profile);

  profileForm = form(
    this.formData,
    (path) => {
      required(path.name);
      email(path.email);
    },
    {
      // using signal form submission requires the formRoot directive,
      // or call submit(this.profileForm, ...) from a click handler
      submission: {
        action: async () => {
          const result = await this.store.saveProfile(this.formData());
          if (!result.ok) {
            return {
              kind: 'server',
              message: result.error() as string,
            } satisfies TreeValidationResult;
          }
        },
      },
    },
  );
}
```

### Splitting a model() across two forms with copySignal

A parent hands the component one object through a `model()`, but the component edits it as two separate forms, each with its own state in the store and its own validation. Each form links to its own slice and reads the model with `readFrom`, keeping the part it owns; the store puts the slices back together in a `computed`; and `copySignal` copies that computed into the model, so the parent gets the whole object back:

```ts
type Checkout = { name: string; email: string; street: string; city: string };

export const CheckoutStore = signalStore(
  withState({
    contact: { name: '', email: '' },
    address: { street: '', city: '' },
  }),
  // generates linkContact() and linkAddress()
  withLink('contact'),
  withLink('address'),
  withComputed(({ contact, address }) => ({
    // the two slices back together, in the shape the parent works with
    checkout: computed<Checkout>(() => ({ ...contact(), ...address() })),
  })),
);
```

```ts
@Component({
  template: `
    <input [formField]="contactForm.name" />
    <input [formField]="contactForm.email" />
    <input [formField]="addressForm.street" />
    <input [formField]="addressForm.city" />
  `,
  imports: [FormField],
})
export class CheckoutComponent {
  store = inject(CheckoutStore);

  // the whole object, edited by the parent and written back to it
  checkout = model<Checkout>({ name: '', email: '', street: '', city: '' });

  // each link reads the model and keeps only the half it owns
  contactData = this.store.linkContact({
    readFrom: this.checkout,
    readMap: ({ name, email }) => ({ name, email }),
  });
  contactForm = form(this.contactData, (path) => {
    required(path.name);
    email(path.email);
  });

  addressData = this.store.linkAddress({
    readFrom: this.checkout,
    readMap: ({ street, city }) => ({ street, city }),
  });
  addressForm = form(this.addressData, (path) => {
    required(path.street);
    required(path.city);
  });

  // the recombined value goes back to the parent. A field only to get an
  // injection context; the returned EffectRef does not have to be kept
  copy = copySignal(this.store.checkout, this.checkout);
}
```

Typing in either form writes that slice to the store, the `computed` recombines both, and the copy sets the model. When the parent writes the model instead, both `readFrom`s pick up their slice and both forms follow.

Neither link uses `writeTo`, because each one only owns half of the object and would push a partial value to a model the other half also writes. The recombined `computed` is the only value that is the whole object, and it is not the source of any link — copying it out is exactly what `copySignal` is for.

The copy does not echo back through the forms: setting the model re-runs both `readFrom`s, each slice equals what the store already holds, and the `equal` guard drops the write.

`copySignal` is a standalone function (`import { copySignal } from '@ngrx-traits/signals'`), not a store feature — see [copySignal](#copysignal).

## API

```typescript
withLink(name, options?)
```

| Property      | Description                                                                    | Type                                                                                                                                                       |
| ------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`        | State key to link to, or a custom name when `computation` is used              | `keyof State \| string`                                                                                                                                    |
| `computation` | Derive the linked value from the store (requires `set`)                        | `(store) => T`                                                                                                                                             |
| `set`         | How writes reach the store, must write synchronously; defaults to `patchState(store, { [name]: value })` | `(value, store) => void`                                                                                                                                   |
| `equal`       | Equality guard for both sync directions, defaults to comparing by content      | `(a, b) => boolean` or a name: `'reference'`, `'array'`, `'set'`, `'stringify'`, a prop of the value, or `'array.<prop>'` / `'set.<prop>'` of its elements |
| `noSetter`    | Skip generating the private `_set<Name>()` method, defaults to `false`         | `boolean`                                                                                                                                                  |

### Generated link method

```typescript
link<Name>(options?: LinkOptions<T, E>): WritableSignal<T>
```

`E` is the external type, inferred from the signal or sink that is passed.

| Property           | Description                                                                                                               | Type                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `syncWith`         | Signal kept in sync both ways: writing it updates the store, store changes are written back to it                         | `WritableSignal<E>`                       |
| `readFrom`         | Signal the store only reads, never written back; or a function receiving the previous value, to merge a partial signal in | `Signal<E> \| (prev: T) => T`             |
| `writeTo`          | Sink store changes are pushed to: a signal that is set, or an output/EventEmitter that is emitted                         | `WritableSignal<E> \| OutputEmitterRef<E> \| EventEmitter<E>` |
| `readMap`          | Maps what the external side supplies into the store's type; required unless `E` is assignable to `T`. `skip()` rejects the value | `(value: E, skip: () => never) => T`      |
| `writeMap`         | Maps a store value into what the external side expects; required unless `T` is assignable to `E`. `skip()` pushes nothing        | `(value: T, skip: () => never) => E`      |
| `writeEqual`       | Equality for the outbound side, replacing `equal` there; only accepted with a `writeMap`                                  | `(a: E, b: E) => boolean` or the same names as `equal`, checked against `E` |
| `initialValueFrom` | With `syncWith`, where the value that wins on link comes from: `'external'` (default) or `'store'`                        | `'external' \| 'store'`                   |
| `storeEditsWhen` | Gate writes made through the returned signal: it buffers them and only pushes to the store when this returns true. Does not apply to `readFrom` / `syncWith` values | `(value: T) => boolean`                   |

`syncWith` is mutually exclusive with `readFrom` and `writeTo` (which combine for a two-way sync with a signal of its own in each direction), and `initialValueFrom` is only accepted together with `syncWith` — all enforced by the types.

The returned `WritableSignal` is always the store view (or, with `storeEditsWhen`, the buffer over it), never the external signal.

### Generated private setter

```typescript
_set<Name>(input: T | (() => T) | ((current: T) => T), config?: { injector?: Injector }): EffectRef
```

The same write path the linked signal uses, exposed as a store method. The `_` prefix makes it private to the store: other features and methods can write through it, consumers of the store cannot see it.

Like the setters of [withStateSetter](/docs/traits/with-state-setter), it is a `signalMethod`, so it accepts a plain value, a signal or reactive fn (keeping the store in sync with it), or an updater `(current) => next` for partial updates.

### copySignal

```typescript
copySignal(source, target, options?): EffectRef;
```

> **Experimental**, like `withLink` itself.

A standalone function, not a store feature: it copies one signal into another signal, an `output()` or an `EventEmitter`, and keeps it up to date. It covers what is not a link source, like the recombined `computed` in [Splitting a model() across two forms](#splitting-a-model-across-two-forms-with-copysignal) — for a store value there is already `writeTo`.

| Parameter          | Description                                                                                                                                               | Type                                                          |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `source`           | Signal copied from, or a function reading signals — tracked like a `computed` — to combine several, map into the target's type, or `skip()` a value     | `Signal<T> \| (skip: () => never) => T`                       |
| `target`           | Copied to: a signal that is set, or an output/EventEmitter that is emitted                                                                                | `WritableSignal<T> \| OutputEmitterRef<T> \| EventEmitter<T>` |
| `options.equal`    | When two values are the same, defaults to comparing by content                                                                                            | `(a, b) => boolean` or the same names as `equal` above        |
| `options.injector` | Injector for the effect watching the source, when called outside an injection context                                                                     | `Injector`                                                    |

```ts
// mirror an input into a model
copySignal(this.search, this.searchModel);

// map into the target's type, and skip the values it should not see
copySignal((skip) => this.filter().search || skip(), this.filterChange);

// map to ids, compared by a premade equality
copySignal(() => this.selected().map((p) => p.id), this.selectedIds, {
  equal: 'array',
});
```

`equal` decides when two values are the same: a value equal to the last one the source produced is not copied again, and one equal to what the target already holds is not written. The second only applies to a writable target, which can be edited on its own; an `output()` holds nothing to compare against.

`skip()` rejects the value being read, from anywhere in the source function: nothing is copied and the target is left as it is. The signals read before it are still tracked, so the source is re-run when they change.

Nothing is written back, so the target can be edited on its own. The edit survives until the source produces a different value: a recompute that ends up equal to the last value the source produced, or a return to it after a `skip()`, leaves the target alone.

The value at call time is copied right away to a writable signal, so the target agrees with the source before the first change. An `output()` or EventEmitter gets it on the first change detection instead, once the parent's binding is listening, so calling `copySignal` in a field initializer is fine.

The source has to fit the target: `T` is taken from the target, and a source that is missing a property the target's type promises, or that can be `null` when the target cannot, is a type error — map it in the source function. A function returning a bare literal widens it, so `() => 'asc'` is a `string` and does not fit a `WritableSignal<'asc' | 'desc'>`: add `as const` or a return type. This is checked on the source rather than the target, because `set` and `emit` take their value as a method parameter and would accept any related type and then hold the wrong shape.

There is no gate and no merge form taking the previous value, as there is on a link. A link merges into the store, which it re-reads every time; a copy would be merging into a stale idea of a target it does not own. To merge into the target, read it in the source function — the copy settles, since writing back what the target already holds is dropped by `equal`. That relies on `equal` recognizing the rebuilt value: the default does for primitives, plain objects and arrays of the same elements, but an array of fresh objects, or a `Date` or class instance as the value, never compares equal to its rebuild and loops, so pass an `equal` that knows it.

The returned `EffectRef` destroys the copy, which otherwise lives as long as the injection context it was created in.

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
