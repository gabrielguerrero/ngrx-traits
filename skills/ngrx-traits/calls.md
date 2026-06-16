# Calls: withCalls, withEntitiesCalls

## withCalls

Generates state, computed, and methods for any async call. Manages its own loading status — does not require `withCallStatus`.

**Warning:** Default `mapPipe` is `exhaustMap`. If your observable does not complete after the first emission, use `switchMap` or add `take(1)` / `first()` to the call.

```typescript
import { withCalls, callConfig } from '@ngrx-traits/signals';

const store = signalStore(
  withCalls((store) => ({
    // simple call — no params
    checkout: () => inject(OrderService).checkout(),

    // call with params — result auto-stored as `loadProductDetailResult()`
    loadProductDetail: ({ id }: { id: string }) =>
      inject(ProductService).getProductDetail(id),

    // full config with callConfig()
    loadProductDetail: callConfig({
      call: ({ id }: { id: string }) => inject(ProductService).getProductDetail(id),
      resultProp: 'productDetail',         // store result as `productDetail()`
      mapPipe: switchMap,                  // override default exhaustMap
      storeResult: true,                   // false = don't auto-store result
      mapError: (error) => (error as HttpErrorResponse).error.message,
      onSuccess: (result, param) => { /* side effects */ },
      onError: (error, param) => { /* side effects */ },
      skipWhen: ({ id }) => !!cachedIds[id],
      callWith: someSignal,                // reactive: call whenever signal changes
      defaultResult: undefined,            // initial value for result signal
    }),
  })),
);
```

**Config options (callConfig):**

| Property | Description | Default |
|---|---|---|
| `call` | `(param) => Observable<T> \| Promise<T>` | required |
| `resultProp` | Signal name for result | `{callName}Result` |
| `storeResult` | Auto-store result | `true` |
| `mapPipe` | RxJS operator | `exhaustMap` |
| `onSuccess` | `(result, param) => void` | — |
| `mapError` | `(error) => ErrorType` | — |
| `onError` | `(error, param) => void` | — |
| `skipWhen` | `(param) => boolean \| Promise<boolean> \| Observable<boolean>` | — |
| `callWith` | `ParamType \| Signal<ParamType \| undefined> \| Observable<ParamType \| undefined> \| () => ParamType \| undefined` | — |
| `defaultResult` | Initial result value | — |

**Generated (call name = `loadProductDetail`):**
```typescript
// State (when storeResult = true)
productDetail: Signal<T>          // named via resultProp

// Computed
isLoadProductDetailLoading: Signal<boolean>
isLoadProductDetailLoaded: Signal<boolean>
loadProductDetailError: Signal<ErrorType>

// Methods — returns Promise when called with direct param
loadProductDetail({ id: string }): Promise<{ value: Signal<T>; ok: true } | { error: Signal<ErrorType>; ok: false }>
// returns RxMethodRef when called with Signal/Observable
loadProductDetail(signal: Signal<{ id: string } | undefined>): RxMethodRef
```

---

### Awaiting call result in component

Direct param calls return a Promise — useful for showing snackbars, resetting forms, etc.:

```typescript
// Store
withCalls(() => ({
  registerUser: callConfig({
    call: (params: { name: string; email: string; password: string }) =>
      inject(UserService).register(params),
    mapError: (error) => (error as HttpErrorResponse).error.message,
  }),
}))

// Component
async onSubmit() {
  const result = await this.store.registerUser({ name, email, password });
  if (result.ok) {
    this.snackBar.open('Registered!', 'Close');
  } else {
    this.snackBar.open(result.error() as string, 'Close', { duration: 5000 });
  }
}
```

---

### callWith — reactive calls

Auto-call whenever a signal emits a non-undefined value:

```typescript
// Auto-load product detail when selection changes
withEntitiesSingleSelection(cfg),
withCalls(({ productEntitySelected }) => ({
  loadProductDetail: callConfig({
    call: ({ id }: { id: string }) => inject(ProductService).getProductDetail(id),
    resultProp: 'productDetail',
    callWith: productEntitySelected, // Signal<Product | undefined> — undefined skips call
  }),
})),
```

**callWith on init** — trigger a call immediately:
```typescript
withCalls(() => ({
  loadProductDetail: callConfig({
    call: ({ id }: { id: string }) => inject(ProductService).getProductDetail(id),
    callWith: { id: '1' }, // calls with this value on init
  }),
  loadProducts: callConfig({
    call: () => inject(ProductService).getProducts(),
    storeResult: false,
    onSuccess: (res) => patchState(store, setAllEntities(res, cfg)),
    callWith: true, // for no-param calls, true triggers on init
  }),
}))
```

**Chaining calls** — chain with two `withCalls` blocks so the second can read results of the first:
```typescript
withCalls(() => ({
  loadOrderDetail: callConfig({
    call: ({ orderId }: { orderId: string }) => inject(OrderService).getOrderDetail(orderId),
    resultProp: 'orderDetail',
  }),
})),
withCalls(({ orderDetail }) => ({
  loadOrderUser: callConfig({
    call: ({ userId }: { userId: string }) => inject(UserService).getUserDetail(userId),
    callWith: () => orderDetail() ? { userId: orderDetail()?.userId } : undefined,
    resultProp: 'userDetails',
  }),
})),
```

**caching with skipWhen:**
```typescript
withState({ detailCache: {} as Record<string, ProductDetail> }),
withCalls(({ detailCache }) => ({
  loadProductDetail: callConfig({
    call: ({ id }: { id: string }) => inject(ProductService).getProductDetail(id),
    storeResult: false,
    skipWhen: ({ id }) => !!detailCache()[id],
    onSuccess: (detail, { id }) => patchState(store, (s) => ({ detailCache: { ...s.detailCache, [id]: detail } })),
  }),
})),
```

---

## withEntitiesCalls

Per-entity parallel calls — each entity id has its own status. Returns `Partial<Entity>` to update, `undefined` to delete.

**Use for:** expandable table rows, per-row status/delete actions, parallel mutations.

```typescript
import { withEntitiesCalls, entityCallConfig } from '@ngrx-traits/signals';

const orderCfg = entityConfig({ entity: type<OrderSummary & { items?: OrderItem[] }>(), collection: 'order' });

withEntitiesCalls({
  ...orderCfg,
  calls: (store, svc = inject(OrderService)) => ({
    // param = entity — return Partial<Entity> to merge, undefined to delete
    loadOrderDetail: (entity: OrderSummary) =>
      svc.getOrderDetail(entity.id).pipe(map(({ items }) => ({ items }))),

    // param = id string/number
    deleteOrder: (id: string) =>
      svc.deleteOrder(id).pipe(map(() => undefined)), // undefined deletes entity

    // param with extra props — use entityCallConfig + paramsSelectId
    changeOrderStatus: entityCallConfig({
      call: (option: { entity: OrderSummary; status: string }) =>
        svc.changeStatus(option.entity.id, option.status),
      paramsSelectId: (param) => param.entity.id,
    }),

    // manual result handling
    loadDetails: entityCallConfig({
      call: (id: string) => svc.getOrderDetail(id),
      storeResult: false,
      onSuccess: (store, result, param) => {
        patchState(store, updateEntity({ id: param, changes: { items: result.items } }, orderCfg));
      },
    }),
  }),
})
```

**Generated (call name = `loadOrderDetail`):**
```typescript
// State
loadOrderDetailCallStatus: Record<string | number, CallStatus>

// Computed
areAllLoadOrderDetailLoaded: Signal<boolean>
isAnyLoadOrderDetailLoading: Signal<boolean>
loadOrderDetailErrors: Signal<Error[]>

// Methods — pass entity, id, or option object
loadOrderDetail(entity: OrderSummary): Promise<...>
isLoadOrderDetailLoading(entity | id): boolean
isLoadOrderDetailLoaded(entity | id): boolean
loadOrderDetailError(entity | id): Error | undefined
setLoadOrderDetailLoaded(id): void
setLoadOrderDetailLoading(id): void
setLoadOrderDetailError(id, error?): void
```

**Template — expandable rows:**
```html
@for (order of store.orderEntities(); track order.id) {
  <tr (click)="store.toggleShowDetail(order)">
    <td>{{ order.id }}</td>
  </tr>
  @if (store.orderIdsSelectedMap()[order.id]) {
    @if (store.isLoadOrderDetailLoaded(order.id)) {
      <tr><td>{{ order.items | json }}</td></tr>
    } @else {
      <tr><td><mat-spinner diameter="20" /></td></tr>
    }
  }
}
```

**Template — per-row status dropdown:**
```html
<mat-select [value]="order.status"
  (valueChange)="store.changeOrderStatus({ entity: order, status: $event })"
  [disabled]="store.isChangeOrderStatusLoading(order)">
  @if (!store.isChangeOrderStatusLoading(order)) {
    @for (opt of statusOptions; track opt.id) {
      <mat-option [value]="opt.id">{{ opt.label }}</mat-option>
    }
  }
</mat-select>
```

**Note:** There is no built-in support for adding new entities (no id yet). Use `withCalls` for create operations.
