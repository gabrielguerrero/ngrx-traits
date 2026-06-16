# Sync & Routing: withEntitiesSyncToRouteQueryParams, withSyncToRouteQueryParams, withSyncToWebStorage, withRoute, withServerStateTransfer

## withEntitiesSyncToRouteQueryParams

Syncs entity filter, pagination, sort, and selection to/from URL query params. Must come after filter/sort/pagination traits and before `withEntitiesLoadingCall`.

```typescript
import { withEntitiesSyncToRouteQueryParams } from '@ngrx-traits/signals';

const cfg = entityConfig({ entity: type<Product>(), collection: 'product' });

signalStore(
  withEntities(cfg),
  withCallStatus({ ...cfg, initialValue: 'loading' }),
  withEntitiesRemoteFilter({ ...cfg, defaultFilter: { search: '' } }),
  withEntitiesRemotePagination({ ...cfg, pageSize: 10, pagesToCache: 2 }),
  withEntitiesRemoteSort({ ...cfg, defaultSort: { field: 'name', direction: 'asc' } }),
  withEntitiesSyncToRouteQueryParams(cfg),  // ← after filter/sort/pagination, before loading call
  withEntitiesLoadingCall({ ... }),
)
```

**Config:**

| Property | Description | Default |
|---|---|---|
| `entity` | Entity type | required |
| `collection` | Collection name (optional) | — |
| `prefix` | URL param prefix to avoid conflicts | collection name |
| `filterMapper` | Custom filter ↔ query param serialization | `JSON.stringify` |
| `onQueryParamsLoaded` | Callback after restoring state from URL | — |
| `defaultDebounce` | Debounce ms for writing URL changes | — |
| `skipLoadingCall` | Restore state without triggering fetch | `false` |
| `syncFilter` | Sync filter | `true` |
| `syncPagination` | Sync pagination | `true` |
| `syncSort` | Sync sort | `true` |
| `syncSingleSelection` | Sync selected id as `selectedId` | `true` |
| `syncMultiSelection` | Sync selected ids as `selectedIds` (comma-separated) | `false` |

**Multi selection sync:**
```typescript
withEntitiesMultiSelection(cfg),
withEntitiesSyncToRouteQueryParams({ ...cfg, syncMultiSelection: true }),
```

Generates no extra state, computed, or methods.

---

## withSyncToRouteQueryParams

Low-level general URL query param sync. For custom state not covered by `withEntitiesSyncToRouteQueryParams`.

```typescript
import { withSyncToRouteQueryParams } from '@ngrx-traits/signals';

signalStore(
  withState({ search: '', page: 1, active: false }),
  withSyncToRouteQueryParams({
    mappers: [{
      // Called once on init — restore state from URL
      queryParamsToState: (query, store) => {
        patchState(store, {
          search: query['search'] ?? '',
          page: +(query['page'] ?? 1),
          active: query['active'] === 'true',
        });
      },
      // Called on every state change — write URL
      stateToQueryParams: (store) =>
        computed(() => ({
          search: store.search(),
          page: store.page().toString(),
          active: store.active().toString(),
        })),
    }],
    defaultDebounce: 300,
  }),
)
```

Generates no extra state, computed, or methods.

---

## withSyncToWebStorage

Persists store state to `localStorage` or `sessionStorage`. Must come **before** `withEntitiesLoadingCall` to prevent unnecessary API calls after restoring state.

```typescript
import { withSyncToWebStorage } from '@ngrx-traits/signals';

// Full state to session storage
signalStore(
  withEntities(cfg),
  withCallStatus({ ...cfg, initialValue: 'loading' }),
  withSyncToWebStorage({ key: 'my-cache', type: 'session' }),  // BEFORE loading call
  withEntitiesLoadingCall({ ... }),
)

// Partial state with expiry
withSyncToWebStorage({
  key: 'my-cache',
  type: 'local',
  restoreOnInit: true,
  saveStateChangesAfterMs: 500,
  expires: 1000 * 60 * 60 * 12, // 12 hours
  filterState: ({ productEntityMap, productIds }) => ({ productEntityMap, productIds }),
})

// Custom serialization with valueMapper
withSyncToWebStorage({
  key: 'user-prefs',
  type: 'local',
  valueMapper: (store) => ({
    stateToStorageValue: () => ({ theme: store.theme(), lang: store.lang() }),
    storageValueToState: (saved) => patchState(store, { theme: saved.theme, lang: saved.lang }),
  }),
})
```

**Config:**

| Property | Description | Default |
|---|---|---|
| `key` | Storage key | required |
| `type` | `'session'` or `'local'` | required |
| `restoreOnInit` | Restore on store init | `true` |
| `saveStateChangesAfterMs` | Debounce before saving | `500` |
| `filterState` | Filter which state to sync (exclusive with `valueMapper`) | — |
| `valueMapper` | Custom transform (exclusive with `filterState`) | — |
| `expires` | Max age in ms before ignoring saved data | — |
| `onRestore` | Callback after restore | — |

**Generated methods:**
```typescript
saveToStorage(): void
loadFromStorage(): void
clearFromStore(): void
```

**Multiple storage keys:** Add `withSyncToWebStorage` multiple times with different keys.

---

## withRoute

Exposes route params, query params, and route data as computed signals. The store must be provided in a routed component (not `providedIn: 'root'`).

```typescript
import { withRoute } from '@ngrx-traits/signals';

// route: /products/:id?sort=name&order=asc
const ProductDetailStore = signalStore(
  withRoute(({ params, queryParams }) => ({
    id: params['id'] as string,
    sort: queryParams['sort'] as string ?? 'name',
    order: queryParams['order'] as string ?? 'asc',
  })),
  withCalls(() => ({
    loadProductDetail: (id: string) => inject(ProductService).getProductDetail(id),
  })),
  withHooks(({ loadProductDetail, id }) => ({
    onInit: () => loadProductDetail(id()),
  })),
);
// store.id(), store.sort(), store.order() — computed signals
```

**Child route params** — automatically merged (deeper params win):
```typescript
// routes: { path: ':orgId', children: [{ path: ':projectId', component: ... }] }
withRoute(({ params }) => ({
  orgId: params['orgId'] as string,       // 'org-123'
  projectId: params['projectId'] as string, // 'project-456'
}))
```

**Route data:**
```typescript
// route config: { path: 'admin', data: { role: 'admin' } }
withRoute(({ data }) => ({ role: data?.['role'] as string }))
```

**API:**

| Property | Description |
|---|---|
| `mapParams` | `({ params, queryParams, data }) => T` — return object becomes computed signals |

**Note:** `withRouteParams` is deprecated — use `withRoute` instead.

---

## withServerStateTransfer

Transfers store state from SSR server to client via Angular's `TransferState` API. Must come **before** `withEntitiesLoadingCall`.

```typescript
import { withServerStateTransfer } from '@ngrx-traits/signals';

// Full state transfer
signalStore(
  withEntities(cfg),
  withCallStatus({ ...cfg, initialValue: 'loading' }),
  withEntitiesLocalFilter({ ... }),
  withEntitiesLocalSort({ ... }),
  withServerStateTransfer({ key: 'products-state' }), // BEFORE loading call
  withEntitiesLoadingCall({ ... }), // skips fetch if data restored
)

// Partial state
withServerStateTransfer({
  key: 'products-state',
  filterState: ({ productEntityMap, productIds }) => ({ productEntityMap, productIds }),
})

// Custom transform
withServerStateTransfer({
  key: 'user-profile',
  valueMapper: (store) => ({
    stateToTransferValue: () => ({ name: store.name(), email: store.email() }),
    transferValueToState: (saved) => patchState(store, { name: saved.name, email: saved.email }),
  }),
})

// Post-restore callback
withServerStateTransfer({
  key: 'products',
  filterState: ({ productEntityMap, productIds }) => ({ productEntityMap, productIds }),
  onRestore: (store) => patchState(store, { productEntitiesCallStatus: 'loaded' }),
})
```

**How it works:**
- **Server:** state is serialized and embedded in HTML via `TransferState`
- **Client:** state is restored during hydration; `withEntitiesLoadingCall` sees status is `loaded` and skips the API call

**Config:**

| Property | Description |
|---|---|
| `key` | Unique `TransferState` key | required |
| `filterState` | Partial state selector (exclusive with `valueMapper`) | — |
| `valueMapper` | Custom bidirectional transform (exclusive with `filterState`) | — |
| `onRestore` | Callback after restoration on client | — |

**Full SSR example:**
```typescript
export const ProductsSSRStore = signalStore(
  { providedIn: 'root' },
  withEntities(cfg),
  withCallStatus({ ...cfg, initialValue: 'loading' }),
  withEntitiesLocalPagination({ ...cfg, pageSize: 5 }),
  withEntitiesLocalFilter({ ...cfg, defaultFilter: { search: '' }, filterFn: ... }),
  withEntitiesLocalSort({ ...cfg, defaultSort: { field: 'name', direction: 'asc' } }),
  withEntitiesSingleSelection(cfg),
  withEntitiesSyncToRouteQueryParams(cfg),
  withServerStateTransfer({ key: 'product-list-ssr' }), // BEFORE loading call
  withEntitiesLoadingCall({
    ...cfg,
    fetchEntities: () => inject(ProductService).getProducts().pipe(map(d => d.resultList)),
  }),
);
```
