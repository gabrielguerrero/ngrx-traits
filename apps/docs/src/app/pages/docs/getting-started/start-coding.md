---
name: Start Coding
order: 3
---

# Getting Started

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

### [withCallStatus](/docs/traits/withCallStatus)

In the example, we use the `withCallStatus` store feature, which adds computed signals like isLoading() and isLoaded() and corresponding setters setLoading and setLoading. You can see them being used in the withHooks to load the products.

### [withEntitiesLocalPagination](/docs/traits/withEntitiesLocalPagination)

You can also see in the example `withEntitiesLocalPagination`, which will add signal entitiesCurrentPage() and loadEntitiesPage({pageIndex: number}) that we can use to render a paginated list like the one below.

### [withCalls](/docs/traits/withCalls)

Finally `withCalls` adds the signals like isLoadProductDetailLoading(), isLoadProductDetailError() and loadProductDetailResult() and the method loadProductDetail({id}) that when called will change the status while the call is being made and store the result when it's done.

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
  loadProductDetail: callConfig({
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
  withEntities({ entity, collection }),
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

### [withEntitiesLoadingCall](/docs/traits/withEntitiesLoadingCall)

Now we can also replace that withHook with withEntitiesLoadingCall, which is similar to withCalls but is specialized on entities list,
it will call the fetchEntities, when the entities status it set to loading, and will handle the storing the result, status changes and errors if any for you.

```typescript
const entity = type<Product>();
****
const collection = "products";
export const ProductsLocalStore = signalStore(
  withEntities({ entity, collection }),
  withCallStatus({ collection, initialValue: "loading" }),
  withEntitiesLocalPagination({ entity, collection, pageSize: 5 }),
  // 👇 replaces withHook, will store entities result, change the status and handle errors
  withEntitiesLoadingCall({
    **** entity,
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

By default, the withEntities expect the Entity to have an id prop, but you can change that by passing a custom id like:

```typescript
const entityConfig = entityConfig({
  entity: type<ProductCustom>(),
  collection: 'products',
  selectId: (entity) => entity.productId,
});

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

## Next Steps
[Working with Entities](/docs/getting-started/working-with-entities), here you will learn how to work with entities in ngrx-traits.
```
