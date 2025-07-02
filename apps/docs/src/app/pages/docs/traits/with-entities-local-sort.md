---
name: withEntitiesLocalSort 
order: 11
---

Generates necessary state, computed and methods for sorting locally entities in the store.

Requires withEntities to be present in the store.

**Kind**: global function

## Import

Import the withEntitiesLocalSort trait from `@ngrx-traits/signals`.

```ts
import { withEntitiesLocalSort } from '@ngrx-traits/signals';
```


## Examples

### Implement remote sort for a list of entities

```typescript
const entity = entityConfig({
    entity: type<T>(),
    collection: 'users'
})

const store = signalStore(
    withEntities(entity),
    withEntitiesLocalSort({
        ...entity,
        defaultSort: {field: 'name', direction: 'asc'}
    })
);
```

To use you generally need either a sort dropdown if is a list or a table where clicking on the columns headers sorts, bellow is how s used with a dropdown (you can find full source code in the examples folder in github):
```html
<users-sort-dropdown
  [sort]="store.usersSort()"
  (sortChange)="store.sortUsersEntities({ sort: $event })"
/>
... show products list
```
If you manually changed the entities and want to reapply the sort you can call the sort entities method without any param to reapply the last sort

### Mixing with other local store features
You can mix this feature with other local store features like withEntitiesLocalFilter, withEntitiesLocalPagination, etc.

```typescript
const productsEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'products',
});
export const ProductsLocalStore = signalStore(
  { providedIn: 'root' },
  withEntities(productsEntityConfig),
  withCallStatus({ ...productsEntityConfig, initialValue: 'loading' }),
  withEntitiesLocalPagination({
    ...productsEntityConfig,
    pageSize: 5,
  }),
  withEntitiesLocalFilter({
    ...productsEntityConfig,
    defaultFilter: { search: '' },
    filterFn: (entity, filter) =>
      !filter?.search ||
      entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
  }),
  withEntitiesLocalSort({
    ...productsEntityConfig,
    defaultSort: { field: 'name', direction: 'asc' },
  }),
  withEntitiesLoadingCall({
    ...productsEntityConfig,
    fetchEntities: () => {
      return inject(ProductService)
        .getProducts()
        .pipe(map((d) => d.resultList));
    },
  }),
);
```

To know more how it mixes and works with other local store features, check [Working with Entities](/docs/getting-started/working-with-entities) section.
## API Reference

This trait receives an object or factory to allow specific configurations:

| Property    | Description                          | Value                                                  |
| ----------- | ------------------------------------ | ------------------------------------------------------ |
| entity      | The entity type                      | `type<T>()`                                            |
| collection  | The name of the collection. Optional | string                                                 |
| defaultSort | The initial sort config.             | `{ field: string; direction: 'asc' \| 'desc' \| ''  }` |

## State

Generates the following signals

```typescript
entitiesSort: Signal<{ field: string; pageSize: direction: 'asc' | 'desc' | '' }>;
```

If collection provided, the following signals are generated, example: **users**

```typescript
usersSort: Signal<{ field: string; pageSize: direction: 'asc' | 'desc' | '' }>;
```

## Methods

Generates the following methods

```typescript
sortEntities: ({sort: { field: string; pageSize: direction: 'asc' | 'desc' | ''}}) => void;
```

If collection provided, the following methods are generated, example: **users**

```typescript
sortUsers: ({sort: { field: string; pageSize: direction: 'asc' | 'desc' | ''}}) => void;
```
