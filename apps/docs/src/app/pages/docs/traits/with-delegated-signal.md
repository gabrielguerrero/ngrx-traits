---
name: withDelegatedSignal
order: 19
---

# withDelegatedSignal

Creates a `WritableSignal` that delegates reading and updating the state to the store using `delegatedSignal`.  By default, writing to it patches the value back to the store via `patchState`. Provide a custom `update` callback to override this behavior (e.g. to trigger a side effect like filtering entities instead).

## Examples

### String shorthand (two-way sync)

```typescript
const Store = signalStore(
  withState({ filter: { search: '', category: 'all' } }),
  // creates filterDelegated WritableSignal, auto-patches state on change
  withDelegatedSignal('filter'),
  // another for custom way to use it
  // withDelegatedSignal({
  //   source: 'productFilter',
  //   update: (signal, store) => {
  //     ... custome patchState
  //   },
  // }),
);

// In component
store.filterDelegated.set({ search: 'shoes', category: 'sports' });
// store.filter() is now { search: 'shoes', category: 'sports' }
// or connect to form
filterForm = form(this.store.filterDelegated, (value) => {
  required(value.search);
});
```

### Config with custom name

```typescript
const Store = signalStore(
  withState({ filter: { search: '' } }), 
  withDelegatedSignal({ name: 'editableFilter', source: 'filter' })
  );

store.editableFilter.set({ search: 'updated' });
```

### Custom update callback

Useful for triggering custom store update logic  when delegated signal changes.

```typescript
const ProductsStore = signalStore(
  withState({ productFilter: { search: '' } }),
  withMethods((store) => {
     filterProducts: (filter: {search: string}) {
      // ... custom patchState
     }
  }),
  withDelegatedSignal({
    source: 'productFilter',
    update: (signal, store) => {
      store.filterProducts(signal());
    },
  }),
);
```

### Using with Angular Signal Forms

The delegated signal can be used as the source for Angular's `form()` in a component, enabling validation and two-way binding with a template input while keeping the store as the source of truth.

```typescript
// Store definition
const ProductsStore = signalStore(
  { providedIn: 'root' },
  withEntities({ entity: type<Product>(), collection: 'product' }),
  withEntitiesLocalFilter({
    entity: type<Product>(),
    collection: 'product',
    defaultFilter: { search: '' },
    filterFn: (entity, filter) => !filter?.search || entity.name.toLowerCase().includes(filter.search.toLowerCase()),
  }),
  withDelegatedSignal({
    source: 'productEntitiesFilter',
    update: (value, store) => {
      store.filterProductEntities(value());
    },
  }),
);
```

```typescript
// Component - create a form from the delegated signal
@Component({
  template: `
    <mat-form-field>
      <mat-label>Search</mat-label>
      <input type="text" matInput [formField]="filterForm.search" />
    </mat-form-field>
  `,
  imports: [MatFormField, MatLabel, MatInput, FormField],
})
export class ProductShopTabComponent {
  store = inject(ProductsStore);

  // Create a validated form from the delegated signal
  filterForm = form(this.store.productEntitiesFilterDelegated, (value) => {
    required(value.search);
  });
}
```

### Computed from multiple state props

Use `computation` and `update` to join multiple state props into a single delegated signal. The `update` callback splits the value back and patches each prop separately.

```typescript
const Store = signalStore(
  { protectedState: false },
  withState({
    user: { name: 'John', email: 'john@test.com' },
    permissions: ['read', 'write'],
  }),
  withDelegatedSignal({
    name: 'userDetail',
    computation: (store) => ({
      ...store.user(),
      permissions: store.permissions(),
    }),
    update: (value, store) => {
      const { permissions, ...user } = value;
      patchState(store, { user, permissions });
    },
  }),
);

// store.userDetail() => { name: 'John', email: 'john@test.com', permissions: ['read', 'write'] }
store.userDetail.set({
  name: 'Jane',
  email: 'jane@test.com',
  permissions: ['read', 'write', 'admin'],
});
// store.user() => { name: 'Jane', email: 'jane@test.com' }
// store.permissions() => ['read', 'write', 'admin']
```

### Primitive values

```typescript
const Store = signalStore(withState({ count: 0 }), withDelegatedSignal('count'));

store.countDelegated.set(42);
// store.count() === 42
```

## API

### Overloads

| Signature                                                | Prop name      | update default      |
| -------------------------------------------------------- | -------------- | --------------------- |
| `withDelegatedSignal('key')`                             | `keyDelegated` | `'patchState'`        |
| `withDelegatedSignal({ source: 'key' })`                 | `keyDelegated` | `undefined` (no sync) |
| `withDelegatedSignal({ name: 'custom', source: 'key' })` | `custom`       | `undefined` (no sync) |
| `withDelegatedSignal({ name: 'x', computation, update })` | `x`           | required              |

### Config

| Property   | Description                 | Type                                              |
| ---------- | --------------------------- | ------------------------------------------------- |
| `source`   | State key to link to        | `keyof State & string`                            |
| `name`     | Custom prop name (optional) | `string`                                          |
| `update` | update callback (optional), if not set does patchState to source prop | `(signal, store) => void` |
| `computation` | Derive value from multiple store props (use instead of `source`) | `(store) => T` |

## Props

Generates a `WritableSignal` prop on the store.

```typescript
// for withDelegatedSignal('filter')
{
  filterDelegated: WritableSignal<{ search: string }>;
}
```

## State

No state signals are generated.

## Methods

No methods are generated.
