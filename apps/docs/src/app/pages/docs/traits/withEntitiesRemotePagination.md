---
name: withEntitiesRemotePagination 
order: 7
---

# withEntitiesRemotePagination

Generates necessary state, computed and methods for remote pagination of entities in the store.
Call load[collection]Page to change the page, it will try to load the new page from cache if it's not present,
it will call set[collection]Loading(), and you should either create an effect that listens to [collection]Loading
and call the api with the [collection]PagedRequest params and use set[Collection]Result to set the result
and changing the status errors manually,
or use withEntitiesLoadingCall to call the api with the [collection]PagedRequest params which handles setting
the result and errors automatically.

In case you dont want load[collection]Page to call set[collection]Loading() (which triggers a fetchEntities), you can pass skipLoadingCall: true to load[collection]Page.
Useful in cases where you want to further change the state before manually calling set[collection]Loading() to trigger a fetch of entities.

This will keep at least the provided (pagesToCache) pages in memory, so previous pages could be removed from the cache.
If you need to keep all previous pages in memory, use withEntitiesRemoteScrollPagination instead.

**Requires** withEntities and withCallStatus to be present in the store.

```typescript
const entityConfig = entityConfig({
  entity: type<T>(),
  collection,
});

export const store = signalStore(
  withEntities(entityConfig),
  withCallStatus({ ...entityConfig, initialValue: 'loading' }),
  withEntitiesRemotePagination({
    ...entityConfig,
    pageSize: 5,
    pagesToCache: 2,
  }),
  withEntitiesLoadingCall({
    ...entityConfig,
    fetchEntities: ({ productsPagedRequest }) => {
      return inject(ProductService)
        .getProducts({
          take: productsPagedRequest().size,
          skip: productsPagedRequest().startIndex,
        })
        .pipe(
          map((d) => ({
            entities: d.resultList,
            total: d.total,
          })),
        );
    },
  }),
);
```

| Property     | Description                                        | Value                    |
| ------------ | -------------------------------------------------- | ------------------------ |
| entity       | The entity type                                    | `type<T>()`              |
| collection   | The name of the collection. Optional               | string                   |
| selectId     | The function to use to select the id of the entity | `SelectEntityId<Entity>` |
| pageSize     | The number of entities to show per page            | number                   |
| currentPage  | The current page to show                           | number                   |
| pagesToCache | The number of pages to cache                       | number                   |

## State

Generates the following signals

```typescript
pagination: Signal<{ currentPage: number; requestPage: number; pageSize: 5; total: number; pagesToCache: number; cache: { start: number; end: number } }>;
```

If collection provided, the following signals are generated, example: **users**

```typescript
usersPagination: Signal<{ currentPage: number; requestPage: number; pageSize: 5; total: number; pagesToCache: number; cache: { start: number; end: number } }>;
```

## Computed

Generates the following computed signals

```typescript
entitiesCurrentPage: Signal<{ entities: Product[]; pageIndex: number; total: number; pageSize: 5; pagesCount: number; hasPrevious: boolean; hasNext: boolean; isLoading: boolean }>;
entitiesPagedRequest: Signal<{ startIndex: number; size: number; page: number }>;
```

If collection provided, the following computed signals are generated, example: **users**

```typescript
usersCurrentPage: Signal<{ entities: Product[]; pageIndex: number; total: number; pageSize: 5; pagesCount: number; hasPrevious: boolean; hasNext: boolean; isLoading: boolean }>;
usersPagedRequest: Signal<{ startIndex: number; size: number; page: number }>;
```

## Methods

Generates the following methods

```typescript
// loads the page and sets the requestPage to the pageIndex
loadEntitiesPage: (options:{ pageIndex: number, forceLoad?: boolean, skipLoadingCall?:boolean }) => void;
// appends the entities to the cache of entities sets the total
setEntitiesPagedResult:(entities: User[], total: number) => void;
```

If collection provided, the following methods are generated, example: **users**

```typescript
// loads the page and sets the requestPage to the pageIndex
loadUsersPage: (options:{ pageIndex: number, forceLoad?: boolean, skipLoadingCall?:boolean }) => void;
// appends the entities to the cache of entities sets the total
setUsersPagedResult:(entities: User[], total: number) => void;
```
