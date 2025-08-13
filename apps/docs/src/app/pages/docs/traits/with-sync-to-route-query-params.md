---
name: withSyncToRouteQueryParams 
order: 18
---

# withSyncToRouteQueryParams

Syncs the route query params with the store and back. On init it will load
the query params once and set them in the store using the mapper.queryParamsToState, after that
and change on the store will be reflected in the query params using the mapper.stateToQueryParams

## Import

Import the withSyncToRouteQueryParams trait from `@ngrx-traits/signals`.

```ts
import { withSyncToRouteQueryParams } from '@ngrx-traits/signals';
```

## Examples
### Sync the store with the route query params
```typescript
    const Store = signalStore(
      withState({
        test: 'test',
        foo: 'foo',
        bar: false,
      }),
      withSyncToRouteQueryParams({
        mappers: [
          {
            queryParamsToState: (query, store) => {
            // set the query params in the store (only called once on init)
              patchState(store, {
                test: query.test,
                foo: query.foo,
                bar: query.bar === 'true',
              });
            },
            stateToQueryParams: (store) =>
              // return the query params to be set in the route
              computed(() => ({
                test: store.test(),
                foo: store.foo(),
                bar: store.bar().toString(),
              })),
          },
        ],
        defaultDebounce: debounce,
      }),
    );
```

## API Reference

| Property        | Description                                                                   | Value                                        |
|-----------------|-------------------------------------------------------------------------------|----------------------------------------------|
| mappers         | Query Mappers to transform one or more query parameters from and to the state | QueryMapper[]                                |
| defaultDebounce | Debounce time for each call to the filter                                     | `(entity: T, filter: FilterType )=> boolean` |

## State

Generates no extra state

## Computed

Generates no extra computed signals

## Methods

Generates no extra computed methods
