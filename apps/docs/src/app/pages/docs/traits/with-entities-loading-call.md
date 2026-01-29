---
name: withEntitiesLoadingCall 
order: 5
---

# withEntitiesLoadingCall

Generates a onInit hook that fetches entities from a remote source
when the is[Collection]Loading is true, by calling the fetchEntities function
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
const productsEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'product',
});
export const ProductsRemoteStore = signalStore(
  { providedIn: 'root' },
  withEntities(productsEntityConfig),
  withCallStatus({ ...productsEntityConfig, initialValue: 'loading' }),
  withEntitiesRemoteFilter({
    ...productsEntityConfig,
    defaultFilter: { name: '' },
  }),
  withEntitiesRemotePagination({
    ...productsEntityConfig,
    pageSize: 5,
    pagesToCache: 2,
  }),
  withEntitiesRemoteSort({
    ...productsEntityConfig,
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
  });
```

Example using withEntitiesLoadingCall to with the withEntitiesLocal\* store features

```typescript
const productsEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'product',
});
export const ProductsLocalStore = signalStore(
  { providedIn: 'root' },
  withEntities(productsEntityConfig),
  withCallStatus({ ...productsEntityConfig, initialValue: 'loading' }),
  withEntitiesLocalPagination({
    ...productsEntityConfig,
    pageSize: 5,
  }),
  withEntitiesLocalFilter({
    ...productsEntityConfig,
    defaultFilter: { search: '' },
    filterFn: (entity, filter) => !filter?.search || entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
  }),
  withEntitiesLocalSort({
    ...productsEntityConfig,
    defaultSort: { field: 'name', direction: 'asc' },
  }),
  withEntitiesLoadingCall({
    ...productsEntityConfig,
    fetchEntities: () => {
      return inject(ProductService)
        .getProducts()
        .pipe(map((d) => d.resultList));
    },
  }),
);
```

To know more how it mixes and works with other local store features, check [Working with Entities](/docs/getting-started/working-with-entities) section.

## API Reference

This trait receives and object to allow specific configurations:

| Property      | Description                                                                                                                                 | Value                                                                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| fetchEntities | A function that fetches the entities from a remote source, the return type can be an array of entities or an object with entities and total | `(store)=> Observable<Entity[] \| { entities: Entity[] , total?:number}> \| Promise<Observable<Entity[] \| { entities: Entity[] , total?:number}>>  ` |
| collection    | Optional collection name.                                                                                                                   | string                                                                                                                                                |
| selectId      | Optional param to provide an entity id selector if different from id                                                                        | `SelectEntityId<Entity>`                                                                                                                              |
| storeResult   | Whether to automatically store the fetched entities (default: `true`). When `false`, entities are not stored but `setLoaded` and `onSuccess` are still called, useful when you want to handle storing in `onSuccess` yourself | `boolean`                                                                                                                                             |
| mapPipe       | Rxjs pipe to use for each call. Default value: `switchMap`                                                                                  | `switchMap` \| `exhaustMap` \| `concatMap`                                                                                                            |
| onSuccess     | Callback executed after call emits value                                                                                                    | `()=> void \| (result, param: ParamType)=> void`                                                                                                      |
| mapError      | Callback to transform and give type to error                                                                                                | `(error)=> ErrorType`                                                                                                                                 |

## State

Generates no extra state

## Computed

Generates no extra computed signals

## Methods

Generates no extra methods
