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

## Usage

```typescript

const entity = entityConfig({
    entity: type<T>()
    collection

})

const store = signalStore(
    withEntitiesLocalFilter({
        ...entity,
         defaultFilter: { search: '' },
        filterFn: (entity, filter) =>
            !filter.search || // if there is no search term return all entities
            entity.name.toLowerCase().includes(filter.search.toLowerCase()),
    })
);
```

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
