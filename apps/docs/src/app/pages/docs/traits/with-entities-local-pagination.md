---
name: withEntitiesLocalPagination 
order: 6
---

# withEntitiesLocalPagination

Generates necessary state, computed and methods for local pagination of entities in the store.

Requires withEntities to be present in the store.

**Kind**: global function

## Import

Import the withEntitiesLocalPagination trait from `@ngrx-traits/signals`.

```ts
import { withEntitiesLocalPagination } from '@ngrx-traits/signals';
```

## Examples

### Paginating a list of entities

In this example we have a list of users and we want to paginate them, we will use the pageSize prop to set the initial page size.
```typescript
const entity = entityConfig({
    entity: type<T>(),
    collection: 'users'
})

const store = signalStore(
    withEntities(entity),
    withEntitiesLocalPagination({
        ...entity,
        pageSize: 10,
    })
);
```
Now we use it in a component, the generated usersCurrentPage signal will provide the entities for the current page, the pageIndex and the total number of entities:

```html
@for (user of store.usersCurrentPage.entities(); track user.id){
  {{ user.name }}
}
<mat-paginator
  [pageSizeOptions]="[5, 10, 25, 100]"
  [length]="store.usersCurrentPage.total()"
  [pageSize]="store.usersCurrentPage.pageSize()"
  [pageIndex]="store.usersCurrentPage.pageIndex()"
  (page)="store.loadUsersPage($event)"
></mat-paginator>
```

### Mixing with other local store features
You can mix this feature with other local store features like withEntitiesLocalSort, withEntitiesLocalFilter, etc.

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

| Property    | Description                          | Value       |
| ----------- | ------------------------------------ | ----------- |
| entity      | The entity type                      | `type<T>()` |
| collection  | The name of the collection. Optional | string      |
| pageSize    | The initial page size.               | number      |
| currentPage | The initial page index.              | number      |

## State

Generates the following signals

```typescript
entitiesPagination: Signal<{ currentPage: number; pageSize: number }>;
```

If collection provided, the following signals are generated, example: **users**

```typescript
usersPagination: Signal<{ currentPage: number; pageSize: number }>;
```

## Computed

Generates the following computed signals

```typescript
entitiesCurrentPage: Signal<{ entities: T[]; pageIndex: number; total: number }>;
```

If collection provided, the following computed signals are generated, example: **users**

```typescript
usersCurrentPage: Signal<{ entities: T[]; pageIndex: number; total: number }>;
```

## Methods

Generates the following methods

```typescript
loadEntitiesPage: ({pageIndex:number}) => void;
```

If collection provided, the following methods are generated, example: **users**

```typescript
loadUsersPage: ({pageIndex:number}) => void;
```
