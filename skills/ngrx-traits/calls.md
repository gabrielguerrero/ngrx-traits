# Calls: withCalls, withEntitiesCalls

## withCalls

Wraps any async call with its own status, result and error. Does not need `withCallStatus`.

**Default `mapPipe` is `exhaustMap`**: while a call is in flight, new params are ignored. Use
`mapPipe: 'switchMap'` when the latest call should win (and for any observable that does not complete).

```typescript
import { withCalls, callConfig } from '@ngrx-traits/signals';

signalStore(
  withCalls((store, service = inject(ProductService)) => ({
    // shorthand: result stored as loadProductDetailResult()
    loadProductDetail: ({ id }: { id: string }) => service.getProductDetail(id),

    // full form
    loadProductDetail2: callConfig({
      call: ({ id }: { id: string }) => service.getProductDetail(id),
      resultProp: 'productDetail',
      mapPipe: 'switchMap',
      mapError: (error) => (error as HttpErrorResponse).error.message,
      onSuccess: (result, param) => {},
      onError: (error, param) => {},
      skipWhen: ({ id }) => !!store.productDetailCache()[id],
      callWith: store.productEntitySelected,
      defaultResult: undefined,
      storeResult: true,
    }),
  })),
);
```

A call takes zero or one parameter — use an object when it needs several.

| Option | Description | Default |
|---|---|---|
| `call` | `(param) => Observable<T> \| Promise<T>` | required |
| `resultProp` | Name of the result signal | `<callName>Result` |
| `storeResult` | Store the result; `false` removes the result signal, keeps status and `onSuccess` | `true` |
| `mapPipe` | `'exhaustMap'` \| `'switchMap'` \| `'concatMap'` | `exhaustMap` |
| `onSuccess` | `(result, param) => void` | — |
| `mapError` | `(error) => ErrorType` — also types `error()` | — |
| `onError` | `(error, param) => void` | — |
| `skipWhen` | `(param) => boolean \| Promise<boolean> \| Observable<boolean>` | — |
| `callWith` | Value, signal, observable or fn — runs the call reactively; `undefined` skips it | — |
| `defaultResult` | Initial value of the result signal | — |

Generated for `loadProductDetail` with `resultProp: 'productDetail'`:

```typescript
productDetail: Signal<T>;
isLoadProductDetailLoading: Signal<boolean>;
isLoadProductDetailLoaded: Signal<boolean>;
loadProductDetailError: Signal<ErrorType | undefined>;
loadProductDetail(param): Promise<{ value: Signal<T>; ok: true } | { error: Signal<ErrorType>; ok: false }>;
loadProductDetail(param: Signal<P> | Observable<P>): RxMethodRef;
productDetailResource(options?): CallResource<T, ErrorType>; // named after resultProp
```

### Awaiting a call

Calling the method with a plain value returns a promise resolving to `{ ok: true, value }` or `{ ok: false, error }`
(both signals). Use it for snackbars, form submission and navigation.

```typescript
const result = await this.store.registerUser({ name, email, password });
if (!result.ok) this.snackBar.open(result.error() as string, 'Close');
```

With Signal Forms, return a server error from `submit`:

```typescript
onSubmit() {
  submit(this.registerForm, async () => {
    const result = await this.store.registerUser(this.model());
    if (!result.ok) {
      return { kind: 'server', fieldTree: this.registerForm.email, message: result.error() as string } satisfies TreeValidationResult;
    }
    return undefined;
  });
}
```

### callWith — running a call reactively

```typescript
withEntitiesSingleSelection(productEntityConfig),
withCalls(({ productEntitySelected }) => ({
  loadProductDetail: callConfig({
    call: ({ id }: { id: string }) => inject(ProductService).getProductDetail(id),
    resultProp: 'productDetail',
    callWith: productEntitySelected, // Signal<Product | undefined>; undefined skips the call
    // or a fn when the shapes differ:
    // callWith: () => productEntitySelected() ? { id: productEntitySelected()!.id } : undefined,
  }),
}));
```

- `callWith: { id: '1' }` runs once on init with that param; `callWith: true` runs a no-param call on init.
- Chain calls with a second `withCalls`, so it can read the first one's result:

```typescript
withCalls(() => ({
  loadOrderDetail: callConfig({ call: ({ orderId }: { orderId: string }) => /* ... */, resultProp: 'orderDetail' }),
})),
withCalls(({ orderDetail }) => ({
  loadOrderUser: callConfig({
    call: ({ userId }: { userId: string }) => inject(UserService).getUserDetail(userId),
    callWith: () => (orderDetail() ? { userId: orderDetail()!.userId } : undefined),
    resultProp: 'userDetails',
  }),
})),
```

### Storing the result yourself

```typescript
withCalls((store) => ({
  loadProducts: callConfig({
    call: () => inject(ProductService).getProducts(),
    storeResult: false, // no result signal; status and error still generated
    onSuccess: (res) => patchState(store, setAllEntities(res.resultList, productEntityConfig)),
  }),
}));
```

### Resource view of a call

Every call that stores a result also generates `<resultProp>Resource()` (or `<callName>Resource()`):
a read-only Angular `Resource`-shaped view over the same store signals.

```typescript
// component
detail = this.store.productDetailResource();
// value(), status(), error(), isLoading(), snapshot(), hasValue(), destroy()
```

`params` drives the call from the component — a signal, fn or observable of the call parameter, where
`undefined` skips it. It needs an injection context (field initializer or constructor) or an `injector` option.

```typescript
productId = input.required<string>();
detail = this.store.productDetailResource({ params: () => ({ id: this.productId() }) });
```

`status()` is `'reloading'` once a value exists, and `value()` keeps the last result on error.
There is no `reload()` or write access: call the generated method, or patch the store.
Naming a call `_loadProductDetail` while keeping a public `resultProp` exposes only the result and the
resource to components.

## withEntitiesCalls

Per-entity calls running in parallel, each with its own status keyed by entity id. The result is merged
into the entity. Use it for expandable rows, per-row actions and per-row mutations.

```typescript
import { withEntitiesCalls, entityCallConfig } from '@ngrx-traits/signals';

withEntitiesCalls(orderEntityConfig, (store, service = inject(OrderService)) => ({
  // param can be an id, an entity, or an object holding one
  loadOrderDetail: (entity: OrderSummary) =>
    service.getOrderDetail(entity.id).pipe(map(({ items }) => ({ items }))), // Partial<Entity> merges
  deleteOrder: (id: string) => service.deleteOrder(id).pipe(map(() => undefined)), // undefined removes the entity

  // any other param shape needs paramsSelectId
  changeOrderStatus: entityCallConfig({
    call: (option: { entity: OrderSummary; status: string }) =>
      service.changeStatus(option.entity.id, option.status),
    paramsSelectId: (param) => param.entity.id,
  }),

  // handle the result yourself
  loadDetails: entityCallConfig({
    call: (id: string) => service.getOrderDetail(id),
    storeResult: false,
    onSuccess: (store, result, param) =>
      patchState(store, updateEntity({ id: param, changes: { items: result.items } }, orderEntityConfig)),
  }),
}));
```

Options: `call`, `paramsSelectId`, `storeResult`, `onSuccess`, `onError`, `mapError`, `skipWhen`.

Generated for `loadOrderDetail`:

```typescript
loadOrderDetailCallStatus: Record<string | number, CallStatus>;
areAllLoadOrderDetailLoaded: Signal<boolean>;
isAnyLoadOrderDetailLoading: Signal<boolean>;
loadOrderDetailErrors: Signal<Error[]>;
loadOrderDetail(entityOrIdOrParam): Promise<{ value: Signal<Entity>; ok: true } | { error: Signal<ErrorType>; ok: false }>;
isLoadOrderDetailLoading(entityOrId): boolean;
isLoadOrderDetailLoaded(entityOrId): boolean;
loadOrderDetailError(entityOrId): Error | undefined;
setLoadOrderDetailLoading(id) / setLoadOrderDetailLoaded(id) / setLoadOrderDetailError(id, error?);
```

```html
<mat-select
  [value]="order.status"
  [disabled]="store.isChangeOrderStatusLoading(order)"
  (valueChange)="store.changeOrderStatus({ entity: order, status: $event })"
>
  @for (opt of statusOptions; track opt.id) {
    <mat-option [value]="opt.id">{{ opt.label }}</mat-option>
  }
</mat-select>
```

Creating entities is not supported (no id yet to key the status by) — use `withCalls` for that.
For statuses not tied to an entity, use [`withCallStatusMap`](entities-loading.md).
