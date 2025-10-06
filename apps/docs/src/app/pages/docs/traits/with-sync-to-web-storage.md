---
name: withSyncToWebStorage 
order: 15
---

# withSyncToWebStorage

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

### Using valueMapper for custom transformation
You can use `valueMapper` to provide custom bidirectional transformation between the store state and the storage value. This is useful when you want to store only specific properties or transform the data before saving.

For example, in a form where you only want to persist certain nested fields:

```typescript
const store = signalStore(
  withState({
    userProfile: {
      userName: '',
      email: '',
      preferences: { theme: 'light', notifications: true },
      tempData: null, // This won't be saved
    }
  }),

  withSyncToWebStorage({
    key: 'user-form',
    type: 'local',
    restoreOnInit: true,
    saveStateChangesAfterMs: 500,
    // Only save and restore userName and email from userProfile, not preferences or tempData
    valueMapper: (store) => ({
      stateToStorageValue: () => ({
        userName: store.userProfile().userName,
        email: store.userProfile().email,
      }),
      storageValueToState: (savedData) => {
        patchState(store, {
          userProfile: {
            ...store.userProfile(),
            userName: savedData.userName,
            email: savedData.email,
          }
        });
      },
    }),
  }),
);
```

**Note:** `valueMapper` and `filterState` are mutually exclusive - you can only use one or the other, not both.

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

This trait receives an object to allow specific configurations:

| Property                | Description                                                                                          | Value                                                  |
|-------------------------|------------------------------------------------------------------------------------------------------|--------------------------------------------------------|
| key                     | Key to use when storing in session or local storage                                                  | string                                                 |
| type                    | Type of storage to use                                                                               | 'session' \| 'local'                                   |
| restoreOnInit           | Auto restore the state from the storage when the store is initialized                                | boolean. Default: true                                 |
| saveStateChangesAfterMs | Milliseconds after which the state is saved to storage when it changes                               | number. Default: 500                                   |
| filterState             | Optional function to filter the state signals that will be synced to storage (mutually exclusive with valueMapper) | ({state1}) => ({state1})                               |
| valueMapper             | Optional custom transformation between store state and storage value (mutually exclusive with filterState) | StorageValueMapper<T, Store>                           |
| expires                 | If the data is older than the time in milliseconds it won't be restored                              | number                                                 |
| onRestore               | Optional callback after the state is restored from storage                                           | (store) => void                                        |

### StorageValueMapper<T, Store>

The `valueMapper` is a factory function that receives the store and returns an object with two methods:

```typescript
valueMapper: (store: Store) => {
  stateToStorageValue: () => T | undefined | null;
  storageValueToState: (value: T) => void;
}
```

| Property              | Description                                           | Type                           |
|-----------------------|-------------------------------------------------------|--------------------------------|
| stateToStorageValue   | Function to transform store state to storage value   | () => T \| undefined \| null |
| storageValueToState   | Function to transform storage value back to state    | (value: T) => void        |

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
