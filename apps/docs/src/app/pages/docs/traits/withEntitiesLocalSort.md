---
name: withEntitiesLocalSort 
order: 11
---

Generates necessary state, computed and methods for sorting locally entities in the store.

Requires withEntities to be present in the store.

**Kind**: global function

## Import

Import the withEntitiesLocalSort trait from `@ngrx-traits/signals`.

```ts
import { withEntitiesLocalSort } from '@ngrx-traits/signals';
```

```typescript
const entity = entityConfig({
  entity: type<T>(),
});

const store = signalStore(
  withEntitiesLocalSort({
    ...entity,
    defaultSort: { field: 'name', direction: 'asc' },
  }),
);
```

## Examples

```typescript
const entity = entityConfig({
  entity: type<T>(),
});

const store = signalStore(
  withEntities(entity),
  withEntitiesLocalSort({
    ...entity
    defaultSort: { field: 'name', direction: 'asc' },
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
    withEntities(entity);
    withEntitiesLocalSort({
        ...entity,
        defaultSort: {field: 'name', direction: 'asc'}
    })
);
```

## API Reference

This trait receives an object or factory to allow specific configurations:

| Property    | Description                          | Value                                                  |
| ----------- | ------------------------------------ | ------------------------------------------------------ |
| entity      | The entity type                      | `type<T>()`                                            |
| collection  | The name of the collection. Optional | string                                                 |
| defaultSort | The initial sort config.             | `{ field: string; direction: 'asc' \| 'desc' \| ''  }` |

## State

Generates the following signals

```typescript
entitiesSort: Signal<{ field: string; pageSize: direction: 'asc' | 'desc' | '' }>;
```

If collection provided, the following signals are generated, example: **users**

```typescript
usersSort: Signal<{ field: string; pageSize: direction: 'asc' | 'desc' | '' }>;
```

## Methods

Generates the following methods

```typescript
sortEntities: ({sort: { field: string; pageSize: direction: 'asc' | 'desc' | ''}}) => void;
```

If collection provided, the following methods are generated, example: **users**

```typescript
sortUsers: ({sort: { field: string; pageSize: direction: 'asc' | 'desc' | ''}}) => void;
```
