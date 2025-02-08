---
name: withEntitiesSyncToRouteQueryParams 
order: 17
---

Syncs entities filter, pagination, sort and single selection to route query params for local or remote entities store features. If a collection is provided, it will be used as a prefix (if non is provided) for the query params.
The prefix can be disabled by setting it to false, or changed by providing a string. The filterMapper can be used to customize how the filter object is map to a query params object,
when is not provided the filter will use JSON.stringify to serialize the filter object.

Requires withEntities and withCallStatus to be present in the store.

## Import

Import the withEntitiesSyncToRouteQueryParams trait from `@ngrx-traits/signals`.

```ts
import { withEntitiesSyncToRouteQueryParams } from '@ngrx-traits/signals';
```

## Examples

```typescript
export const ProductsRemoteStore = signalStore(
  { providedIn: 'root' },
  // requires at least withEntities and withCallStatus
  withEntities({ entity, collection }),
  withCallStatus({ prop: collection, initialValue: 'loading' }),
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
    fetchEntities: ({ productsFilter, productsPagedRequest, productsSort }) => {
      return inject(ProductService)
        .getProducts({
          search: productsFilter().name,
          take: productsPagedRequest().size,
          skip: productsPagedRequest().startIndex,
          sortColumn: productsSort().field,
          sortAscending: productsSort().direction === 'asc',
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

## API Reference


| Property            | Description                                                                       | Value                                        |
|---------------------|-----------------------------------------------------------------------------------|----------------------------------------------|
| entity              | The entity type                                                                   | `type<T>()`                                  |
| collection          | The name of the collection. Optional                                              | string                                       |
| prefix              | Prefix for the url query params to avoid conflix with query param                 | string. Default to the collection value      |
| filterMapper        | Configure how the entities filter is serialize to and from the query params       | FilterQueryMapper<Filter>                    |
| onQueryParamsLoaded | Callback to execute something else whe the query params are loaded from the store | `(store) => void`                            |
| defaultDebounce     | Debounce time for each call to the filter                                         | `(entity: T, filter: FilterType )=> boolean` |

## State

Generates no extra state

## Computed

Generates no extra computed signals

## Methods

Generates no extra computed methods

