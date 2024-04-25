# @ngrx-traits/signals

Set of prebuilt ngrx signals Custom Store Features that solve common problems such as adding pagination, sorting, filtering, selection of entities, and more.
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


## Installation

Besides angular, you will need to have ngrx/signals installed with this lib you can do so with:

```npm i @ngrx/signals --save```

Install @ngrx-traits/signals

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
);
```
In the example, we use the `withCallStatus` store feature, which adds computed signals like isLoading() and isLoaded() and corresponding setters setLoading and setLoading. You can see them being used in the withHooks to load the products.
You can also see in the example `withEntitiesLocalPagination`, which will add signal entitiesCurrentPage() and loadEntitiesPage({pageIndex: number}) that we can use to render a paginated list like the one below.

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
            <mat-list-item>{{ product.name }}</mat-list-item>
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
  }
`,
})
export class SignalProductListPaginatedPageContainerComponent {
   store = inject(ProductsLocalStore);

}
```
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
    }))
  );
```
To see a full list of the store features in the library with details and examples, check the [API](../libs/ngrx-traits/signals/api-docs.md) documentation.

Also, I recommend checking the example section, where you can see multiple use cases for the library. [Examples](../apps/example-app/src/app/examples/signals)

For a more in step by step guide you can see the following articles.

## Articles

- [Introducing @ngrx-traits/signals](https://medium.com/@gabrieldavidguerrero/introducing-ngrx-traits-signals-1b3ff9af67ec)
- [@ngrx-traits/signals remote pagination](https://medium.com/@gabrieldavidguerrero/ngrx-traits-signals-remote-pagination-8eac8db30604)
