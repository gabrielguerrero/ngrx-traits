---
name: withServerStateTransfer
order: 16
---

# withServerStateTransfer

Sync store state using Angular's TransferState API for SSR hydration

**Kind**: global function

**Use Case**: When using Server-Side Rendering (SSR), this custom store feature enables state to be serialized on the server and automatically restored on the client during hydration. This prevents unnecessary API calls and ensures a seamless transition from server-rendered to client-side rendered content.

## Import

Import the withServerStateTransfer custom store feature from `@ngrx-traits/signals`.

```ts
import { withServerStateTransfer } from '@ngrx-traits/signals';
```

## Important: Feature Ordering

**To avoid unnecessary backend calls after state restoration**, ensure you add `withServerStateTransfer` **after** state declarations but **before** any initialization calls that fetch data from the backend. This allows you to check if data is already loaded before making API calls.

```typescript
// ✅ Correct order
signalStore(
  withEntities({ entity }),
  withCallStatus({ prop: 'products', initialValue: 'loading' }),

  // Add withServerStateTransfer BEFORE loading calls
  withServerStateTransfer({ key: 'my-state' }),

  // Loading call comes LAST
  withEntitiesLoadingCall({
    fetchEntities: () => inject(Service).getProducts()
  })
)

// ❌ Incorrect order - will make unnecessary backend call
signalStore(
  withEntities({ entity }),
  withCallStatus({ prop: 'products', initialValue: 'loading' }),

  // Loading call runs first
  withEntitiesLoadingCall({
    fetchEntities: () => inject(Service).getProducts()
  }),

  // State transfer restores too late
  withServerStateTransfer({ key: 'my-state' })
)
```

## Examples

### Basic usage: Transfer entire store state

```typescript
const store = signalStore(
  withEntities({ entity, collection }),
  withCallStatus({ prop: collection, initialValue: 'loading' }),

  withServerStateTransfer({
    key: 'my-state',
  }),
);
```

### Transfer specific state properties using filterState

Use `filterState` when you only want to transfer a subset of your state:

```typescript
const store = signalStore(
  withEntities({ entity, collection }),
  withCallStatus({ prop: collection, initialValue: 'loading' }),

  withServerStateTransfer({
    key: 'products-state',
    // Only transfer entity data, not loading states
    filterState: ({ orderItemsEntityMap, orderItemsIds }) => ({
      orderItemsEntityMap,
      orderItemsIds,
    }),
  }),
);
```

### Using valueMapper for custom transformation

Use `valueMapper` when you need custom serialization/deserialization logic:

```typescript
const store = signalStore(
  withState({
    userProfile: {
      userName: '',
      email: '',
      preferences: { theme: 'light', notifications: true },
      tempData: null,
    }
  }),

  withServerStateTransfer({
    key: 'user-profile',
    // Only transfer userName and email
    valueMapper: (store) => ({
      stateToTransferValue: () => ({
        userName: store.userProfile().userName,
        email: store.userProfile().email,
      }),
      transferValueToState: (savedData) => {
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

### Using onRestore callback

Execute custom logic after state restoration from server:

```typescript
const store = signalStore(
  withEntities({ entity, collection }),
  withCallStatus({ prop: collection }),

  withServerStateTransfer({
    key: 'products-state',
    filterState: ({ productsEntityMap, productsIds }) => ({
      productsEntityMap,
      productsIds,
    }),
    onRestore: (store) => {
      // Custom logic after restoration, e.g., set loaded status
      patchState(store, { productsCallStatus: 'loaded' });
    },
  }),
);
```

### Complex example with multiple features

Real-world example combining entities, filtering, pagination, sorting, and SSR state transfer:

```typescript
const productsEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'product',
});

export const ProductsSSRStore = signalStore(
  { providedIn: 'root' },

  // 1. State declarations first
  withEntities(productsEntityConfig),
  withCallStatus({ ...productsEntityConfig, initialValue: 'loading' }),

  // 2. Feature configurations
  withEntitiesLocalPagination({
    ...productsEntityConfig,
    pageSize: 5,
  }),
  withEntitiesLocalFilter({
    ...productsEntityConfig,
    defaultFilter: { search: '' },
    filterFn: (entity, filter) =>
      !filter?.search ||
      entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
  }),
  withEntitiesLocalSort({
    ...productsEntityConfig,
    defaultSort: { field: 'name', direction: 'asc' },
  }),
  withEntitiesSingleSelection(productsEntityConfig),

  // 3. Sync to URL query params
  withEntitiesSyncToRouteQueryParams(productsEntityConfig),

  // 4. Transfer state from server to client (BEFORE loading call)
  withServerStateTransfer({
    key: 'product-list-ssr',
  }),

  // 5. Loading call LAST - when state comes from server 
  // overrides status to loaded so fetchEntities wont be trigger
  withEntitiesLoadingCall({
    ...productsEntityConfig,
    fetchEntities: () => {
      return inject(ProductService)
        .getProducts()
        .pipe(map((d) => d.resultList));
    },
  }),
);
```

This order ensures:
- On server: Entities are fetched and state is transferred to client
- On client: State is restored from transfer, then `withEntitiesLoadingCall` sees data is already loaded and skips the API call

## How it works

**On the Server:**
- An effect monitors store state changes
- State is serialized and saved to Angular's TransferState
- Serialized state is embedded in the HTML sent to the client

**On the Client:**
- During hydration, state is read from TransferState
- State is restored to the store using `patchState` (or custom mapper)
- `onRestore` callback is executed if provided
- TransferState is cleaned up to free memory

## API Reference

This custom store feature receives an object to allow specific configurations:

| Property      | Description                                                                                          | Value                          |
|---------------|------------------------------------------------------------------------------------------------------|--------------------------------|
| key           | Unique key to store state in TransferState                                                           | string                         |
| filterState   | Filter state before transferring (mutually exclusive with valueMapper)                               | (state) => Partial\<State\>    |
| valueMapper   | Custom transformation between store and transfer value (mutually exclusive with filterState)         | TransferValueMapper<T, Store>   |
| onRestore     | Callback executed after state restoration on client                                                  | (store) => void                |

### TransferValueMapper<T, Store>

The `valueMapper` is a factory function that receives the store and returns an object with two methods:

```typescript
valueMapper: (store: Store) => {
  stateToTransferValue: () => T | undefined | null;
  transferValueToState: (value: T) => void;
}
```

| Property              | Description                                           | Type                           |
|-----------------------|-------------------------------------------------------|--------------------------------|
| stateToTransferValue  | Transform store state to transfer value (server)     | () => T \| undefined \| null   |
| transferValueToState  | Transform transfer value to state (client)           | (value: T) => void             |

**Note:** `valueMapper` and `filterState` are mutually exclusive - use one or the other, not both.

## State

No extra state generated

## Computed

No extra computed generated

## Methods

No extra methods generated
