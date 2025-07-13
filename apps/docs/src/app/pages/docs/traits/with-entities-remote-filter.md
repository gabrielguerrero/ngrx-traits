---
name: withEntitiesRemoteFilter 
order: 4
---

# withEntitiesRemoteFilter

Generates necessary state, computed and methods for remotely filtering entities in the store,
the generated filter[collection]Entities method will filter the entities by calling set[collection]Loading()
and you should either create an effect that listens to [collection]Loading can call the api with the [collection]Filter params
or use withEntitiesLoadingCall to call the api with the [collection]Filter params
and is debounced by default. You can change the debounce by using the debounce option filter[collection]Entities or changing the defaultDebounce prop in the config.

In case you dont want filter[collection]Entities to call set[collection]Loading() (which triggers a fetchEntities), you can pass skipLoadingCall: true to filter[collection]Entities.
Useful in cases where you want to further change the state before manually calling set[collection]Loading() to trigger a fetch of entities.

**Requires** withEntities and withCallStatus to be present before this function.

## Import

Import the withCalls trait from `@ngrx-traits/signals`.

```ts
import { withEntitiesRemoteFilter } from '@ngrx-traits/signals';
```

## Examples

### Filtering a list of entities based on a search term
In this example we have a list of products and we want to filter them based on a search term, we will use the defaultFilter prop to set the initial filter, and the filterFn to filter the entities based on the search term. The generated `filterProductsEntities` will store the filter and  call `setProductsLoading()` which triggers the `fetchEntities` function, notice we access the filter value in the `fetchEntities` function using the `productsFilter()` signal.

```typescript
const entityConfig = entityConfig({
  entity: type<T>(),
  collection,
});

export const store = signalStore(
  withEntities(entityConfig),
  withCallStatus({ ...entityConfig, initialValue: 'loading' }),
  withEntitiesRemoteFilter({
    ...entityConfig,
    defaultFilter: { name: '' },
  }),
  withEntitiesLoadingCall({
    ...entityConfig,
    fetchEntities: ({ productsFilter }) => {
      return inject(ProductService).getProducts({
        search: productsFilter().name,
      });
    },
  }),
);
```

### Using filter method
Once you have your store defined you can use the generated filter[Collection]Entities method, ui for the filter is generally some sort of form with one or more field or controls of different kind, you should make your filter object represent those controls, after that, the filter is either connected to a button like 'Apply' , that on press will submit the entire form. In this case be sure to set the debounce to 0, so that the filter is applied immediately.
```html
<form (submit)="store.filterProductsEntities({ filter:{ search: searchControl.value, role: role.value }})">
    <mat-select #role placeholder="Role" (change)="store.filterProductsEntities({ filter:{ role: $event.target.value }, debounce:0})">
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
    (input)="store.filterProductsEntities({ filter:{ search: $event.target.value }, patch: true })"
```

### Mixing with other remote store features
You can mix this feature with other remote store features like withEntitiesRemoteSort, withEntitiesRemotePagination, etc.


```typescript
const productsStoreFeature = signalStoreFeature(
  withEntities({
    entity: productsEntity,
    collection: productsCollection,
  }),
  withCallStatus({
    initialValue: 'loading',
    collection: productsCollection,
    errorType: type<string>(),
  }),
  withEntitiesRemoteFilter({
    entity: productsEntity,
    collection: productsCollection,
    defaultFilter: { search: '' },
  }),
  withEntitiesRemotePagination({
    entity: productsEntity,
    collection: productsCollection,
    pageSize: 10,
  }),
  withEntitiesRemoteSort({
    entity: productsEntity,
    collection: productsCollection,
    defaultSort: { field: 'name', direction: 'asc' },
  }),
  withEntitiesLoadingCall(
    ({ productsPagedRequest, productsFilter, productsSort }) => ({
      collection: productsCollection,
      fetchEntities: async () => {
        const res = await lastValueFrom(
          inject(ProductService).getProducts({
            search: productsFilter().search,
            skip: productsPagedRequest().startIndex,
            take: productsPagedRequest().size,
            sortAscending: productsSort().direction === 'asc',
            sortColumn: productsSort().field,
          }),
        );
        return { entities: res.resultList, total: res.total };
      },
    }),
  ),
);
```
To know more how it mixes and works with other local store features, check [Working with Entities](/docs/getting-started/working-with-entities) section.

## API Reference
| Property        | Description                                                       | Value                                        |
| --------------- | ----------------------------------------------------------------- | -------------------------------------------- |
| entity          | The entity type                                                   | `type<T>()`                                  |
| collection      | The name of the collection. Optional                              | string                                       |
| defaultFilter   | The initial filter. Type is inferred based on this initial value. | `FilterType`                                 |
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
