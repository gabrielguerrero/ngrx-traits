---
name: withForm
order: 19
---

# withForm
Creates a signal-based `FieldTree` form linked to a store state property using Angular's `linkedSignal` and `form()` from `@angular/forms/signals`. When the source state changes, the form resets to the new value. Optionally syncs form changes back to the store, with support for validation.

## Examples

### String shorthand (two-way sync with validation)
```typescript
const Store = signalStore(
  withState({ userState: { username: '' } }),
  // creates userStateForm FieldTree, auto-patches state on change
  withForm('userState', (v) => {
    required(v.username);
  }),
);

// In component
store.userStateForm.username().value.set('john');
// store.userState() is now { username: 'john' }
// store.userStateForm().valid() reflects validation state
```

### Config with custom onChange
Useful for triggering side effects like filtering entities when the form value changes.
```typescript
const ProductsStore = signalStore(
  withState({ productEntitiesFilter: { search: '' } }),
  withEntitiesLocalFilter({ ... }),
  withForm({
    source: 'productEntitiesFilter',
    validation: (value) => {
      required(value.search);
      debounce(value.search, 500);
    },
    onChange: (form, store) => {
      store.filterProductEntities(form().value());
    },
  }),
);
```

### Config with custom name
```typescript
const Store = signalStore(
  withState({ filter: { search: '' } }),
  withForm({ name: 'searchForm', source: 'filter' }),
);

store.searchForm.search().value.set('updated');
```

### One-way sync (store to form only)
```typescript
const Store = signalStore(
  withState({ filter: { search: '' } }),
  // form follows store, but changes to form don't patch back
  withForm({ source: 'filter', onChange: null }),
);
```

### Patch only when valid
```typescript
const Store = signalStore(
  { protectedState: false },
  withState({ filter: { search: '' } }),
  withForm({
    source: 'filter',
    onChange: 'patchStateIfValid',
    validation: (v) => {
      required(v.search);
    },
  }),
);

// Only patches store.filter() when the form is valid
store.filterForm.search().value.set('valid');
```

## API

### Overloads

| Signature | Prop name | onChange default |
|-----------|-----------|-----------------|
| `withForm('key', validation?)` | `keyForm` | `'patchState'` |
| `withForm({ source: 'key' })` | `keyForm` | `undefined` (no sync) |
| `withForm({ name: 'custom', source: 'key' })` | `custom` | `undefined` (no sync) |

### Config

| Property     | Description | Type |
|--------------|-------------|------|
| `source`     | State key to link the form to | `keyof State & string` |
| `name`       | Custom prop name (optional) | `string` |
| `validation` | Validation schema or function (optional) | `SchemaOrSchemaFn<State[K]>` |
| `onChange`   | Sync strategy (optional) | `null \| 'patchState' \| 'patchStateIfValid' \| (form, store) => void` |

## Props
Generates a `FieldTree` prop on the store.

```typescript
// for withForm('userState')
{
  userStateForm: FieldTree<{ username: string }>;
}
```

The `FieldTree` provides:
- `form().value()` — current form value
- `form().valid()` — validation state
- `form.fieldName().value` — writable signal for each field

## State
No state signals are generated.

## Methods
No methods are generated.
