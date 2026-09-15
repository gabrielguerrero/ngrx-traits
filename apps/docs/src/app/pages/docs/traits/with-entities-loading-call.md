---
name: withEntitiesLoadingCall 
order: 5
---

# withEntitiesLoadingCall

Generates a onInit hook that fetches entities from a remote source
when the is[Collection]Loading is true, by calling the fetchEntities function
and if successful, it will call set[Collection]Loaded and also set the entities
to the store using the setAllEntities method or the setEntitiesPagedResult method
if it exists (comes from withEntitiesRemotePagination),
if an error occurs it will set the error to the store using set[Collection]Error with the error.

**Kind**: global function

**Requires** withEntities and withCallStatus to be present in the store.

## Import

Import the withCalls trait from `@ngrx-traits/signals`.

```ts
import { withEntitiesLoadingCall } from '@ngrx-traits/signals';
```

## Examples

Example using withEntitiesLoadingCall with the withEntitiesRemote\* store features

```typescript
const productsEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'product',
});
export const ProductsRemoteStore = signalStore(
  { providedIn: 'root' },
  withEntities(productsEntityConfig),
  withCallStatus(productsEntityConfig, { initialValue: 'loading' }),
  withEntitiesRemoteFilter(productsEntityConfig, {
    defaultFilter: { name: '' },
  }),
  withEntitiesRemotePagination(productsEntityConfig, {
    pageSize: 5,
    pagesToCache: 2,
  }),
  withEntitiesRemoteSort(productsEntityConfig, {
    defaultSort: { field: 'name', direction: 'asc' },
  }),

  withEntitiesLoadingCall(
    productsEntityConfig,
    ({ productEntitiesFilter, productEntitiesPagedRequest, productEntitiesSort }) => ({
      fetchEntities: () => {
        return inject(ProductService)
          .getProducts({
            search: productEntitiesFilter().name,
            take: productEntitiesPagedRequest().size,
            skip: productEntitiesPagedRequest().startIndex,
            sortColumn: productEntitiesSort().field,
            sortAscending: productEntitiesSort().direction === 'asc',
          })
          .pipe(
            map((d) => ({
              entities: d.resultList,
              total: d.total,
            })),
          );
      },
    }),
  ),
);
```

Example using withEntitiesLoadingCall to with the withEntitiesLocal\* store features

```typescript
const productsEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'product',
});
export const ProductsLocalStore = signalStore(
  { providedIn: 'root' },
  withEntities(productsEntityConfig),
  withCallStatus(productsEntityConfig, { initialValue: 'loading' }),
  withEntitiesLocalPagination(productsEntityConfig, {
    pageSize: 5,
  }),
  withEntitiesLocalFilter(productsEntityConfig, {
    defaultFilter: { search: '' },
    filterFn: (entity, filter) => !filter?.search || entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
  }),
  withEntitiesLocalSort(productsEntityConfig, {
    defaultSort: { field: 'name', direction: 'asc' },
  }),
  withEntitiesLoadingCall(productsEntityConfig, {
    fetchEntities: () => {
      return inject(ProductService)
        .getProducts()
        .pipe(map((d) => d.resultList));
    },
  }),
);
```

To know more how it mixes and works with other local store features, check [Working with Entities](/docs/getting-started/working-with-entities) section.

### Angular Resource view of the entities

> **Experimental.** Ready to use, but the API may still change in response to feedback. If you hit a problem or something feels awkward, please [open an issue](https://github.com/gabrielguerrero/ngrx-traits/issues).

`withEntitiesLoadingCall` also generates an `entitiesResource()` (or `[collection]EntitiesResource()`) method: a factory of a read-only view of the entities and their loading call with the shape of Angular's `Resource`, for components that prefer the resource API. Call it in a field initializer to get an instance; every signal in it reads the store, so it always agrees with `[collection]Entities()` and the `withCallStatus` signals. See the same view in [withCalls](/docs/traits/with-calls#angular-resource-view-of-a-call) for the status mapping and the details.

```typescript
// In component
store = inject(ProductsRemoteStore);
// typed as CallResource<Product[], ErrorType>
products = this.store.productEntitiesResource();
```

`status()` tells a first load (`loading`) from a later one (`reloading`), so the list can stay on screen while a filter, sort or page change fetches the next result:

```html
@if (products.status() === 'loading') {
  <mat-spinner />
} @else if (products.status() === 'error') {
  <button (click)="store.setProductEntitiesLoading()">Retry</button>
} @else {
  @if (products.status() === 'reloading') {
    <mat-progress-bar mode="indeterminate" />
  }
  @for (product of products.value(); track product.id) {
    <product-item [product]="product" />
  }
  <button [disabled]="products.isLoading()" (click)="store.setProductEntitiesLoading()">Refresh</button>
}
```

- `value()` is the `[collection]Entities()` signal, so `hasValue()` is true unless the load failed.
- To fetch again, call `set[Collection]Loading()`, which triggers `fetchEntities` like any other change of the filter, sort or page. The view does not add a `reload()`: the fetch is the store's, and the store already exposes what runs it.
- The view is read-only. To replace the entities, patch the store from a store method as usual, with `setAllEntities`.

#### With a pagination store feature

There is no separate resource for a page. With any of the `withEntities*Pagination` features, keep using `[collection]EntitiesCurrentPage`, which already has the entities, `total`, `pageIndex`, `pageSize` and, in the remote ones, its own `isLoading`. It is a `DeepSignal`, so read each prop as its own signal (`...CurrentPage.entities()`), which only recomputes when that prop changes.

Take the status from the resource, and the rows and the paginator from the page. With `withEntitiesRemotePagination` this matters: the entity collection holds the cached page window, so the resource's `value()` is not what you render.

```html
@if (products.status() === 'loading') {
  <mat-spinner />
} @else {
  <product-list [list]="store.productEntitiesCurrentPage.entities()" />
  <mat-paginator
    [length]="store.productEntitiesCurrentPage.total()"
    [pageSize]="store.productEntitiesCurrentPage.pageSize()"
    [pageIndex]="store.productEntitiesCurrentPage.pageIndex()"
    (page)="store.loadProductEntitiesPage($event)"
  />
  <button [disabled]="products.isLoading()" (click)="store.setProductEntitiesLoading()">Refresh</button>
}
```

### Full example: filtered list with detail

A product list filtered and sorted by the backend, where clicking a row loads the product detail. The list uses the view generated by `withEntitiesLoadingCall`, the detail the one generated by [withCalls](/docs/traits/with-calls#angular-resource-view-of-a-call), driven by the selected row. The same example runs in the example app under Signals > Product List and Detail (Resource API).

```typescript
const productEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'product',
});

export const ProductResourceStore = signalStore(
  withEntities(productEntityConfig),
  withCallStatus(productEntityConfig, { initialValue: 'loading' }),
  withEntitiesRemoteFilter(productEntityConfig, {
    defaultFilter: { search: '' },
  }),
  withEntitiesRemoteSort(productEntityConfig, {
    defaultSort: { field: 'name', direction: 'asc' },
  }),
  // 👇 also generates productEntitiesResource()
  withEntitiesLoadingCall(
    productEntityConfig,
    ({ productEntitiesFilter, productEntitiesSort }) => ({
      fetchEntities: () =>
        inject(ProductService)
          .getProducts({
            search: productEntitiesFilter().search,
            sortColumn: productEntitiesSort().field,
            sortAscending: productEntitiesSort().direction === 'asc',
          })
          .pipe(map((d) => d.resultList)),
    }),
  ),
  // 👇 also generates productDetailResource()
  withCalls(() => ({
    loadProductDetail: callConfig({
      call: ({ id }: { id: string }) => inject(ProductService).getProductDetail(id),
      resultProp: 'productDetail',
      mapPipe: 'switchMap',
    }),
  })),
);
```

```typescript
@Component({
  selector: 'product-resource-page',
  providers: [ProductResourceStore],
  template: `
    <product-search-form
      [searchProduct]="store.productEntitiesFilter()"
      (searchProductChange)="store.filterProductEntities({ filter: $event })"
    />
    <div class="grid grid-cols-2 gap-8">
      <div>
        @if (products.status() === 'loading') {
          <mat-spinner />
        } @else {
          @if (products.status() === 'reloading') {
            <mat-progress-bar mode="indeterminate" />
          }
          <product-list
            [list]="products.value()"
            [selectedProduct]="selectedProduct()"
            (selectProduct)="selectedProduct.set($event)"
            (sort)="store.sortProductEntities({ sort: { field: $event.active, direction: $event.direction } })"
          />
        }
      </div>
      <div>
        @if (detail.hasValue()) {
          <product-detail [product]="detail.value()" [productLoading]="detail.isLoading()" />
        } @else if (detail.isLoading()) {
          <mat-spinner />
        } @else {
          <h2>Please select a product</h2>
        }
      </div>
    </div>
  `,
})
export class ProductResourcePageComponent {
  store = inject(ProductResourceStore);
  // value() is store.productEntities(), status() the withCallStatus status
  products = this.store.productEntitiesResource();
  selectedProduct = signal<Product | undefined>(undefined);
  // the call runs each time the selection changes, undefined skips it
  detail = this.store.productDetailResource({
    params: () => {
      const product = this.selectedProduct();
      return product ? { id: product.id } : undefined;
    },
  });
}
```

## API Reference

This trait receives and object to allow specific configurations:

| Property      | Description                                                                                                                                 | Value                                                                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| fetchEntities | A function that fetches the entities from a remote source, the return type can be an array of entities or an object with entities and total | `(store)=> Observable<Entity[] \| { entities: Entity[] , total?:number}> \| Promise<Observable<Entity[] \| { entities: Entity[] , total?:number}>>  ` |
| collection    | Optional collection name.                                                                                                                   | string                                                                                                                                                |
| selectId      | Optional param to provide an entity id selector if different from id                                                                        | `SelectEntityId<Entity>`                                                                                                                              |
| storeResult   | Whether to automatically store the fetched entities (default: `true`). When `false`, entities are not stored but `setLoaded` and `onSuccess` are still called, useful when you want to handle storing in `onSuccess` yourself | `boolean`                                                                                                                                             |
| mapPipe       | Rxjs pipe to use for each call. Default value: `switchMap`                                                                                  | `switchMap` \| `exhaustMap` \| `concatMap`                                                                                                            |
| onSuccess     | Callback executed after call emits value                                                                                                    | `()=> void \| (result, param: ParamType)=> void`                                                                                                      |
| mapError      | Callback to transform and give type to error                                                                                                | `(error)=> ErrorType`                                                                                                                                 |

## State

Generates no extra state

## Computed

Generates no extra computed signals

## Methods

Generates the following method

```typescript
// Factory of an Angular Resource view of the entities and their loading call,
// see withCalls for the CallResource shape
entitiesResource: () => CallResource<Entity[], ErrorType>;
// or, with a collection
[collection]EntitiesResource: () => CallResource<Entity[], ErrorType>;
```
