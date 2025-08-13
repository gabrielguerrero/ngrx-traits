---
name: Working with Entities
---

# Working with Entities

This library provides a variety of store features for working with entities. Here, you'll learn how they work, how to combine them, and best practices for using them.

## Loading Entities

There are multiple ways to load entities, ranging from a more manual approach to a fully automated one. Below, we'll explore these methods step by step.

### Loading Entities Using `withCallStatus`

You should only need this approach if you are dealing with complex loading logic that cannot be easily handled by the `withCalls` and `withEntitiesLoading` store features.

With `withCallStatus`, we manage the loading state manually by using status-related signals such as `isLoading`, `isLoaded`, and `error`, along with their corresponding setters: `setLoading`, `setLoaded`, and `setError` added by `withCallStatus`.

```typescript
const productEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'products',
});

export const ProductsRemoteStore = signalStore(
  { providedIn: 'root' },
  withEntities(productEntityConfig),
  withCallStatus({ ...productEntityConfig, initialValue: 'loading' }),
  // 👆 adds signals isProductsLoading(), isProductsLoaded(), productsError()
  // and methods setProductsLoading() setProductsLoaded(), setProductsError(error)
  withMethods(({setProductsLoading, setProductsLoaded, setProductsError, ...store}) => ({
    loadProducts: rxMethod(pipe(switchMap(() => {
      setProductsLoading()
      return inject(ProductService)
        .getProducts()
        .pipe(
          tap((res) =>
            patchState(
              store,
              setAllEntities(res.resultList, { collection: 'products' }),
            ),
          ),
          catchError((error) => {
            setProductsError(error);
            return EMPTY;
          }));
    })))
  }))
  );
```

### Loading Entities Using `withCalls`

Using `withCalls` eliminates the need to manually update the call status, reducing boilerplate code. However, it is not specifically designed to work with `withEntities`, so you still need to manually store the entities in the state.

In contrast, when using `withEntitiesLoadingCall`, this process is handled automatically.

```typescript
const productsEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'products',
});
const store = signalStore(
  withEntities(productsEntityConfig),
  withCalls((store) => ({
    loadProducts: callConfig({
      call: () => inject(ProductService).getProducts(),
      storeResult: false,
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



### Loading Entities Using `withCalls` in a Store with `withEntitiesLocalFilter` and `withEntitiesLocalSort`

This approach is similar to the previous one. When using local filtering and sorting, you must manually trigger sorting and filtering after loading the entities.

This example is included mainly for completeness. However, in most cases, you should use `withEntitiesLoadingCall` instead, as it automatically handles sorting and filtering if they are present.

```typescript
const productsEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'products',
});
export const Store = signalStore(
  { providedIn: 'root' },
  withEntities({ entity, collection }),
  withEntitiesLocalFilter({
    entity,
    collection,
    defaultFilter: { search: '' },
    filterFn: (entity, filter) =>
      !filter?.search ||
      entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
  }),
  withEntitiesLocalSort({
    entity,
    collection,
    defaultSort: { field: 'name', direction: 'asc' },
  }),
  withCalls((store) => ({
    loadProducts: callConfig({
      call: () => inject(ProductService).getProducts(),
      storeResult: false,
      onSuccess: (res) => {
        patchState(store, setAllEntities(res.resultList, productsEntityConfig));
        // force resort and refilter
        store.sortProductsEntities();
        store.filterProductsEntities();
      },
    }),
  })),
);
```

### Loading Entities Using `withEntitiesLoadingCall`

`withEntitiesLoadingCall` is specifically designed for loading entities and integrating seamlessly with other `withEntities` store features included in this library.

Let's first look at an example, followed by an explanation of how it works.

```typescript
const productsEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'products',
});
export const ProductsLocalStore = signalStore(
  { providedIn: 'root' },
  withEntities(productsEntityConfig),
  withCallStatus({ ...productsEntityConfig, initialValue: 'loading' }),
  withEntitiesLoadingCall({
    ...productsEntityConfig,
    fetchEntities: () => {
      return inject(ProductService)
        .getProducts()
        .pipe(map((d) => d.resultList));
    },
  }));
```

### Interaction between withCallStatus, withEntitiesLoading, and other withEntities* store features

`withEntitiesLoadingCall` is reactive—it listens to the `isProductsLoading()` signal (or `isLoading()` if no collection prop is defined in the `entityConfig`). This signal is added by `withCallStatus`, and when it is `true`, `fetchEntities` is called.

Since in our previous example `withCallStatus` sets the `initialValue` to `'loading'`, the entities will be fetched immediately when the store initializes.

### Why does `withEntitiesLoadingCall` depend on the loading status from `withCallStatus` instead of generating its own?

Unlike `withCalls`, which manages its own loading state, `withEntitiesLoadingCall` relies on `withCallStatus` because `callStatus` acts as a communication API between all other `withEntities*` store features.

For example:
- `withEntitiesRemoteFilter` calls `setProductsLoading()` (or `setLoading()` if no collection) when `filterEntities` is executed, ensuring `fetchEntities` is triggered with the updated filter parameters.
- `withEntitiesRemotePagination` calls `setProductsLoading()` when more pages need to be loaded.
- `withEntitiesRemoteSort` does the same when sorting is required.

In contrast, `withEntitiesLocalFilter` and `withEntitiesLocalSort` do not trigger a new fetch. Instead, they reapply filtering and sorting every time `isProductsLoaded` is `true`.

Below, you can see a few examples illustrating these interactions.

### Local Filtering, Sorting, and Pagination with `withEntitiesLoadingCall` and Others

Below is an example of how to use `withEntitiesLocalPagination`, `withEntitiesLocalFilter`, and `withEntitiesLocalSort` alongside `withEntitiesLoadingCall`. This setup loads entities from the backend, after which they can be filtered, sorted, and paginated locally.

Notice that in `fetchEntities`, you only need to return either an array of entities or an object of type `{ entities: Entity[], total: number }`. The store will handle storing the entities for you. Additionally, local filtering, sorting, and pagination will automatically reapply whenever the data is reloaded.
```typescript
const productsEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'products',
});
export const ProductsLocalStore = signalStore(
  { providedIn: 'root' },
  withEntities(productsEntityConfig),
  withCallStatus({ ...productsEntityConfig, initialValue: 'loading' }),
  // withCallStatus must be before all the other 
  // withEntities* features so the can use the callStatus state
  withEntitiesLocalPagination({
    ...productsEntityConfig,
    pageSize: 5,
  }),
  withEntitiesLocalFilter({
    ...productsEntityConfig,
    defaultFilter: { search: '' },
    filterFn: (entity, filter) =>
      !filter?.search ||
      entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
  }),
  withEntitiesLocalSort({
    ...productsEntityConfig,
    defaultSort: { field: 'name', direction: 'asc' },
  }),
  // with withEntitiesLoadingCall, should generally be the after all the other 
  // withEntities* so it can use the state generated by them, 
  // you can see this in the next example for remote filtering, sorting pagination 
  withEntitiesLoadingCall({
    ...productsEntityConfig,
    fetchEntities: () => {
      return inject(ProductService)
        .getProducts()
        .pipe(map((d) => d.resultList));
    },
  }),
);
```
### Remote Filtering, Sorting, and Pagination with `withEntitiesLoadingCall` and Others

In this scenario, sorting, filtering, and pagination are handled by the backend.

Notice that in the `fetchEntities` function, we pass the filter, sort, and pagination parameters to the backend, which we read from the signals added by the other withEntities* store features. The backend processes these parameters and returns the filtered, sorted, and paginated entities along with the total count. The store features then takes care of the rest.

```typescript
const productsStoreFeature = signalStoreFeature(
  withEntities({
    entity: productsEntity,
    collection: productsCollection,
  }),
  withCallStatus({
    initialValue: 'loading',
    collection: productsCollection,
    errorType: type<string>(),
  }),
  withEntitiesRemoteFilter({
    entity: productsEntity,
    collection: productsCollection,
    defaultFilter: { search: '' },
  }),
  withEntitiesRemotePagination({
    entity: productsEntity,
    collection: productsCollection,
    pageSize: 10,
  }),
  withEntitiesRemoteSort({
    entity: productsEntity,
    collection: productsCollection,
    defaultSort: { field: 'name', direction: 'asc' },
  }),
  withEntitiesLoadingCall(
    ({ productsPagedRequest, productsFilter, productsSort }) => ({
      collection: productsCollection,
      fetchEntities: async () => {
        const res = await lastValueFrom(
          inject(ProductService).getProducts({
            search: productsFilter().search,
            skip: productsPagedRequest().startIndex,
            take: productsPagedRequest().size,
            sortAscending: productsSort().direction === 'asc',
            sortColumn: productsSort().field,
          }),
        );
        return { entities: res.resultList, total: res.total };
      },
    }),
  ),
);
```
