---
name: withLinkedSignal
order: 19
---

# withLinkedSignal
Creates a `WritableSignal` linked to a store state property via Angular's `linkedSignal`. When the source state changes, the linked signal updates automatically. Optionally syncs changes back to the store.

## Examples

### String shorthand (two-way sync)
```typescript
const Store = signalStore(
  withState({ filter: { search: '', category: 'all' } }),
  // creates filterLinked WritableSignal, auto-patches state on change
  withLinkedSignal('filter'),
);

// In component
store.filterLinked.set({ search: 'shoes', category: 'sports' });
// store.filter() is now { search: 'shoes', category: 'sports' }
```

### Config with custom name
```typescript
const Store = signalStore(
  withState({ filter: { search: '' } }),
  withLinkedSignal({ name: 'editableFilter', source: 'filter' }),
);

store.editableFilter.set({ search: 'updated' });
```

### One-way sync (store to signal only)
```typescript
const Store = signalStore(
  withState({ filter: { search: '' } }),
  // signal follows store, but changes to signal don't patch back
  withLinkedSignal({ source: 'filter', onChange: null }),
);
```

### Custom onChange callback
Useful for triggering side effects like filtering entities when the linked signal changes.
```typescript
const ProductsStore = signalStore(
  withState({ productEntitiesFilter: { search: '' } }),
  withEntitiesLocalFilter({ ... }),
  withLinkedSignal({
    source: 'productEntitiesFilter',
    onChange: (signal, store) => {
      store.filterProductEntities(signal());
    },
  }),
);
```

### Using with Angular Signal Forms
The linked signal can be used as the source for Angular's `form()` in a component, enabling validation and two-way binding with a template input while keeping the store as the source of truth.

```typescript
// Store definition
const ProductsStore = signalStore(
  { providedIn: 'root' },
  withEntities({ entity: type<Product>(), collection: 'product' }),
  withEntitiesLocalFilter({
    entity: type<Product>(),
    collection: 'product',
    defaultFilter: { search: '' },
    filterFn: (entity, filter) =>
      !filter?.search ||
      entity.name.toLowerCase().includes(filter.search.toLowerCase()),
  }),
  withLinkedSignal({
    source: 'productEntitiesFilter',
    onChange: (signal, store) => {
      store.filterProductEntities(signal());
    },
  }),
);
```

```typescript
// Component - create a form from the linked signal
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

  // Create a validated form from the linked signal
  filterForm = form(this.store.productEntitiesFilterLinked, (value) => {
    required(value.search);
  });
}
```

### Primitive values
```typescript
const Store = signalStore(
  withState({ count: 0 }),
  withLinkedSignal('count'),
);

store.countLinked.set(42);
// store.count() === 42
```

## API

### Overloads

| Signature | Prop name | onChange default |
|-----------|-----------|-----------------|
| `withLinkedSignal('key')` | `keyLinked` | `'patchState'` |
| `withLinkedSignal({ source: 'key' })` | `keyLinked` | `undefined` (no sync) |
| `withLinkedSignal({ name: 'custom', source: 'key' })` | `custom` | `undefined` (no sync) |

### Config

| Property   | Description | Type |
|------------|-------------|------|
| `source` | State key to link to | `keyof State & string` |
| `name` | Custom prop name (optional) | `string` |
| `onChange` | Sync strategy (optional) | `null \| 'patchState' \| (signal, store) => void` |

## Props
Generates a `WritableSignal` prop on the store.

```typescript
// for withLinkedSignal('filter')
{
  filterLinked: WritableSignal<{ search: string }>;
}
```

## State
No state signals are generated.

## Methods
No methods are generated.
