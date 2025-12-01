---
name: withEntitiesHybridFilter
order: 4
---

# withEntitiesHybridFilter

Generates necessary state and methods to do remote and local filtering of entities in the store,
the generated filter[Collection]Entities method will filter the entities by calling set[Collection]Loading() if the isRemoteFilter returns true
and if false will call the filterFn to filter the entities locally.

For the remote case you should either create an effect that listens to [Collection]Loading can call the api with the [Collection]Filter params
or use withEntitiesLoadingCall to call the api with the [Collection]Filter params. filter[Collection]Entities
is debounced by default, you can change the debounce by using the debounce option filter[Collection]Entities or changing the defaultDebounce prop in the config.


**Requires** withEntities and withCallStatus to be present before this function.

## Import

Import the withCalls trait from `@ngrx-traits/signals`.

```ts
import { withEntitiesHybridFilter } from '@ngrx-traits/signals';
```

## Examples

### Filtering a list of entities locally based on a search term but remotely based on a category
We have a Products list that shows all the products for a category, there is a category dropdown that should reload the list when the category changes, There is also search box that filters locally the rendered list by name and other props.

```typescript
const entityConfig = entityConfig({
  entity: type<Product>(),
  collection: "product",
});

export const store = signalStore(
  withEntities(entityConfig),
  withCallStatus({ ...entityConfig, initialValue: 'loading' }),
  withEntitiesHybridFilter({
    entity,
    defaultFilter: { search: '', categoryId: 'snes' },
    isRemoteFilter: (previous, current) =>
      previous.categoryId !== current.categoryId,
      // only remote filter when the category changes
    filterFn: (entity, filter) =>
      !filter?.search ||
      entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
  }),
  withEntitiesLoadingCall({
    ...entityConfig,
    fetchEntities: ({ productEntitiesFilter }) => {
      return inject(ProductService).getProducts({
        categoryId: productEntitiesFilter().categoryId,
      });
    },
  }),
);
```

We can use it in our template like 
  
  ```html
  <mat-select #category placeholder="Category" (change)="store.filterProductEntities({ filter:{ categoryId: $event.target.value }, partial: true})">
      <mat-option value="snes">SNES</mat-option>
      <mat-option value="nes">NES</mat-option>
  </mat-select>
  <input #searchControl type="text" placeholder="Search" (input)="store.filterProductEntities({ filter:{ search: $event.target.value }, partial: true})">

... render list of products
```
### Using filter method
Once you have your store defined you can use the generated filter[Collection]Entities method, ui for the filter is generally some sort of form with one or more field or controls of different kind, you should make your filter object represent those controls, after that, the filter is either connected to a button like 'Apply' , that on press will submit the entire form. In this case be sure to set the debounce to 0, so that the filter is applied immediately.
```html
<form (submit)="store.filterProductEntities({ filter:{ search: searchControl.value, role: roleControl.value }})">
    <mat-select #roleControl placeholder="Role" (change)="store.filterProductEntities({ filter:{ role: $event.target.value }, debounce:0})">
        <mat-option value="admin">Admin</mat-option>
        <mat-option value="user">User</mat-option>
    </mat-select>
    <input #searchControl type="text" placeholder="Search">
    <button type="submit">Apply</button>
</form>
```
The second way is where there is no submit button, and the filter is connected to the controls, on any change in the controls the filter is updated, you can use the partial prop on the filter method to update only part of the filter object. `filterEntities` is debounced by default, so you can use it directly on a text field if you wish.
```html
<input
    type="text"
    placeholder="Search"
    (input)="store.filterProductEntities({ filter:{ search: $event.target.value }, patch: true })"
```

### Mixing with other local store features
You can mix this feature with other local store features like withEntitiesLocalSort, withEntitiesLocalPagination, etc., of the remote ones don't mix it with  withEntitiesRemotePagination or withEntitiesRemoteScrollPagination, because then the local filter will not have the full list to filter from.


```typescript
const productsEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'product',
});
export const ProductsLocalStore = signalStore(
  { providedIn: 'root' },
  withEntities(productsEntityConfig),
  withCallStatus({ ...productsEntityConfig, initialValue: 'loading' }),
  withEntitiesLocalPagination({
    ...productsEntityConfig,
    pageSize: 5,
  }),
  withEntitiesHybridFilter({
    entity,
    defaultFilter: { search: '', categoryId: 'snes' },
    isRemoteFilter: (previous, current) =>
      previous.categoryId !== current.categoryId,
    // only remote filter when the category changes
    filterFn: (entity, filter) =>
      !filter?.search ||
      entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
  }),
  withEntitiesLocalSort({
    ...productsEntityConfig,
    defaultSort: { field: 'name', direction: 'asc' },
  }),
  withEntitiesLoadingCall({
    ...entityConfig,
    fetchEntities: ({ productEntitiesFilter }) => {
      return inject(ProductService).getProducts({
        categoryId: productEntitiesFilter().categoryId,
      });
    },
  }),
);
```
To know more how it mixes and works with other local store features, check [Working with Entities](/docs/getting-started/working-with-entities) section.

## API Reference
| Property        | Description                                                      | Value                                        |
| --------------- | ---------------------------------------------------------------- | -------------------------------------------- |
| entity          | The entity type                                                  | `type<T>()`                                  |
| collection      | The name of the collection. Optional                             | string                                       |
| defaultFilter   | The initial filter. Type is inferred based on this initial value. | `FilterType`                                 |
| defaultDebounce | Debounce time for each call to the filter                        | `(entity: T, filter: FilterType )=> boolean` |
| filterFn        | Callback to filter entities                                      | `(entity: T, filter: FilterType )=> boolean` |
| isRemoteFilter  | Callback to determine if the filter should be applied remotely   | `(previous: FilterType, current: FilterType )=> boolean` |

## State

Generates the following signals

```typescript
filter: Signal<FilterType>;
```

If collection provided, the following signals are generated, example: **users**

```typescript
usersFilter: Signal<FilterType>;
```

## Computed

Generates the following computed signals

```typescript
isFilterChanged: Signal<boolean>;
```

If collection provided, the following computed signals are generated, example: **user**

```typescript
isUserFilterChanged: Signal<boolean>;
```

## Methods

Generates the following methods

```typescript
filterEntities: ({filter: FilterType, debounce?:number, patch?:boolean, forceLoad:boolean }) => void;
resetFilter:() => void;
```

**debounce**: overrides default debounce.

**patch**: filter will be patched, otherwise complete `FilterType` should be passed.

If collection provided, the following methods are generated, example: **users**

```typescript
filterUserEntities: ({filter: FilterType, debounce?:number, patch?:boolean, forceLoad:boolean }) => void;
resetUserEntitiesFilter:() => void;
```
