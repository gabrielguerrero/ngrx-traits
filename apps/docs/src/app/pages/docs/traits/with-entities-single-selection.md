---
name: withEntitiesSingleSelection 
order: 9
---

Generates necessary state, computed and methods for single selection of entities.

Requires withEntities to be present in the store.

**Kind**: global function

## Import

Import the withEntitiesSingleSelection trait from `@ngrx-traits/signals`.

```ts
import { withEntitiesSingleSelection } from '@ngrx-traits/signals';
```

## Examples
### Adding single selection to a list

```typescript

const entity = entityConfig({
    entity: type<Product>(),
    collection: "products"
})

const store = signalStore(
    withEntities(entity),
    withEntitiesSingleSelection(entity)
);
```
To use it in your template:
```html
<mat-list>
  @for (product of store.productsEntities(); track product.id) {
    <mat-list-item
      [class.selected]="store.productsEntitySelected() === product"
      (click)="store.selectProductsEntity(product)"
    ><span matListItemTitle
    >#{{ product.id }} {{ product.name }}</span
    >
      <span matListItemLine> {{ product.price | currency }}</span>
    </mat-list-item>
  }
</mat-list>
```

### Mixing with other local store features
You can mix this feature with other local or remote features like withEntitiesLocalSort, withEntitiesLocalPagination, etc.

```typescript
const productsEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'products',
});
export const ProductsLocalStore = signalStore(
  { providedIn: 'root' },
  withEntities(productsEntityConfig),
  withEntitiesSingleSelection(productsEntityConfig),
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
entityIdSelected: Signal<string | number | undefined>;
```

If collection provided, the following signals are generated, example: **users**

```typescript
usersIdSelected: Signal<string | number | undefined>;
```

## Computed

Generates the following computed signals

```typescript
entitySelected: Signal<Entity | undefined>;
```

If collection provided, the following computed signals are generated, example: **users**

```typescript
usersEntitySelected: Signal<Entity | undefined>;
```

## Methods

Generates the following methods

```typescript
selectEntity: ({id:string | number}) => void;
deselectEntity: ({id:string | number}) => void;
toggleEntity: ({id:string | number}) => void;
```

If collection provided, the following methods are generated, example: **users**

```typescript
selectUserEntity: ({id:string | number}) => void;
deselectUserEntity: ({id:string | number}) => void;
toggleUserEntity: ({id:string | number}) => void;
```
