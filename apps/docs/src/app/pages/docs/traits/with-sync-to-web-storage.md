---
name: withSyncToWebStorage 
order: 15
---

Sync the state of the store to the web storage

**Kind**: global function

## Import

Import the withCalls trait from `@ngrx-traits/signals`.

```ts
import { withSyncToWebStorage } from '@ngrx-traits/signals';
```

## Examples
### Sync store to either session or local web storage

```typescript
const store = signalStore(
  // following are not required, just an example it can have anything
  withEntities({ entity, collection }),
  withCallStatus({ prop: collection, initialValue: 'loading' }),
// Sync the store to session storage
  withSyncToWebStorage({
    key: 'my-key',
    type: 'session',
    // type: 'local', // to use local storage
    
  }),
);
```

### Sync part of the store to session or local web storage

```typescript
const store = signalStore(
  // following are not required, just an example it can have anything
  withEntities({ entity, collection }),
  withCallStatus({ prop: collection, initialValue: 'loading' }),

  withSyncToWebStorage({
    key: 'my-key',
    type: 'session',
    expires: 5000,
    // filter the state before saving to the storage
    filterState: ({ orderItemsEntityMap, orderItemsIds }) => ({
      orderItemsEntityMap,
      orderItemsIds,
    }),
  }),
);
```

### Only restore data from web storage if it's not older than 12 hours
```typescript
const store = signalStore(
  // following are not required, just an example it can have anything
  withEntities({ entity, collection }),
  withCallStatus({ prop: collection, initialValue: 'loading' }),

  withSyncToWebStorage({
    key: 'my-key',
    type: 'session',
    restoreOnInit: true,
    saveStateChangesAfterMs: 300,
    expires: 1000 * 60 * 60 * 12, // 12 hours
  }),
);
```

### Splitting the state in multiple store keys
You can add withSyncToWebStorage multiple times with different keys, this can be useful if you are creating your own store features and each has a withSyncToWebStorage, or you need to split the state in two keys.

```typescript
import { signalStoreFeature } from '@ngrx/signals';

// two custom store features, each with its own withSyncToWebStorage and key
function withProductsList() {
  const productsEntityConfig = entityConfig({
    entity: type<Product>(),
    collection: 'products',
  });
  return signalStoreFeature(
    // following are not required, just an example it can have anything
    withEntities(productsEntityConfig),
    withCallStatus(productsEntityConfig),
    withSyncToWebStorage({
      key: 'my-products',
      type: 'session',
      restoreOnInit: true,
      saveStateChangesAfterMs: 300,
      expires: 1000 * 60 * 60 * 12, // 12 hours
    }),
  );
}
function withOrderList() {
  const ordersEntityConfig = entityConfig({
    entity: type<Order>(),
    collection: 'orders',
  });
  return signalStoreFeature(
    // following are not required, just an example it can have anything
    withEntities(ordersEntityConfig),
    withCallStatus(ordersEntityConfig),
    withSyncToWebStorage({
      key: 'my-orders',
      type: 'session',
      restoreOnInit: true,
      saveStateChangesAfterMs: 300,
      expires: 1000 * 60 * 60 * 12, // 12 hours
    }),
  );
}
const store = signalStore(
  // using then will store each slice of state in its 
  // own store key
  withProductsList(),
  withOrderList()
  );
```
## API Reference

This trait receives and object to allow specific configurations:

| Property                | Description                                                                | Value                    |
|-------------------------|----------------------------------------------------------------------------|--------------------------|
| key                     | Key to use when storing in session or local storage                        | string                   |
| type                    | Type or storage to use                                                     | 'session'                | 'local'                                                                  |
| restoreOnInit           | Auto restore the state from the storage when the store is initialized      | boolean. Default: true   |
| saveStateChangesAfterMs | Milliseconds after which the state is saved to storage when it changes     | number. Default: 300     |
| filterState             | Optional function to filter the state signals that will be sync to storage | ({state1}) => ({state1}) |
| expires                 | If the data is older than the time in milliseconds it wont be restored     | number                   |

## State
No extra state generated
## Computed
No extra computed  generated

## Methods
```typescript
saveToStorage: () => void;
loadFromStorage: () => void;
clearFromStore: () => void;
```
