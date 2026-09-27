---
name: withEntitiesSingleSelection 
order: 9
---

# withEntitiesSingleSelection

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
    collection: "product"
})

const store = signalStore(
    withEntities(entity),
    withEntitiesSingleSelection(entity)
);
```
To use it in your template:
```html
<mat-list>
  @for (product of store.productEntities(); track product.id) {
    <mat-list-item
      [class.selected]="store.productEntitySelected() === product"
      (click)="store.selectProductEntity(product)"
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
  collection: 'product',
});
export const ProductsLocalStore = signalStore(
  { providedIn: 'root' },
  withEntities(productsEntityConfig),
  withEntitiesSingleSelection(productsEntityConfig),
  withCallStatus(productsEntityConfig, { initialValue: 'loading' }),
  withEntitiesLocalPagination(productsEntityConfig, {
    pageSize: 5,
  }),
  withEntitiesLocalFilter(productsEntityConfig, {
    defaultFilter: { search: '' },
    filterFn: (entity, filter) =>
      !filter?.search ||
      entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
  }),
  withEntitiesLocalSort(productsEntityConfig, {
    defaultSort: { field: 'name', direction: 'asc' },
  }),
  withEntitiesLoadingCall(productsEntityConfig, {
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

`Id` is the return type of the config's `selectId`, or else the type of the entity's `id` prop, or `string | number` when the entity has no `id` prop.

Note the ngrx `entityConfig` widens `selectId` to `string | number`, so with it `Id` is `string | number`; an inline `selectId` keeps its return type.

Generates the following signals

```typescript
idSelected: Signal<Id | undefined>;
```

If collection provided, the following signals are generated, example: **users**

```typescript
usersIdSelected: Signal<Id | undefined>;
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
selectEntity: ({id: Id} | undefined) => void;
deselectEntity: () => void;
toggleSelectEntity: ({id: Id} | undefined) => void;
```

If collection provided, the following methods are generated, example: **users**

```typescript
selectUsersEntity: ({id: Id} | undefined) => void;
deselectUsersEntity: () => void;
toggleSelectUsersEntity: ({id: Id} | undefined) => void;
```
