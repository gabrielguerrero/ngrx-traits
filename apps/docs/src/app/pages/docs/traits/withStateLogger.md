---
name: withStateLogger 
order: 14
---

Log the state of the store on every change

## Import

Import the withStateLogger trait from `@ngrx-traits/signals`.

```ts
import { withStateLogger } from '@ngrx-traits/signals';
```

## Examples

```typescript
withStateLogger(),
```

With name and filter function:

```typescript
withStateLogger({
    name: 'loggedStore',
    filterState: ({isLoading})=> ({isLoading})
}),
```

## API Reference

This trait receives an object or factory to allow specific configurations:
| Property | Description | Value |
| ----------- | ------------------------------------ | ------------------------------------------------------ |
| name | Optional store name to log | string |
| filterState | Optional function to filter the state that is logged| `(store)=> filteredStore` |
