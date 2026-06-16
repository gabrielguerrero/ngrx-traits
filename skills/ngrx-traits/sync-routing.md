# Routing, URL, storage and SSR: withRoute, withEntitiesSyncToRouteQueryParams, withSyncToRouteQueryParams, withSyncToWebStorage, withServerStateTransfer

The three sync traits go **after** the state they persist and **before** `withEntitiesLoadingCall`, so
restored state is in place before the first fetch (and can make it unnecessary).

## withRoute

Exposes route params, query params and route data as computed signals. The store must be provided by a
routed component or route, not `providedIn: 'root'`.

```typescript
// route: /categories/:categoryId/products?sort=name
const ProductListStore = signalStore(
  withRoute(({ params, queryParams, data }) => ({
    categoryId: params['categoryId'] as string,
    sort: (queryParams['sort'] as string) ?? 'name',
    role: data?.['role'] as string,
  })),
  withCalls(({ categoryId }) => ({
    loadCategory: callConfig({
      call: (id: string) => inject(CategoryService).getCategory(id),
      callWith: categoryId, // reloads whenever the param changes
      resultProp: 'category',
    }),
  })),
);
```

Params of child routes are merged in automatically; a deeper child wins over a parent with the same name.

## withEntitiesSyncToRouteQueryParams

Two-way sync of the entity filter, pagination, sort and selection with the URL query params. On init it
restores the state from the URL and triggers a load; afterwards every change is written back.

```typescript
withEntitiesSyncToRouteQueryParams(productEntityConfig, { prefix: 'p' });
```

| Option | Description | Default |
|---|---|---|
| `prefix` | Prefix for the query params, to avoid clashes | the collection name |
| `filterMapper` | How the filter is serialized; `getFilterQueryMapper` builds one from the filter fields | JSON |
| `onQueryParamsLoaded` | `(store) => void` after the URL state was restored | — |
| `defaultDebounce` | Debounce for writing state changes back to the URL | — |
| `skipLoadingCall` | Restore the state without triggering a fetch | `false` |
| `syncFilter` / `syncPagination` / `syncSort` | Sync those traits | `true` |
| `syncSingleSelection` | Sync the selected id as `selectedId` | `true` |
| `syncMultiSelection` | Sync the selected ids as a comma-separated `selectedIds` | `false` |

```typescript
// readable query params instead of a JSON blob
withEntitiesSyncToRouteQueryParams(productEntityConfig, {
  filterMapper: getFilterQueryMapper({ search: 'string', categoryId: 'string' }),
});
```

## withSyncToRouteQueryParams

The general form, for state the entity traits do not cover. `getQueryMapperForState` builds the mapper
from the state props and their types — names and types are checked against the store state.

```typescript
import { getQueryMapperForState, withSyncToRouteQueryParams } from '@ngrx-traits/signals';

signalStore(
  withState({ search: '', page: 0, showSold: false, day: new Date(), filter: { color: 'red', size: 10 } }),
  withSyncToRouteQueryParams({
    mappers: [
      getQueryMapperForState({
        search: 'string',
        page: 'number',
        showSold: 'boolean',
        day: 'date',
        filter: { color: 'string' }, // one param per declared field: ?filter.color=red
      }),
    ],
  }),
);
// ?search=shoes&page=2&showSold=true&day=2026-08-11&filter.color=red
```

Types: `'string'`, `'number'`, `'boolean'`, `'date'`, `'date-time'`, `'time'`, `'string-array'`,
`'number-array'`, `'json'`, or a nested props object. Only `'json'` is stringified; declare a
`'string-array'` whose values may contain a comma as `'json'` instead. Undeclared props and fields are
neither written nor touched when the URL is read back.

| Option | Description | Default |
|---|---|---|
| `mappers` | One or more query mappers | required |
| `defaultDebounce` | Debounce before state changes reach the URL | `300` |
| `restoreOnInit` | Read the query params into the store on init | `true` |
| `onQueryParamsStored` | `(store) => void` after the params were stored in the state | — |

Generates `loadFromQueryParams()`, for reading the URL on demand with `restoreOnInit: false`.

Write a mapper by hand for anything the generated one cannot express (renaming a param, splitting one
param over several props); both kinds can be mixed in `mappers`:

```typescript
withSyncToRouteQueryParams({
  mappers: [
    {
      // once on init: URL -> state
      queryParamsToState: (query, store) =>
        patchState(store, { search: query['search'] ?? '', page: +(query['page'] ?? 1) }),
      // on every change: state -> URL
      stateToQueryParams: (store) =>
        computed(() => ({ search: store.search(), page: store.page().toString() })),
    },
  ],
});
```

## withSyncToWebStorage

Persists state to `localStorage` or `sessionStorage` and restores it on init.

```typescript
withSyncToWebStorage({
  key: 'products-cache',
  type: 'session',
  expires: 1000 * 60 * 60 * 12,
  filterState: ({ productEntityMap, productIds }) => ({ productEntityMap, productIds }),
});
```

| Option | Description | Default |
|---|---|---|
| `key` | Storage key | required |
| `type` | `'session'` \| `'local'` | required |
| `restoreOnInit` | Restore on store init | `true` |
| `saveStateChangesAfterMs` | Debounce before writing | `500` |
| `filterState` | Prop names or a selector fn; mutually exclusive with `valueMapper` | — |
| `valueMapper` | `(store) => ({ stateToStorageValue, storageValueToState })`; mutually exclusive with `filterState` | — |
| `expires` | Ignore data older than this (ms) | — |
| `onRestore` | `(store) => void` after restoring | — |

Generates `saveToStorage()`, `loadFromStorage()`, `clearFromStore()`. Add the trait several times with
different keys to persist different slices.

## withServerStateTransfer

Carries state rendered on the server to the client through Angular's `TransferState`, so the client does
not refetch during hydration.

```typescript
withServerStateTransfer({
  key: 'product-list-ssr',
  filterState: ({ productEntityMap, productIds }) => ({ productEntityMap, productIds }),
  onRestore: (store) => patchState(store, { productEntitiesCallStatus: 'loaded' }),
});
```

| Option | Description |
|---|---|
| `key` | Unique `TransferState` key |
| `filterState` | Prop names or a selector fn; mutually exclusive with `valueMapper` |
| `valueMapper` | `(store) => ({ stateToTransferValue, transferValueToState })` |
| `onRestore` | `(store) => void` after restoring on the client |

Transferring the whole state (no `filterState`) already carries the call status, so the loading call sees
`loaded` and skips the fetch. With a partial state, restore the status yourself in `onRestore`.
