---
name: withCallStatus 
order: 1
---

# withCallStatusMap

Generates necessary state, computed and methods for call progress status but map by a key, allowing to implement
calls of the same type that run on parallel each with its own status

**Kind**: global function

## Import

Import the withCallStatus trait from `@ngrx-traits/signals`.

```ts
import { withCallStatusMap } from '@ngrx-traits/signals';
```

## Usage

Use this when you need a special way to call you backend that is not handle by [withEntitiesCall](/docs/traits/withEntitiesCalls)

### Minimal use case
```typescript
const store = signalStore(withCallStatusMap());
```

### Using withCallStatusMap and withMethods to call backend

```typescript
const orderEntity = entityConfig({
  entity: type<OrderSummary & { items?: OrderDetail['items'] }>(),
  collection: 'orders',
});

export const ProductsRemoteStore = signalStore(
  { providedIn: 'root' },
  withEntities(orderEntity),
  withCallStatusMap({ prop: 'loadDetails' }),
  withMethods((store) => ({
    loadProducts: rxMethod<{ orderId: string }>(
      pipe(
        switchMap((params) => {
          store.setLoadDetailsLoading(params.orderId);
          return inject(OrderService)
            .getOrderDetail(params.orderId)
            .pipe(
              tap((res) =>
                patchState(
                  store,
                  updateEntity(
                    {
                      id: params.orderId,
                      changes: { items: res.items },
                    },
                    orderEntity,
                  ),
                ),
              ),
              catchError((error) => {
                store.setLoadDetailsError(params.orderId, error);
                return EMPTY;
              }),
            );
        }),
      ),
    ),
  })),
);
```


## API Reference

This trait receives an object to allow specific configurations:

| Property     | Description                                                                                    | Value                           |
| ------------ | ---------------------------------------------------------------------------------------------- | ------------------------------- |
| prop         | The name of the property for which this represents the call status.                            | string                          |
| initialValue | The initial value of the call status. Record<string | number, CallStatus>                                                         | `init` \| `loading` \| `loaded` |
| errorType    | The type of the error                                                                          | `T`                             |

## State

Generates the following signals, with prop = test

```typescript
testCallStatus: Record<string | number, CallStatus>;
```

## Computed

Generates the following computed signals

```typescript
areAllTestLoaded: Signal<boolean>
isAnyTestLoading: Signal<boolean>
testErrors: Signal<Error[]>
```

## Methods

Generates the following methods

```typescript
  isTestLoading: (id: string) => boolean;
  isTestLoaded: (id: string) => boolean;
  testError: (id: string) => Error | undefined;
  setTestLoaded: (id: string) => void;
  setTestLoading: (id: string) => void;
  setTestError: (id: string, error?: unknown) => void;
```
