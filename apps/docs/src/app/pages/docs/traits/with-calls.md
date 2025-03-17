---
name: withCalls 
order: 2
---

# withCalls

Generates necessary state, computed and methods to track the progress of the call and store the result of the call. 

The generated methods are rxMethods with the same name as the original call, which accepts either the original parameters or a Signal or Observable of the same type as the original parameters. The original call can only have zero or one parameter, use an object with multiple props as first param if you need more.

**Kind**: global function

**Warning**: The default mapPipe is [exhaustMap](https://www.learnrxjs.io/learn-rxjs/operators/transformation/exhaustmap). If your call returns an observable that does not complete after the first value is emitted, any changes to the input params will be ignored. Either specify [switchMap](https://www.learnrxjs.io/learn-rxjs/operators/transformation/switchmap) as mapPipe, or use [take(1)](https://www.learnrxjs.io/learn-rxjs/operators/filtering/take) or [first()](https://www.learnrxjs.io/learn-rxjs/operators/filtering/first) as part of your call.

## Import

Import the withCalls trait from `@ngrx-traits/signals`.

```ts
import { withCalls } from '@ngrx-traits/signals';
```

## Examples
### Minimal use case
```typescript
const store = signalStore(
  loadProductDetail: ({ id }: { id: string }) =>
      inject(ProductService).getProductDetail(id)
);
```
Use in the template like 
```html
<mat-list>
  @for (
      product of store.productsEntities; track product.id
    ) {
    <mat-list-item
      (click)="store.loadProductDetail({ id: product.id })"
    >{{ product.name }}</mat-list-item>
  }
</mat-list>
@if (store.isLoadProductDetailLoading()) {
  <mat-spinner />
} @else if (store.isLoadProductDetailLoaded()) {
  <product-detail [product]="store.loadProductDetailResult()!" />
} @else {
  <div class="content-center"><h2>Please Select a product</h2></div>
}
```

### Renaming the property where results are stored
```typescript
const store = signalStore(
  withCalls(({ productsSelectedEntity }) => ({
    loadProductDetail: callConfig({
      call: ({ id }: { id: string }) => inject(ProductService).getProductDetail(id),
      resultProp: 'productDetail',
    }),
  })),
);
```
### Using withCalls to load a list of Entities 
If you want to store entities you should probably check first [withEntitiesLoadingCall](/docs/traits/withEntitiesLoadingCall) which is specially designed for this use case, but you can use withCalls as well.
```typescript
const productsEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'products',
});
const store = signalStore(
  withEntities(productsEntityConfig),
  withCalls(({ productsSelectedEntity }) => ({
    loadProducts: callConfig({
      call: () => inject(ProductService).getProducts(),
      storeResult: false,
      // store result false disables auto storing the call result and extra result type
      // this allows you to store the result your own way in the onSuccess
      onSuccess: (res) => {
        patchState(
          store,
          setAllEntities(res.resultList, productsEntityConfig),
        );
      },
    }),
  })),
);
```
### Using withCalls to cache result of a call in a map
In this case we have a list of entities and when you click on them, you load a detail of the item, but you want to cache the results so you don't need to load the same item twice.
```typescript
const Store = signalStore(
  withEntities(productsEntityConfig),
  withState({
    productDetailCache: {} as Record<string, ProductDetail>,
  }),
  withCalls(({ productDetailCache,...store }) => ({
    loadProductDetail: callConfig({
      call: ({ id }: { id: string }) => inject(ProductService).getProductDetail(id),
      storeResult: false,// allows us to handle the result manually
      skipWhen: ({id}) => !!productDetailCache()[id],// skip call if already cached
      onSuccess: (productDetail, { id }) => {
        patchState(store, (state) => ({...state, productDetailCache: {...state.productDetailCache, [id]:productDetail}}));
      },
    }),
  })),
);
```

### Using callWith to reactively call your method when everytime a signal changes
You might find yourself in a situation where you need to call a method everytime a signal changes, a good example of this is you have a list of entities and every time a user selects an item in the list you will load and show the details of the selected item. 
You can achieve this in a few ways some I show commented bellow, the most compact way is using callWith, let's see and example bellow and the equivalent using withHooks. 
```typescript
const productsEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'products',
});
export const ProductsLocalStore = signalStore(
  { providedIn: 'root' },
  withEntities(productsEntityConfig),
  withEntitiesSingleSelection(productsEntityConfig),
  // 👆 adds signal productsEntitySelected()
  //    and method selectProductsEntity({ id: string | number })
  withCalls(({ productsEntitySelected }) => ({
    loadProductDetail: callConfig({
      call: ({ id }: { id: string }) =>
        inject(ProductService).getProductDetail(id),
      resultProp: 'productDetail',
      // call load the product detail when a product is selected
      callWith: productsEntitySelected,
      // productsEntitySelected is of type Signal<Product | undefined> so it can be pass directly to callWith
      // because it matches the type the call parameter, but you can use a function as bellow if it doesnt
      // callWith: () =>
      //   productsEntitySelected()
      //     ? { id: productsEntitySelected()!.id }
      //     : undefined, // if no product is selected, skip call
    }),
  })),
  // loadProductDetail callWith is equivalent to:
  // withHooks((store) => {
  //   return {
  //     onInit() {
  //       toObservable(store.productsEntitySelected)
  //         .pipe(filter((v) => !!v))
  //         .subscribe((v) => {
  //           store.loadProductDetail({ id: v!.id });
  //         });
  //   };
  // }),
);
```
The callWith prop accepts a signal an observable or a simple value but this must be of the type of the call parameter or undefined, by default the call is skip if undefined is returned. you can change that by adding a skipWhen prop to the callConfig object.

### Using callWith to chain calls
Another good use case of callWith is to chain calls like bellow. Notice we use two withCalls so one call can reference the generated values of the other. 

```typescript
export const ProductsLocalStore = signalStore(
  withCalls(({ productsEntitySelected }) => ({
    loadOrderDetail: callConfig({
      call: ({ orderId }: { orderId: string }) =>
        inject(OrderService).getOrderDetail(orderId),
      resultProp: 'orderDetail',
    }),
  })),
  withCalls(({ orderDetail }) => ({
    loadOrderUserDetails: callConfig({
      call: ({ userId }: { userId: string }) =>
        inject(UserService).getUserDetail(userId),
      callWith: () => 
        orderDetail() ? { userId:orderDetail()?.userId } : undefined 
        // undefined will skip the call
      ,
      resultProp: 'userDetails',
    })
  })
);
```

### Using withCall prop to trigger an initial call
You can use withCall prop to get your call executed on init, is a shorter than writing a 
withHook to cal them
```typescript
const productsEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'products',
});
const store = signalStore(
  withEntities(productsEntityConfig),
  withCalls(({ productsSelectedEntity }) => ({
    loadProductDetail: callConfig({
      call: ({ id }: { id: string }) => inject(ProductService).getProductDetail(id),
      resultProp: 'productDetail',
      callWith: {id: 1}, // this will be call on init with that param
    }),
    loadProducts: callConfig({
      call: () => inject(ProductService).getProducts(),
      storeResult: false,
      onSuccess: (res) => {
        patchState(
          store,
          setAllEntities(res.resultList, productsEntityConfig),
        );
      },
      // for calls with no params pasing true will execute the call
      withCall: true
    }),
  })),
);
```

## API Reference

This trait receives and object to allow specific configurations:

| Property                                  | Description                                      | Value                                                                                               |
|-------------------------------------------|--------------------------------------------------|-----------------------------------------------------------------------------------------------------|
| call                                      | Async callback.                                  | `(param: ParamType)=> Observable<T>  (param: ParamType)=> Promise<T>`                               |
| resultProp                                | State property name to store the result of the call. | string                                                                                              |
| storeResult                               | Whether the result is stored as a signal or not. | boolean. Default: true                                                                              |
| mapPipe                                   | Rxjs pipe to use for each call. Default value: `exhaustMap` | `switchMap` \| `exhaustMap` \| `concatMap` (default: exhaustMap)                                    |
| onSuccess                                 | Callback executed after call emits value         | `()=> void \| (result, param: ParamType)=> void`                                                    |
| mapError                                  | Callback to transform and give type to error     | `(error)=> ErrorType`                                                                               |
| onError                                   | Callback executed after call emits error         | `(error: ErrorType, param: ParamType)=> void`                                                       |
| skipWhen                                  | Call back to check if the call should be skipped or not | `(param: ParamType)=> boolean  \| Promise<boolean>  \| Observable<boolean>`                         |
| callWith                                  | Reactively execute the call with the provided param | `ParamType \| Signal<ParamType \| null \| undefined>> \| Observable<ParamType \| null\| undefined>> \| (() => ParamType \| null \| undefined) ` |
| defaultResult | Default value for the result signal | `T` |

## State

Generates the following signals for each call defined within the trait

Eg: callName: 'getUser', resultProp: user

```typescript
// When storeResult = true
user: Signal<T>;
```

## Computed

Generates the following computed signals

```typescript
isGetUserLoading: Signal<boolean>;
isGetUserLoaded: Signal<boolean>;
getUserError: Signal<ErrorType>;
```

## Methods

Generates the following methods

```typescript
getUser: (param: ParamType) => void;
```
