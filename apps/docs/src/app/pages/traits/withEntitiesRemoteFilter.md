---
name: withEntitiesRemoteFilter - DONE
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
