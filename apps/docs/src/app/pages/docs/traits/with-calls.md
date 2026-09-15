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
      product of store.productEntities(); track product.id
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
  withCalls((store) => ({
    loadProductDetail: callConfig({
      call: ({ id }: { id: string }) => inject(ProductService).getProductDetail(id),
      resultProp: 'productDetail',
    }),
  })),
);
```
### Using withCalls to load a list of Entities 
If you want to store entities you should probably check first [withEntitiesLoadingCall](/docs/traits/with-entities-loading-call) which is specially designed for this use case, but you can use withCalls as well.
```typescript
const productsEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'product',
});
const store = signalStore(
  withEntities(productsEntityConfig),
  withCalls((store) => ({
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
  collection: 'product',
});
export const ProductsLocalStore = signalStore(
  { providedIn: 'root' },
  withEntities(productsEntityConfig),
  withEntitiesSingleSelection(productsEntityConfig),
  // 👆 adds signal productEntitySelected()
  //    and method selectProductEntity({ id: string | number })
  withCalls(({ productEntitySelected }) => ({
    loadProductDetail: callConfig({
      call: ({ id }: { id: string }) =>
        inject(ProductService).getProductDetail(id),
      resultProp: 'productDetail',
      // call load the product detail when a product is selected
      callWith: productEntitySelected,
      // productEntitySelected is of type Signal<Product | undefined> so it can be pass directly to callWith
      // because it matches the type the call parameter, but you can use a function as bellow if it doesn't
      // callWith: () =>
      //   productEntitySelected()
      //     ? { id: productEntitySelected()!.id }
      //     : undefined, // if no product is selected, skip call
    }),
  })),
  // loadProductDetail callWith is equivalent to:
  // withHooks((store) => {
  //   return {
  //     onInit() {
  //       toObservable(store.productEntitySelected)
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
  withCalls(({ productEntitySelected }) => ({
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
withHooks to call them
```typescript
const productsEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'product',
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
      // for calls with no params passing true will execute the call
      withCall: true
    }),
  })),
);
```

### Awaiting call result
When calling a generated method with a direct param (not a Signal or Observable), it returns a Promise that resolves with the result of the call. This is useful for handling success/error in components, e.g. showing snackbars or resetting forms.

The return type is:
```typescript
Promise<
  | { value: Signal<ResultType>; ok: true }
  | { error: Signal<ErrorType>; ok: false }
>
```

Store setup with `mapError` to type the error:
```typescript
const RegisterUserStore = signalStore(
  withCalls(() => ({
    registerUser: callConfig({
      call: (params: { name: string; email: string; password: string }) =>
        inject(UserService).register(params),
      mapError: (error) => {
        return (error as HttpErrorResponse).error.message;
      },
    }),
  })),
);
```

Component usage:
```typescript
async onSubmit() {
  const { name, email, password } = this.model();
  const result = await this.store.registerUser({ name, email, password });
  if (result.ok) {
    this.snackBar.open('Registration successful!', 'Close', {
      duration: 3000,
    });
  } else {
    this.snackBar.open(result.error() as string, 'Close', {
      duration: 5000,
    });
  }
}
```

### Awaiting call with signal forms submit

Example of how it can be use combine with signals form submit to connect server side errors to the form

```ts
protected store = inject(RegisterUserStore);
  private snackBar = inject(MatSnackBar);

  protected model = signal<RegisterData>({ ...initialValue });
  protected registerForm = form(this.model, (path) => {
    required(path.name);
    required(path.email);
    email(path.email);
    required(path.password);
    minLength(path.password, 6);
    required(path.confirmPassword);
    validate(path.confirmPassword, ({ value, valueOf }) => {
      const password = valueOf(path.password);
      return value() !== password
        ? { kind: 'passwordMismatch', message: 'Passwords must match' }
        : undefined;
    });
  });

  async onSubmit() {
    await submit(this.registerForm, async () => {
      const { name, email, password, dateOfBirth } = this.model();

      const result = await this.store.registerUser({ name, email, password });

      if (result.ok) {
        this.snackBar.open('Registration successful!', 'Close');
        this.model.set({ ...initialValue });
      } else {
        this.snackBar.open(result.error() as string, 'Close');
        return {
          kind: 'server',
          fieldTree: this.registerForm.email,
          message: result.error() as string,
        };
      }
      return undefined;
    });
  }
```

### Angular Resource view of a call

> **Experimental.** Ready to use, but the API may still change in response to feedback. If you hit a problem or something feels awkward, please [open an issue](https://github.com/gabrielguerrero/ngrx-traits/issues).

For each call that stores its result, `withCalls` also generates a resource method: a factory of a read-only view of the call with the shape of Angular's `Resource`, for components that prefer the resource API (`value`, `status`, `error`, `isLoading`, `snapshot`, `hasValue()`, plus `destroy()`). Call it in a field initializer to get an instance; every signal in it reads the store, nothing is copied, so all views of the same call agree with each other and with the generated signals.

The view is read-only on purpose. Angular's `ResourceRef` can be written because its value lives in the resource, here it lives in the store, so changing it is a store method's job. There is no `reload()` either: the generated call method is what runs the call, and it takes the params, so the component calls that.

The resource is a view of the result, so it is named after the prop holding it: `<resultProp>Resource()` when the call renames its result, `<callName>Resource()` otherwise.

| call | resultProp | resource |
| --- | --- | --- |
| `loadProductDetail` | `productDetail` | `productDetailResource()` |
| `loadProductDetail` | none | `loadProductDetailResource()` |
| `checkout` | none | `checkoutResource()` |

```typescript
const ProductsStore = signalStore(
  withCalls(() => ({
    loadProductDetail: callConfig({
      call: ({ id }: { id: string }) => inject(ProductService).getProductDetail(id),
      resultProp: 'productDetail',
      mapError: (error) => error as HttpErrorResponse,
    }),
  })),
);

// In component
store = inject(ProductsStore);
// typed as CallResource<ProductDetail | undefined, HttpErrorResponse>
detail = this.store.productDetailResource();
```

```html
@if (detail.isLoading()) {
  <mat-spinner />
} @else if (detail.hasValue()) {
  <!-- hasValue() narrows value() to ProductDetail -->
  <product-detail [product]="detail.value()" />
  <button (click)="store.loadProductDetail({ id: productId() })">Refresh</button>
} @else if (detail.status() === 'error') {
  {{ detail.error()?.message }}
}
```

The view maps the store call status to Angular's `ResourceStatus`: `init` is `idle`, `loading` is `loading` the first time and `reloading` once the call has produced a value, `loaded` is `resolved`, and an error is `error`. `local` is never reported, since the value is the store's, not the view's. Unlike a resource created with `resource()`, `value()` never throws: when the call fails it keeps the last result. It is structurally an Angular `Resource` whenever the error type (see `mapError`) extends `Error`, so it can be passed to any API that takes one.

- To run the call again, call the generated method, or the `params` source below. The view does not add a `reload()`: the call is the store's, and running it needs the params.
- To change the result, patch the store from a store method, as usual. Every view reads the same signal, so they all see it.

#### Exposing only the resource to components

A name starting with an underscore is private to the store, the same rule every other generated member follows. Since the name comes from `resultProp`, a private call with a public `resultProp` keeps the method, the status and the error inside the store while components get the result and the resource:

```typescript
const ProductsStore = signalStore(
  withCalls(() => ({
    // the call is private
    _loadProductDetail: callConfig({
      call: ({ id }: { id: string }) => inject(ProductService).getProductDetail(id),
      // the result and the resource are public
      resultProp: 'productDetail',
    }),
  })),
);

// In component: store._loadProductDetail is not there, this is the way in
detail = this.store.productDetailResource({ params: () => ({ id: this.productId() }) });
```

Give the `resultProp` an underscore too (`_productDetail`) to keep the resource private as well.

#### Driving the call from the component

The `params` option takes a signal, a function or an observable of the call parameter, and runs the call every time it emits, the same as calling the generated method with it, except that `undefined` skips the call, so it can be driven by an input that is not set yet. It requires an injection context (field initializer or constructor), or the `injector` option. `destroy()` stops it.

```typescript
// In component
productId = input.required<string>();
detail = this.store.productDetailResource({
  params: () => ({ id: this.productId() }),
});
```

#### Loading the detail of the selected row

`params` can be any signal the component owns, like the row selected in a list. Returning `undefined` while nothing is selected skips the call, and `mapPipe: 'switchMap'` cancels a detail still loading when the selection changes.

```typescript
const ProductsStore = signalStore(
  withCalls(() => ({
    loadProductDetail: callConfig({
      call: ({ id }: { id: string }) => inject(ProductService).getProductDetail(id),
      resultProp: 'productDetail',
      mapPipe: 'switchMap',
    }),
  })),
);

// In component
store = inject(ProductsStore);
selectedProduct = signal<Product | undefined>(undefined);
detail = this.store.productDetailResource({
  params: () => {
    const product = this.selectedProduct();
    return product ? { id: product.id } : undefined;
  },
});
```

```html
<product-list [list]="products()" (selectProduct)="selectedProduct.set($event)" />

@if (detail.hasValue()) {
  <!-- keeps showing the previous detail while the next one loads -->
  <product-detail [product]="detail.value()" [productLoading]="detail.isLoading()" />
} @else if (detail.isLoading()) {
  <mat-spinner />
} @else if (detail.status() === 'error') {
  <!-- the store method runs the call again, with the id of the selected row -->
  <button (click)="store.loadProductDetail({ id: selectedProduct()!.id })">Retry</button>
} @else {
  <h2>Please select a product</h2>
}
```

See [withEntitiesLoadingCall](/docs/traits/with-entities-loading-call#full-example-filtered-list-with-detail) for a full example combining this view with the one of an entities list.

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
getUserError: Signal<ErrorType | undefined>;
```

## Methods

Generates the following methods

```typescript
// When called with a direct param, returns a Promise with the result
getUser: (param: ParamType) => Promise<
  | { value: Signal<ResultType>; ok: true }
  | { error: Signal<ErrorType>; ok: false }
>;
// When called with a Signal or Observable, returns an RxMethodRef
getUser: (param: Signal<ParamType> | Observable<ParamType>) => RxMethodRef;
// Factory of an Angular Resource view of the call, only when storeResult is not false,
// named after the resultProp ('user' here), or after the call when there is none
userResource: (options?: {
  params?: Signal<ParamType | undefined> | (() => ParamType | undefined) | Observable<ParamType | undefined>;
  injector?: Injector;
}) => CallResource<ResultType, ErrorType>;
```

Where `CallResource` has the shape of Angular's `Resource`, with the error typed by the call:

```typescript
interface CallResource<T, Error> {
  value: Signal<T>;
  status: Signal<'idle' | 'loading' | 'reloading' | 'resolved' | 'error'>;
  error: Signal<Error | undefined>;
  isLoading: Signal<boolean>;
  snapshot: Signal<CallResourceSnapshot<T, Error>>;
  hasValue(): boolean; // narrows value to Exclude<T, undefined>
  destroy(): void; // stops the params source, when one was given
}
```
