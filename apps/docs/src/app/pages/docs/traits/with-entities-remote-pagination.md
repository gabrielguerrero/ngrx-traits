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


## Examples

### Paginating a list of entities
In this example we have a list of products and we want to paginate them, we will use the pageSize prop to set the initial page size.

```typescript
const entityConfig = entityConfig({
  entity: type<T>(),
  collection: 'products'
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
Now we use it in a component, the generated usersCurrentPage signal will provide the entities for the current page, the pageIndex and the total number of entities:

```html
@for (user of store.productsCurrentPage.entities(); track user.id){
  {{ user.name }}
}
<mat-paginator
  [pageSizeOptions]="[5, 10, 25, 100]"
  [length]="store.productsCurrentPage.total()"
  [pageSize]="store.productsCurrentPage.pageSize()"
  [pageIndex]="store.productsCurrentPage.pageIndex()"
  (page)="store.loadProductsPage($event)"
></mat-paginator>
```

## Mixing with other remote store features
You can mix this feature with other remote store features like withEntitiesRemoteSort, withEntitiesRemoteFilter, etc.


```typescript
const productsStoreFeature = signalStoreFeature(
  withEntities({
    entity: productsEntity,
    collection: productsCollection,
  }),
  withCallStatus({
    initialValue: 'loading',
    collection: productsCollection,
    errorType: type<string>(),
  }),
  withEntitiesRemoteFilter({
    entity: productsEntity,
    collection: productsCollection,
    defaultFilter: { search: '' },
  }),
  withEntitiesRemotePagination({
    entity: productsEntity,
    collection: productsCollection,
    pageSize: 10,
  }),
  withEntitiesRemoteSort({
    entity: productsEntity,
    collection: productsCollection,
    defaultSort: { field: 'name', direction: 'asc' },
  }),
  withEntitiesLoadingCall(
    ({ productsPagedRequest, productsFilter, productsSort }) => ({
      collection: productsCollection,
      fetchEntities: async () => {
        const res = await lastValueFrom(
          inject(ProductService).getProducts({
            search: productsFilter().search,
            skip: productsPagedRequest().startIndex,
            take: productsPagedRequest().size,
            sortAscending: productsSort().direction === 'asc',
            sortColumn: productsSort().field,
          }),
        );
        return { entities: res.resultList, total: res.total };
      },
    }),
  ),
);
```
To know more how it mixes and works with other local store features, check [Working with Entities](/docs/getting-started/working-with-entities) section.

## API Reference
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
