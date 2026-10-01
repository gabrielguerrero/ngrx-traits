---
name: Start Coding
order: 3
title: "Start Coding | NgRx Traits"
meta:
  - name: description
    content: "Learn the basics of NgRx Traits with a simple example: a product list signal store with call status, local pagination and backend calls via withCalls."
  - property: og:title
    content: "Start Coding | NgRx Traits"
  - property: og:description
    content: "Learn the basics of NgRx Traits with a simple example: a product list signal store with call status, local pagination and backend calls via withCalls."
  - property: og:url
    content: "https://ngrx-traits.dev/docs/getting-started/start-coding/"
  - name: twitter:title
    content: "Start Coding | NgRx Traits"
  - name: twitter:description
    content: "Learn the basics of NgRx Traits with a simple example: a product list signal store with call status, local pagination and backend calls via withCalls."
---

# Getting Started

To use this library you will first need to understand some of the concepts of NgRx Signals, you can find more about it [here](https://ngrx.io/guide/signals).

To better understand what the library does, let's take a look at a simple example.

```typescript
const entity = type<Product>();
export const ProductsLocalStore = signalStore(
  withEntities({ entity }),
  withCallStatus({ initialValue: 'loading' }),
  // 👆 adds signals isLoading(), isLoaded(), error()
  // and methods setLoading() setLoaded(), setError(error)
  withEntitiesLocalPagination({ entity }, { pageSize: 5 }),
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

### [withCallStatus](/docs/traits/with-call-status)

In the example, we use the `withCallStatus` store feature, which adds computed signals like isLoading() and isLoaded() and corresponding setters setLoading, setLoaded and setError. You can see them being used in the withHooks to load the products.

### [withEntitiesLocalPagination](/docs/traits/with-entities-local-pagination)

You can also see in the example `withEntitiesLocalPagination`, which will add signal entitiesCurrentPage() and loadEntitiesPage({pageIndex: number}) that we can use to render a paginated list like the one below.

### [withCalls](/docs/traits/with-calls)

Finally `withCalls` adds the signals like isLoadProductDetailLoading(), loadProductDetailError() and loadProductDetailResult() and the method loadProductDetail({id}) that when called will change the status while the call is being made and store the result when it's done.

Now let's see how we can use them in a component.

```typescript
@Component({
  selector: 'product-list-paginated-page',
  imports: [MatProgressSpinner, MatListModule, MatPaginator, ProductDetailComponent],
  template: `
    @if (store.isLoading()) {
      <mat-spinner />
    } @else {
      <div>
        <mat-list>
          <!-- 👇 we use store.entitiesCurrentPage.entities()
            instead of store.entities()
            entitiesCurrentPage is a DeepSignal, so each prop is a signal of its
            own and only recomputes when that prop changes -->
          @for (product of store.entitiesCurrentPage.entities(); track product.id) {
            <!-- 👇 using loadProductDetail -->
            <mat-list-item (click)="store.loadProductDetail(product)">
              {{ product.name }}
            </mat-list-item>
          }
        </mat-list>
        <!-- 👇 entitiesCurrentPage has all the props
          needed for the paginator, and loadEntitiesPage
          handles page changes -->
        <mat-paginator
          [length]="store.entitiesCurrentPage.total()"
          [pageSize]="store.entitiesCurrentPage.pageSize()"
          [pageIndex]="store.entitiesCurrentPage.pageIndex()"
          (page)="store.loadEntitiesPage($event)"
        />
      </div>
      <!-- 👇 using isLoadProductDetailLoading for the progress
        and loadProductDetailResult for the stored result -->
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
export class ProductListPaginatedPageComponent {
  store = inject(ProductsLocalStore);
}
```

`withCalls` is very flexible you can see other examples below.

```typescript
const productsEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'products',
});
// ...
withEntitiesSingleSelection(productsEntityConfig),
// 👆 adds productsEntitySelected(), used by the checkout call below
withCalls(({ productsEntitySelected }) => ({
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
      productId: productsEntitySelected()!.id,
      quantity: 1,
    }),
}))
```

Most store features support a collection param that allows you have custom names in the generated signals and methods. Declare it once with `entityConfig(...)` and pass that config to each feature, for example:

```typescript
const productEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'product',
});

export const ProductsLocalStore = signalStore(
  withEntities(productEntityConfig),
  withCallStatus(productEntityConfig, { initialValue: 'loading' }),
  // 👆 adds signals isProductEntitiesLoading(), isProductEntitiesLoaded(), productEntitiesError()
  // and methods setProductEntitiesLoading() setProductEntitiesLoaded(), setProductEntitiesError(error)
  withEntitiesLocalPagination(productEntityConfig, { pageSize: 5 }),
  // 👆 adds signal productEntitiesCurrentPage()
  // and method loadProductEntitiesPage({pageIndex: number})"
  withHooks(({ setProductEntitiesLoaded, setProductEntitiesError, ...store }) => ({
    onInit: async () => {
      const productService = inject(ProductService);
      try {
        const res = await lastValueFrom(productService.getProducts());
        patchState(store, setAllEntities(res.resultList, productEntityConfig));
        setProductEntitiesLoaded();
      } catch (e) {
        setProductEntitiesError(e);
      }
    }
  })),
  withCalls(() => ({
    loadProductDetail: ({ id }: { id: string }) =>
      inject(ProductService).getProductDetail(id),
  })),
);
```

### [withEntitiesLoadingCall](/docs/traits/with-entities-loading-call)

Now we can also replace that withHook with withEntitiesLoadingCall, which is similar to withCalls but is specialized on entities list,
it will call the fetchEntities, when the entities status it set to loading, and will handle the storing the result, status changes and errors if any for you.

```typescript
const productEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'product',
});

export const ProductsLocalStore = signalStore(
  withEntities(productEntityConfig),
  withCallStatus(productEntityConfig, { initialValue: "loading" }),
  withEntitiesLocalPagination(productEntityConfig, { pageSize: 5 }),
  // 👇 replaces withHook, will store entities result, change the status and handle errors
  withEntitiesLoadingCall(productEntityConfig, {
    fetchEntities: () =>
      inject(ProductService)
        .getProducts()
        .pipe(map((res) => res.resultList)),
  }),
  withCalls(() => ({
    loadProductDetail: ({ id }: { id: string }) =>
      inject(ProductService).getProductDetail(id),
  })),
);
```

### Using Angular's Resource API

If you prefer Angular's Resource API in your components, `withEntitiesLoadingCall` and `withCalls` also generate a factory of a resource view of the entities and of each call. Every signal in it reads the store, so it always agrees with the signals above. A call's resource is named `<resultProp>Resource` when the call sets `resultProp`, otherwise `<callName>Resource`, so the store above generates `loadProductDetailResource`, while the `callConfig` example with `resultProp: 'productDetail'` would generate `productDetailResource`.

```typescript
// In component
store = inject(ProductsLocalStore);
products = this.store.productEntitiesResource();
selectedProduct = signal<Product | undefined>(undefined);
detail = this.store.loadProductDetailResource({
  // runs the call each time the selection changes, undefined skips it
  params: () => {
    const product = this.selectedProduct();
    return product ? { id: product.id } : undefined;
  },
});
```

```html
@if (products.isLoading()) {
  <mat-spinner />
}
<product-list [list]="products.value()" (selectProduct)="selectedProduct.set($event)" />
@if (detail.hasValue()) {
  <product-detail [product]="detail.value()" />
}
```

See [withCalls](/docs/traits/with-calls#angular-resource-view-of-a-call) and [withEntitiesLoadingCall](/docs/traits/with-entities-loading-call#angular-resource-view-of-the-entities) for the details.

### Custom ids

By default, the withEntities expect the Entity to have an id prop, but you can change that by passing a custom id like:

```typescript
const productEntityConfig = entityConfig({
  entity: type<ProductCustom>(),
  collection: 'product',
  selectId: (entity) => entity.productId,
});

export const ProductsLocalStore = signalStore(
  withEntities(productEntityConfig),
  withCallStatus(productEntityConfig, { initialValue: "loading" }),
  withEntitiesLocalPagination(productEntityConfig, { pageSize: 5 }),
  withEntitiesLoadingCall(productEntityConfig, {
    fetchEntities: () =>
      inject(ProductService)
        .getProducts()
        .pipe(map((res) => res.resultList)),
  }),
  withCalls(() => ({
    loadProductDetail: ({ id }: { id: string }) =>
      inject(ProductService).getProductDetail(id),
  })),
);
```

Create an entityConfig with `entityConfig(...)` as shown above, then pass it as the first arg to each withEntities* feature you use.

## Next Steps
[Working with Entities](/docs/getting-started/working-with-entities), here you will learn how to work with entities in NgRx Traits.
