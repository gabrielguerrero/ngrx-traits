## Constants

<dl>
<dt><a href="#arraysAreNotAllowedMsg">arraysAreNotAllowedMsg</a></dt>
<dd><p>A function that takes an <code>Event</code> and a <code>State</code>, and returns a <code>State</code>.
See <code>createReducer</code>.</p></dd>
</dl>

## Functions

<dl>
<dt><a href="#withAllCallStatus">withAllCallStatus()</a></dt>
<dd><p>Adds methods to the store to track the status of all calls in the store</p></dd>
<dt><a href="#withCallStatusMap">withCallStatusMap(configFactory)</a></dt>
<dd><p>Generates necessary state, computed and methods for call progress status but map by a key, allowing to implement
calls of the same type that run on parallel each with its own status.</p></dd>
<dt><a href="#withCallStatus">withCallStatus(configFactory)</a></dt>
<dd><p>Generates necessary state, computed and methods for call progress status to the store</p></dd>
<dt><a href="#callConfig">callConfig(config)</a></dt>
<dd><p>Call configuration object for withCalls</p></dd>
<dt><del><a href="#typedCallConfig">typedCallConfig(config)</a></del></dt>
<dd><p>Call configuration object for withCalls</p></dd>
<dt><a href="#withCalls">withCalls(callsFactory)</a></dt>
<dd><p>Generates necessary state, computed and methods to track the progress of the
call and store the result of the call. The generated methods are rxMethods with
the same name as the original call, which accepts either the original parameters
or a Signal or Observable of the same type as the original parameters.
The original call can only have zero or one parameter, use an object with multiple
props as first param if you need more.
If the name start with an underscore, the call will be private and all generated methods
will also start with an underscore, making it only accessible inside the store.</p></dd>
<dt><a href="#entityCallConfig">entityCallConfig(config)</a></dt>
<dd><p>Call configuration object for withEntitiesCalls</p></dd>
<dt><a href="#withEntitiesCalls">withEntitiesCalls()</a></dt>
<dd><p>Generates necessary state, computed and methods to track the progress of
calls related to an entity and merges the result back to entities list. The generated methods are rxMethods with
the same name as the original call, which accepts either the original parameters
or a Signal or Observable of the same type as the original parameters.
The original call can only have zero or one parameter, use an object with multiple
props as first param if you need more.
<em>Important</em> The calls must have a parameter of type Entity  {entity: Entity, ...extra params} or use entityCallConfig
and the paramsSelectId to return with param prop represents the entityId .
The call can be skipped based on the result of the previous call, to skip a call return undefined or false.</p></dd>
<dt><a href="#withEntitiesHybridFilter">withEntitiesHybridFilter(configFactory)</a></dt>
<dd><p>Generates necessary state and methods to do remote and local filtering of entities in the store,
the generated filter[Collection]Entities method will filter the entities by calling set[Collection]Loading() if the isRemoteFilter returns true
and if false will call the filterFn to filter the entities locally.</p>
<p>For the remote case you should either create an effect that listens to [Collection]Loading can call the api with the [Collection]Filter params
or use withEntitiesLoadingCall to call the api with the [Collection]Filter params. filter[Collection]Entities
is debounced by default, you can change the debounce by using the debounce option filter[Collection]Entities or changing the defaultDebounce prop in the config.</p>
<p>In case you dont want filter[Collection]Entities to call set[Collection]Loading() (which triggers a fetchEntities), you can pass skipLoadingCall: true to filter[Collection]Entities.
Useful in cases where you want to further change the state before manually calling set[Collection]Loading() to trigger a fetch of entities.</p>
<p>Requires withEntities and withCallStatus to be present before this function.</p></dd>
<dt><a href="#withEntitiesLocalFilter">withEntitiesLocalFilter(configFactory)</a></dt>
<dd><p>Generates necessary state, computed and methods for locally filtering entities in the store,
the generated filter[Collection]Entities method will filter the entities based on the filter function
and is debounced by default.</p>
<p>Requires withEntities to be used.</p></dd>
<dt><a href="#withEntitiesRemoteFilter">withEntitiesRemoteFilter(configFactory)</a></dt>
<dd><p>Generates necessary state, computed and methods for remotely filtering entities in the store,
the generated filter[Collection]Entities method will filter the entities by calling set[Collection]Loading()
and you should either create an effect that listens to [Collection]Loading can call the api with the [Collection]Filter params
or use withEntitiesLoadingCall to call the api with the [Collection]Filter params.
filter[Collection]Entities is debounced by default, you can change the debounce by using the debounce option filter[Collection]Entities or changing the defaultDebounce prop in the config.</p>
<p>In case you dont want filter[Collection]Entities to call set[Collection]Loading() (which triggers a fetchEntities), you can pass skipLoadingCall: true to filter[Collection]Entities.
Useful in cases where you want to further change the state before manually calling set[Collection]Loading() to trigger a fetch of entities.</p>
<p>Requires withEntities and withCallStatus to be present before this function.</p></dd>
<dt><a href="#withEntitiesLoadingCall">withEntitiesLoadingCall(config)</a></dt>
<dd><p>Generates a onInit hook that fetches entities from a remote source
when the [Collection]Loading is true, by calling the fetchEntities function
and if successful, it will call set[Collection]Loaded and also set the entities
to the store using the setAllEntities method or the setEntitiesPagedResult method
if it exists (comes from withEntitiesRemotePagination),
if an error occurs it will set the error to the store using set[Collection]Error with the error.</p>
<p>Requires withEntities and withCallStatus to be present in the store.</p></dd>
<dt><a href="#withEntitiesLocalPagination">withEntitiesLocalPagination(configFactory)</a></dt>
<dd><p>Generates necessary state, computed and methods for local pagination of entities in the store.</p>
<p>Requires withEntities to be present in the store.</p></dd>
<dt><a href="#withEntitiesRemotePagination">withEntitiesRemotePagination(configFactory)</a></dt>
<dd><p>Generates necessary state, computed and methods for remote pagination of entities in the store.
Call load[Collection]Page to change the page, it will try to load the new page from cache if it's not present,
it will call set[Collection]Loading(), and you should either create an effect that listens to [Collection]Loading
and call the api with the [Collection]PagedRequest params and use set[Collection]Result to set the result
and changing the status errors manually,
or use withEntitiesLoadingCall to call the api with the [Collection]PagedRequest params which handles setting
the result and errors automatically.</p>
<p>In case you dont want load[Collection]Page to call set[Collection]Loading() (which triggers a fetchEntities), you can pass skipLoadingCall: true to load[Collection]Page.
Useful in cases where you want to further change the state before manually calling set[Collection]Loading() to trigger a fetch of entities.</p>
<p>This will keep at least the provided (pagesToCache) pages in memory, so previous pages could be removed from the cache.
If you need to keep all previous pages in memory, use withEntitiesRemoteScrollPagination instead.</p>
<p>Requires withEntities and withCallStatus to be present in the store.</p></dd>
<dt><a href="#withEntitiesRemoteScrollPagination">withEntitiesRemoteScrollPagination(configFactory)</a></dt>
<dd><p>Generates necessary state, computed and methods for remote infinite scroll pagination of entities in the store.
This is ideal for implementing infinite scroll where the entities cache keeps growing, or for a paginated list that only
allows going to the next and previous page because you dont know the total number of entities
probably because the data is top big and partitioned in multiple nodes.</p>
<p>When the page changes, it will try to load the current page from cache if it's not present,
it will call set[Collection]Loading(), and you should either create an effect that listens to is[Collection]Loading
and call the api with the [Collection]PagedRequest params and use set[Collection]Result to set the result
and changing the status errors manually
or use withEntitiesLoadingCall to call the api with the [Collection]PagedRequest params which handles setting
the result and errors automatically. Requires withEntities and withCallStatus to be used.</p>
<p>The generated set[Collection]Result method will append the entities to the cache of entities,
it requires either just set of requested entities set[Collection]Result({ entities }) in which case it will assume there is no more result if you set less entities
than the requested buffer size, or you can provide an extra param to the entities, total set[Collection]Result({ entities, total }) so it calculates if there is more
or a hasMore param set[Collection]Result({entities, hasMore}) that you can set to false to indicate the end of the entities.</p>
<p>Requires withEntities and withCallStatus to be present in the store.</p></dd>
<dt><a href="#withEntitiesMultiSelection">withEntitiesMultiSelection(configFactory)</a></dt>
<dd><p>Generates state, signals and methods for multi selection of entities.
Warning: isAll[Collection]Selected and toggleSelectAll[Collection] wont work
correctly in using remote pagination, because they cant select all the data.</p>
<p>Requires withEntities to be used before this feature.</p></dd>
<dt><a href="#withEntitiesSingleSelection">withEntitiesSingleSelection(configFactory)</a></dt>
<dd><p>Generates state, computed and methods for single selection of entities.</p>
<p>Requires withEntities to be present before this function.</p></dd>
<dt><a href="#withEntitiesLocalSort">withEntitiesLocalSort(configFactory)</a></dt>
<dd><p>Generates necessary state, computed and methods for sorting locally entities in the store.</p>
<p>Requires withEntities to be present before this function</p></dd>
<dt><a href="#withEntitiesRemoteSort">withEntitiesRemoteSort(configFactory)</a></dt>
<dd><p>Generates state, signals, and methods to sort entities remotely. When the sort method sort[Collection]Entities is called it will store the sort
and call set[Collection]Loading, and you should either create an effect that listens to [Collection]Loading
and call the api with the [Collection]Sort params and use wither setAllEntities if is not paginated or set[Collection]Result if is paginated
with the sorted result that come from the backend, plus changing the status  and set errors is needed.
or use withEntitiesLoadingCall to call the api with the [Collection]Sort params which handles setting
the result and errors automatically.</p>
<p>In case you dont want sort[Collection]Entities to call set[Collection]Loading() (which triggers a fetchEntities), you can pass skipLoadingCall: true to sort[Collection]Entities.
Useful in cases where you want to further change the state before manually calling set[Collection]Loading() to trigger a fetch of entities.</p>
<p>Requires withEntities and withCallStatus to be present before this function.</p></dd>
<dt><a href="#withEventHandler">withEventHandler(eventHandlerFactory)</a></dt>
<dd></dd>
<dt><a href="#createEvent">createEvent(type, config)</a></dt>
<dd><p>Creates a configured <code>Creator</code> function that, when called, returns an object in the shape of the <code>Event</code> interface.</p>
<p>Event creators reduce the explicitness of class-based event creators.</p></dd>
<dt><a href="#withFeatureFactory">withFeatureFactory(featureFactory)</a></dt>
<dd><p>This store feature allows access to the store's state, methods, computed signals, to store features that don't have a config factory that
can access the store. This can be useful for creating store features that need to access the store's state, methods, computed signals, etc. or to wrap store
features that don't have a config factory that can access the store.</p></dd>
<dt><a href="#withInputBindings">withInputBindings(inputs)</a></dt>
<dd></dd>
<dt><a href="#withLogger">withLogger(name, filter, showDiff)</a></dt>
<dd><p>Log the state of the store on every change, optionally filter the signals to log
the filter prop can receive an array with the names of the props to filter, or you can provide a function
which receives the store as an argument and should return the object to log, if any of the props in the object is a signal
it will log the value of the signal. If showDiff is true it will log the diff of the state on every change.</p></dd>
<dt><del><a href="#withStateLogger">withStateLogger(name, filterState)</a></del></dt>
<dd><p>Log the state of the store on every change</p></dd>
<dt><a href="#withRouteParams">withRouteParams(mapParams)</a></dt>
<dd><p>This store feature provides access to the route params. The mapParams receives the route params object, use it to transform it
to an object, this will create a computed for each prop return by the mapParams function</p>
<p>Requires the store to be provided in a routed component, since this feature consumes from Angular's ActivatedRoute. 
Providing it in root or in a route-level factory is not sufficient.</p></dd>
<dt><a href="#withEntitiesSyncToRouteQueryParams">withEntitiesSyncToRouteQueryParams()</a></dt>
<dd><p>Syncs entities filter, pagination, sort and single selection to route query params for local or remote entities store features. If a collection is provided, it will be used as a prefix (if non is provided) for the query params.
The prefix can be disabled by setting it to false, or changed by providing a string. The filterMapper can be used to customize how the filter object is map to a query params object,
when is not provided the filter will use JSON.stringify to serialize the filter object.</p>
<p>Requires withEntities and withCallStatus to be present in the store.</p></dd>
<dt><a href="#withSyncToRouteQueryParams">withSyncToRouteQueryParams()</a></dt>
<dd><p>Syncs the route query params with the store and back. On init it will load
the query params once and set them in the store using the mapper.queryParamsToState, after that
and change on the store will be reflected in the query params using the mapper.stateToQueryParams</p></dd>
<dt><a href="#withSyncToWebStorage">withSyncToWebStorage(key, type, saveStateChangesAfterMs, restoreOnInit, filterState, onRestore, expires)</a></dt>
<dd><p>Sync the state of the store to the web storage</p></dd>
</dl>

<a name="arraysAreNotAllowedMsg"></a>

## arraysAreNotAllowedMsg
<p>A function that takes an <code>Event</code> and a <code>State</code>, and returns a <code>State</code>.
See <code>createReducer</code>.</p>

**Kind**: global constant  
<a name="withAllCallStatus"></a>

## withAllCallStatus()
<p>Adds methods to the store to track the status of all calls in the store</p>

**Kind**: global function  
**Example**  
```js
export const ProductsLocalStore = signalStore(
  withAllCallStatus(), // <-- add this line
  withEntities({ entity, collection }),
  withCallStatus({ collection, initialValue: 'loading' }),
  withEntitiesLoadingCall({
    collection,
    fetchEntities: () => {
      return inject(ProductService)
        .getProducts()
        .pipe(map((d) => d.resultList));
    },
  }),
  withCalls(() => ({
    loadProductDetail: callConfig({
      call: ({ id }: { id: string }) =>
        inject(ProductService).getProductDetail(id),
      resultProp: 'productDetail',
    }),
    checkout: () => inject(OrderService).checkout(),
  })),
);
// generates the following methods
 store.isAnyCallLoading() // Signal<boolean>
 store.callsErrors // () => Signals<unknown[]>
```
<a name="withCallStatusMap"></a>

## withCallStatusMap(configFactory)
<p>Generates necessary state, computed and methods for call progress status but map by a key, allowing to implement
calls of the same type that run on parallel each with its own status.</p>

**Kind**: global function  

| Param | Description |
| --- | --- |
| configFactory | <p>The configuration object for the feature or a factory function that receives the store and returns the configuration object</p> |
| configFactory.prop | <p>The name of the property for which this represents the call status</p> |
| configFactory.initialValue | <p>The initial value of the call status</p> |
| configFactory.collection | <p>The name of the collection for which this represents the call status is an alias to prop param</p> |
| configFactory.errorType | <p>The type of the error they do the same thing</p> <p>prop or collection is required</p> |

**Example**  
```js
export const Store = signalStore(
  { providedIn: 'root' },
  withEntities(orderEntity),
  withCallStatusMap({ prop: 'loadDetails' }),
  withMethods((store) => ({
    loadProducts: rxMethod<{ orderId: string }>(
      pipe(
        switchMap((params) => {
          store.setLoadDetailsLoading(params.orderId);
          return inject(OrderService)
            .getOrderDetail(params.orderId)
            .pipe(
              tap((res) =>
                patchState(
                  store,
                  updateEntity(
                    {
                      id: params.orderId,
                      changes: { items: res.items },
                    },
                    orderEntity,
                  ),
                ),
              ),
              catchError((error) => {
                store.setLoadDetailsError(params.orderId, error);
                return EMPTY;
              }),
            );
        }),
      ),
    ),
  })),
);

 // generates the following signals
 store.loadDetailsCallStatus // '{[key:string]: init' | 'loading' | 'loaded' | { error: unknown }}
 // generates the following computed signals
 store.isAnyLoadDetailsLoading() // boolean
 store.areAllLoadDetailsLoaded // boolean
 store.loadDetailsErrors() // Errors[] | undefined
 // generates the following methods
 store.isLoadDetailsLoading(key: string) // boolean
 store.isLoadDetailsLoaded(key: string) // boolean
 store.loadDetailsError(key: string) // unknown | null
 store.setLoadDetailsLoading(key: string) // () => void
 store.setLoadDetailsLoaded(key: string) // () => void
 store.setLoadDetailsError(key: string) // (error?: unknown) => void
```
<a name="withCallStatus"></a>

## withCallStatus(configFactory)
<p>Generates necessary state, computed and methods for call progress status to the store</p>

**Kind**: global function  

| Param | Description |
| --- | --- |
| configFactory | <p>The configuration object for the feature or a factory function that receives the store and returns the configuration object</p> |
| configFactory.prop | <p>The name of the property for which this represents the call status</p> |
| configFactory.initialValue | <p>The initial value of the call status</p> |
| configFactory.collection | <p>The name of the collection for which this represents the call status is an alias to prop param</p> |
| configFactory.errorType | <p>The type of the error they do the same thing</p> <p>prop or collection is required</p> |

**Example**  
```js
const store = signalStore(
 withCallStatus({ prop: 'users', })
 // other valid configurations
 // withCallStatus()
 // withCallStatus({ collection: 'users', initialValue: 'loading' , errorType: type<string>()})
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
<a name="callConfig"></a>

## callConfig(config)
<p>Call configuration object for withCalls</p>

**Kind**: global function  

| Param | Description |
| --- | --- |
| config | <p>the call configuration</p> |
| config.call | <p>required, the function that will be called</p> |
| config.mapPipe | <p>optional, default exhaustMap the pipe operator that will be used to map the call result</p> |
| config.storeResult | <p>optional, default true, if false, the result will not be stored in the store</p> |
| config.resultProp | <p>optional, default callName + 'Result', the name of the prop where the result will be stored</p> |
| config.onSuccess | <p>optional, a function that will be called when the call is successful</p> |
| config.mapError | <p>optional, a function that will be called to transform the error before storing it</p> |
| config.onError | <p>optional, a function that will be called when the call fails</p> |
| config.skipWhen | <p>optional, a function that will be called to determine if the call should be skipped</p> |
| config.callWith | <p>optional, reactively execute the call with the provided params return by a function or signal or observable</p> |
| config.defaultResult | <p>optional, A default value for the result before the call is executed</p> |

<a name="typedCallConfig"></a>

## ~~typedCallConfig(config)~~
***Deprecated***

<p>Call configuration object for withCalls</p>

**Kind**: global function  

| Param | Description |
| --- | --- |
| config | <p>the call configuration</p> |
| config.call | <p>required, the function that will be called</p> |
| config.mapPipe | <p>optional, default exhaustMap the pipe operator that will be used to map the call result</p> |
| config.storeResult | <p>optional, default true, if false, the result will not be stored in the store</p> |
| config.resultProp | <p>optional, default callName + 'Result', the name of the prop where the result will be stored</p> |
| config.onSuccess | <p>optional, a function that will be called when the call is successful</p> |
| config.mapError | <p>optional, a function that will be called to transform the error before storing it</p> |
| config.onError | <p>optional, a function that will be called when the call fails</p> |
| config.skipWhen | <p>optional, a function that will be called to determine if the call should be skipped</p> |
| config.callWith | <p>optional, reactively execute the call with the provided params return by a function or signal or observable</p> |
| config.defaultResult | <p>optional, A default value for the result before the call is executed</p> |

<a name="withCalls"></a>

## withCalls(callsFactory)
<p>Generates necessary state, computed and methods to track the progress of the
call and store the result of the call. The generated methods are rxMethods with
the same name as the original call, which accepts either the original parameters
or a Signal or Observable of the same type as the original parameters.
The original call can only have zero or one parameter, use an object with multiple
props as first param if you need more.
If the name start with an underscore, the call will be private and all generated methods
will also start with an underscore, making it only accessible inside the store.</p>

**Kind**: global function  
**Warning**: The default mapPipe is [exhaustMap](https://www.learnrxjs.io/learn-rxjs/operators/transformation/exhaustmap). If your call returns an observable that does not complete after the first value is emitted, any changes to the input params will be ignored. Either specify [switchMap](https://www.learnrxjs.io/learn-rxjs/operators/transformation/switchmap) as mapPipe, or use [take(1)](https://www.learnrxjs.io/learn-rxjs/operators/filtering/take) or [first()](https://www.learnrxjs.io/learn-rxjs/operators/filtering/first) as part of your call.  

| Param | Type | Description |
| --- | --- | --- |
| callsFactory | <code>callsFactory</code> | <p>a factory function that receives the store and returns an object of type {Record&lt;string, Call | CallConfig&gt;} with the calls to be made</p> |

**Example**  
```js
withCalls(({ productsSelectedEntity }) => ({
    loadProductDetail: callConfig({
      call: ({ id }: { id: string }) =>
        inject(ProductService).getProductDetail(id),
      resultProp: 'productDetail',
      // storeResult: false, // will omit storing the result, and remove the result prop from the store
      mapPipe: 'switchMap', // default is 'exhaustMap'
      onSuccess: (result, callParam) => {
      // do something with the result
      },
      mapError: (error, callParam) => {
        return // transform the error before storing it
      },
      onError: (error, callParam) => {
      // do something with the error
      },
      skipWhen: (callParam) => {
        // if return true, the call will be skip, if false, the call will execute as usual
        return // boolean | Promise<boolean> | Observable<boolean>
      },
      callWith: () =>
      // reactively call  with the selected product id, if undefined is return, the call is skip by default
       productsEntitySelected()
           ? { id: productsEntitySelected()!.id }
           : undefined,
    }),
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
  store.checkoutError // unknown | null
  // generates the following methods
  store.loadProductDetail // ({id: string} | Signal<{id: string}> | Observable<{id: string}>) => void
  store.checkout // () => void
```
<a name="entityCallConfig"></a>

## entityCallConfig(config)
<p>Call configuration object for withEntitiesCalls</p>

**Kind**: global function  

| Param | Description |
| --- | --- |
| config | <p>the call configuration</p> |
| config.call | <p>required, the function that will be called</p> |
| config.mapResult | <p>required, a function to transform the result of the call to the entity</p> |
| config.entityId | <p>required, a function that returns the entity id in the params</p> |
| config.onSuccess | <p>optional, a function that will be called when the call is successful</p> |
| config.mapError | <p>optional, a function that will be called to transform the error before storing it</p> |
| config.onError | <p>optional, a function that will be called when the call fails</p> |
| config.skipWhen | <p>optional, a function that will be called to determine if the call should be skipped</p> |
| config.callWith | <p>optional, reactively execute the call with the provided params return by a function or signal or observable</p> |
| config.defaultResult | <p>optional, A default value for the result before the call is executed</p> |

<a name="withEntitiesCalls"></a>

## withEntitiesCalls()
<p>Generates necessary state, computed and methods to track the progress of
calls related to an entity and merges the result back to entities list. The generated methods are rxMethods with
the same name as the original call, which accepts either the original parameters
or a Signal or Observable of the same type as the original parameters.
The original call can only have zero or one parameter, use an object with multiple
props as first param if you need more.
<em>Important</em> The calls must have a parameter of type Entity  {entity: Entity, ...extra params} or use entityCallConfig
and the paramsSelectId to return with param prop represents the entityId .
The call can be skipped based on the result of the previous call, to skip a call return undefined or false.</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| config.entity |  | <p>The entity type to be used</p> |
| config.collection |  | <p>The optional collection name to be used</p> |
| config.selectId |  | <p>The function to use to select the id of the entity</p> |
| config.callsFactory | <code>Record.&lt;string, EntitiesCallConfig&gt;</code> | <p>a factory function that receives the store and returns an object of type  with the calls to be made</p> |

**Example**  
```js
const orderEntity = entityConfig({
  entity: type<OrderSummary & { items?: OrderDetail['items'] }>(),
  collection: 'orders',
});
export const OrderStore = signalStore(
  withEntities(orderEntity),
  withEntitiesCalls({
    ...orderEntity,
    calls: (store, orderService = inject(OrderService)) => ({
      loadOrderDetail: (entity) => orderService.getOrderDetail(entity.id),
      // alternative way to define the call
      // loadOrderDetail: entityCallConfig({
      //   call: (entity: OrderSummary) => orderService.getOrderDetail(entity.id),
      //   // skip the call if result is already loaded
      //   skipWhen: (param, previousResult) => !!previousResult?.items,
      // }),
      changeOrderStatus: (option: {
        entity: OrderSummary;
        status: OrderSummary['status'];
      }) => orderService.changeStatus(option.entity.id, option.status),
      deleteOrder: (entity: OrderSummary) => {
        return orderService.delete(entity.id).pipe(
          map((deleted) => {
            deleted ? undefined : entity; // returning undefined will remove the entity from the store
          }),
        );
      },
    }),
  }),
);

  // generates the following signals
  store.loadOrderDetailCallStatus // a map { [id: string]:'init' | 'loading' | 'loaded' | { error: unknown }}
  // similar for changeOrderStatus and deleteOrder *
  // the calls updates the entities so results, which can be accessed with the usual entities list computed signals
  // generates the following computed signals
  store.isAnyLoadOrderDetailLoading: Signal<boolean>
  store.isAnyLoadOrderDetailLoaded: Signal<boolean>
  store.loadOrderDetailErrors: Signal<unknown[]>
  // same for changeOrderStatus and deleteOrder
  // generates the following methods
  store.isLoadOrderDetailLoading(id: string) => boolean
  store.isLoadOrderDetailLoaded(id: string) => boolean
  store.loadOrderDetailError(id: string) => string | null
  store.loadOrderDetail ({id: string} | Signal<{id: string}> | Observable<{id: string}>) => void
  // same for changeOrderStatus and deleteOrder
```
<a name="withEntitiesHybridFilter"></a>

## withEntitiesHybridFilter(configFactory)
<p>Generates necessary state and methods to do remote and local filtering of entities in the store,
the generated filter[Collection]Entities method will filter the entities by calling set[Collection]Loading() if the isRemoteFilter returns true
and if false will call the filterFn to filter the entities locally.</p>
<p>For the remote case you should either create an effect that listens to [Collection]Loading can call the api with the [Collection]Filter params
or use withEntitiesLoadingCall to call the api with the [Collection]Filter params. filter[Collection]Entities
is debounced by default, you can change the debounce by using the debounce option filter[Collection]Entities or changing the defaultDebounce prop in the config.</p>
<p>In case you dont want filter[Collection]Entities to call set[Collection]Loading() (which triggers a fetchEntities), you can pass skipLoadingCall: true to filter[Collection]Entities.
Useful in cases where you want to further change the state before manually calling set[Collection]Loading() to trigger a fetch of entities.</p>
<p>Requires withEntities and withCallStatus to be present before this function.</p>

**Kind**: global function  

| Param | Description |
| --- | --- |
| configFactory | <p>The configuration object for the feature or a factory function that receives the store and returns the configuration object</p> |
| configFactory.defaultFilter | <p>The default filter to be used</p> |
| configFactory.defaultDebounce | <p>The default debounce time to be used, if not set it will default to 300ms</p> |
| configFactory.filterFn | <p>The function to filter the entities</p> |
| configFactory.isRemoteFilter | <p>The function to determine if the filter is remote or local</p> |
| configFactory.entity | <p>The entity type to be used</p> |
| configFactory.collection | <p>The optional collection name to be used</p> |
| configFactory.selectId | <p>The optional function to select the id of the entity</p> |

**Example**  
```js
const entity = type<Product>();
const collection = 'products';
export const store = signalStore(
  { providedIn: 'root' },
  // requires withEntities and withCallStatus to be used
  withEntities({ entity, collection }),
  withCallStatus({ prop: collection, initialValue: 'loading' }),
  withEntitiesHybridFilter({
    entity,
    collection,
    defaultFilter: { name: '' , category: ''},
    filterFn: (entity, filter) =>
       (!filter.name || entity.name.toLowerCase().includes(filter.name.toLowerCase()))
    // in this case the filter will call setProductsLoading() if the category changes, othewise
    // it will filter the entities locally using filterFn
    isRemoteFilter: (previous, current) => {
         return previous.category !== current.category;
    }
  }),
  // after you can use withEntitiesLoadingCall to connect the filter to
  // the api call, or do it manually as shown after
   withEntitiesLoadingCall({
    collection,
    fetchEntities: ({ productsFilter }) => {
      return inject(ProductService)
        .getProducts({
          category: productsFilter().category,
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
//                  category: productsFilter().category,
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
 store.productsFilter // { search: string , category: string }
 // generates the following methods
 store.filterProductsEntities  // (options: { filter: { search: string, category: string }, debounce?: number, patch?: boolean, forceLoad?: boolean, skipLoadingCall?:boolean }) => void
 store.resetProductsFilter  // () => void
```
<a name="withEntitiesLocalFilter"></a>

## withEntitiesLocalFilter(configFactory)
<p>Generates necessary state, computed and methods for locally filtering entities in the store,
the generated filter[Collection]Entities method will filter the entities based on the filter function
and is debounced by default.</p>
<p>Requires withEntities to be used.</p>

**Kind**: global function  

| Param | Description |
| --- | --- |
| configFactory | <p>The configuration object for the feature or a factory function that receives the store and returns the configuration object</p> |
| configFactory.filterFn | <p>The function that will be used to filter the entities</p> |
| configFactory.defaultFilter | <p>The default filter to be used</p> |
| configFactory.defaultDebounce | <p>The default debounce time to be used, if not set it will default to 300ms</p> |
| configFactory.entity | <p>The entity type to be used</p> |
| configFactory.collection | <p>The optional collection name to be used</p> |
| configFactory.selectId | <p>The function to use to select the id of the entity</p> |

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
 // generates the following methods
 store.filterProductsEntities  // (options: { filter: { search: string }, debounce?: number, patch?: boolean, forceLoad?: boolean }) => void
 store.resetProductsFilter  // () => void
```
<a name="withEntitiesRemoteFilter"></a>

## withEntitiesRemoteFilter(configFactory)
<p>Generates necessary state, computed and methods for remotely filtering entities in the store,
the generated filter[Collection]Entities method will filter the entities by calling set[Collection]Loading()
and you should either create an effect that listens to [Collection]Loading can call the api with the [Collection]Filter params
or use withEntitiesLoadingCall to call the api with the [Collection]Filter params.
filter[Collection]Entities is debounced by default, you can change the debounce by using the debounce option filter[Collection]Entities or changing the defaultDebounce prop in the config.</p>
<p>In case you dont want filter[Collection]Entities to call set[Collection]Loading() (which triggers a fetchEntities), you can pass skipLoadingCall: true to filter[Collection]Entities.
Useful in cases where you want to further change the state before manually calling set[Collection]Loading() to trigger a fetch of entities.</p>
<p>Requires withEntities and withCallStatus to be present before this function.</p>

**Kind**: global function  

| Param | Description |
| --- | --- |
| configFactory | <p>The configuration object for the feature or a factory function that receives the store and returns the configuration object</p> |
| configFactory.defaultFilter | <p>The default filter to be used</p> |
| configFactory.defaultDebounce | <p>The default debounce time to be used, if not set it will default to 300ms</p> |
| configFactory.entity | <p>The entity type to be used</p> |
| configFactory.collection | <p>The optional collection name to be used</p> |

**Example**  
```js
const entity = type<Product>();
const collection = 'products';
export const store = signalStore(
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
 // generates the following methods
 store.filterProductsEntities  // (options: { filter: { search: string }, debounce?: number, patch?: boolean, forceLoad?: boolean, skipLoadingCall?:boolean }) => void
 store.resetProductsFilter  // () => void
```
<a name="withEntitiesLoadingCall"></a>

## withEntitiesLoadingCall(config)
<p>Generates a onInit hook that fetches entities from a remote source
when the [Collection]Loading is true, by calling the fetchEntities function
and if successful, it will call set[Collection]Loaded and also set the entities
to the store using the setAllEntities method or the setEntitiesPagedResult method
if it exists (comes from withEntitiesRemotePagination),
if an error occurs it will set the error to the store using set[Collection]Error with the error.</p>
<p>Requires withEntities and withCallStatus to be present in the store.</p>

**Kind**: global function  

| Param | Description |
| --- | --- |
| config | <p>Configuration object or factory function that returns the configuration object</p> |
| config.fetchEntities | <p>A function that fetches the entities from a remote source, the return type can be an array of entities or an object with entities and total</p> |
| config.collection | <p>The collection name</p> |
| config.onSuccess | <p>A function that is called when the fetchEntities is successful</p> |
| config.mapError | <p>A function to transform the error before setting it to the store, requires withCallStatus errorType to be set</p> |
| config.onError | <p>A function that is called when the fetchEntities fails</p> |
| config.selectId | <p>The function to use to select the id of the entity</p> |

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
  // triggers the onInit effect that checks if [Collection]Loading(), if true
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

## withEntitiesLocalPagination(configFactory)
<p>Generates necessary state, computed and methods for local pagination of entities in the store.</p>
<p>Requires withEntities to be present in the store.</p>

**Kind**: global function  

| Param | Description |
| --- | --- |
| configFactory | <p>The configuration object for the feature or a factory function that receives the store and returns the configuration object</p> |
| configFactory.pageSize | <p>The number of entities to show per page</p> |
| configFactory.currentPage | <p>The current page to show</p> |
| configFactory.entity | <p>The entity type</p> |
| configFactory.collection | <p>The name of the collection</p> |

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

## withEntitiesRemotePagination(configFactory)
<p>Generates necessary state, computed and methods for remote pagination of entities in the store.
Call load[Collection]Page to change the page, it will try to load the new page from cache if it's not present,
it will call set[Collection]Loading(), and you should either create an effect that listens to [Collection]Loading
and call the api with the [Collection]PagedRequest params and use set[Collection]Result to set the result
and changing the status errors manually,
or use withEntitiesLoadingCall to call the api with the [Collection]PagedRequest params which handles setting
the result and errors automatically.</p>
<p>In case you dont want load[Collection]Page to call set[Collection]Loading() (which triggers a fetchEntities), you can pass skipLoadingCall: true to load[Collection]Page.
Useful in cases where you want to further change the state before manually calling set[Collection]Loading() to trigger a fetch of entities.</p>
<p>This will keep at least the provided (pagesToCache) pages in memory, so previous pages could be removed from the cache.
If you need to keep all previous pages in memory, use withEntitiesRemoteScrollPagination instead.</p>
<p>Requires withEntities and withCallStatus to be present in the store.</p>

**Kind**: global function  

| Param | Description |
| --- | --- |
| configFactory | <p>The configuration object for the feature or a factory function that receives the store and returns the configuration object</p> |
| configFactory.pageSize | <p>The number of entities to show per page</p> |
| configFactory.currentPage | <p>The current page to show</p> |
| configFactory.pagesToCache | <p>The number of pages to cache</p> |
| configFactory.entity | <p>The entity type</p> |
| configFactory.collection | <p>The name of the collection</p> |
| configFactory.selectId | <p>The function to use to select the id of the entity</p> |

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
//               patchState(
//                 state,
//                 setProductsPagedResult({ entities: res.resultList, total: res.total } ),
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
 store.productsCurrentPage // { entities: Product[], pageIndex: number, total: number, pageSize: 5, pagesCount: number, hasPrevious: boolean, hasNext: boolean, isLoading: boolean }
 store.productsPagedRequest // { startIndex: number, size: number, page: number }
 // generates the following methods
 store.loadProductsPage({ pageIndex: number, forceLoad?: boolean, skipLoadingCall?:boolean }) // loads the page and sets the requestPage to the pageIndex
 store.setProductsPagedResult(entities: Product[], total: number) // appends the entities to the cache of entities and total
```
<a name="withEntitiesRemoteScrollPagination"></a>

## withEntitiesRemoteScrollPagination(configFactory)
<p>Generates necessary state, computed and methods for remote infinite scroll pagination of entities in the store.
This is ideal for implementing infinite scroll where the entities cache keeps growing, or for a paginated list that only
allows going to the next and previous page because you dont know the total number of entities
probably because the data is top big and partitioned in multiple nodes.</p>
<p>When the page changes, it will try to load the current page from cache if it's not present,
it will call set[Collection]Loading(), and you should either create an effect that listens to is[Collection]Loading
and call the api with the [Collection]PagedRequest params and use set[Collection]Result to set the result
and changing the status errors manually
or use withEntitiesLoadingCall to call the api with the [Collection]PagedRequest params which handles setting
the result and errors automatically. Requires withEntities and withCallStatus to be used.</p>
<p>The generated set[Collection]Result method will append the entities to the cache of entities,
it requires either just set of requested entities set[Collection]Result({ entities }) in which case it will assume there is no more result if you set less entities
than the requested buffer size, or you can provide an extra param to the entities, total set[Collection]Result({ entities, total }) so it calculates if there is more
or a hasMore param set[Collection]Result({entities, hasMore}) that you can set to false to indicate the end of the entities.</p>
<p>Requires withEntities and withCallStatus to be present in the store.</p>

**Kind**: global function  

| Param | Description |
| --- | --- |
| configFactory | <p>The configuration object for the feature or a factory function that receives the store and returns the configuration object</p> |
| configFactory.pageSize | <p>The number of entities to show per page</p> |
| configFactory.pagesToCache | <p>The number of pages to cache</p> |
| configFactory.entity | <p>The entity type</p> |
| configFactory.collection | <p>The name of the collection</p> |

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
 })),

 // in your component add
 store = inject(ProductsRemoteStore);
 dataSource = getInfiniteScrollDataSource(store, { collection: 'products' }) // pass this to your cdkVirtualFor see examples section
  // generates the following signals
  store.productsPagination // { currentPage: number,  pageSize: number,  pagesToCache: number, hasMore: boolean } used internally
 // generates the following computed signals
 store.productsCurrentPage // {  entities: Entity[], pageIndex: number, total: number, pageSize: number,  hasPrevious: boolean, hasNext: boolean, isLoading: boolean }
 store.productsPagedRequest // { startIndex: number, size: number }
 // generates the following methods
 store.loadProductsNextPage() // loads next page
 store.loadProductsPreviousPage() // loads previous page
 store.loadProductsFirstPage() // loads first page
 store.loadMoreProducts() // loads more entities (used for infinite scroll datasource)
 store.setProductsPagedResult(entities: Product[], total: number) // appends the entities to the cache of entities and total
```
<a name="withEntitiesMultiSelection"></a>

## withEntitiesMultiSelection(configFactory)
<p>Generates state, signals and methods for multi selection of entities.
Warning: isAll[Collection]Selected and toggleSelectAll[Collection] wont work
correctly in using remote pagination, because they cant select all the data.</p>
<p>Requires withEntities to be used before this feature.</p>

**Kind**: global function  

| Param | Description |
| --- | --- |
| configFactory | <p>The configuration object for the feature or a factory function that receives the store and returns the configuration object</p> |
| configFactory.entity | <p>the entity type</p> |
| configFactory.collection | <p>the collection name</p> |
| configFactory.clearOnFilter | <p>Clear the selected entity when the filter changes (default: true)</p> |
| configFactory.clearOnRemoteSort | <p>Clear the selected entity when the remote sort changes (default: true)</p> |

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
store.productsIdsSelectedMap // Record<string | number, boolean>;
// generates the following computed signals
store.productsEntitiesSelected // Entity[];
store.isAllProductsSelected // 'all' | 'none' | 'some';
// generates the following methods
store.selectProducts // (config: { id: string | number } | { ids: (string | number)[] }) => void;
store.deselectProducts // (config: { id: string | number } | { ids: (string | number)[] }) => void;
store.toggleSelectProducts // (config: { id: string | number } | { ids: (string | number)[] }) => void;
store.toggleSelectAllProducts // () => void;
```
<a name="withEntitiesSingleSelection"></a>

## withEntitiesSingleSelection(configFactory)
<p>Generates state, computed and methods for single selection of entities.</p>
<p>Requires withEntities to be present before this function.</p>

**Kind**: global function  

| Param | Description |
| --- | --- |
| configFactory | <p>The configuration object for the feature or a factory function that receives the store and returns the configuration object</p> |
| configFactory.collection | <p>The collection name</p> |
| configFactory.entity | <p>The entity type</p> |
| configFactory.clearOnFilter | <p>Clear the selected entity when the filter changes (default: true)</p> |
| configFactory.clearOnRemoteSort | <p>Clear the selected entity when the remote sort changes (default: true)</p> |

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
 store.productsIdSelected // string | number | undefined
 // generates the following computed signals
 store.productsEntitySelected // Entity | undefined
 // generates the following methods
 store.selectProductEntity // (config: { id: string | number }) => void
 store.deselectProductEntity // (config: { id: string | number }) => void
 store.toggleProductEntity // (config: { id: string | number }) => void
```
<a name="withEntitiesLocalSort"></a>

## withEntitiesLocalSort(configFactory)
<p>Generates necessary state, computed and methods for sorting locally entities in the store.</p>
<p>Requires withEntities to be present before this function</p>

**Kind**: global function  

| Param | Description |
| --- | --- |
| configFactory | <p>The configuration object for the feature or a factory function that receives the store and returns the configuration object</p> |
| configFactory.defaultSort | <p>The default sort to be applied to the entities</p> |
| configFactory.entity | <p>The type entity to be used</p> |
| configFactory.collection | <p>The name of the collection for which will be sorted</p> |
| configFactory.selectId | <p>The function to use to select the id of the entity</p> |
| configFactory.sortFunction | <p>Optional custom function use to sort the entities</p> |

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

## withEntitiesRemoteSort(configFactory)
<p>Generates state, signals, and methods to sort entities remotely. When the sort method sort[Collection]Entities is called it will store the sort
and call set[Collection]Loading, and you should either create an effect that listens to [Collection]Loading
and call the api with the [Collection]Sort params and use wither setAllEntities if is not paginated or set[Collection]Result if is paginated
with the sorted result that come from the backend, plus changing the status  and set errors is needed.
or use withEntitiesLoadingCall to call the api with the [Collection]Sort params which handles setting
the result and errors automatically.</p>
<p>In case you dont want sort[Collection]Entities to call set[Collection]Loading() (which triggers a fetchEntities), you can pass skipLoadingCall: true to sort[Collection]Entities.
Useful in cases where you want to further change the state before manually calling set[Collection]Loading() to trigger a fetch of entities.</p>
<p>Requires withEntities and withCallStatus to be present before this function.</p>

**Kind**: global function  

| Param | Description |
| --- | --- |
| configFactory | <p>The configuration object for the feature or a factory function that receives the store and returns the configuration object</p> |
| configFactory.defaultSort | <p>The default sort to use when the store is initialized</p> |
| configFactory.entity | <p>The entity type</p> |
| configFactory.collection | <p>The collection name</p> |

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
store.sortProductsEntities // (options: { sort: Sort<Entity>; , skipLoadingCall?:boolean}) => void;
```
<a name="withEventHandler"></a>

## withEventHandler(eventHandlerFactory)
**Kind**: global function  
**Experimental**: Adds an event handler to the store, allowing the store to listen to events and react to them.
This helps with the communications between different store feature functions, normally a store feature can only
call methods generated by other store featured if it is declared before. With event handlers, you can send events
to other store features, and they can react to them regardless of the order of declaration. This is useful for example between
the filter and pagination store features, filter fires an event when the filter is changed and the pagination store
feature can listen to it and reset the current page back to 0, by using  withEventHandler pagination avoids creating a dependency
on the filter store feature, and the order in which they get declared won't affect the communication .  

| Param |
| --- |
| eventHandlerFactory | 

**Example**  
```js
const increment = createEvent('[Counter] Increment');
    const decrement = createEvent('[Counter] Decrement');
    const add = createEvent('[Counter] Add', props<{ value: number }>());
    const Store = signalStore(
      withState({ count: 0 }),
      withEventHandler((state) => [
        onEvent(increment, () => {
          patchState(state, { count: state.count() + 1 });
        }),
        onEvent(decrement, () => {
          patchState(state, { count: state.count() - 1 });
        }),
      ]),
      withMethods((state) => {
        return {
          // this test we can send events to things defined after this method
          add5: () => broadcast(state, add({ value: 5 })),
        };
      }),
      withEventHandler((state) => [
        onEvent(add, ({ value }) => {
          patchState(state, { count: state.count() + value });
        }),
      ]),
      withMethods((state) => {
        return {
          increment: () => broadcast(state, increment()),
          decrement: () => broadcast(state, decrement()),
        };
      }),
    );
```
<a name="createEvent"></a>

## createEvent(type, config)
<p>Creates a configured <code>Creator</code> function that, when called, returns an object in the shape of the <code>Event</code> interface.</p>
<p>Event creators reduce the explicitness of class-based event creators.</p>

**Kind**: global function  
**Usagenotes**: **Declaring an event creator**

Without additional metadata:
```ts
export const increment = createEvent('[Counter] Increment');
```
With additional metadata:
```ts
export const loginSuccess = createEvent(
  '[Auth/API] Login Success',
  props<{ user: User }>()
);
```
With a function:
```ts
export const loginSuccess = createEvent(
  '[Auth/API] Login Success',
  (response: Response) => response.user
);
```

**Dispatching an event**

Without additional metadata:
```ts
store.dispatch(increment());
```
With additional metadata:
```ts
store.dispatch(loginSuccess({ user: newUser }));
```

**Referencing an event in a reducer**

Using a switch statement:
```ts
switch (event.type) {
  // ...
  case AuthApiEvents.loginSuccess.type: {
    return {
      ...state,
      user: event.user
    };
  }
}
```
Using a reducer creator:
```ts
on(AuthApiEvents.loginSuccess, (state, { user }) => ({ ...state, user }))
```

 **Referencing an event in an effect**
```ts
effectName$ = createEffect(
  () => this.events$.pipe(
    ofType(AuthApiEvents.loginSuccess),
    // ...
  )
);
```  

| Param | Description |
| --- | --- |
| type | <p>Describes the event that will be dispatched</p> |
| config | <p>Additional metadata needed for the handling of the event.  See [Usage Notes](createEvent#usage-notes).</p> |

<a name="withFeatureFactory"></a>

## withFeatureFactory(featureFactory)
<p>This store feature allows access to the store's state, methods, computed signals, to store features that don't have a config factory that
can access the store. This can be useful for creating store features that need to access the store's state, methods, computed signals, etc. or to wrap store
features that don't have a config factory that can access the store.</p>

**Kind**: global function  

| Param |
| --- |
| featureFactory | 

**Example**  
```js
// Use case 1: allow a custome store feature that receives a plain config object to access the store's state, methods, computed signals.
function withCustomFeature(config: { fooValue: string }) {
...// create a custom store feature
}
const Store = signalStore(
      withState({ foo: 'foo' }),
      // 👇use previous state to configure custom feature
      withFeatureFactory(({ foo }) => withCustomFeature({ fooValue: foo() })),
      // you can also use a signalStoreFeature inside withFeatureFactory
      withFeatureFactory(({ foo }) =>
        signalStoreFeature(
          withState({ foo2: foo() }),
          // ... other store features,
        ),
      ),
    );

// Use case 2: use withFeatureFactory inside a custom feature to create a store whose config can be a factory that receives the store
  function withCustomFeature2<Input extends SignalStoreFeatureResult>(
      configFactory: FeatureConfigFactory<Input, { foo: string }>,
    ): SignalStoreFeature<
      Input,
      {
        state: { foo: string };
        computed: { bar: Signal<string> };
        methods: { baz: () => number };
      }
    > {
      return withFeatureFactory((store: StoreSource<Input>) => {
        const config = getFeatureConfig(configFactory, store);
        return signalStoreFeature(
          withState<{ foo: string }>({ foo: config.fooValue }),
          withComputed(({ foo }) => ({ bar: computed(() => foo() + 1) })),
          withMethods(({ foo, bar }) => ({
            baz: () => foo() + bar() + 2,
          })),
        );
      }) as any;
    }

    // now withCustomFeature2 can be used like :
    const Store = signalStore(
      // withCustomFeature2({ fooValue: 'foo' }), // usual way with a plain object
      withState({ fooValue: 'foo' }),
      // or with a factory that receives the store
      withCustomFeature2(({ fooValue }) => ({ fooValue: fooValue() })),
    );
```
<a name="withInputBindings"></a>

## withInputBindings(inputs)
**Kind**: global function  
**Experimental**: Binds component inputs to the store, so that the store is updated with the latest values of the inputs.  

| Param |
| --- |
| inputs | 

**Example**  
```js
const Store = signalStore(
   withInputBindings({
      pageIndex: 0,
      length: 0,
      pageSize: 10,
      pageSizeOptions: [5, 10, 20],
    }),
   //... other features that use foo and bar
 );
 // generates the signals
   store.pageIndex(); // 0
   store.length(); // 0
   store.pageSize(); // 10
   store.pageSizeOptions(); // [5, 10, 20]

   generates the method
   store.bindInputs({ pageIndex: Signal<number>, length: Signal<number>, pageSize: Signal<number>, pageSizeOptions: Signal<number[]> });

 // use in a component
   class PaginatorComponent {
    readonly pageIndex = input.required<number>;
    readonly length = input.required<number>;
    readonly pageSize = input.required<number>;
    readonly pageSizeOptions = input.required<number[]>;
    readonly store = inject(Store);
    constructor() {
      this.store.bindInputs({
        pageIndex: this.pageIndex,
        length: this.length,
        pageSize: this.pageSize,
        pageSizeOptions: this.pageSizeOptions,
      });
      // if the inputs have the same name and type as the store,
      // you can use bindInputs like
      // this.store.bindInputs(this);
    }
  }
```
<a name="withLogger"></a>

## withLogger(name, filter, showDiff)
<p>Log the state of the store on every change, optionally filter the signals to log
the filter prop can receive an array with the names of the props to filter, or you can provide a function
which receives the store as an argument and should return the object to log, if any of the props in the object is a signal
it will log the value of the signal. If showDiff is true it will log the diff of the state on every change.</p>

**Kind**: global function  

| Param | Description |
| --- | --- |
| name | <p>The name of the store to log</p> |
| filter | <p>optional filter function to filter the store signals or an array of keys to filter</p> |
| showDiff | <p>optional flag to log the diff of the state on every change</p> |

**Example**  
```js
const Store = signalStore(
    withState(() => ({ prop1: 1, prop2: 2 })),
    withComputed(({ prop1, prop2 }) => ({
      prop3: computed(() => prop1() + prop2()),
    })),
    withLogger({
      name: 'Store',
      // by default it will log all state and computed signals
      // or you can filter with an array of keys
      // filter: ['prop1', 'prop2'],
      // or you can filter with a function
      // filter: ({ prop1, prop2 }) => ({ prop1, prop2 }),
      // showDiff: true,
    }),
  );
```
<a name="withStateLogger"></a>

## ~~withStateLogger(name, filterState)~~
***Deprecated***

<p>Log the state of the store on every change</p>

**Kind**: global function  

| Param | Description |
| --- | --- |
| name | <p>The name of the store to log</p> |
| filterState | <p>optional filter the state before logging</p> |

<a name="withRouteParams"></a>

## withRouteParams(mapParams)
<p>This store feature provides access to the route params. The mapParams receives the route params object, use it to transform it
to an object, this will create a computed for each prop return by the mapParams function</p>

**Usage Notes:** the store to be provided in a routed component, since this feature consumes from Angular's ActivatedRoute. 
Providing it in root or in a route-level factory is not sufficient.

**Kind**: global function  

| Param | Description |
| --- | --- |
| mapParams | <p>A function to transform the params before they are stored.</p> |

**Example**  
```js
// example route  /products/:id/
const ProductDetailStore = signalStore(
  withRouteParams(({ id }) => ({ id })),
  withCalls(() => ({
    loadProductDetail: (id: string) =>
      inject(ProductService).getProductDetail(id),
  })),
  withHooks(({ loadProductDetail, id }) => ({
    onInit: () => {
      loadProductDetail(id());
    },
  })),
);
```
<a name="withEntitiesSyncToRouteQueryParams"></a>

## withEntitiesSyncToRouteQueryParams()
<p>Syncs entities filter, pagination, sort and single selection to route query params for local or remote entities store features. If a collection is provided, it will be used as a prefix (if non is provided) for the query params.
The prefix can be disabled by setting it to false, or changed by providing a string. The filterMapper can be used to customize how the filter object is map to a query params object,
when is not provided the filter will use JSON.stringify to serialize the filter object.</p>
<p>Requires withEntities and withCallStatus to be present in the store.</p>

**Kind**: global function  

| Param | Description |
| --- | --- |
| config.collection | <p>The collection name to use as a prefix for the query params. If not provided, the collection name will be used.</p> |
| config.filterMapper | <p>A function to map the filter object to a query params object.</p> |
| config.prefix | <p>The prefix to use for the query params. If set to false, the prefix will be disabled.</p> |
| config.onQueryParamsLoaded | <p>A function to be called when the query params are loaded into the store, (only gets called once).</p> |
| config.defaultDebounce | <p>The default debounce time to use sync the store changes back to the route query params.</p> |

**Example**  
```js
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
<a name="withSyncToRouteQueryParams"></a>

## withSyncToRouteQueryParams()
<p>Syncs the route query params with the store and back. On init it will load
the query params once and set them in the store using the mapper.queryParamsToState, after that
and change on the store will be reflected in the query params using the mapper.stateToQueryParams</p>

**Kind**: global function  

| Param | Description |
| --- | --- |
| config.mappers | <p>The mappers to sync the query params with the store</p> |
| config.defaultDebounce | <p>The debounce time to wait before updating the query params from the store</p> |

**Example**  
```js
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
<a name="withSyncToWebStorage"></a>

## withSyncToWebStorage(key, type, saveStateChangesAfterMs, restoreOnInit, filterState, onRestore, expires)
<p>Sync the state of the store to the web storage</p>

**Kind**: global function  

| Param | Description |
| --- | --- |
| key | <p>the key to use in the web storage</p> |
| type | <p>'session' or 'local' storage</p> |
| saveStateChangesAfterMs | <p>save the state to the storage after this many milliseconds, 0 to disable</p> |
| restoreOnInit | <p>restore the state from the storage on init</p> |
| filterState | <p>filter the state before saving to the storage</p> |
| onRestore | <p>callback after the state is restored from the storage</p> |
| expires | <p>storage will not be loaded if is older than this many milliseconds</p> |

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
     // optionally, filter the state before saving to the storage
     filterState: ({ orderItemsEntityMap, orderItemsIds }) => ({
      orderItemsEntityMap,
      orderItemsIds,
    }),
 }),
 );
 // generates the following methods
 store.saveToStorage();
 store.loadFromStorage();
 store.clearFromStore();
```
