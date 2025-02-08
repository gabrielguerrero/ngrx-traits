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

```typescript

const entity = entityConfig({
    entity: type<T>()
    collection: 'users'
})

const store = signalStore(
    withEntities(entity),
    withEntitiesMultiSelection(entity)

);
```

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
