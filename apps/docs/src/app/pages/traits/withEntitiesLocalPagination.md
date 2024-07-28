---
name: withEntitiesLocalPagination - DONE
order: 6
---

Generates necessary state, computed and methods for local pagination of entities in the store.

Requires withEntities to be present in the store.

**Kind**: global function

## Import

Import the withEntitiesLocalPagination trait from `@ngrx-traits/signals`.

```ts
import { withEntitiesLocalPagination } from '@ngrx-traits/signals';
```

```typescript

const entity = entityConfig({
    entity: type<T>()
    collection: 'users'
})

const store = signalStore(
    withEntitiesLocalPagination({
        ...entity,
        pageSize: 10,
        currentPage: 0
    })
);
```

## Examples

```typescript
const store = signalStore(
  withEntitiesLocalPagination({
    pageSize: 10,
    currentPage: 0,
  }),
);
```

With named collection:

```typescript
const entity = entityConfig({
    entity: type<T>()
    collection: 'users'
})

const store = signalStore(
    withEntitiesLocalPagination({
        ...entity,
        pageSize: 10,
        currentPage: 0
    })
);
```

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
