---
name: withEntitiesMultiSelection 
order: 10
---

Generates necessary state, computed and methods for multi selection of entities. Warning: isAll[Collection]Selected and toggleSelectAll[Collection] wont work correctly in using remote pagination, because they cant select all the data.

Requires withEntities to be present in the store.

**Kind**: global function

## Import

Import the withEntitiesMultiSelection trait from `@ngrx-traits/signals`.

```ts
import { withEntitiesMultiSelection } from '@ngrx-traits/signals';
```

## Examples
### Adding multi selection to a list

```typescript

const entity = entityConfig({
    entity: type<Product>(),
    collection: 'products'
})

const store = signalStore(
    withEntities(entity),
    withEntitiesMultiSelection(entity)
);
```

Use it in a template like:
```html
     <mat-selection-list [multiple]="true">
        @for (item of store.entities(); track item.id) {
          <mat-list-option
            [value]="item.id"
            [selected]="!!store.productsIdsSelectedMap()[item.id]"
            (click)="store.toggleSelectProductsEntities({ id: item.id})"
          >
            {{ item.label }}
          </mat-list-option>
        }
      </mat-selection-list>
```
### Mixing with other local store features
You can mix this feature with other local or remote features like withEntitiesLocalSort, withEntitiesLocalPagination, etc, can be use with remote features but if using it in remote pagination be aware the toggleAll could not work as intended because all the rows are not loaded at the same time.

```typescript
const productsEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'products',
});
export const ProductsLocalStore = signalStore(
  { providedIn: 'root' },
  withEntities(productsEntityConfig),
  withCallStatus({ ...productsEntityConfig, initialValue: 'loading' }),
  withEntitiesMultiSelection(productsEntityConfig),
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

| Property    | Description                          | Value       |
| ----------- | ------------------------------------ |-------------|
| entity      | The entity type                      | `type<T>()` |
| collection  | The name of the collection. Optional | string      |
| clearOnFilter | Clear the selected entity when the filter changes (default: true)             | boolean     |
| clearOnRemoteSort | Clear the selected entity when the remote sort changes (default: true)             | boolean     |


## State

Generates the following signals

```typescript
entitiesIdsSelectedMap: Record<string | number, boolean>;
```

If collection provided, the following signals are generated, example: **users**

```typescript
usersIdsSelectedMap: Record<string | number, boolean>;
```

## Computed

Generates the following computed signals

```typescript
entitiesSelected: Signal<Entity[]>;
isAllEntitiesSelected: Signal<'all' | 'none' | 'some'>;
```

If collection provided, the following computed signals are generated, example: **users**

```typescript
usersEntitiesSelected: Signal<Entity[]>;
isAllUsersSelected: Signal<'all' | 'none' | 'some'>;
```

## Methods

Generates the following methods

```typescript
selectEntities: ({id:string | number} | {ids: (string | number[])}) => void;
deselectEntities: ({id:string | number} | {ids: (string | number[])}) => void;
toggleSelectEntities: ({id:string | number} | {ids: (string | number[])}) => void;
toggleSelectAllEntities: ({id:string | number} | {ids: (string | number[])}) => void;
```

If collection provided, the following methods are generated, example: **users**

```typescript
selectUsers: ({id:string | number} | {ids: (string | number[])}) => void;
deselectUsers: ({id:string | number} | {ids: (string | number[])}) => void;
toggleSelectUsers: ({id:string | number} | {ids: (string | number[])}) => void;
toggleSelectAllUsers: ({id:string | number} | {ids: (string | number[])}) => void;
```
