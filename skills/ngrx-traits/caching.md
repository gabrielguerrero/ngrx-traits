# Caching calls: cacheCall, cacheRxCall

Wraps any promise or observable in a key-based cache. A cached, non-expired value is returned
immediately; otherwise the call runs and its value is cached. Independent of `@ngrx/signals` — it also
works inside a service, a component or Angular's `resource()`.

- `cacheRxCall({ ... })` — the call returns an `Observable`.
- `cacheCall({ ... })` — the call returns a `Promise` (e.g. `fetch`).

```typescript
import { cacheRxCall } from '@ngrx-traits/signals';

withCalls((store, service = inject(ProductService)) => ({
  loadProductDetail: ({ id }: { id: string }) =>
    cacheRxCall({
      key: ['products', id],          // dynamic key
      call: service.getProductDetail(id),
      expires: 1000 * 60 * 5,         // 5 min; omit to cache indefinitely
      maxCacheSize: 5,                // LRU eviction above this many keys
    }),
}));
```

| Option | Description |
|---|---|
| `key` | String, or array of strings/objects — objects are serialized, so a query object can be part of the key |
| `call` | The observable (`cacheRxCall`) or a function returning a promise (`cacheCall`) |
| `expires` | Milliseconds before the entry is invalidated; never expires when omitted |
| `maxCacheSize` | Maximum number of entries; least-recently-used entries are evicted first |
| `skip` | `true` bypasses the cache for this call, and still stores the result |
| `cacheStore` | A scoped `CacheStore`; defaults to the global one |

`cacheCall` / `cacheRxCall` work on the server too. It is the `CacheStore` methods below
(`get`, `set`, `invalidate`, `delete`, `clear`) that no-op outside the browser.

Caching a paged search — the query object is part of the key, so each search is cached separately, and
`maxCacheSize` keeps only the most used ones:

```typescript
withEntitiesLoadingCall(
  productEntityConfig,
  ({ productEntitiesFilter, productEntitiesPagedRequest }, service = inject(ProductService)) => ({
    fetchEntities: async () => {
      const query = {
        search: productEntitiesFilter().search,
        skip: productEntitiesPagedRequest().startIndex,
        take: productEntitiesPagedRequest().size,
      };
      const res = await cacheCall({
        key: ['products', query],
        call: () => service.getProducts(query),
        maxCacheSize: 5,
        expires: 1000 * 60 * 10,
      });
      return { entities: res.resultList, total: res.total };
    },
  }),
);
```

## Scoped cache

The cache is global by default. Provide a `CacheStore` to scope it to a route or a component tree, then
pass it to every call that should use it:

```typescript
providers: [provideCacheStore(new CacheStore({ clearExpiredEvery: 10 * 60 * 1000 }))];

withCalls((store, service = inject(ProductService), cacheStore = inject(CacheStore)) => ({
  loadProductDetail: ({ id }: { id: string }) =>
    cacheRxCall({ key: ['products', id], call: service.getProductDetail(id), cacheStore }),
}));
```

## Managing the cache

```typescript
getGlobalCache().invalidate({ key: ['products'] }); // refetch on next call
getGlobalCache().delete({ key: ['products'] });     // drop entries now
getGlobalCache().get({ key: ['products', '1'] })?.value; // the entry, undefined when missing or expired
getGlobalCache().set({ key: ['products', '4'], value: product });
getGlobalCache().set({ key: ['products', '4'], value: (prev) => ({ ...prev, stock: 0 }) });
getGlobalCache().clear();
getGlobalCache().setSkipCacheForAllCalls(true); // e.g. in tests
// setGlobalCache(new CacheStore({ clearExpiredEvery: 60_000 })) replaces the global one
```

Invalidate after a mutation — e.g. in a `withCalls` `onSuccess` — so the next read refetches.

An alternative for caching inside one store, without the cache API, is `withCalls` with `skipWhen` plus a
state map — see [calls.md](calls.md).
