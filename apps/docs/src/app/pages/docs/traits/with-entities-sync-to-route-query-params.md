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
const productEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'product',
});

export const ProductsRemoteStore = signalStore(
  { providedIn: 'root' },
  // requires at least withEntities and withCallStatus
  withEntities(productEntityConfig),
  withCallStatus(productEntityConfig, { initialValue: 'loading' }),
  withEntitiesRemoteFilter(productEntityConfig, {
    defaultFilter: { name: '' },
  }),
  withEntitiesRemotePagination(productEntityConfig),
  withEntitiesRemoteSort(productEntityConfig, {
    defaultSort: { field: 'name', direction: 'asc' },
  }),
  withEntitiesLoadingCall(productEntityConfig, ({ productEntitiesFilter, productEntitiesPagedRequest, productEntitiesSort }) => ({
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
  })),
  // syncs the entities filter, pagination, sort and single selection to the route query params
  withEntitiesSyncToRouteQueryParams(productEntityConfig)
);
```

### Syncing with multi selection

Use `syncMultiSelection: true`  when using `withEntitiesMultiSelection`. Selected ids are serialized as a comma-separated `selectedIds` query param.

```typescript
const productEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'product',
});

export const ProductsLocalStore = signalStore(
  { providedIn: 'root' },
  withEntities(productEntityConfig),
  withCallStatus(productEntityConfig, { initialValue: 'loading' }),
  withEntitiesMultiSelection(productEntityConfig),
  withEntitiesLoadingCall(productEntityConfig, { ... }),
  withEntitiesSyncToRouteQueryParams(productEntityConfig, {
    syncMultiSelection: true,
  }),
);
```

### Two collections, with a short prefix

You can sync more than one collection in the same store, each `withEntitiesSyncToRouteQueryParams` prefixes its own query params so the two never collide.

When you have multiple collections, group each one into its own custom store feature (or give it its own store) instead of listing every feature of both collections directly in one `signalStore`. It keeps each collection readable and reusable on its own. It also avoids the feature limit: `signalStore` accepts up to 15 features, and a fully configured collection already uses about 8 of them, so two collections would not fit.

Use `entityConfig` to declare the entity and collection once, then pass it as the first argument to every feature for that collection.

```typescript
// with-product-entities.ts
export const productEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'product',
});

export function withProductEntities() {
  return signalStoreFeature(
    withEntities(productEntityConfig),
    withCallStatus(productEntityConfig, { initialValue: 'loading' }),
    withEntitiesRemoteFilter(productEntityConfig, {
      defaultFilter: { search: '' },
    }),
    withEntitiesRemotePagination(productEntityConfig, {
      pageSize: 10,
    }),
    withEntitiesRemoteSort(productEntityConfig, {
      defaultSort: { field: 'name', direction: 'asc' },
    }),
    withEntitiesSingleSelection(productEntityConfig),
    // 👇 params become p-filter, p-page, p-pageSize, p-sortBy, p-sortDirection, p-selectedId
    withEntitiesSyncToRouteQueryParams(productEntityConfig, {
      prefix: 'p',
    }),
    withEntitiesLoadingCall(
      productEntityConfig,
      ({ productEntitiesPagedRequest, productEntitiesFilter, productEntitiesSort },
        service = inject(ProductService)) => ({
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
    withCallStatus(orderItemEntityConfig, { initialValue: 'loading' }),
    withEntitiesLocalSort(orderItemEntityConfig, {
      defaultSort: { field: 'name', direction: 'asc' },
    }),
    withEntitiesLocalPagination(orderItemEntityConfig, {
      pageSize: 10,
    }),
    withEntitiesSingleSelection(orderItemEntityConfig),
    // 👇 params become o-filter, o-page, o-pageSize, o-sortBy, o-sortDirection, o-selectedId
    withEntitiesSyncToRouteQueryParams(orderItemEntityConfig, {
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

withEntitiesSyncToRouteQueryParams(productEntityConfig, {
  prefix: 'p',
  // 👇 p-search=tv&p-maxPrice=100&p-from=2026-08-11
  filterMapper: getFilterQueryMapper<ProductFilter>({
    search: 'string',
    maxPrice: 'number',
    from: 'date',
  }),
}),
```

The filter type has to be given, it cannot be inferred from the store, and that is what makes the field names autocomplete and their types check. The available types are the same ones [getQueryMapperForState](/docs/traits/with-sync-to-route-query-params) uses: `'string'`, `'number'`, `'boolean'`, `'date'`, `'date-time'`, `'time'`, `'string-array'`, `'number-array'` and `'json'`. The same caveat applies to `'string-array'`, a field whose values can carry a comma has to be declared as `'json'`, since the comma is what separates the entries.

A field holding an object can be described field by field too, with a nested props object, which gives it one param per leaf named with the path to it:

```typescript
type ProductFilter = { search: string; range: { from: Date; to: Date } };

withEntitiesSyncToRouteQueryParams(productEntityConfig, {
  prefix: 'p',
  // 👇 p-search=tv&p-range.from=2026-08-11&p-range.to=2026-08-31
  filterMapper: getFilterQueryMapper<ProductFilter>({
    search: 'string',
    range: { from: 'date', to: 'date' },
  }),
}),
```

Fields that are `undefined` or `null` are removed from the url. On the way back the generated mapper patches the filter instead of replacing it, so the fields it does not declare keep the value they have, at the top level and inside a declared object alike.

Every declared field is restored, and one whose param is missing from the url, or does not match its declared type, falls back to the value it has in `defaultFilter` rather than being left empty, which is what makes a bare url restore the declared fields to their defaults instead of leaving the filter alone. When `defaultFilter` says nothing about the field, the value the filter already holds is kept instead of emptying it.

The flip side is that a field cannot travel as cleared unless its default already is, restoring a url without its param brings the default back rather than an empty value.

For anything else, like renaming a field to something shorter, pass the mapper object by hand:

```typescript
withEntitiesSyncToRouteQueryParams(productEntityConfig, {
  prefix: 'p',
  filterMapper: {
    // 👇 p-filter={"search":"tv"} becomes p-q=tv
    filterToQueryParams: (filter) => ({ q: filter.search }),
    queryParamsToFilter: (query) => ({ search: query.q ?? '' }),
  },
}),
```

`queryParamsToFilter` also receives the store `defaultFilter` and the filter the store holds right now, `(query, defaultFilter, currentFilter)`, to fall back on for what the url does not carry, and it can return `undefined` to leave the filter alone. Set `patch: true` on the mapper when it only maps some of the fields, so the rest are merged instead of replaced.

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

