---
name: withLink
order: 19
---

# withLink

Generates a `link<Name>()` method that connects store state to component signals like `input()`, `model()` and Angular Signal Forms. The method returns a `WritableSignal` that is a live view of the store: reading it reads the state, writing it updates the store (via `patchState` by default, or a custom `update` callback, e.g. to call a store method like `filterEntities` instead).

Optionally pass an external signal to the link method to keep it in sync with the store:

- `WritableSignal` (e.g. `model()`): two-way sync.
- Read-only `Signal` (e.g. `input()`): one-way external → store.

Both sync directions are guarded by `equal` (defaults to `Object.is`), so writes only happen when the value actually changed — this prevents echo loops when `update` transforms the value (e.g. normalizes or sorts it).

The first argument names the generated method and doubles as the state key to link to (with autocompletion), unless `computation` is provided in the options — then it is just a custom name and the value is derived from the store.

## Premade withLink for entities

If you want to work with the ngrx traits withEntities\* store features, be sure to check the following premade withLink store features for them:

- [withLinkEntitiesFilter](/docs/traits/with-link-entities-filter)
- [withLinkEntitiesSort](/docs/traits/with-link-entities-sort)
- [withLinkEntitiesSingleSelection](/docs/traits/with-link-entities-single-selection)
- [withLinkEntitiesMultiSelection](/docs/traits/with-link-entities-multi-selection)

> Passing an external signal requires an injection context (field initializer or constructor), because effects are created to keep it in sync. The no-arg form has no such requirement.

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
  linked = this.store.linkProductIdSelected(this.selectedId);
}
```

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

### Choosing the initial value

When an external signal is linked, by default its current value is pushed to the store. Use `initialValue: 'store'` to write the store value to the external signal instead:

```typescript
selectedId = model<string | undefined>(undefined);
linked = this.store.linkProductIdSelected(this.selectedId, {
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

This case is very similar to the previous one, but you will need a `linkedSignal` that works as a buffer between the form and the store, so only validated data reaches the store.
For Angular 22 you can use the new `set` option in `linkedSignal` to only let valid data into the store:

```ts
export class ProductListComponent {
  store = inject(ProductsStore);

  storeSignal = this.store.linkProductEntitiesFilter();
  // buffer signal
  formData = linkedSignal(this.storeSignal, {
    // new in angular 22, only propagates valid data to the store
    set: (value) => {
      if (this.filterForm().valid()) this.storeSignal.set(value);
    },
  });

  filterForm = form(this.formData, (value) => {
    required(value.search);
  });
}
```

For Angular versions older than 22 you will need an effect to only let valid data into the store:

```ts
export class ProductListComponent {
  store = inject(ProductsStore);

  storeSignal = this.store.linkProductEntitiesFilter();
  // buffer signal
  formData = linkedSignal(this.storeSignal);

  filterForm = form(this.formData, (value) => {
    required(value.search);
  });

  constructor() {
    effect(() => {
      const value = this.formData();
      if (this.filterForm().valid()) this.storeSignal.set(value);
    });
  }
}
```

### On submission, only setting validated data in the store with Signal Forms

There are two ways for this case:

The first is very similar to the previous one, with a `linkedSignal` that works as a buffer between the form and the store, but the changes are set in the store on form submission (or by your own method):

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

### Generated link method

```typescript
link<Name>(external?: Signal<T>, options?: LinkOptions): WritableSignal<T>
```

| Property       | Description                                                                                   | Type                    |
| -------------- | --------------------------------------------------------------------------------------------- | ----------------------- |
| `external`     | Signal to keep in sync: `WritableSignal` two-way, read-only `Signal` one-way external → store | `Signal<T>`             |
| `initialValue` | Which value wins on link: `'external'` (default) pushes to the store, `'store'` writes back   | `'external' \| 'store'` |

The returned `WritableSignal` is always the delegated store view, never the external signal.

## Methods

```typescript
// for withLink('filter')
{
  linkFilter: (external?, options?) => WritableSignal<{ search: string }>;
}
```

## State

No state signals are generated.

## Props

No props are generated.
