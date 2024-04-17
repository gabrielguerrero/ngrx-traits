## Functions

<dl>
<dt><a href="#withCallStatus">withCallStatus(config)</a></dt>
<dd><p>Generates necessary state, computed and methods for call progress status to the store</p></dd>
<dt><a href="#withCalls">withCalls(callsFactory)</a></dt>
<dd><p>Generates necessary state, computed and methods to track the progress of the call
and store the result of the call</p></dd>
<dt><a href="#withEntitiesLocalFilter">withEntitiesLocalFilter(config)</a></dt>
<dd><p>Generates necessary state, computed and methods for locally filtering entities in the store,
the generated filter[collenction]Entities method will filter the entities based on the filter function
and is debounced by default. Requires withEntities to be used.</p></dd>
<dt><a href="#withEntitiesRemoteFilter">withEntitiesRemoteFilter(config)</a></dt>
<dd><p>Generates necessary state, computed and methods for remotely filtering entities in the store,
the generated filter[collection]Entities method will filter the entities by calling set[collection]Loading()
and you should either create an effect that listens toe [collection]Loading can call the api with the [collection]Filter params
or use withEntitiesLoadingCall to call the api with the [collection]Filter params
and is debounced by default. Requires withEntities and withCallStatus to be present before this function.</p></dd>
<dt><a href="#withEntitiesLoadingCall">withEntitiesLoadingCall(config)</a></dt>
<dd><p>Generates a onInit hook that fetches entities from a remote source
when the [collection]Loading is true, by calling the fetchEntities function
and if successful, it will call set[Collection]Loaded and also set the entities
to the store using the setAllEntities method or the setEntitiesLoadResult method
if it exists (comes from withEntitiesRemotePagination),
if an error occurs it will set the error to the store using set[Collection]Error with the error.
Requires withEntities and withCallStatus to be present in the store.</p></dd>
<dt><a href="#withEntitiesLocalPagination">withEntitiesLocalPagination(config)</a></dt>
<dd><p>Generates necessary state, computed and methods for local pagination of entities in the store.
Requires withEntities to be present in the store.</p></dd>
<dt><a href="#withEntitiesRemotePagination">withEntitiesRemotePagination(config)</a></dt>
<dd><p>Generates necessary state, computed and methods for remote pagination of entities in the store.
When the page changes, it will try to load the current page from cache if it's not present,
it will call set[collection]Loading(), and you should either create an effect that listens to [collection]Loading
and call the api with the [collection]PagedRequest params and use set[Collection]LoadResult to set the result
and changing the status errors manually
or use withEntitiesLoadingCall to call the api with the [collection]PagedRequest params which handles setting
the result and errors automatically. Requires withEntities and withCallStatus to be used.
Requires withEntities and withCallStatus to be present in the store.</p></dd>
<dt><a href="#withEntitiesRemoteScrollPagination">withEntitiesRemoteScrollPagination(config)</a></dt>
<dd><p>Generates necessary state, computed and methods for remote infinite scroll pagination of entities in the store. The
different between this and withEntitiesRemotePagination this will can only got to next and previous page, and the cache
of entities keeps growing, ideally for implementing infinite scroll style ui.
When the page changes, it will try to load the current page from cache if it's not present,
it will call set[collection]Loading(), and you should either create an effect that listens to is[Collection]Loading
and call the api with the [collection]PagedRequest params and use set[Collection]LoadResult to set the result
and changing the status errors manually
or use withEntitiesLoadingCall to call the api with the [collection]PagedRequest params which handles setting
the result and errors automatically. Requires withEntities and withCallStatus to be used.
Requires withEntities and withCallStatus to be present in the store.</p></dd>
<dt><a href="#withEntitiesMultiSelection">withEntitiesMultiSelection(config)</a></dt>
<dd><p>Generates state, signals and methods for multi selection of entities</p></dd>
<dt><a href="#withEntitiesSingleSelection">withEntitiesSingleSelection(config)</a></dt>
<dd><p>Generates state, computed and methods for single selection of entities. Requires withEntities to be present before this function.</p></dd>
<dt><a href="#withEntitiesLocalSort">withEntitiesLocalSort(config)</a></dt>
<dd><p>Generates necessary state, computed and methods for sorting locally entities in the store. Requires withEntities to be present before this function</p></dd>
<dt><a href="#withEntitiesRemoteSort">withEntitiesRemoteSort(config)</a></dt>
<dd><p>Generates state, signals, and methods to sort entities remotely. When the sort method is called it will store the sort
and call set[Collection]Loading, and you should either create an effect that listens to [collection]Loading
and call the api with the [collection]Sort params and use wither setAllEntities if is not paginated or set[Collection]LoadResult if is paginated
with the sorted result that come from the backend, plus changing the status  and set errors is needed.
or use withEntitiesLoadingCall to call the api with the [collection]Sort params which handles setting
the result and errors automatically. Requires withEntities and withCallStatus to be present before this function.</p></dd>
<dt><a href="#withLogger">withLogger(name)</a></dt>
<dd><p>Log the state of the store on every change</p></dd>
<dt><a href="#withSyncToWebStorage">withSyncToWebStorage(key, type, saveStateChangesAfterMs, restoreOnInit)</a></dt>
<dd><p>Sync the state of the store to the web storage</p></dd>
</dl>

<a name="withCallStatus"></a>

## withCallStatus(config)
<p>Generates necessary state, computed and methods for call progress status to the store</p>

**Kind**: global function  

| Param | Description |
| --- | --- |
| config | <p>Configuration object</p> |
| config.prop | <p>The name of the property for which this represents the call status</p> |
| config.initialValue | <p>The initial value of the call status</p> |
| config.collection | <p>The name of the collection for which this represents the call status is an alias to prop param they do the same thing</p> <p>prop or collection is required</p> |

**Example**  
```js
const store = signalStore(
 withCallStatus({ prop: 'users', })
 // other valid configurations
 // withCallStatus()
 // withCallStatus({ collection: 'users', initialValue: 'loading' })
 )

 // generates the following signals
 store.usersCallStatus // 'init' | 'loading' | 'loaded' | { error: unknown }
 // generates the following computed signals
 store.isUsersLoading // boolean
 store.isUsersLoaded // boolean
 store.usersError // unknown | null
 // generates the following methods
 store.setUsersLoading // () => void
 store.setUsersLoaded // () => void
 store.setUsersError // (error?: unknown) => void
```
<a name="withCalls"></a>

## withCalls(callsFactory)
<p>Generates necessary state, computed and methods to track the progress of the call
and store the result of the call</p>

**Kind**: global function  

| Param |
| --- |
| callsFactory | 

**Example**  
```js
withCalls(({ productsSelectedEntity }) => ({
    loadProductDetail: {
      call: ({ id }: { id: string }) =>
        inject(ProductService).getProductDetail(id),
      resultProp: 'productDetail',
    },
    checkout: () =>
      inject(OrderService).checkout({
        productId: productsSelectedEntity()!.id,
        quantity: 1,
      }),
  })),

  // generates the following signals
  store.loadProductDetailCallStatus // 'init' | 'loading' | 'loaded' | { error: unknown }
  store.productDetail // the result of the call
  store.checkoutCallStatus // 'init' | 'loading' | 'loaded' | { error: unknown }
  store.checkoutResult // the result of the call
  // generates the following computed signals
  store.isLoadProductDetailLoading // boolean
  store.isLoadProductDetailLoaded // boolean
  store.loadProductDetailError // string | null
  store.isCheckoutLoading // boolean
  store.isCheckoutLoaded // boolean
  store.checkoutError // string | null
  // generates the following methods
  store.loadProductDetail // ({id: string}) => void
  store.checkout // () => void
```
<a name="withEntitiesLocalFilter"></a>

## withEntitiesLocalFilter(config)
<p>Generates necessary state, computed and methods for locally filtering entities in the store,
the generated filter[collenction]Entities method will filter the entities based on the filter function
and is debounced by default. Requires withEntities to be used.</p>

**Kind**: global function  

| Param | Description |
| --- | --- |
| config |  |
| config.filterFn | <p>The function that will be used to filter the entities</p> |
| config.defaultFilter | <p>The default filter to be used</p> |
| config.entity | <p>The entity tye to be used</p> |
| config.collection | <p>The optional collection name to be used</p> |

**Example**  
```js
const entity = type<Product>();
const collection = 'products';
const store = signalStore(
  { providedIn: 'root' },
  // requires withEntities to be used
  withEntities({ entity, collection }),

  withEntitiesLocalFilter({
    entity,
    collection,
    defaultFilter: { search: '' },
    filterFn: (entity, filter) =>
      !filter?.search || // if there is no search term return all entities
      entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
  }),
 );

// generates the following signals
 store.productsFilter // { search: string }
 // generates the following computed signals
 store.isProductsFilterChanged // boolean
 // generates the following methods
 store.filterProductsEntities  // (options: { filter: { search: string }, debounce?: number, patch?: boolean, forceLoad?: boolean }) => void
 store.resetProductsFilter  // () => void
```
<a name="withEntitiesRemoteFilter"></a>

## withEntitiesRemoteFilter(config)
<p>Generates necessary state, computed and methods for remotely filtering entities in the store,
the generated filter[collection]Entities method will filter the entities by calling set[collection]Loading()
and you should either create an effect that listens toe [collection]Loading can call the api with the [collection]Filter params
or use withEntitiesLoadingCall to call the api with the [collection]Filter params
and is debounced by default. Requires withEntities and withCallStatus to be present before this function.</p>

**Kind**: global function  

| Param | Description |
| --- | --- |
| config |  |
| config.defaultFilter | <p>The default filter to be used</p> |
| config.entity | <p>The entity type to be used</p> |
| config.collection | <p>The optional collection name to be used</p> |

**Example**  
```js
const entity = type<Product>();
const collection = 'products';
export const store = signalStore(
  { providedIn: 'root' },
  // requires withEntities and withCallStatus to be used
  withEntities({ entity, collection }),
  withCallStatus({ prop: collection, initialValue: 'loading' }),

  withEntitiesRemoteFilter({
    entity,
    collection,
    defaultFilter: { name: '' },
  }),
  // after you can use withEntitiesLoadingCall to connect the filter to
  // the api call, or do it manually as shown after
   withEntitiesLoadingCall({
    collection,
    fetchEntities: ({ productsFilter }) => {
      return inject(ProductService)
        .getProducts({
          search: productsFilter().name,
        })
    },
  }),
// withEntitiesLoadingCall is the same as doing the following:
// withHooks(({ productsLoading, setProductsError, ...state }) => ({
//   onInit: async () => {
//     effect(() => {
//       if (isProductsLoading()) {
//         inject(ProductService)
//              .getProducts({
//                 search: productsFilter().name,
//               })
//           .pipe(
//             takeUntilDestroyed(),
//             tap((res) =>
//               patchState(
//                 state,
//                 setAllEntities(res.resultList, { collection: 'products' }),
//               ),
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
 })),
// generates the following signals
 store.productsFilter // { search: string }
 // generates the following computed signals
 store.isProductsFilterChanged // boolean
 // generates the following methods
 store.filterProductsEntities  // (options: { filter: { search: string }, debounce?: number, patch?: boolean, forceLoad?: boolean }) => void
 store.resetProductsFilter  // () => void
```
<a name="withEntitiesLoadingCall"></a>

## withEntitiesLoadingCall(config)
<p>Generates a onInit hook that fetches entities from a remote source
when the [collection]Loading is true, by calling the fetchEntities function
and if successful, it will call set[Collection]Loaded and also set the entities
to the store using the setAllEntities method or the setEntitiesLoadResult method
if it exists (comes from withEntitiesRemotePagination),
if an error occurs it will set the error to the store using set[Collection]Error with the error.
Requires withEntities and withCallStatus to be present in the store.</p>

**Kind**: global function  

| Param | Description |
| --- | --- |
| config | <p>Configuration object</p> |
| config.fetchEntities | <p>A function that fetches the entities from a remote source the return type</p> |
| config.collection | <p>The collection name can be an array of entities or an object with entities and total</p> |

**Example**  
```js
export const ProductsRemoteStore = signalStore(
  { providedIn: 'root' },
  // requires at least withEntities and withCallStatus
  withEntities({ entity, collection }),
  withCallStatus({ prop: collection, initialValue: 'loading' }),
  // other features
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
  // now we add the withEntitiesLoadingCall, in this case any time the filter,
  // pagination or sort changes they call set[Collection]Loading() which then
  // triggers the onInit effect that checks if [collection]Loading(), if true
  // then calls fetchEntities function
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
```
<a name="withEntitiesLocalPagination"></a>

## withEntitiesLocalPagination(config)
<p>Generates necessary state, computed and methods for local pagination of entities in the store.
Requires withEntities to be present in the store.</p>

**Kind**: global function  

| Param | Description |
| --- | --- |
| config |  |
| config.pageSize | <p>The number of entities to show per page</p> |
| config.currentPage | <p>The current page to show</p> |
| config.entity | <p>The entity type</p> |
| config.collection | <p>The name of the collection</p> |

**Example**  
```js
const entity = type<Product>();
const collection = 'products';
export const ProductsLocalStore = signalStore(
  { providedIn: 'root' },
  // required withEntities
  withEntities({ entity, collection }),
  withEntitiesLocalPagination({
    entity,
    collection,
    pageSize: 5,
  }),

  // generates the following signals
  store.productsPagination // { currentPage: 0, pageSize: 5 }
  // generates the following computed signals
  store.productsCurrentPage // { entities: Product[], pageIndex: 0, total: 10, pageSize: 5, pagesCount: 2, hasPrevious: false, hasNext: true }
  // generates the following methods
  store.loadProductsPage // ({ pageIndex: number }) => void
```
<a name="withEntitiesRemotePagination"></a>

## withEntitiesRemotePagination(config)
<p>Generates necessary state, computed and methods for remote pagination of entities in the store.
When the page changes, it will try to load the current page from cache if it's not present,
it will call set[collection]Loading(), and you should either create an effect that listens to [collection]Loading
and call the api with the [collection]PagedRequest params and use set[Collection]LoadResult to set the result
and changing the status errors manually
or use withEntitiesLoadingCall to call the api with the [collection]PagedRequest params which handles setting
the result and errors automatically. Requires withEntities and withCallStatus to be used.
Requires withEntities and withCallStatus to be present in the store.</p>

**Kind**: global function  

| Param | Description |
| --- | --- |
| config |  |
| config.pageSize | <p>The number of entities to show per page</p> |
| config.currentPage | <p>The current page to show</p> |
| config.pagesToCache | <p>The number of pages to cache</p> |
| config.entity | <p>The entity type</p> |
| config.collection | <p>The name of the collection</p> |

**Example**  
```js
const entity = type<Product>();
const collection = 'products';
export const store = signalStore(
  { providedIn: 'root' },
  // required withEntities and withCallStatus
  withEntities({ entity, collection }),
  withCallStatus({ prop: collection, initialValue: 'loading' }),

  withEntitiesRemotePagination({
    entity,
    collection,
    pageSize: 5,
    pagesToCache: 2,
  })
  // after you can use withEntitiesLoadingCall to connect the filter to
  // the api call, or do it manually as shown after
   withEntitiesLoadingCall({
    collection,
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
// withHooks(({ productsLoading, setProductsError, setProductsLoadResult, ...state }) => ({
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
//               patchState(
//                 state,
//                 setProductsLoadResult(res.resultList, res.total),
//               ),
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
 })),
  // generates the following signals
  store.productsPagination // { currentPage: number, requestPage: number, pageSize: 5, total: number, pagesToCache: number, cache: { start: number, end: number } } used internally
 // generates the following computed signals
 store.productsCurrentPage // { entities: Product[], pageIndex: number, total: number, pageSize: 5, pagesCount: number, hasPrevious: boolean, hasNext: boolean, loading: boolean }
 store.productsPagedRequest // { startIndex: number, size: number, page: number }
 // generates the following methods
 store.loadProductsPage({ pageIndex: number, forceLoad?: boolean }) // loads the page and sets the requestPage to the pageIndex
 store.setProductsLoadResult(entities: Product[], total: number) // appends the entities to the cache of entities and total
```
<a name="withEntitiesRemoteScrollPagination"></a>

## withEntitiesRemoteScrollPagination(config)
<p>Generates necessary state, computed and methods for remote infinite scroll pagination of entities in the store. The
different between this and withEntitiesRemotePagination this will can only got to next and previous page, and the cache
of entities keeps growing, ideally for implementing infinite scroll style ui.
When the page changes, it will try to load the current page from cache if it's not present,
it will call set[collection]Loading(), and you should either create an effect that listens to is[Collection]Loading
and call the api with the [collection]PagedRequest params and use set[Collection]LoadResult to set the result
and changing the status errors manually
or use withEntitiesLoadingCall to call the api with the [collection]PagedRequest params which handles setting
the result and errors automatically. Requires withEntities and withCallStatus to be used.
Requires withEntities and withCallStatus to be present in the store.</p>

**Kind**: global function  

| Param | Description |
| --- | --- |
| config |  |
| config.pageSize | <p>The number of entities to show per page</p> |
| config.pagesToCache | <p>The number of pages to cache</p> |
| config.entity | <p>The entity type</p> |
| config.collection | <p>The name of the collection</p> |

**Example**  
```js
const entity = type<Product>();
const collection = 'products';
export const store = signalStore(
  { providedIn: 'root' },
  // required withEntities and withCallStatus
  withEntities({ entity, collection }),
  withCallStatus({ prop: collection, initialValue: 'loading' }),

  withEntitiesRemoteScrollPagination({
    entity,
    collection,
    pageSize: 5,
    pagesToCache: 2,
  })
  // after you can use withEntitiesLoadingCall to connect the filter to
  // the api call, or do it manually as shown after
   withEntitiesLoadingCall({
    collection,
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
// withHooks(({ productsLoading, setProductsError, setProductsLoadResult, ...state }) => ({
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
//               patchState(
//                 state,
//                 setProductsLoadResult(res.resultList, res.total),
//               ),
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
 })),

 // in your component add
 store = inject(ProductsRemoteStore);
 dataSource = getInfiniteScrollDataSource(store, { collecrion: 'products' }) // pass this to your cdkVirtualFor see examples section
  // generates the following signals
  store.productsPagination // { currentPage: number, requestPage: number, pageSize: 5, total: number, pagesToCache: number, cache: { start: number, end: number } } used internally
 // generates the following computed signals
 store.productsPageInfo // {  pageIndex: number, total: number, pageSize: 5, pagesCount: number, hasPrevious: boolean, hasNext: boolean, loading: boolean }
 store.productsPagedRequest // { startIndex: number, size: number, page: number }
 // generates the following methods
 store.loadProductsNextPage() // loads next page
 store.loadProductsPreviousPage() // loads previous page
 store.loadProductsFirstPage() // loads first page
 store.setProductsLoadResult(entities: Product[], total: number) // appends the entities to the cache of entities and total
```
<a name="withEntitiesMultiSelection"></a>

## withEntitiesMultiSelection(config)
<p>Generates state, signals and methods for multi selection of entities</p>

**Kind**: global function  

| Param | Description |
| --- | --- |
| config |  |
| config.entity | <p>the entity type</p> |
| config.collection | <p>the collection name</p> |

**Example**  
```js
const entity = type<Product>();
const collection = 'products';
export const store = signalStore(
  { providedIn: 'root' },
  withEntities({ entity, collection }),
  withEntitiesMultiSelection({ entity, collection }),
  );

// generates the following signals
store.productsSelectedIdsMap // Record<string | number, boolean>;
// generates the following computed signals
store.productsSelectedEntities // Entity[];
store.isAllProductsSelected // 'all' | 'none' | 'some';
// generates the following methods
store.selectProducts // (config: { id: string | number } | { ids: (string | number)[] }) => void;
store.deselectProducts // (config: { id: string | number } | { ids: (string | number)[] }) => void;
store.toggleSelectProducts // (config: { id: string | number } | { ids: (string | number)[] }) => void;
store.toggleSelectAllProducts // () => void;
```
<a name="withEntitiesSingleSelection"></a>

## withEntitiesSingleSelection(config)
<p>Generates state, computed and methods for single selection of entities. Requires withEntities to be present before this function.</p>

**Kind**: global function  

| Param | Description |
| --- | --- |
| config |  |
| config.collection | <p>The collection name</p> |
| config.entity | <p>The entity type</p> |

**Example**  
```js
const entity = type<Product>();
const collection = 'products';
export const store = signalStore(
  { providedIn: 'root' },
  // Required withEntities and withCallStatus
  withEntities({ entity, collection }),
  withCallStatus({ prop: collection, initialValue: 'loading' }),

  withEntitiesSingleSelection({
    entity,
    collection,
  }),
 );

 // generates the following signals
 store.productsSelectedId // string | number | undefined
 // generates the following computed signals
 store.productsSelectedEntity // Entity | undefined
 // generates the following methods
 store.selectProductEntity // (config: { id: string | number }) => void
 store.deselectProductEntity // (config: { id: string | number }) => void
 store.toggleProductEntity // (config: { id: string | number }) => void
```
<a name="withEntitiesLocalSort"></a>

## withEntitiesLocalSort(config)
<p>Generates necessary state, computed and methods for sorting locally entities in the store. Requires withEntities to be present before this function</p>

**Kind**: global function  

| Param | Description |
| --- | --- |
| config |  |
| config.defaultSort | <p>The default sort to be applied to the entities</p> |
| config.entity | <p>The type entity to be used</p> |
| config.collection | <p>The name of the collection for which will be sorted</p> |

**Example**  
```js
const entity = type<Product>();
const collection = 'products';
export const store = signalStore(
  { providedIn: 'root' },
  withEntities({ entity, collection }),
  withEntitiesLocalSort({
    entity,
    collection,
    defaultSort: { field: 'name', direction: 'asc' },
  }),
);
// generates the following signals
store.productsSort - the current sort applied to the products
// generates the following methods
store.sortProductsEntities({ sort: { field: 'name', direction: 'asc' } }) - sorts the products entities
```
<a name="withEntitiesRemoteSort"></a>

## withEntitiesRemoteSort(config)
<p>Generates state, signals, and methods to sort entities remotely. When the sort method is called it will store the sort
and call set[Collection]Loading, and you should either create an effect that listens to [collection]Loading
and call the api with the [collection]Sort params and use wither setAllEntities if is not paginated or set[Collection]LoadResult if is paginated
with the sorted result that come from the backend, plus changing the status  and set errors is needed.
or use withEntitiesLoadingCall to call the api with the [collection]Sort params which handles setting
the result and errors automatically. Requires withEntities and withCallStatus to be present before this function.</p>

**Kind**: global function  

| Param | Description |
| --- | --- |
| config |  |
| config.defaultSort | <p>The default sort to use when the store is initialized</p> |
| config.entity | <p>The entity type</p> |
| config.collection | <p>The collection name</p> |

**Example**  
```js
const entity = type<Product>();
const collection = 'products';
export const store = signalStore(
  { providedIn: 'root' },
  // required withEntities and withCallStatus
  withEntities({ entity, collection }),
  withCallStatus({ prop: collection, initialValue: 'loading' }),

  withEntitiesRemoteSort({
    entity,
    collection,
    defaultSort: { field: 'name', direction: 'asc' },
  }),
  // after you can use withEntitiesLoadingCall to connect the filter to
  // the api call, or do it manually as shown after
   withEntitiesLoadingCall({
    collection,
    fetchEntities: ({ productsSort }) => {
      return inject(ProductService)
        .getProducts({
          sortColumn: productsSort().field,
          sortAscending: productsSort().direction === 'asc',
        })
    },
  }),
// withEntitiesLoadingCall is the same as doing the following:
// withHooks(({ productsSort, productsLoading, setProductsError, ...state }) => ({
//   onInit: async () => {
//     effect(() => {
//       if (isProductsLoading()) {
//         inject(ProductService)
//             .getProducts({
//                 sortColumn: productsSort().field,
//                 sortAscending: productsSort().direction === 'asc',
//              })
//           .pipe(
//             takeUntilDestroyed(),
//             tap((res) =>
//               patchState(
//                 state,
//                 setAllEntities(res.resultList, { collection: 'products' }),
//               ),
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
 })),

// generate the following signals
store.productsSort // the current sort
// and the following methods
store.sortProductsEntities // (options: { sort: Sort<Entity>; }) => void;
```
<a name="withLogger"></a>

## withLogger(name)
<p>Log the state of the store on every change</p>

**Kind**: global function  

| Param | Description |
| --- | --- |
| name | <p>The name of the store to log</p> |

<a name="withSyncToWebStorage"></a>

## withSyncToWebStorage(key, type, saveStateChangesAfterMs, restoreOnInit)
<p>Sync the state of the store to the web storage</p>

**Kind**: global function  

| Param | Description |
| --- | --- |
| key | <p>the key to use in the web storage</p> |
| type | <p>'session' or 'local' storage</p> |
| saveStateChangesAfterMs | <p>save the state to the storage after this many milliseconds, 0 to disable</p> |
| restoreOnInit | <p>restore the state from the storage on init</p> |

**Example**  
```js
const store = signalStore(
 // following are not required, just an example it can have anything
 withEntities({ entity, collection }),
 withCallStatus({ prop: collection, initialValue: 'loading' }),

 withSyncToWebStorage({
     key: 'my-key',
     type: 'session',
     restoreOnInit: true,
     saveStateChangesAfterMs: 300,
 }),
 );
 // generates the following methods
 store.saveToStorage();
 store.loadFromStorage();
```
