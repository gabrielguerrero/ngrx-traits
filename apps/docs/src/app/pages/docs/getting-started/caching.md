
# Caching
 This feature allows you to easily implement caching for calls that return an observable or a promise.

## Basic example 
```ts
withCalls(
  (
    service = inject(ProductService),
  ) => ({
    loadProductDetail: ({ id }: { id: string }) =>
      cacheRxCall({
        key: ['products', id],
        call: service.getProductDetail(id),
        expires: 1000 * 60 * 5 // 5 mins
      }),
  }),
)
```
## How it Works
The cache method works by wrapping a source observable or promise. When a request is made:

- It first checks if the requested key exists in the cache.
- If found and is not expired or invalidated, the cached value is immediately returned.
- If not in the cache, the source observable or promise is executed.
- Upon successful completion, its value is cached for future use.

There are two versions of the cache call:
`cacheCall`  use this if your call returns a promise, like when using fetch
`cacheRxCall` works with calls that return an Observable and requires rxjs to be part of your app.

Although the examples seen bellow will use ngrx-traits withCalls, this library in its beta version doesn't depend on ngrx-signals or ngrx-traits. It can be use inside the new angular resource api, or inside services or components catching calls that use http client or fetch.

By default, the cache is global, but it can also be scoped to a set of components by using providers and the inject function (example later bellow)

## Key Features and Configuration
The cache method offers additional properties for fine-grained control over caching behavior:

cacheCall and cacheRxCall provide the following params

- `key`: this is either a string or an array of string or objects, the objects are transform to string in the cache and can be used to create dynamic keys.
- `call`: this is either a function that returns a promise in the case of cacheCall or an Observable for cacheRxCall, the result of the call is what will be cached.
- `expires` (milliseconds): This optional property sets an expiration time for cached values. Once the specified time in milliseconds has passed, the cached value will be invalidated, and the source will be re-executed on the next request. If expires is not provided, the cached value will never be invalidated automatically.
- `maxCacheSize` (number): This optional property allows you to define a maximum number of key-value pairs the cache will store. When the cache reaches this limit, it employs the least recently used (LRU) eviction strategy. Keys that are accessed more frequently (more hits) will be retained, while those with fewer hits will be removed to make space for new entries.

## Examples

## Caching result indefinitely 
The following example shows a case caching a result indefinitely, using a dynamic key
```ts
withCalls(
  (
    service = inject(ProductService),
  ) => ({
    loadProductDetail: ({ id }: { id: string }) =>
      cacheRxCall({
        key: ['products', id],
        call: service.getProductDetail(id),
      }),
  }),
)
```

### Caching a result for 5 mins
By adding the expires prop you can define how long will the value be valid in the cache. If not expired will return the value, and after it expires, the next call will execute the call again and cache it for the same time.
```ts
withCalls(
  (
    service = inject(ProductService),
  ) => ({
    loadProductDetail: ({ id }: { id: string }) =>
      cacheRxCall({
        key: ['products', id],
        call: service.getProductDetail(id),
        expires: 1000 * 60 * 5 // 5 mins
      }),
  }),
)
```

### Caching a result a maximum of 5 keys
The following example will cache up to 5 key value pairs, when the cache reaches its limit, it employs the least recently used (LRU) eviction strategy. Keys that are accessed more frequently (more hits) will be retained, while those with fewer hits will be removed to make space for new entries.
```ts
withCalls(
  (
    service = inject(ProductService),
  ) => ({
    loadProductDetail: ({ id }: { id: string }) =>
      cacheRxCall({
        key: ['products', id],
        call: service.getProductDetail(id),
        maxCacheSize: 5
      }),
  }),
)
```
### Mixing expires and maximum cache size
You can mix the expire and maxCacheSize, so while the value is not expired, it will store up to the max size of the cache, and then it all gets invalidated if the expire time has passed.
```ts
withCalls(
  (
    service = inject(ProductService),
  ) => ({
    loadProductDetail: ({ id }: { id: string }) =>
      cacheRxCall({
        key: ['products', id],
        call: service.getProductDetail(id),
        expires: 1000 * 60 * 5, // 5 mins
        maxCacheSize: 5
      }),
  }),
)
```

### Caching search results
A good use case for maxCacheSize is caching search results. Search queries often produce keys with many variations due to multiple parameters, which can lead to an inefficient cache if left unbounded — especially when large results are cached. By setting maxCacheSize, you ensure that only the most frequent searches remain in the cache, while less common ones are eventually evicted. Also add the expire parameter to ensure that cached values do not become stale over time.
```typescript
const productsEntity = entityConfig({
  entity: type<Product>(),
  collection: 'products',
});
const productsStoreFeature = signalStoreFeature(
  withEntities(productsEntity),
  withCallStatus(productsEntity),
  withEntitiesRemoteFilter({
    ...productsEntity,
    defaultFilter: { search: '' },
  }),
  withEntitiesRemotePagination({
    ...productsEntity,
    pageSize: 10,
  }),
  withEntitiesRemoteSort({
    ...productsEntity,
    defaultSort: { field: 'name', direction: 'asc' },
  }),
  withEntitiesLoadingCall(
    ({ productsPagedRequest, productsFilter, productsSort }) => ({
      ...productsEntity,
      fetchEntities: async () => {
        const query = {
          search: productsFilter().search,
          skip: productsPagedRequest().startIndex,
          take: productsPagedRequest().size,
          sortAscending: productsSort().direction === 'asc',
          sortColumn: productsSort().field,
        };
        // we use cacheCall to show the case where service.getProducts(query) 
        // returns a promise
        const res = await cacheCall({ 
          key: ['products', query], // <-- query is part of the key
          call: () => service.getProducts(query),
          maxCacheSize: 5, // we will only cache top 5 searches
          expires: 1000 * 60 * 10, // expire after 10 mins
        });
        return { entities: res.resultList, total: res.total };
      },
    }),
  ),
);
```
### Scoped cache store
To not use a global store , and use a scoped you can provide the Cache store in a component or a module via
```ts
 providers: [provideCacheStore( new CacheStore({ clearExpiredEvery: 10 * 60 * 1000 }))]
```
And then use it in your code like:
```ts
withCalls(
  (
    service = inject(ProductService),
    cacheStore = inject(CacheStore) // <-- inject cache store
  ) => ({
    loadProductDetail: ({ id }: { id: string }) =>
      cacheRxCall({
        key: ['products', id],
        call: service.getProductDetail(id),
        expires: 1000 * 60 * 5// 5 mins.
        cacheStore // <-- be sure to pass the store otherwise will use the global
      }),
  }),
)
```

### Invalidate a cached value manually
Sometimes you will need to manually invalidate the cache, you can use the following
```ts
// invalidate any keys inside products, so next calls will be refresh from the backend
getGlobalCache().invalidate({key: ['products']})
```
### Delete a cache
```ts
// inmeadiatly delete all keys that inside products
getGlobalCache().delete({key: ['products']})
```

### Get a value from the cache manually
```ts
getGlobalCache().get({key: ['products','1']})
```

### Change a value in the cache manually
```ts
// you can pass an object directly
getGlobalCache().set({key: ['products','4'], value: myObject})
// or use a function to change the previously value of the cache
getGlobalCache().set({
  key: ['products', '4'],
  value: (previousValue) => ({ ...previousValue, newProp: 2 })
});
```
### Clear all cache
```ts
getGlobalCache().clear()
```
