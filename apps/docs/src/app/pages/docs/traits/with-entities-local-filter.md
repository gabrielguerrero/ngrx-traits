---
name: withEntitiesLocalFilter 
order: 3
---

Generates necessary state, computed and methods for locally filtering entities in the store, the generated filter[collenction]Entities method will filter the entities based on the filter function and is debounced by default.

Requires withEntities to be used.

**Kind**: global function

## Import

Import the withEntitiesLocalFilter trait from `@ngrx-traits/signals`.

```ts
import { withEntitiesLocalFilter } from '@ngrx-traits/signals';
```

## Examples
### Filtering a list of entities based on a search term
In this example we have a list of users and we want to filter them based on a search term, we will use the defaultFilter prop to set the initial filter, and the filterFn to filter the entities based on the search term.

```typescript
const entity = entityConfig({
    entity: type<T>(),
    collection: 'users'
})

const store = signalStore(
    withEntities(entity),
    withEntitiesLocalFilter({
        ...entity,
         defaultFilter: { search: '' },
        filterFn: (entity, filter) =>
            !filter.search || // if there is no search term return all entities
            entity.name.toLowerCase().includes(filter.search.toLowerCase()),
    })
);
```
### Using filter method
Once you have your store defined you can use the generated filter[Collection]Entities method, ui for the filter is generally some sort of form with one or more field or controls of different kind, you should make your filter object represent those controls, after that, the filter is either connected to a button like 'Apply' , that on press will submit the entire form. In this case be sure to set the debounce to 0, so that the filter is applied immediately. 
```html
<form (submit)="store.filterUsersEmtities({ filter:{ search: searchControl.value, role: role.value }})">
    <mat-select #role placeholder="Role" (change)="store.filterUsersEmtities({ filter:{ role: $event.target.value }, debounce:0})">
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
    (input)="store.filterUsersEmtities({ filter:{ search: $event.target.value }, patch: true })"
```
If you manually changed the entities and want to reapply the filter you can call the filter entities method without any param to reapply the last filter

### Mixing with other local store features
You can mix this feature with other local store features like withEntitiesLocalSort, withEntitiesLocalPagination, etc. 

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


| Property        | Description                                                       | Value                                        |
| --------------- | ----------------------------------------------------------------- | -------------------------------------------- |
| entity          | The entity type                                                   | `type<T>()`                                  |
| collection      | The name of the collection. Optional                              | string                                       |
| defaultFilter   | The initial filter. Type is inferred based on this initial value. | `FilterType`                                 |
| filterFn        | Callback to filter entitiyes                                      | `(entity: T, filter: FilterType )=> boolean` |
| defaultDebounce | Debounce time for each call to the filter                         | `(entity: T, filter: FilterType )=> boolean` |

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

If collection provided, the following computed signals are generated, example: **users**

```typescript
isUsersFilterChanged: Signal<boolean>;
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
filterUsers: ({filter: FilterType, debounce?:number, patch?:boolean, forceLoad:boolean }) => void;
resetUsersFilter:() => void;
```
