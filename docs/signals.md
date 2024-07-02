# @ngrx-traits/signals

Set of prebuilt ngrx signals Custom Store Features that solve common problems such as adding pagination, sorting, filtering, selection of entities, and more.

[![Join the discord server at https://discord.gg/CEjF5D3NCh](https://img.shields.io/discord/1241018601541079070.svg?color=7389D8&labelColor=6A7EC2&logo=discord&logoColor=ffffff&style=flat-square)](https://discord.gg/CEjF5D3NCh)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](https://commitizen.github.io/cz-cli/)
[![npm version](https://badge.fury.io/js/@ngrx-traits%2Fsignals.svg)](https://www.npmjs.com/@ngrx-traits/signals)

# Features

- ✅ Reduce boilerplate with generated strongly typed signals and methods.
- ✅ Store Feature to load entities list
- ✅ Store Feature to create a status for backend operations
- ✅ Store Feature to filter remote and locally entities list
- ✅ Store Feature to sort remote and locally entities list
- ✅ Store Feature to paginate entities list locally or remotely
- ✅ Store Feature to create a infinite scroll pagination
- ✅ Store Feature to add single or multi selection entities list
- ✅ Store Feature to reduce boilerplate needed when calling backend apis
- ✅ Store Feature to sync the state to local or session storage
- ✅ Caching

## Table of Contents
### [Installation](#installation)

### [Getting Started](#getting-started)

### [Playground](https://stackblitz.com/github/gabrielguerrero/ngrx-traits-signals-playground?file=src%2Fapp%2Fproduct-list-detail%2Fproduct-local.store.ts)

### [Examples](../apps/example-app/src/app/examples/signals)

### [API](../libs/ngrx-traits/signals/api-docs.md)

### [Articles](#articles) 

### [Discord](https://discord.gg/CEjF5D3NCh)


## Installation

Besides angular, you will need to have ngrx/signals installed with this lib you can do so with:

```npm i @ngrx/signals --save```
or 
```yarn add @ngrx/signals```

Then you can install  @ngrx-traits/signals with:

```npm i @ngrx-traits/signals --save```

or

```yarn add @ngrx-traits/signals```

```npm i @ngrx-traits/signals --save```

## Getting Started

To use this library you will first need to understand some of the concepts of ngrx/signals, you can find more about it [here](https://ngrx.io/guide/signals).

To better understand what the library does, let's take a look at a simple example.

```typescript
const entity = type<Product>();
export const ProductsLocalStore = signalStore(
  withEntities({ entity }),
  withCallStatus({ initialValue: 'loading' }),
  // 👆 adds signals isLoading(), isLoaded(), error()
  // and methods setLoading() setLoaded(), setError(error)
  withEntitiesLocalPagination({ entity, pageSize: 5 }),
  // 👆 adds signal entitiesCurrentPage()
  // and method loadEntitiesPage({pageIndex: number})"
  withHooks(({ setLoaded, setError, ...store }) => ({
    onInit: async () => {
      const productService = inject(ProductService);
      try {
        const res = await lastValueFrom(productService.getProducts());
        patchState(store, setAllEntities(res.resultList));
        setLoaded();
      } catch (e) {
        setError(e);
      }
    },
  })),
  withCalls(() => ({
    loadProductDetail: ({ id }: { id: string }) =>
      inject(ProductService).getProductDetail(id),
  })),
  // 👆 adds signals isLoadProductDetailLoading(), loadProductDetailResult()
  // and method loadProductDetail({id})
);
```

### withCallStatus

In the example, we use the `withCallStatus` store feature, which adds computed signals like isLoading() and isLoaded() and corresponding setters setLoading and setLoading. You can see them being used in the withHooks to load the products.

### withEntitiesLocalPagination

You can also see in the example `withEntitiesLocalPagination`, which will add signal entitiesCurrentPage() and loadEntitiesPage({pageIndex: number}) that we can use to render a paginated list like the one below.

### withCalls

Finally `withCalls` adds the signals like  isLoadProductDetailLoading(), isLoadProductDetailError() and  loadProductDetailResult() and the method loadProductDetail({id}) that when called will change the status while the call is being made and store the result when it's done.

Now let's see how we can use them in a component.


```html
  @if (store.isLoading()) {
    <mat-spinner />
  } @else {
      <div>
        <mat-list>
          <!-- 👇 we use store.entitiesCurrentPage().entities 
            instead of store.entities() ↓ -->
          @for (
            product of store.entitiesCurrentPage().entities;
            track product.id
          ) {
            <!-- 👇 using loadProductDetail -->
            <mat-list-item (click)="store.loadProductDetail(product)">{{ product.name }}</mat-list-item>
          }
        </mat-list>
        <!-- 👇 entitiesCurrentPage has all the props
             needed for the paginator, and loadEntitiesPage 
             handles page changes -->
        <mat-paginator
          [length]="store.entitiesCurrentPage().total"
          [pageSize]="store.entitiesCurrentPage().pageSize"
          [pageIndex]="store.entitiesCurrentPage().pageIndex"
          (page)="store.loadEntitiesPage($event)"
        />
      </div>
     <!-- 👇 using isLoadProductDetailLoading for the progress 
      and loadProductDetailResult for the stored result-->
      @if (store.isLoadProductDetailLoading()) {
      <mat-spinner />
      } @else if (store.isLoadProductDetailLoaded()) {
      <product-detail [product]="store.loadProductDetailResult()!" />
      } @else {
      <h2>Please Select a product</h2>
      }
  }
`,
})
export class SignalProductListPaginatedPageContainerComponent {
   store = inject(ProductsLocalStore);

}
```

`withCalls` is very flexible you can see other examples below.
```typescript
   withCalls(({ productsSelectedEntity }) => ({
    loadProductDetail: typedCallConfig({
      call: ({ id }: { id: string }) =>
        inject(ProductService).getProductDetail(id),
      resultProp: 'productDetail', // change the prop name of the result
      // storeResult: false, // will omit storing the result, and remove the result prop from the store
      mapPipe: 'switchMap', // default is 'exhaustMap'
      onSuccess: (result, callParam) => {
      // do something with the result
      },
      onError: (error, callParam) => {
      // do something with the error
      },
    }),
     // you can add as many calls as you want
    checkout: () =>
      inject(OrderService).checkout({
        productId: productsSelectedEntity()!.id,
        quantity: 1,
      }),
  }))
````

Most store features support a collection param that allows you have custom names in the generated signals and methods for example:

```typescript 
  const entity = type<Product>();
  const collection = 'products';
  export const ProductsLocalStore = signalStore(
    withEntities({ entity , collection}),
    withCallStatus({ collection, initialValue: 'loading' }),
    // 👆 adds signals isProductsLoading(), isProductsLoaded(), productsError()
    // and methods setProductsLoading() setProductsLoaded(), setProductsError(error)
    withEntitiesLocalPagination({ entity, collection, pageSize: 5 }),
    // 👆 adds signal productsCurrentPage()
    // and method loadProductsPage({pageIndex: number})"
    withHooks(({ setProductsLoaded, setProductsError, ...store }) => ({
      onInit: async () => {
        const productService = inject(ProductService);
        try {
          const res = await lastValueFrom(productService.getProducts());
          patchState(store, setAllEntities(res.resultList));
          setProductsLoaded();
        } catch (e) {
          setProductsError(e);
        }
      }
    })),
    withCalls(() => ({
      loadProductDetail: ({ id }: { id: string }) =>
        inject(ProductService).getProductDetail(id),
    })),
  );
```
### withEntitiesLoadingCall
Now we can also replace that withHook with withEntitiesLoadingCall, which is similar to withCalls but is specialized on entities list,
it will call the fetchEntities, when the entities status it set to loading, and will handle the storing the result, status changes and errors if any for you.

```typescript
const entity = type<Product>();
  const collection = "products";
  export const ProductsLocalStore = signalStore(
  withEntities({ entity, collection }),
  withCallStatus({ collection, initialValue: "loading" }),
  withEntitiesLocalPagination({ entity, collection, pageSize: 5 }),
  // 👇 replaces withHook, will store entities result, change the status and handle errors
  withEntitiesLoadingCall({
  entity,
  collection,
  fetchEntities: () =>
    inject(ProductService)
      .getProducts()
      .pipe((res) => res.resultList),
  }),
  withCalls(() => ({
  loadProductDetail: ({ id }: { id: string }) =>
      inject(ProductService).getProductDetail(id),
  })),
  );
```

### Custom ids
By default, the withEntities expect the Entity to have an id prop, but you can change that by passing a custom id  like:
```typescript
const entityConfig = {
  entity: type<Product>(),
  collection: "products",
  idKey: "productId",
} as const; // 👈 important to use as const otherwise collection and idKey type will be a string instead of a string literal 

export const ProductsLocalStore = signalStore(
  withEntities(entityConfig),
  withCallStatus({ ...entityConfig, initialValue: "loading" }),
  withEntitiesLocalPagination({ ...entityConfig, pageSize: 5 }),
  withEntitiesLoadingCall({
    ...entityConfig,
    fetchEntities: () =>
      inject(ProductService)
        .getProducts()
        .pipe((res) => res.resultList),
  }),
  withCalls(() => ({
    loadProductDetail: ({ id }: { id: string }) =>
      inject(ProductService).getProductDetail(id),
  })),
);
```
You create a entityConfig like shown above using as const, and the you need to spread it to all withEntities* that you are using

```typescript
To see a full list of the store features in the library with details and examples, check the [API](../libs/ngrx-traits/signals/api-docs.md) documentation.

Also, I recommend checking the example section, where you can see multiple use cases for the library. [Examples](../apps/example-app/src/app/examples/signals)

For a more in step by step guide you can see the following articles.

## Articles

- [Introducing @ngrx-traits/signals](https://medium.com/@gabrieldavidguerrero/introducing-ngrx-traits-signals-1b3ff9af67ec)
- [@ngrx-traits/signals remote pagination](https://medium.com/@gabrieldavidguerrero/ngrx-traits-signals-remote-pagination-8eac8db30604)
