# Entities Loading: withEntities, withCallStatus, withAllCallStatus, withEntitiesLoadingCall, withCallStatusMap

## withEntities (from @ngrx/signals/entities)

Foundation for all entity stores. Always first.

```typescript
import { entityConfig, withEntities } from '@ngrx/signals/entities';
import { type } from '@ngrx/signals';

const cfg = entityConfig({ entity: type<Product>(), collection: 'product' });
// spread cfg into all other traits to share entity/collection config

const store = signalStore(withEntities(cfg));
// generates: productEntities(), productEntityMap(), productIds()
// ngrx/entities methods: setAllEntities, addEntity, updateEntity, removeEntity ...
```

**Without collection** (single entity collection per store):
```typescript
const store = signalStore(withEntities({ entity: type<Product>() }));
// generates: entities(), entityMap(), ids()
```

---

## withCallStatus

Adds loading state. Required before `withEntitiesLoadingCall` and all remote `withEntities*` traits.

```typescript
import { withCallStatus } from '@ngrx-traits/signals';

// with collection (preferred for entity stores)
withCallStatus({ ...cfg, initialValue: 'loading' })
// generates: isProductEntitiesLoading(), isProductEntitiesLoaded(), productEntitiesError()
//            setProductEntitiesLoading(), setProductEntitiesLoaded(), setProductEntitiesError(err)

// with prop (for non-entity stores)
withCallStatus({ prop: 'user' })
// generates: isUserLoading(), isUserLoaded(), userError()

// with error type
withCallStatus({ ...cfg, initialValue: 'loading', errorType: type<string>() })
```

**State signal name**: `productEntitiesCallStatus: 'init' | 'loading' | 'loaded' | { error: unknown }`

`initialValue: 'loading'` causes fetch to run immediately on store init (via `withEntitiesLoadingCall`).

---

## withAllCallStatus

Tracks status of ALL calls in the store. Must come **before** `withCalls`, `withCallStatus`, `withEntitiesCalls` it should monitor.

```typescript
import { withAllCallStatus } from '@ngrx-traits/signals';

const Store = signalStore(
  withAllCallStatus(), // FIRST
  withCalls(() => ({
    loadProducts: () => inject(ProductService).getProducts(),
    loadOrders: () => inject(OrderService).getOrders(),
  })),
);
// store.isAnyCallLoading() — true if any call is in-flight
// store.callsErrors() — array of errors from all calls
```

**Typical use: global error snackbar**

```typescript
export function withErrorSnackbar() {
  return signalStoreFeature(
    withAllCallStatus(),
    withHooks((store, snackBar = inject(MatSnackBar)) => ({
      onInit: () => {
        effect(() => {
          if (store.callsErrors().length > 0) {
            snackBar.open('Error', 'Close', { duration: 5000 });
          }
        });
      },
    })),
  );
}
// Add withErrorSnackbar() before withCalls in your store
```

**Computed signals:**
```typescript
isAnyCallLoading: Signal<boolean>
callsErrors: Signal<(unknown | null)[]>
```

---

## withEntitiesLoadingCall

Wires fetching to `withCallStatus`. Watches `isLoading` signal and calls `fetchEntities` when true. Automatically stores result using `setAllEntities` (local) or `setEntitiesPagedResult` (remote pagination).

**Must come after**: `withEntities`, `withCallStatus`, and any remote filter/sort/pagination traits it reads.

```typescript
import { withEntitiesLoadingCall } from '@ngrx-traits/signals';

// Local (return entity array)
withEntitiesLoadingCall({
  ...cfg,
  fetchEntities: () => inject(ProductService).getProducts().pipe(map(d => d.resultList)),
})

// Remote (return { entities, total } for pagination)
withEntitiesLoadingCall(
  ({ productEntitiesFilter, productEntitiesPagedRequest, productEntitiesSort }) => ({
    ...cfg,
    fetchEntities: async () => {
      const res = await lastValueFrom(inject(ProductService).getProducts({
        search: productEntitiesFilter().search,
        skip: productEntitiesPagedRequest().startIndex,
        take: productEntitiesPagedRequest().size,
        sortColumn: productEntitiesSort().field,
        sortAscending: productEntitiesSort().direction === 'asc',
      }));
      return { entities: res.resultList, total: res.total };
    },
  }),
)
```

**Config options:**

| Property | Description | Default |
|---|---|---|
| `fetchEntities` | Returns `Observable`/`Promise` of `Entity[]` or `{ entities, total? }` | required |
| `collection` | Collection name | — |
| `mapPipe` | RxJS operator | `switchMap` |
| `storeResult` | Auto-store fetched entities | `true` |
| `onSuccess` | Callback after success | — |
| `mapError` | Transform error to typed error | — |

Generates no extra state, computed, or methods.

---

## withCallStatusMap

Tracks call status **per key** (e.g. per entity id) — for parallel calls of the same type.

```typescript
import { withCallStatusMap } from '@ngrx-traits/signals';

const store = signalStore(
  withEntities(orderEntity),
  withCallStatusMap({ prop: 'loadDetails' }),
  withMethods((store) => ({
    loadOrderDetail: rxMethod<{ orderId: string }>(pipe(
      switchMap(({ orderId }) => {
        store.setLoadDetailsLoading(orderId);
        return inject(OrderService).getOrderDetail(orderId).pipe(
          tap(res => patchState(store, updateEntity({ id: orderId, changes: { items: res.items } }, orderEntity))),
          catchError(error => { store.setLoadDetailsError(orderId, error); return EMPTY; }),
        );
      }),
    )),
  })),
);
```

**Generated (prop = `loadDetails`):**
```typescript
// State
loadDetailsCallStatus: Record<string | number, CallStatus>

// Computed
areAllLoadDetailsLoaded: Signal<boolean>
isAnyLoadDetailsLoading: Signal<boolean>
loadDetailsErrors: Signal<Error[]>

// Methods
isLoadDetailsLoading(id: string): boolean
isLoadDetailsLoaded(id: string): boolean
loadDetailsError(id: string): Error | undefined
setLoadDetailsLoaded(id: string): void
setLoadDetailsLoading(id: string): void
setLoadDetailsError(id: string, error?: unknown): void
```

**Config options:**

| Property | Description |
|---|---|
| `prop` | Property name for the status map |
| `initialValue` | Initial status value |
| `errorType` | Error type |
