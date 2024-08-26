---
name: withEntitiesRemoteScrollPagination
order: 8
---

# withEntitiesRemoteScrollPagination

Generates necessary state, computed and methods for remote infinite scroll pagination of entities in the store.
This is ideal for implementing infinite scroll where the entities cache keeps growing, or for a paginated list that only
allows going to the next and previous page because you dont know the total number of entities
probably because the data is top big and partitioned in multiple nodes.

When the page changes, it will try to load the current page from cache if it's not present,
it will call set[Collection]Loading(), and you should either create an effect that listens to is[Collection]Loading
and call the api with the [collection]PagedRequest params and use set[Collection]Result to set the result
and changing the status errors manually
or use withEntitiesLoadingCall to call the api with the [collection]PagedRequest params which handles setting
the result and errors automatically. Requires withEntities and withCallStatus to be used.

The generated set[Collection]Result method will append the entities to the cache of entities,
it requires either just set of requested entities set[Collection]Result({ entities }) in which case it will assume there is no more result if you set less entities
than the requested buffer size, or you can provide an extra param to the entities, total set[Collection]Result({ entities, total }) so it calculates if there is more
or a hasMore param set[Collection]Result({entities, hasMore}) that you can set to false to indicate the end of the entities.

**Requires** withEntities and withCallStatus to be present in the store.

## Examples

```typescript
const entityConfig = entityConfig({
  entity: type<T>(),
  collection
});

export const store = signalStore(
  // required withEntities and withCallStatus
  withEntities(entityConfig),
  withCallStatus({ prop: collection, initialValue: 'loading' }),

  withEntitiesRemoteScrollPagination({
    ...entityConfig,
    pageSize: 5,
    pagesToCache: 2,
  }),
  // after you can use withEntitiesLoadingCall to connect the filter to
  // the api call, or do it manually as shown after
   withEntitiesLoadingCall({
     ...entityConfig,
    fetchEntities: ({ productsPagedRequest }) => {
      return inject(ProductService)
        .getProducts({
          take: productsPagedRequest().size,
          skip: productsPagedRequest().startIndex,
        }).pipe(
          map((d) => ({
            entities: d.resultList,
            total: d.total,
          })),
        )
    },
  }),
// withEntitiesLoadingCall is the same as doing the following:
// withHooks(({ productsLoading, setProductsError, setProductsPagedResult, ...state }) => ({
//   onInit: async () => {
//     effect(() => {
//       if (isProductsLoading()) {
//         inject(ProductService)
//             .getProducts({
//                take: productsPagedRequest().size,
//                skip: productsPagedRequest().startIndex,
//              })
//           .pipe(
//             takeUntilDestroyed(),
//             tap((res) =>
//                 // total is not required, you can use hasMore or none see docs
//                 setProductsPagedResult({ entities: res.resultList, total: res.total } )
//             ),
//             catchError((error) => {
//               setProductsError(error);
//               return EMPTY;
//             }),
//           )
//           .subscribe();
//       }
//     });
//   },
);


```

```typescript
 // in your component add
 store = inject(ProductsRemoteStore);
 dataSource = getInfiniteScrollDataSource(store, { collection: 'products' }) // pass this to your cdkVirtualFor see examples section
// pass the dataSource to your cdkVirtualFor
```



| Property        | Description                                        | Value                                        |
|-----------------|----------------------------------------------------|----------------------------------------------|
| entity          | The entity type                                    | `type<T>()`                                  |
| collection      | The name of the collection. Optional               | string                                       |
| selectId        | The function to use to select the id of the entity | `SelectEntityId<Entity>`                                       |
| pageSize        | The number of entities to show per page            | number                                       |
| currentPage     | The current page to show                           | number                                       |
| pagesToCache    | The number of pages to cache                       | number                                       |

## State

Generates the following signals

```typescript
pagination: Signal<{ currentPage: number, requestPage: number, pageSize: 5, total: number, pagesToCache: number, cache: { start: number, end: number } }>;
```

If collection provided, the following signals are generated, example: **users**

```typescript
usersPagination: Signal<{ currentPage: number, requestPage: number, pageSize: 5, total: number, pagesToCache: number, cache: { start: number, end: number } }>;
```

## Computed

Generates the following computed signals

```typescript
entitiesCurrentPage: Signal<{ entities: Product[], pageIndex: number, total: number, pageSize: 5, pagesCount: number, hasPrevious: boolean, hasNext: boolean, isLoading: boolean }>;
entitiesPagedRequest: Signal<{ startIndex: number, size: number, page: number }>;
```

If collection provided, the following computed signals are generated, example: **users**

```typescript
usersCurrentPage: Signal<{ entities: Product[], pageIndex: number, total: number, pageSize: 5, pagesCount: number, hasPrevious: boolean, hasNext: boolean, isLoading: boolean }>;
usersPagedRequest: Signal<{ startIndex: number, size: number, page: number }>;
```

## Methods

Generates the following methods

```typescript
// loads the page and sets the requestPage to the pageIndex
loadEntitiesNextPage: () => void;
// loads previous page
loadEntitiesPreviousPage: () => void;
// loads more entities (used for infinite scroll datasource)
store.loadMoreEntities()
// appends the entities to the cache of entities sets the total
setEntitiesPagedResult:(entities: User[], total?: number, hasMore?: boolean) => void;
```

If collection provided, the following methods are generated, example: **users**

```typescript
// loads the page and sets the requestPage to the pageIndex
loadUsersNextPage: () => void;
// loads previous page
loadUsersPreviousPage: () => void;
// loads more entities (used for infinite scroll datasource)
store.loadMoreUsers()
// appends the entities to the cache of entities sets the total
setUsersPagedResult:(entities: User[], total?: number, hasMore?: boolean) => void;
```
