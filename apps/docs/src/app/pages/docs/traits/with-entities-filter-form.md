---
name: withEntitiesFilterForm
order: 5
---

# withEntitiesFilterForm
Creates a `FieldTree` form linked to the filter state of a `withEntitiesLocalFilter`, `withEntitiesRemoteFilter`, or `withEntitiesHybridFilter`. The form type is automatically inferred from the filter state — no need to re-specify the filter type. Optionally syncs valid form changes back to the filter method and supports validation.

Requires one of the `withEntities*Filter` features to be used before it.

## Examples

### Basic usage
```typescript
const entity = type<Product>();
const collection = 'product';

const Store = signalStore(
  withEntities({ entity, collection }),
  withEntitiesRemoteFilter({
    entity, collection,
    defaultFilter: { search: '' },
  }),
  // creates productEntitiesFilterForm - filter type { search: string } is inferred
  withEntitiesFilterForm({ entity, collection }),
);

// In component - form fields are fully typed
store.productEntitiesFilterForm.search().value.set('shoes');
store.productEntitiesFilterForm().value();  // { search: 'shoes' }
```

### Using entityConfig
```typescript
const productConfig = entityConfig({
  entity: type<Product>(),
  collection: 'product',
});

const Store = signalStore(
  withEntities(productConfig),
  withEntitiesRemoteFilter({
    ...productConfig,
    defaultFilter: { search: '' },
  }),
  // spread or pass entityConfig directly
  withEntitiesFilterForm(productConfig),
);
```

### Without collection
```typescript
const Store = signalStore(
  withEntities({ entity: type<Product>() }),
  withEntitiesLocalFilter({
    entity: type<Product>(),
    defaultFilter: { search: '' },
    filterFn: (entity, filter) =>
      !filter?.search ||
      entity.name.toLowerCase().includes(filter.search.toLowerCase()),
  }),
  withEntitiesFilterForm({ entity: type<Product>() }),
);

// prop name is entitiesFilterForm when no collection
store.entitiesFilterForm.search().value.set('test');
```

### Auto-filter on form changes
By default `filterOnChanges` is `true`, so valid form changes automatically call the filter method.
```typescript
const Store = signalStore(
  withEntities(productConfig),
  withEntitiesRemoteFilter({
    ...productConfig,
    defaultFilter: { search: '' },
  }),
  // filterOnChanges defaults to true
  withEntitiesFilterForm(productConfig),
);

// Changing the form value triggers store.filterProductEntities() automatically
store.productEntitiesFilterForm.search().value.set('shoes');
```

Set `filterOnChanges: false` when you want to control when the filter is applied, for example via an "Apply" button.
```typescript
const Store = signalStore(
  withEntities(productConfig),
  withEntitiesRemoteFilter({
    ...productConfig,
    defaultFilter: { search: '' },
  }),
  withEntitiesFilterForm({
    ...productConfig,
    filterOnChanges: false,
  }),
);

// In component - filter only when the user clicks "Apply"
  submitSearch() {
    let x = this.store.test(2);
    submit(this.productEntitiesFilterForm, async (form) => {
      const result = await this.store.filterProductEntities(form().value());
      if (!result.ok) {
        return {
          kind: 'server',
          message: result.error as string,
        } satisfies TreeValidationResult;
      }
      return undefined;
    });
  }
```

### With validation
```typescript
const Store = signalStore(
  withEntities(productConfig),
  withEntitiesRemoteFilter({
    ...productConfig,
    defaultFilter: { search: '' },
  }),
  withEntitiesFilterForm({
    ...productConfig,
    filterOnChanges: true,
    validation: (v) => {
      required(v.search);
    },
  }),
);

// Only filters when form is valid
store.productEntitiesFilterForm.search().value.set('');    // invalid, no filter
store.productEntitiesFilterForm.search().value.set('test'); // valid, triggers filter
```

## API

### Config

| Property          | Description | Type |
|-------------------|-------------|------|
| `entity`          | Entity type marker | `Entity` |
| `collection`      | Collection name (optional) | `string` |
| `filterOnChanges` | Auto-call filter method on valid form changes, defaults to `true` | `boolean` |
| `validation`      | Validation schema or function (optional) | `SchemaOrSchemaFn<Filter>` |

## Props
Generates a `FieldTree` prop on the store. The filter type is inferred from the preceding `withEntities*Filter` state.

```typescript
// with collection 'product' and filter { search: string }
{
  productEntitiesFilterForm: FieldTree<{ search: string }>;
}

// without collection
{
  entitiesFilterForm: FieldTree<{ search: string }>;
}
```

## State
No state signals are generated.

## Methods
No methods are generated.
