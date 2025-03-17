---
name: withEntitiesCalls 
order: 1
---

# withEntitiesCalls

Generates necessary state, computed and methods for call progress
related to an entity,  this allows parallel calls for different entities, the calls
will have a unique id (generally the entity Id) which is use to have a status per id.
The results by default get merged into the entities state.

## Import

Import the withCallStatus trait from `@ngrx-traits/signals`.

```ts
import { withEntitiesCalls } from '@ngrx-traits/signals';
```

## Usage

The primary goal of withEntitiesCalls is to solve a problem that the standard withCalls trait cannot: handling per-entity operations in parallel. For example, imagine a list of orders where clicking an order expands a row to load additional details. You may also want users to expand multiple orders at the same time, or allow actions like deleting or changing the status of each order — all independently and concurrently.

A real-world analogy is a video streaming app like Netflix, where users can start downloading multiple shows in parallel, and the app shows individual progress per show. Each of these operations needs its own isolated status and result handling.

A common workaround is to give each row its own component and store, allowing localized call tracking. However, that approach introduces boilerplate and becomes problematic if the parent component needs insight into the child states — for example, to display a total download progress bar or a count of active operations.

withEntitiesCalls simplifies this by centralizing all entity-related calls within a single store. Each call must include an entity or an ID, which is used to track the call’s progress individually. All state is maintained together, reducing boilerplate and improving clarity. Like other store features, it’s optimized for common use cases. For more complex scenarios, the per-row component/store pattern may still be more appropriate.

	Note: The call function must receive a parameter that includes an entity ID. This ID is essential for tracking the call’s status and can be extracted in several ways:

```typescript
withEntitiesCalls({
  ...orderEntity,
  calls: (store, orderService = inject(OrderService)) => ({
    // with an id as param
    loadOrderDetail: (id: string) => orderService.getOrderDetail(entity.id).pipe(map(({ items }) => ({ items }))),
    // with an entity as param
    loadOrderDetail2: (entity: OrderSummary) => orderService.getOrderDetail(entity.id).pipe(map(({ items }) => ({ items }))),
    // with an entity as param prop and extra props
    loadOrderDetail3: (option: { entity: OrderSummary; extraProp: string }) => orderService.getOrderDetail(option.entity.id).pipe(map(({ items }) => ({ items }))),
    // with a entityCallConfig and paramSelectId
    loadOrderDetail4: entityCallConfig({
      call: (option: { productId: string, extraProp: string }) => orderService.getOrderDetail(id),
      paramsSelectId: (param) => param.productId,
    }),
    // in all the previous calls you must returm a Partial<Entity>  to update the entity or undefined to delete the entity
    // if you want to control how the result is stored you use storeResult false and onSuccess like this
    loadOrderDetail5: entityCallConfig({
      call: (option: { productId: string, extraProp: string }) => orderService.getOrderDetail(id),
      paramsSelectId: (param) => param.productId,
      storeResult: false,
      onSuccess: (store, result, param) => {
        store.updateEntity(param.productId, { items: result.items });
      },
    }),
  }),
}),
```
Each call should return either a Partial<Entity> to update the entity, or undefined to delete it from the store. If you need more control over how the result is handled, you can set storeResult to false and use the onSuccess callback to manually update the entity.

There is currently no built-in support for adding new entities, since new entities typically don’t have an ID yet — and the ID is required to track the call’s status. For those cases, it’s recommended to use the standard withCalls trait instead.

If your use case requires more advanced or fully custom logic, consider using [withCallStatusMap](/docs/traits/with-call-status-map). It gives you full control by exposing call status tracking by key, but you’ll need to manually implement your own withMethod to handle the call lifecycle — including backend interaction, result handling, and status updates.

## Examples

### Table with expandable rows
This case you have a list of entities and when you click on one of the items the row expands 
to show more details. 
In this case you generally have a type that represents the items on the list (OrderSummary in this example)
and a type that represents the details of the item (OrderDetail), and you want to load extra details of the item when the row is expanded.

Notice that the entity type is OrderSummary & { items?: OrderDetail['items'] }, this is because the entity will have the items property
lazy loaded when the details are loaded, and the items property is optional because when the details are loaded the items will be added to the entity.

```typescript
import { macPrefix } from 'iron-webcrypto';

const orderEntity = entityConfig({
  entity: type<OrderSummary & { items?: OrderDetail['items'] }>(),
  collection: 'orders',
});
export const OrderStore = signalStore(
  withEntities(orderEntity),
  // load entities
  withCallStatus({ ...orderEntity, initialValue: 'loading' }),
  withEntitiesLoadingCall({
    ...orderEntity,
    fetchEntities: () =>
      inject(OrderService)
        .getOrders()
        .pipe(map((res) => res.resultList)),
  }),
  withEntitiesMultiSelection(orderEntity), // we use this to track which rows are expanded
  // call to load the order detail
  withEntitiesCalls({
    ...orderEntity,
    calls: (store, orderService = inject(OrderService)) => ({
      // the function must return one or more properties of the entity
      loadOrderDetail: (entity) => orderService.getOrderDetail(entity.id).pipe(map(({items}) => ({ items })))
    }),
  }),
  withMethods((store) => ({
    toggleShowDetail(order: OrderSummary) {
      store.toggleSelectOrdersEntities(order);// this will toggle the row expanded
      // only load the order detail if it is not loaded yet, this can be avoided by using the skipWhen option if using entityCallConfig
      if (!store.isLoadOrderDetailLoaded(order)) {
        store.loadOrderDetail(order);
      }
    },
  })),
);
```
We can now use this store in the template like this:
```html
<mat-list role="list">
  @for (order of store.ordersEntities(); track order.id) {
    <mat-list-item
      (click)="store.toggleShowDetail(order)"
    >
      <div class="flex gap-4">
        <span>Order #{{ order.id }} {{ order.userName }} Total: ${{ order.total }}</span>
      </div>
    </mat-list-item>

    <!-- Expanded Section (Order Details) -->
    @if (store.ordersIdsSelectedMap()[order.id]) {
      @if (store.isLoadOrderDetailLoaded(order.id)) {
        <div class="expanded-content ml-12">
          <mat-list dense>
            @for (item of order.items; track item.id) {
              <mat-list-item>
                <span>{{ item.name }}</span> - ${{ item.price }}
              </mat-list-item>
            }
          </mat-list>
        </div>
      } @else {
        <mat-spinner class="mx-auto my-4" />
      }
    }
  }
</mat-list>
```

### Mutating an entity
In this case you want to do an operation that changes part of the entity, like changing the status of an order.
```typescript
const orderEntity = entityConfig({
  entity: type<OrderSummary & { items?: OrderDetail['items'] }>(),
  collection: 'orders',
});
export const OrderStore = signalStore(
  withEntities(orderEntity),
  // load entities
  withCallStatus({ ...orderEntity, initialValue: 'loading' }),
  withEntitiesLoadingCall({
    ...orderEntity,
    fetchEntities: () =>
      inject(OrderService)
        .getOrders()
        .pipe(map((res) => res.resultList)),
  }),
  // call to change status
  withEntitiesCalls({
    ...orderEntity,
    calls: (store, orderService = inject(OrderService)) => ({
      changeOrderStatus: (option: {
        entity: OrderSummary;
        status: OrderSummary['status'];
      }) => orderService.changeStatus(option.entity.id, option.status),
    }),
  }),
);
```
Now we can use in inside a mat table, for this case we use a dropdown to render the status and allow the user to change it:
```html
   <ng-container matColumnDef="status">
      <th mat-header-cell *matHeaderCellDef>Status</th>
      <td mat-cell *matCellDef="let order">
        <mat-form-field appearance="fill">
          @if (store.isChangeOrderStatusLoading(order)) {
            <mat-progress-spinner
              matPrefix
              diameter="20"
              mode="indeterminate"
            />
          }
          <mat-select
            [value]="order.status"
            (valueChange)="
              store.changeOrderStatus({ entity: order, status: $event })
            "
            [disabled]="store.isChangeOrderStatusLoading(order)"
            [placeholder]="
              store.isChangeOrderStatusLoading(order) ? 'Loading...' : 'Status'
            "
          >
            @if (!store.isChangeOrderStatusLoading(order)) {
              @for (option of orderStatusArray; track option.id) {
                <mat-option [value]="option.id">
                  {{ option.label }}
                </mat-option>
              }
            }
          </mat-select>
        </mat-form-field>
      </td>
    </ng-container>
```

### Deleting an entity
The main difference here is that we return undefined in the call to delete the entity.
```typescript
const orderEntity = entityConfig({
  entity: type<OrderSummary & { items?: OrderDetail['items'] }>(),
  collection: 'orders',
});
export const OrderStore = signalStore(
  withEntities(orderEntity),
  // load entities
  withCallStatus({ ...orderEntity, initialValue: 'loading' }),
  withEntitiesLoadingCall({
    ...orderEntity,
    fetchEntities: () =>
      inject(OrderService)
        .getOrders()
        .pipe(map((res) => res.resultList)),
  }),
  // call to delete the order
  withEntitiesCalls({
    ...orderEntity,
    calls: (store, orderService = inject(OrderService)) => ({
      deleteOrder: (entity: OrderSummary) => orderService.deleteOrder(entity.id).pipe(map(() => undefined)),
    }),
  }),
);
```
Now we can use in inside a mat table, for this case we use a button to delete the order:
```html
<ng-container matColumnDef="delete">
  <th mat-header-cell *matHeaderCellDef>Delete</th>
  <td mat-cell *matCellDef="let order">
    @if (!store.isDeleteOrderLoading(order)) {
      <button mat-icon-button (click)="store.deleteOrder(order)">
        <mat-icon>delete</mat-icon>
      </button>
    } @else {
      <mat-progress-spinner
        diameter="20"
        mode="indeterminate"
      ></mat-progress-spinner>
    }
  </td>
</ng-container>
```

## API Reference

This trait receives and object to allow specific configurations:

| Property       | Description                                              | Value                                                                                                                                                                |
|----------------|----------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| call           | Async callback.                                          | `(param: string \| number \| Entity \| { entity:Entity } & Record<string, any>)=> Observable<Partial<Entity> \| undefined> \| Promise<Partial<Entity> \| undefined>` |
| paramsSelectId | Optional function configure the parameter entity id prop | `(param: Pameter)=> string \| number`                                                                                                                                |
| storeResult    | Whether the result is stored as a signal or not.         | boolean. Default: true                                                                                                                                               |
| onSuccess      | Callback executed after call emits value                 | `()=> void \| (result, param: ParamType)=> void`                                                                                                                     |
| mapError       | Callback to transform and give type to error             | `(error)=> ErrorType`                                                                                                                                                |
| onError        | Callback executed after call emits error                 | `(error: ErrorType, param: ParamType)=> void`                                                                                                                        |
| skipWhen       | Call back to check if the call should be skipped or not  | `(param: ParamType)=> boolean  \| Promise<boolean>  \| Observable<boolean>`                                                                                          |

## State

Generates the following signals for each call defined within the trait

```typescript
const orderEntity = entityConfig({
  entity: type<OrderSummary & { items?: OrderDetail['items'] }>(),
  collection: 'orders',
});
 withEntitiesCalls({
    ...orderEntity,
    calls: (store, orderService = inject(OrderService)) => ({
      // the function must return one or more properties of the entity
      loadOrderDetail: (entity) => orderService.getOrderDetail(entity.id).pipe(map(({items}) => ({ items })))
    }),
  }),
```


```typescript
// When storeResult = true
loadOrderDetailCallStatus: Record<string | number, CallStatus>;
```

## Computed

Generates the following computed signals

```typescript
areAllLoadOrderDetailLoaded: Signal<boolean>
isAnyLoadOrderDetailLoading: Signal<boolean>
loadOrderDetailErrors: Signal<Error[]>
```

## Methods

Generates the following methods

```typescript
  isLoadOrderDetailLoading: (id: string)=> boolean;
  isLoadOrderDetailLoaded: (id: string)=> boolean;
  loadOrderDetailError: (id: string)=> Error | undefined;
  setLoadOrderDetailLoaded: (id: string) => void;
  setLoadOrderDetailLoading: (id: string) => void;
  setLoadOrderDetailError: (id: string, error?: unknown) => void;
  loadOrderDetail(entity: OrderSummary & { items?: OrderDetail['items'] }) => Partial<(OrderSummary & { items?: OrderDetail['items'] } | undefined)>  
```
