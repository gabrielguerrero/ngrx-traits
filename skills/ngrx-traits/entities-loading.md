# Entities & loading: withEntities, withCallStatus, withEntitiesLoadingCall, withAllCallStatus, withCallStatusMap

## withEntities (from @ngrx/signals/entities)

Foundation of every entity store, always first.

```typescript
import { type } from '@ngrx/signals';
import { entityConfig, withEntities } from '@ngrx/signals/entities';

const productEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'product',        // optional
  selectId: (e) => e.productId, // optional, when the id prop is not `id`
});

signalStore(withEntities(productEntityConfig));
// productEntities(), productEntityMap(), productIds()
// without a collection: entities(), entityMap(), ids()
```

Write to it with the `@ngrx/signals/entities` updaters, passing the same config:
`patchState(store, setAllEntities(list, productEntityConfig))`, `addEntity`, `updateEntity`, `removeEntity`.

## withCallStatus

The status every other entity trait talks through. Put it before them.

```typescript
withCallStatus(productEntityConfig, { initialValue: 'loading', errorType: type<string>() });
// isProductEntitiesLoading(), isProductEntitiesLoaded(), productEntitiesError()
// setProductEntitiesLoading(), setProductEntitiesLoaded(), setProductEntitiesError(err)
// state: productCallStatus: 'init' | 'loading' | 'loaded' | { error: unknown }
//        (the one generated name with no `Entities` infix — prefer the setters above over patchState)

withCallStatus({ prop: 'user' });          // non-entity state: isUserLoading(), setUserLoading() ...
withCallStatus({ collection: 'user' });    // same names as the entity form, without an entity type
withCallStatus();                          // isLoading(), setLoading() ...
```

| Option | Description |
|---|---|
| `initialValue` | `'init'` (default), `'loading'` — fetch on store init — or `'loaded'` |
| `collection` / `prop` | Name prefix; `collection` adds the `Entities` infix |
| `errorType` | `type<T>()` to type the error signal |

## withEntitiesLoadingCall

Calls `fetchEntities` whenever the status becomes loading, stores the result (`setAllEntities`, or
`setEntitiesPagedResult` when a remote pagination trait is present), and sets loaded/error.
Requires `withEntities` + `withCallStatus`, and must come **after** the filter/sort/pagination traits it reads.

```typescript
// local: return the entity array
withEntitiesLoadingCall(productEntityConfig, {
  fetchEntities: () => inject(ProductService).getProducts().pipe(map((d) => d.resultList)),
});

// remote: read other traits' signals from the factory, return { entities, total }
withEntitiesLoadingCall(
  productEntityConfig,
  ({ productEntitiesFilter, productEntitiesPagedRequest, productEntitiesSort }, service = inject(ProductService)) => ({
    fetchEntities: async () => {
      const res = await lastValueFrom(
        service.getProducts({
          search: productEntitiesFilter().search,
          skip: productEntitiesPagedRequest().startIndex,
          take: productEntitiesPagedRequest().size,
          sortColumn: productEntitiesSort().field,
          sortAscending: productEntitiesSort().direction === 'asc',
        }),
      );
      return { entities: res.resultList, total: res.total };
    },
  }),
);
```

| Option | Description | Default |
|---|---|---|
| `fetchEntities` | `Observable`/`Promise` of `Entity[]` or `{ entities, total? }` | required |
| `mapPipe` | `'switchMap'` \| `'exhaustMap'` \| `'concatMap'` | `switchMap` |
| `storeResult` | Store the entities automatically; `false` leaves it to `onSuccess` | `true` |
| `onSuccess` | `(result) => void` | — |
| `mapError` | `(error) => Error` | — |
| `onError` | `(error) => void` | — |
| `collection` / `selectId` | Come from the entity config | — |

Reload with `store.setProductEntitiesLoading()` — it refetches with the current filter, sort and page.

### Resource view of the entities

Also generates `[collection]EntitiesResource()` (`entitiesResource()` without a collection): a read-only
Angular `Resource`-shaped view over the same signals. Call it in a field initializer.

```typescript
// component
products = this.store.productEntitiesResource();
// products.value()   -> store.productEntities()
// products.status()  -> 'idle' | 'loading' | 'reloading' | 'resolved' | 'error'
// products.isLoading(), products.error(), products.hasValue(), products.snapshot()
```

`status()` is `'loading'` on the first load and `'reloading'` afterwards, so the list can stay on screen
while the next page or filter loads. There is no `reload()` — call `setProductEntitiesLoading()`.
With a pagination trait, take the rows from `productEntitiesCurrentPage.entities()`, not from `value()`:
the entity collection only holds the cached page window.

## withAllCallStatus

Aggregates the status of every call registered after it, so place it **before** the `withCalls`,
`withCallStatus`, `withEntitiesCalls` and `withCallStatusMap` it should watch.

```typescript
signalStore(
  withAllCallStatus(),
  withCalls(() => ({ loadProducts: () => inject(ProductService).getProducts() })),
);
// isAnyCallLoading(): Signal<boolean>
// callsErrors(): Signal<unknown[]>
```

Typical use — one global error handler feature reused by every store:

```typescript
export function withErrorSnackbar() {
  return signalStoreFeature(
    withAllCallStatus(),
    withHooks((store, snackBar = inject(MatSnackBar)) => ({
      onInit: () => {
        effect(() => {
          if (store.callsErrors().length) snackBar.open('Error', 'Close', { duration: 5000 });
        });
      },
    })),
  );
}
```

## withCallStatusMap

A call status per key, for parallel calls of the same kind when `withEntitiesCalls` does not fit
(the result is not part of an entity, or there is no entity at all).

```typescript
withCallStatusMap({ prop: 'loadDetails' });
// state: loadDetailsCallStatus: Record<string | number, CallStatus>
// computed: areAllLoadDetailsLoaded(), isAnyLoadDetailsLoading(), loadDetailsErrors()
// methods: isLoadDetailsLoading(id), isLoadDetailsLoaded(id), loadDetailsError(id),
//          setLoadDetailsLoading(id), setLoadDetailsLoaded(id), setLoadDetailsError(id, error)
```

```typescript
withMethods((store, service = inject(OrderService)) => ({
  loadOrderDetail: rxMethod<string>(
    pipe(
      mergeMap((orderId) => {
        store.setLoadDetailsLoading(orderId);
        return service.getOrderDetail(orderId).pipe(
          tap((res) => {
            patchState(store, updateEntity({ id: orderId, changes: { items: res.items } }, orderEntityConfig));
            store.setLoadDetailsLoaded(orderId);
          }),
          catchError((error) => {
            store.setLoadDetailsError(orderId, error);
            return EMPTY;
          }),
        );
      }),
    ),
  ),
}));
```

| Option | Description |
|---|---|
| `prop` | Name prefix for the generated map and methods (`collection` is an alias) |
| `initialValue` | Initial status |
| `errorType` | `type<T>()` to type the errors |
