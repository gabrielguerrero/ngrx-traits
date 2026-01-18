---
name: ExtractStoreFeatureOutput
order: 1
---

# ExtractStoreFeatureOutput

A TypeScript utility type that extracts the output type from a custom `signalStoreFeature` function. Essential when splitting large signal stores into multiple features.

## The Problem
There are going to be cases where you will want to split your NgRx `signalStore` into multiple [custom store features](https://ngrx.io/guide/signals/signal-store/custom-store-features) for better organization and reusability or simply you hit the maximum limit of 10 parameters the signalStore function has.
 One tricky part of splitting a store into multiple features is when you need to create a store feature that depends on the output of previous features, because you need to create an input interface that represents all the state props or methods your feature depends on, and this can be cumbersome to find all the right types which sometimes are created on the fly by TS or belong to third party libs like ngrx-traits or ngrx-toolkit.
 `ExtractStoreFeatureOutput` is a type utility that solves this problem by extracting the output type of store features so it can easily be reused as input for other store features.

## Example of the problem

The following is not complex enough that it needs to be split into multiple features, but we are going to intentionally split it a complex way to demonstrate how much the `ExtractStoreFeatureOutput` helps.

The store bellow represent a simple product store that loads a list of products from server with filtering, pagination, sorting and selection capabilities, and also load product detail by id.
```typescript
const productEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'product',
});

export const ProductStore = signalStore(
  withEntities(productEntityConfig),
  withCallStatus({
    ...productEntityConfig,
    initialValue: 'loading',
    errorType: type<string>(),
  }),
  withEntitiesRemoteFilter({
    ...productEntityConfig,
    defaultFilter: { search: '' },
  }),
  withEntitiesRemotePagination({
    ...productEntityConfig,
    pageSize: 10,
  }),
  withEntitiesRemoteSort({
    ...productEntityConfig,
    defaultSort: { field: 'name', direction: 'asc' },
  }),
  withEntitiesSingleSelection(productEntityConfig),
  // load list of products from server
  withEntitiesLoadingCall(
    (
      {
        productEntitiesPagedRequest,
        productEntitiesFilter,
        productEntitiesSort,
      },
      service = inject(ProductService),
    ) => ({
      ...productEntityConfig,
      fetchEntities: async () => {
        const query = {
          search: productEntitiesFilter().search,
          skip: productEntitiesPagedRequest().startIndex,
          take: productEntitiesPagedRequest().size,
          sortAscending: productEntitiesSort().direction === 'asc',
          sortColumn: productEntitiesSort().field,
        };
        const source = cacheRxCall({
          key: ['products', query],
          call: service.getProducts(query),
          maxCacheSize: 5,
        });
        const res = await lastValueFrom(source);
        return { entities: res.resultList, total: res.total };
      },
      mapError: (error) => (error as Error).message,
    }),
  ),
  // load product detail by id
  withCalls((store, service = inject(ProductService)) => ({
    loadProductDetail: ({ id }: { id: string }) =>
      cacheRxCall({
        key: ['products', id],
        call: service.getProductDetail(id),
        maxCacheSize: 3,
      }),
  })),
);
```

Now let's split the above store into multiple features, in this case the first part will be withProductEntities, which will have all the store features related to the state of the product entities and the second part withProductsCalls which will have all the store features that make calls to the backend.

First withProductEntities.ts :
```typescript
export const productEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'product',
});

export function withProductEntities() {
  return signalStoreFeature(
    withEntities(productEntityConfig),
    withCallStatus({
      ...productEntityConfig,
      initialValue: 'loading',
      errorType: type<string>(),
    }),
    withEntitiesRemoteFilter({
      ...productEntityConfig,
      defaultFilter: { search: '' },
    }),
    withEntitiesRemotePagination({
      ...productEntityConfig,
      pageSize: 10,
    }),
    withEntitiesRemoteSort({
      ...productEntityConfig,
      defaultSort: { field: 'name', direction: 'asc' },
    }),
    withEntitiesSingleSelection(productEntityConfig),
  );
}
// Now we can extract the output type of withProductEntities feature
export type ProductEntitiesStoreFeature = ExtractStoreFeatureOutput<
  typeof withProductEntities
>;
```
Notice above how we extracted the output type  of the withProductEntities feature.

Now we can create withProductsCalls.ts feature.
```typescript
export function withProductCalls() {
  return signalStoreFeature(
    /// notice here we use the ProductEntitiesStoreFeature, as input type
    type<ProductEntitiesStoreFeature>(),
    withEntitiesLoadingCall(
      (
        {
          productEntitiesPagedRequest,
          productEntitiesFilter,
          productEntitiesSort,
        },
        service = inject(ProductService),
      ) => ({
        ...productEntityConfig,
        fetchEntities: async () => {
          const query = {
            search: productEntitiesFilter().search,
            skip: productEntitiesPagedRequest().startIndex,
            take: productEntitiesPagedRequest().size,
            sortAscending: productEntitiesSort().direction === 'asc',
            sortColumn: productEntitiesSort().field,
          };
          const source = cacheRxCall({
            key: ['products', query],
            call: service.getProducts(query),
            maxCacheSize: 5,
          });
          const res = await lastValueFrom(source);
          return { entities: res.resultList, total: res.total };
        },
        mapError: (error) => (error as Error).message,
      }),
    ),
    withCalls((store, service = inject(ProductService)) => ({
      loadProductDetail: ({ id }: { id: string }) =>
        cacheRxCall({
          key: ['products', id],
          call: service.getProductDetail(id),
          maxCacheSize: 3,
        }),
    })),
  );
}
```

And finally we can compose the final ProductStore:
```typescript
export const ProductStore = signalStore(
  withProductEntities(),
  withProductCalls(),
);
```

## More complex example
You can find a more complex example in the github repo [here](
https://github.com/gabrielguerrero/ngrx-traits/tree/main/apps/example-app/src/app/examples/signals/product-shop-page)
## Key Points

- Wrap your `signalStoreFeature` in a function to use with `typeof`
- The extracted type includes all state, props, and methods from combined features
- Use `type<ExtractedType>()` as first argument to dependent `signalStoreFeature`
- Enables full type inference and autocompletion in factory functions
