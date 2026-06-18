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
If you want to work with the ngrx traits withEntities* store features, be sure check the following withLink store feature for them: 

- [withLinkEntitiesFilter](/docs/traits/with-entities-filter)
TODO add rest

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
    filterFn: (entity, filter) =>
      !filter?.search ||
      entity.name.toLowerCase().includes(filter.search.toLowerCase()),
  }),
  // generates linkProductEntitiesFilter()
  withLink('productEntitiesFilter', {
    update: (value, store) => store.filterProductEntities({ filter: value }),
  }),
);
```

### Using with Angular Signal Forms

The linked signal can be used as the source for Angular's `form()`, enabling validation and two-way binding with template inputs while keeping the store as the source of truth.

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

  filterForm = form(this.store.linkProductEntitiesFilter(), (value) => {
    required(value.search);
  });
}
```

### Two-way sync with a model()

```typescript
@Component({ /* ... */ })
export class ProductSelectComponent {
  store = inject(ProductsStore);

  // when the parent writes the model, the store updates;
  // when the store changes, the model (and the parent) updates
  selectedId = model<string | undefined>(undefined);
  linked = this.store.linkProductIdSelected(this.selectedId);
}
```

### Custom name with computation

Use `computation` and `update` to derive the linked value from the store, `update` maps writes back:

```typescript
const Store = signalStore(
  withEntities({ entity: type<Genre>() }),
  withEntitiesMultiSelection({ entity: type<Genre>() }),
  // generates linkSelectedGenreIds()
  withLink('selectedGenreIds', {
    computation: (store) => store.idsSelected(),
    update: (value, store) =>
      store.selectEntities({ ids: value, clearSelectionBeforeSelect: true }),
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

## API

```typescript
withLink(name, options?)
```

| Property      | Description                                                                             | Type                        |
| ------------- | --------------------------------------------------------------------------------------- | --------------------------- |
| `name`        | State key to link to, or a custom name when `computation` is used                        | `keyof State \| string`     |
| `computation` | Derive the linked value from the store (requires `update`)                               | `(store) => T`              |
| `update`      | How writes reach the store; defaults to `patchState(store, { [name]: value })`           | `(value, store) => void`    |
| `equal`       | Equality guard for both sync directions, defaults to `Object.is`                         | `(a, b) => boolean`         |

### Generated link method

```typescript
link<Name>(external?: Signal<T>, options?: LinkOptions): WritableSignal<T>
```

| Property       | Description                                                                                      | Type                      |
| -------------- | ------------------------------------------------------------------------------------------------ | ------------------------- |
| `external`     | Signal to keep in sync: `WritableSignal` two-way, read-only `Signal` one-way external → store     | `Signal<T>`               |
| `initialValue` | Which value wins on link: `'external'` (default) pushes to the store, `'store'` writes back      | `'external' \| 'store'`   |

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
