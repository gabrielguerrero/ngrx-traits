---
name: withEntitiesLoadingCall - DONE
order: 5
---

# withEntitiesLoadingCall

Generates a onInit hook that fetches entities from a remote source
when the [collection]Loading is true, by calling the fetchEntities function
and if successful, it will call set[Collection]Loaded and also set the entities
to the store using the setAllEntities method or the setEntitiesPagedResult method
if it exists (comes from withEntitiesRemotePagination),
if an error occurs it will set the error to the store using set[Collection]Error with the error.

**Kind**: global function

**Requires** withEntities and withCallStatus to be present in the store.

## Import

Import the withCalls trait from `@ngrx-traits/signals`.

```ts
import { withEntitiesLoadingCall } from '@ngrx-traits/signals';
```

## Examples

Example using withEntitiesLoadingCall with the withEntitiesRemote\* store features

```typescript
export const ProductsRemoteStore = signalStore(
  { providedIn: 'root' },
  withEntities({ entity, collection }),
  withCallStatus({ prop: collection, initialValue: 'loading' }),
  withEntitiesRemoteFilter({
    entity,
    collection,
    defaultFilter: { name: '' },
  }),
  withEntitiesRemotePagination({
    entity,
    collection,
    pageSize: 5,
    pagesToCache: 2,
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
  });
```

Example using withEntitiesLoadingCall to with the withEntitiesLocal\* store features

```typescript
export const ProductsLocalStore = signalStore(
  { providedIn: 'root' },
  withEntities({ entity, collection }),
  withCallStatus({ collection, initialValue: 'loading' }),
  withEntitiesLocalPagination({
    entity,
    collection,
    pageSize: 5,
  }),
  withEntitiesLocalFilter({
    entity,
    collection,
    defaultFilter: { search: '' },
    filterFn: (entity, filter) => !filter?.search || entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
  }),
  withEntitiesLocalSort({
    entity,
    collection,
    defaultSort: { field: 'name', direction: 'asc' },
  }),
  withEntitiesLoadingCall({
    collection,
    fetchEntities: () => {
      return inject(ProductService)
        .getProducts()
        .pipe(map((d) => d.resultList));
    },
  }),
);
```

## API Reference

This trait receives and object to allow specific configurations:

| Property      | Description                                                                                                                                 | Value                                                                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| fetchEntities | A function that fetches the entities from a remote source, the return type can be an array of entities or an object with entities and total | `(store)=> Observable<Entity[] \| { entities: Entity[] , total?:number}> \| Promise<Observable<Entity[] \| { entities: Entity[] , total?:number}>>  ` |
| collection    | Optional collection name.                                                                                                                   | string                                                                                                                                                |
| selectId      | Optional param to provide an entity id selector if different from id                                                                        | `SelectEntityId<Entity>`                                                                                                                              |
| storeResult   | Whether the result is stored as a signal or not                                                                                             | boolean                                                                                                                                               |
| mapPipe       | Rxjs pipe to use for each call. Default value: `switchMap`                                                                                  | `switchMap` \| `exhaustMap` \| `concatMap`                                                                                                            |
| onSuccess     | Callback executed after call emits value                                                                                                    | `()=> void \| (result, param: ParamType)=> void`                                                                                                      |
| mapError      | Callback to transform and give type to error                                                                                                | `(error)=> ErrorType`                                                                                                                                 |

## State

Generates no extra state

## Computed

Generates no extra computed signals

## Methods

Generates no extra methods
