---
name: withAllCallStatus 
order: 1
---

# withAllCallStatus

Generates necessary helper signals that track the status of all calls after it 

**Kind**: global function

## Import

Import the withAllCallStatus trait from `@ngrx-traits/signals`.

```ts
import { withAllCallStatus } from '@ngrx-traits/signals';
```

## Usage

This will help you when you need to do a lot of calls to load your components
and you want to track that if any of the calls are loading , or to handle all the errors of any of the calls in one place, reducing the need to have an onError prop per calls in the store, it supports
withCalls, withEntitiesCall, withCallStatus and withCallStatusMap, as long as withAllCallStatus is before all of them in the store definition. 

### Global isLoading

Add `withAllCallStatus` to the store definition, before all the calls, 
this will add isAnyCallLoading signal, which you could use in your template 
to show a spinner or something like that.
```typescript
const Store = signalStore(
  withAllCallStatus(), // this must be before all the calls
  withCalls(() => ({
    loadProducts: () =>
      inject(ProductService)
        .getProducts()
        .pipe(map((d) => d.resultList)),
    loadOrders: () =>
      inject(OrderService)
        .getOrders()
        .pipe(map((d) => d.resultList)),
    loadProductDetail: ({ id }: { id: string }) =>
      inject(ProductService).getProductDetail(id),
  })),
  withHooks((store) => ({
    onInit: () => {
      store.loadProducts();
      store.loadOrders();
      store.loadProductDetail({ id: '1' });
    },
  })),
);
```
In the template
```html
@if(isAnyCallLoading()) { 
<mat-spinner/>
} else {
...render your components
}
```

### Store error handler
Sometimes we will like to have a generic error handler for all the calls in the store, for that you can create a custom store feature similar to: 


```typescript
export function withErrorSnackbar() {
  return signalStoreFeature(
    withAllCallStatus(),
    withHooks((store, snackBar = inject(MatSnackBar)) => ({
      onInit: () => {
        effect(() => {
          const errors = store.callsErrors();
          if (errors.length > 0) {
            snackBar.open('Error processing Call', 'Close', {
              duration: 5000,
            });
          }
        });
      },
    })),
  );
}
```
Now we just need to add this feature to the store any store definition that we want to have this error handling

```typescript
const Store = signalStore(
  // add our generic error handler
  withErrorSnackbar(), 
  // now any error of the calls bellow will show a snackbar message
  withCalls(() => ({
    loadProducts: () =>
      inject(ProductService)
        .getProducts()
        .pipe(map((d) => d.resultList)),
    loadOrders: () =>
      inject(OrderService)
        .getOrders()
        .pipe(map((d) => d.resultList)),
    loadProductDetail: ({ id }: { id: string }) =>
      inject(ProductService).getProductDetail(id),
  })),
  withHooks((store) => ({
    onInit: () => {
      store.loadProducts();
      store.loadOrders();
      store.loadProductDetail({ id: '1' });
    },
  })),
);
```




## API Reference

This trait receives no params



## State

Generates the following signals

```typescript
_allCallStatus: [] as CallStatus[]
```


## Computed

Generates the following computed signals

```typescript
isAnyCallLoading: Signal<boolean>;
callsErrors: Signal<(unknown | null)[]>;
```

## Methods

Provides a global function
registerCallStatus: (callStatus: CallStatus);
that can be used to register status of any call, this is used internally by the store features withCalls, withEntitiesCall, withCallStatus and withCallStatusMap, but you can use it to register the status of any call if your call is not using any of the supported store features. 

