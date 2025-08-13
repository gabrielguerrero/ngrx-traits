---
name: withLogger 
order: 14
---

# withLogger

Log the state signals and computed signals of the store on every change, with the option to provide a filter function to log only the necessary signals.

## Import

Import the withLogger trait from `@ngrx-traits/signals`.

```ts
import { withLogger } from '@ngrx-traits/signals';
```

## Examples

### Log all signals and computed signals in the store when they change:

```typescript
const store = signalStore(
  withState({ foo: 'foo' }),
  withEntities({entity: type<Product>()}),
  withLogger({name: "MyStore"}),
);
```

### Log some signals and computed signals in the store when they change:

```typescript
const store = signalStore(
  withState({ foo: 'foo' }),
  withEntities({entity: type<Product>()}),
  withLogger({
    name: 'orderItemsStore',
    // you can use a function to filter the state that is logged
    // filter: ({ entityMap, ids }) => ({
    //   entityMap,
    //   ids,
    // }),
    // or you can use an array of keys of props names that should be logged
    filter: ['idsSelected'],
  }),
);
```

## API Reference

| Property     | Description                                                                                                                   | Value                                 |
|--------------|-------------------------------------------------------------------------------------------------------------------------------|---------------------------------------|
| name         | Name to log in the console                                                                                                    | `type<T>()`                           |
| filter       | Optional either a function to filter the state that is logged or an array of props names of the state that should be included | `(store)=> filteredStore` \| string[] |
