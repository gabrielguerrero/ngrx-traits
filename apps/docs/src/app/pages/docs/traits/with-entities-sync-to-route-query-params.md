---
name: withEntitiesSyncToRouteQueryParams 
order: 17
---

# withEntitiesSyncToRouteQueryParams

Syncs entities filter, pagination, sort, single selection and multi selection to route query params for local or remote entities store features. If a collection is provided, it will be used as a prefix (if non is provided) for the query params.
The prefix can be disabled by setting it to false, or changed by providing a string. The filterMapper can be used to customize how the filter object is map to a query params object,
when is not provided the filter will use JSON.stringify to serialize the filter object.

Requires withEntities and withCallStatus to be present in the store.

## Import

Import the withEntitiesSyncToRouteQueryParams trait from `@ngrx-traits/signals`.

```ts
import { withEntitiesSyncToRouteQueryParams, getFilterQueryMapper } from '@ngrx-traits/signals';
```

## Examples
### Syncing entities filter, pagination, sort and single selection to route query params

```typescript
export const ProductsRemoteStore = signalStore(
  { providedIn: 'root' },
  // requires at least withEntities and withCallStatus
  withEntities({ entity, collection }),
  withCallStatus({ collection, initialValue: 'loading' }),
  withEntitiesRemoteFilter({
    entity,
    collection,
  }),
  withEntitiesRemotePagination({
    entity,
    collection,
  }),
  withEntitiesRemoteSort({
    entity,
    collection,
    defaultSort: { field: 'name', direction: 'asc' },
  }),
  withEntitiesLoadingCall({
    collection,
    fetchEntities: ({ productEntitiesFilter, productEntitiesPagedRequest, productEntitiesSort }) => {
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
  // syncs the entities filter, pagination, sort and single selection to the route query params
  withEntitiesSyncToRouteQueryParams({
    entity,
    collection,
  })
);
```

### Syncing with multi selection

Use `syncMultiSelection: true`  when using `withEntitiesMultiSelection`. Selected ids are serialized as a comma-separated `selectedIds` query param.

```typescript
export const ProductsLocalStore = signalStore(
  { providedIn: 'root' },
  withEntities({ entity, collection }),
  withCallStatus({ collection, initialValue: 'loading' }),
  withEntitiesMultiSelection({ entity, collection }),
  withEntitiesLoadingCall({ ... }),
  withEntitiesSyncToRouteQueryParams({
    entity,
    collection,
    syncMultiSelection: true,
  }),
);
```

### Two collections, with a short prefix

You can sync more than one collection in the same store, each `withEntitiesSyncToRouteQueryParams` prefixes its own query params so the two never collide.

When you have multiple collections, group each one into its own custom store feature (or give it its own store) instead of listing every feature of both collections directly in one `signalStore`. It keeps each collection readable and reusable on its own. It also avoids the feature limit: `signalStore` accepts up to 15 features, and a fully configured collection already uses about 8 of them, so two collections would not fit.

Use `entityConfig` to declare the entity and collection once, then spread it when a feature takes extra options, or pass it directly when it does not.

```typescript
// with-product-entities.ts
export const productEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'product',
});

export function withProductEntities() {
  return signalStoreFeature(
    withEntities(productEntityConfig),
    withCallStatus({ ...productEntityConfig, initialValue: 'loading' }),
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
    // 👇 params become p-filter, p-page, p-pageSize, p-sortBy, p-sortDirection, p-selectedId
    withEntitiesSyncToRouteQueryParams({
      ...productEntityConfig,
      prefix: 'p',
    }),
    withEntitiesLoadingCall(
      ({ productEntitiesPagedRequest, productEntitiesFilter, productEntitiesSort },
        service = inject(ProductService)) => ({
        ...productEntityConfig,
        fetchEntities: async () => { ... },
      }),
    ),
  );
}
```

```typescript
// with-order-entities.ts
export const orderItemEntityConfig = entityConfig({
  entity: type<ProductOrder>(),
  collection: 'orderItem',
});

export function withOrderEntities() {
  return signalStoreFeature(
    withEntities(orderItemEntityConfig),
    withCallStatus({ ...orderItemEntityConfig, initialValue: 'loading' }),
    withEntitiesLocalSort({
      ...orderItemEntityConfig,
      defaultSort: { field: 'name', direction: 'asc' },
    }),
    withEntitiesLocalPagination({
      ...orderItemEntityConfig,
      pageSize: 10,
    }),
    withEntitiesSingleSelection(orderItemEntityConfig),
    // 👇 params become o-filter, o-page, o-pageSize, o-sortBy, o-sortDirection, o-selectedId
    withEntitiesSyncToRouteQueryParams({
      ...orderItemEntityConfig,
      prefix: 'o',
    }),
  );
}
```

Both collections then compose into a single store:

```typescript
export const ProductsShopStore = signalStore(
  withProductEntities(),
  withOrderEntities(),
);
```

Without `prefix` the collection name is used, which gets verbose quickly:

```
?product-filter={"search":""}&product-page=1&product-pageSize=10&product-sortBy=name&product-sortDirection=asc&orderItem-filter={"search":""}&orderItem-page=1&orderItem-pageSize=10&orderItem-sortBy=name&orderItem-sortDirection=asc
```

With `prefix: 'p'` and `prefix: 'o'` the collections keep their full names in the store while the url stays short:

```
?p-filter={"search":""}&p-page=1&p-pageSize=10&p-sortBy=name&p-sortDirection=asc&o-filter={"search":""}&o-page=1&o-pageSize=10&o-sortBy=name&o-sortDirection=asc
```

Setting `prefix: false` removes the prefix entirely, only do that when a single collection syncs to the url, otherwise the collections overwrite each other's params.

The `filter` param is usually the longest one, because the filter object is serialized with `JSON.stringify`:

```
?p-filter=%7B%22search%22%3A%22tv%22%2C%22maxPrice%22%3A100%2C%22from%22%3A%222026-08-11T00%3A00%3A00.000Z%22%7D
```

Use `filterMapper` with `getFilterQueryMapper` to spread the filter over one param per field instead. Declare each field with its type and the serialization is generated for you:

```typescript
type ProductFilter = { search: string; maxPrice: number; from: Date };

withEntitiesSyncToRouteQueryParams({
  ...productEntityConfig,
  prefix: 'p',
  // 👇 p-search=tv&p-maxPrice=100&p-from=2026-08-11
  filterMapper: getFilterQueryMapper<ProductFilter>({
    search: 'string',
    maxPrice: 'number',
    from: 'date',
  }),
}),
```

The filter type has to be given, it cannot be inferred from the store, and that is what makes the field names autocomplete and their types check. The available types are the same ones [getQueryMapperForState](/docs/traits/with-sync-to-route-query-params) uses: `'string'`, `'number'`, `'boolean'`, `'date'`, `'date-time'`, `'time'` and `'json'`.

Fields that are `undefined` or `null` are removed from the url, and a field that does not match its declared type is dropped. Keep in mind the filter is replaced rather than patched when restoring, so a hand edited url that only carries some of the fields gives a filter with only those. A url carrying none of them leaves the filter untouched.

For anything else, like renaming a field to something shorter, pass the mapper object by hand:

```typescript
withEntitiesSyncToRouteQueryParams({
  ...productEntityConfig,
  prefix: 'p',
  filterMapper: {
    // 👇 p-filter={"search":"tv"} becomes p-q=tv
    filterToQueryParams: (filter) => ({ q: filter.search }),
    queryParamsToFilter: (query) => ({ search: query.q ?? '' }),
  },
}),
```

Also consider `syncPagination: false`, `syncSort: false` or `syncSingleSelection: false` to drop the params you do not need to restore from the url.

## API Reference


| Property            | Description                                                                                                                                       | Value                                        |
|---------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------|
| entity              | The entity type                                                                                                                                   | `type<T>()`                                  |
| collection          | The name of the collection. Optional                                                                                                              | string                                       |
| prefix              | Prefix for the url query params to avoid conflicts with query param                                                                               | string. Default to the collection value      |
| filterMapper        | Configure how the entities filter is serialize to and from the query params, `getFilterQueryMapper` generates one from the filter fields           | FilterQueryMapper<Filter>                    |
| onQueryParamsLoaded | Callback to execute something else when the query params are loaded from the store                                                                | `(store) => void`                            |
| defaultDebounce     | Debounce time for syncing store changes back to the route query params                                                                            | number (milliseconds)                        |
| skipLoadingCall     | When true, restoring state from query params will update the store state but will not trigger a backend call to fetch entities. Default: false    | boolean                                      |
| syncFilter          | Sync entities filter to route query params. Default: true                                                                                         | boolean                                      |
| syncPagination      | Sync entities pagination to route query params. Default: true                                                                                     | boolean                                      |
| syncSort            | Sync entities sort to route query params. Default: true                                                                                           | boolean                                      |
| syncSingleSelection | Sync single selected entity id to route query params as `selectedId`. Default: true                                                               | boolean                                      |
| syncMultiSelection  | Sync multi selected entity ids to route query params as `selectedIds` (comma-separated). Default: false                                           | boolean                                      |

## State

Generates no extra state

## Computed

Generates no extra computed signals

## Methods

Generates no extra computed methods

