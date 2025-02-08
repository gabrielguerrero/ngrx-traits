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

```typescript

const entity = entityConfig({
    entity: type<T>()
    collection: 'users'
})

const store = signalStore(
    withEntities(entity),
    withEntitiesSingleSelection(entity)
);
```

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
