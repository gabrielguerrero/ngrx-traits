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
    // optionally, filter the state before saving to the storage
    filterState: ({ orderItemsEntityMap, orderItemsIds }) => ({
      orderItemsEntityMap,
      orderItemsIds,
    }),
  }),
);
```
## API Reference

This trait receives and object to allow specific configurations:

| Property    | Description                                                                | Value                                                                       |
|-------------|----------------------------------------------------------------------------|-----------------------------------------------------------------------------|
| key         | Key to use when storing in session or local storage                        | string                                                                      |
| type        | Type or storage to use                                                     | 'session'                                                                   | 'local'                                                                  |
| restoreOnInit | Auto restore the state from the storage when the store is initialized      | boolean. Default: true                                                      |
| saveStateChangesAfterMs     | Miliseconds after which the state is saved to storage when is changed      | number. Default: 300                                                        |
| filterState   | Optional function to filter the state signals that will be sync to storage | ({state1}) => ({state1})                                                    |

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
