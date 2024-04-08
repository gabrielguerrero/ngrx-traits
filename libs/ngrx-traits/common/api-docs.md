## Functions

<dl>
<dt><a href="#addAsyncActionTrait">addAsyncActionTrait(options)</a> ⇒</dt>
<dd><p>Generates the typical ngrx code need to make a async action with
a request, success and failure actions, plus a status property to track its progress
and selectors to query the status. This trait can be added more thant once as long
as the name prop is different.</p></dd>
<dt><a href="#addCrudEntitiesTrait">addCrudEntitiesTrait(config)</a></dt>
<dd><p>Generates ngrx code to add, remove update, upsert entities on a list, it also
tracks the changes made, helpful for implementing batch updates. The <code>storeChanges</code> (false by default),
will store for add and update the changed entity props in the property <code>entityChanges</code> of the <code>Change</code> object.</p></dd>
<dt><a href="#addEntitiesPaginationTrait">addEntitiesPaginationTrait(config)</a></dt>
<dd><p>Generates ngrx code to paginate a list of entities, this has 3 cache <code>cacheType</code></p>
<ul>
<li>'full': The full result is cache in memory and split in pages to render, useful
for small result but not so small that requires been render in pages</li>
<li>'partial': Backend returns partial results because is are to big, this has a cache a few pages forward
to avoid calling the backend on each page, the cache is clean when a new loadEntities is required</li>
<li>'grow': Similar to partial that the backend returns partial result, but in this case the cache grows,
after each loadEntities the cache is appended to the previous cache, this mode is ideal for infinite scrolls,
where you will only call loadNextPage.
To make the pagination experience smoother the loadEntities action is fired when the current page is equal
to the last cached page, so while the user is reading the page more pages are being loading in the background.</li>
</ul></dd>
<dt><a href="#addEntitiesSyncToRouteQueryParams">addEntitiesSyncToRouteQueryParams()</a></dt>
<dd><p>Generates ngrx code necessary to load and set to the current route query params for the filter, sort and paging traits</p></dd>
<dt><a href="#addFilterEntitiesTrait">addFilterEntitiesTrait(traitConfig)</a></dt>
<dd><p>Generates the ngrx code needed to filter a list of entities locally or remotely, adds a filter
action and a selectFilter selector, the filter action is debounced and the filter will only
call the loadEntities action if the params have changed, so there is no need to implement that in
the components. The filter action has a <code>forceLoad</code> param which can
be use to skip that restriction for one call or setting the <code>defaultDebounceTime</code> to 0 for all calls.
Calling the filter action will also replace the <code>filters</code> param in the store, if the <code>patch</code> param is set
the filters are merged with the previous value in the store.</p></dd>
<dt><a href="#addLoadEntitiesTrait">addLoadEntitiesTrait(traitConfig)</a></dt>
<dd><p>Generates the ngrx code needed to load a list of entities from the backend. This trait is the base for all other traits related
to a list of entities, the other will call loadEntities when needing data. See the example for the list of actions and selectors this generates</p></dd>
<dt><a href="#addLoadEntityTraits">addLoadEntityTraits(entityName)</a> ⇒</dt>
<dd><p>Generates ngrx code needed to load and entity and store it in a state. This action can be added
more than once as long as the entityName para is different</p></dd>
<dt><a href="#addResetEntitiesStateTrait">addResetEntitiesStateTrait(traitConfig)</a></dt>
<dd><p>Generates the ngrx code needed to reset the current state to the initial state.</p></dd>
<dt><a href="#addSelectEntitiesTrait">addSelectEntitiesTrait()</a></dt>
<dd><p>Generates ngrx code to add multi selection to a list</p></dd>
<dt><a href="#addSelectEntityTrait">addSelectEntityTrait(config)</a></dt>
<dd><p>Generates ngrx code to add single selection to a list</p></dd>
<dt><a href="#addSetEntityTrait">addSetEntityTrait(entityName)</a> ⇒</dt>
<dd><p>Generates ngrx code needed to set and entity in the store state</p></dd>
<dt><a href="#addSortEntitiesTrait">addSortEntitiesTrait(config)</a></dt>
<dd><p>Generates ngrx code to sort locally or remotely a list of entities</p></dd>
</dl>

<a name="addAsyncActionTrait"></a>

## addAsyncActionTrait(options) ⇒
<p>Generates the typical ngrx code need to make a async action with
a request, success and failure actions, plus a status property to track its progress
and selectors to query the status. This trait can be added more thant once as long
as the name prop is different.</p>

**Kind**: global function  
**Returns**: <p>the trait factory</p>  

| Param | Description |
| --- | --- |
| options | <p>Config object for the trait factory</p> |
| options.name | <p>Name of the main request action, should be in camel case</p> |
| options.actionProps | <p>Optional param for the main request action, use the props() function for its value, if not present action will have no params,</p> |
| options.actionSuccessProps | <p>Optional param for the request success action, use the props() function for its value, if not present action success will have no params</p> |
| options.actionFailProps | <p>Optional param for the request fail action, use the props() function for its value, if not present action fail will have no params</p> |

**Example**  
```js
export interface TestState
extends AsyncActionState<'createClient'>{}

// The following trait config
const traits = createEntityFeatureFactory(
     {entityName: 'Todo'},
     addAsyncActionTrait({
       name: 'createClient',
       actionProps: props<{ name: string }>(),
       actionSuccessProps: props<{ id: string }>(),
     }),
)({
     actionsGroupKey: 'Client',
     featureSelector: createFeatureSelector<AsyncActionState<'createClient'>>(
       'client',
     ),
   });
//   adds following props to the state:
//    createClientStatus?: 'loading' | 'success' | 'fail';

// generated actions
traits.actions.createClient({name:'Pedro'})
traits.actions.createClientSuccess({id:'123'})
traits.actions.createClientFail();
//generated selectors
traits.selectors.isLoadingCreateClient
traits.selectors.isSuccessCreateClient
traits.selectors.isFailCreateClient
```
<a name="addCrudEntitiesTrait"></a>

## addCrudEntitiesTrait(config)
<p>Generates ngrx code to add, remove update, upsert entities on a list, it also
tracks the changes made, helpful for implementing batch updates. The <code>storeChanges</code> (false by default),
will store for add and update the changed entity props in the property <code>entityChanges</code> of the <code>Change</code> object.</p>

**Kind**: global function  

| Param | Description |
| --- | --- |
| config |  |
| config.storeChanges | <p>Will store the changes made, default fals</p> |

**Example**  
```js
// The following trait config

export interface TestState
extends EntityAndStatusState<Todo>, CrudState<Todo>{}

   const traits = createEntityFeatureFactory(
     {entityName: 'Todo'},
     addLoadEntitiesTrait<Todo>(),
     addCrudEntitiesTrait<Todo>()
   )({
     actionsGroupKey: '[Todos]',
     featureSelector: createFeatureSelector<TestState>>(
       'todos',
     ),
   });

//   adds following props to the state:
//    changes: Change<Todo>[];

// generated actions
traits.actions.addTodos(entity1,entity2...)
traits.actions.updateTodos({id: id1, changes:{prop1}},{id: id2, changes:{prop2}} ...)
traits.actions.upsertTodos(entity1,entity2...)
traits.actions.removeAllTodos()
traits.actions.clearTodosChanges()
// generated selectors
traits.selectors.selectTodosChangesList()
traits.selectors.selectFilteredTodosChangesList()
traits.selectors.selectAllFilteredChanges()
```
<a name="addEntitiesPaginationTrait"></a>

## addEntitiesPaginationTrait(config)
<p>Generates ngrx code to paginate a list of entities, this has 3 cache <code>cacheType</code></p>
<ul>
<li>'full': The full result is cache in memory and split in pages to render, useful
for small result but not so small that requires been render in pages</li>
<li>'partial': Backend returns partial results because is are to big, this has a cache a few pages forward
to avoid calling the backend on each page, the cache is clean when a new loadEntities is required</li>
<li>'grow': Similar to partial that the backend returns partial result, but in this case the cache grows,
after each loadEntities the cache is appended to the previous cache, this mode is ideal for infinite scrolls,
where you will only call loadNextPage.
To make the pagination experience smoother the loadEntities action is fired when the current page is equal
to the last cached page, so while the user is reading the page more pages are being loading in the background.</li>
</ul>

**Kind**: global function  

| Param | Description |
| --- | --- |
| config |  |
| config.cacheType | <p>Default to 'partial', change the cache mode</p> |
| config.pageSize | <p>Default to 10, number of entities on  each page</p> |
| config.currentPage | <p>Default to 0, starting page</p> |
| config.pagesToCache | <p>Default to 3, used in partial and grow cache mode, is the number of extra pages kept in cache to avoid calling the backend on each page</p> |

**Example**  
```js
// The following trait config

export interface TestState
extends EntityAndStatusState<Todo>,EntitiesPaginationState{}

   const traits = createEntityFeatureFactory(
     {entityName: 'Todo'},
     addLoadEntitiesTrait<Todo>(),
     addEntitiesPaginationTrait<Todo>()
   )({
     actionsGroupKey: '[Todos]',
     featureSelector: createFeatureSelector<TestState>>(
       'todos',
     ),
   });

//   adds following props to the state:
//    pagination: {
//       currentPage: number;
//       requestPage: number;
//       pageSize: number;
//       total?: number;
//       pagesToCache: number;
//       cache: {
//         type: 'full' | 'partial' | 'grow';
//         start: number;
//         end: number;
//       }
//     }

// generated actions
traits.actions.loadTodosPage({index})
traits.actions.loadTodosPageSuccess()
traits.actions.loadTodosPageFail()
traits.actions.loadTodosNextPage()
traits.actions.loadTodosPreviousPage()
traits.actions.loadTodosFirstPage()
traits.actions.loadTodosLastPage()
traits.actions.clearTodosPagesCache()
// generated selectors
traits.selectors.selectTodosCurrentPageList()
traits.selectors.isLoadingTodosCurrentPage()
// use isLoadingTodosPage over isLoadingTodos (which will return true even
// if the page loading is not the current one)
traits.selectors.selectTodosCurrentPage()
traits.selectors.selectTodosPagedRequest()// use in effects to get paging parameter
traits.selectors.selectTodosCurrentPageInfo()
```
<a name="addEntitiesSyncToRouteQueryParams"></a>

## addEntitiesSyncToRouteQueryParams()
<p>Generates ngrx code necessary to load and set to the current route query params for the filter, sort and paging traits</p>

**Kind**: global function  
**Example**  
```js
const traits = createEntityFeatureFactory(
     {entityName: 'Todo'},
     addLoadEntitiesTrait<Todo>(),
     addFilterEntitiesTrait(),
     addSortEntitiesTrait<Todo>({
       remote: true,
       defaultSort: {active:'id', direction:'asc'}
     })
     addEntitiesPaginationTrait<Todo>(),
     addEntitiesSyncToRouteQueryParams()
   )({
     actionsGroupKey: '[Todos]',
     featureSelector: createFeatureSelector<TestState>>(
       'todos',
     ),
   });


// generated actions
traits.actions.loadTodosUsingRouteQueryParams()
```
<a name="addFilterEntitiesTrait"></a>

## addFilterEntitiesTrait(traitConfig)
<p>Generates the ngrx code needed to filter a list of entities locally or remotely, adds a filter
action and a selectFilter selector, the filter action is debounced and the filter will only
call the loadEntities action if the params have changed, so there is no need to implement that in
the components. The filter action has a <code>forceLoad</code> param which can
be use to skip that restriction for one call or setting the <code>defaultDebounceTime</code> to 0 for all calls.
Calling the filter action will also replace the <code>filters</code> param in the store, if the <code>patch</code> param is set
the filters are merged with the previous value in the store.</p>

**Kind**: global function  

| Param | Description |
| --- | --- |
| traitConfig | <p>Config object fot the trait factory</p> |
| traitConfig.defaultFilter | <p>Initial value for the filter</p> |
| traitConfig.filterFn | <p>Function to filter entities in memory, if not present then its expected is filtered by the backend unless isRemoteFilter is defned</p> |
| traitConfig.defaultDebounceTime | <p>Value in milliseconds. Default to 400ms</p> |
| traitConfig.isRemoteFilter | <p>Function to when it returns true it fires loadEntities so a remote backend filtering can run, otherwise it uses filterFn to do a local filtering</p> |

**Example**  
```js
// The following trait config

export interface TestState
extends LoadEntitiesState<Todo>, FilterEntitiesState<TodoFilter>{}

   const traits = createEntityFeatureFactory(
     {entityName: 'Todo'},
     addLoadEntitiesTrait<Todo>(),
     //addFilterEntitiesTrait<Todo,TodoFilter>() // no params uses remote filtering
     addFilterEntitiesTrait<Todo,TodoFilter>({filterFn: (filter, entity) => // local filtering
         !filter.content || !!entity.content?.includes(filter.content.toLowerCase())
         // or use the following function to switch between remote search and local
         // depending on which properties have changed in the filter
         // isRemoteFilter: (previous, current) => previous?.someRemoteParam !== current?.someRemoteParam,
   )({
     actionsGroupKey: '[Todos]',
     featureSelector: createFeatureSelector<TestState>>(
       'todos',
     ),
   });

//   adds following props to the state:
//    filters?: TodoFilter;

// generated actions
traits.actions.filterTodos()
// generated selectors
traits.selectors.selectTodosFilter()
```
<a name="addLoadEntitiesTrait"></a>

## addLoadEntitiesTrait(traitConfig)
<p>Generates the ngrx code needed to load a list of entities from the backend. This trait is the base for all other traits related
to a list of entities, the other will call loadEntities when needing data. See the example for the list of actions and selectors this generates</p>

**Kind**: global function  

| Param | Description |
| --- | --- |
| traitConfig | <p>Config object for the trait factory</p> |
| traitConfig.selectId | <p>Function that returns the id of an entity</p> |
| traitConfig.sortComparer | <p>Default sort function for to @ngrx/entity EntityAdapter</p> |

**Example**  
```js
// The following trait config

export interface TestState
extends LoadEntitiesState<Todo>{}

   const traits = createEntityFeatureFactory(
     {entityName: 'Todo'},
     addLoadEntitiesTrait<Todo>(),
   )({
     actionsGroupKey: '[Todos]',
     featureSelector: createFeatureSelector<TestState>>(
       'todos',
     ),
   });

//   adds following props to the state:
//    ids: string[] | number[];
//    entities: Dictionary<Todo>;
//    status?: 'loading' | 'success' | 'fail';

// generated actions
traits.actions.loadTodos()
traits.actions.loadTodosSuccess({entities: todos})
traits.actions.loadTodosFail();
// generated selectors
traits.selectors.selectTodosList
traits.selectors.selectTodosMap
traits.selectors.selectTodosIds
traits.selectors.selectTodosTotal
traits.selectors.isTodosLoading
traits.selectors.isTodosLoadingSuccess
traits.selectors.isTodosLoadingFail
```
<a name="addLoadEntityTraits"></a>

## addLoadEntityTraits(entityName) ⇒
<p>Generates ngrx code needed to load and entity and store it in a state. This action can be added
more than once as long as the entityName para is different</p>

**Kind**: global function  
**Returns**: <p>the trait factory</p>  

| Param | Description |
| --- | --- |
| entityName | <p>Entity name, should be in camel case</p> |
| options.actionProps | <p>Optional param for the main request action, use the props() function for its value, if not present action will have no params,</p> |
| options.actionSuccessProps | <p>Optional param for the request success action, use the props() function for its value, if not present action success will have no params</p> |
| options.actionFailProps | <p>Optional param for the request fail action, use the props() function for its value, if not present action fail will have no params</p> |

**Example**  
```js
export interface TestState
extends LoadEntityState<Client,'client'>{}

const traits = createEntityFeatureFactory(
...addLoadEntityTraits({
       entityName: 'client',
       requestProps: props<{ id: string }>(),
       responseProps: props<{ client: Client }>(),
     }),
)({
     actionsGroupKey: 'Client',
     featureSelector: createFeatureSelector<
       LoadEntityState<Client, 'client'>
       >('client'),
   });

//   adds following props to the state:
//    loadClientStatus?: 'loading' | 'success' | 'fail';
//    client?: Client;

// generated actions
traits.actions.loadClient({id:123});
traits.actions.loadClientSuccess({client: {id: '123', name: 'gabs'}});
traits.actions.loadClientFail();
// generated selectors
traits.selectors.selectClient()
traits.selectors.isLoadingLoadClient()
traits.selectors.isSuccessLoadClient()
traits.selectors.isFailLoadClient()
```
<a name="addResetEntitiesStateTrait"></a>

## addResetEntitiesStateTrait(traitConfig)
<p>Generates the ngrx code needed to reset the current state to the initial state.</p>

**Kind**: global function  

| Param | Description |
| --- | --- |
| traitConfig | <p>Config object fot the trait factory</p> |
| traitConfig.resetOn | <p>set an extra action which will also trigger a reset state, useful if you want to create an action that reset several features states</p> |

**Example**  
```js
// The following trait config

   const traits = createEntityFeatureFactory(
     {entityName: 'Todo'},
     addLoadEntitiesTrait<Todo>(),
     addResetEntitiesStateTrait()
   )({
     actionsGroupKey: '[Todos]',
     featureSelector: createFeatureSelector<TestState>>(
       'todos',
     ),
   });
// generated actions
traits.actions.resetTodosState()
```
<a name="addSelectEntitiesTrait"></a>

## addSelectEntitiesTrait()
<p>Generates ngrx code to add multi selection to a list</p>

**Kind**: global function  
**Example**  
```js
// The following trait config

export interface TestState
extends EntityAndStatusState<Todo>,MultipleSelectionState{}

   const traits = createEntityFeatureFactory(
     {entityName: 'Todo'},
     addLoadEntitiesTrait<Todo>(),
     addSelectEntitiesTrait<Todo>()
   )({
     actionsGroupKey: '[Todos]',
     featureSelector: createFeatureSelector<TestState>>(
       'todos',
     ),
   });

//   adds following props to the state:
//    selectedIds: Dictionary<boolean>;

// generated actions
traits.actions.selectTodos({id})
traits.actions.deselectTodos({id})
traits.actions.toggleSectTodos({id})
traits.actions.toggleSelectAllTodos()
traits.actions.clearTodosSelection()
//generated selectors
traits.selectors.isAllTodosSelected()
traits.selectors.selectTodosIdsSelectedMap()
traits.selectors.selectTodosIdsSelectedList()
traits.selectors.selectTodosSelectedMap()
traits.selectors.selectTodosSelectedList()
traits.selectors.selectTotalSelectedTodos()
```
<a name="addSelectEntityTrait"></a>

## addSelectEntityTrait(config)
<p>Generates ngrx code to add single selection to a list</p>

**Kind**: global function  

| Param | Description |
| --- | --- |
| config |  |
| config.selectedId | <p>Default selected id</p> |

**Example**  
```js
// The following trait config

export interface TestState
extends EntityAndStatusState<Todo>,SelectEntityState{}

   const traits = createEntityFeatureFactory(
     {entityName: 'Todo'},
     addLoadEntitiesTrait<Todo>(),
     addSelectEntityTrait<Todo>()
   )({
     actionsGroupKey: '[Todos]',
     featureSelector: createFeatureSelector<TestState>>(
       'todos',
     ),
   });

//   adds following props to the state:
//     selectedId?: number | string;

// generated actions
traits.actions.selectTodo({id})
traits.actions.deselectTodo()
traits.actions.toggleSelectTodo({id})
//generated selectors
traits.selectors.selectTodoIdSelected()
traits.selectors.selectTodoSelected()
```
<a name="addSetEntityTrait"></a>

## addSetEntityTrait(entityName) ⇒
<p>Generates ngrx code needed to set and entity in the store state</p>

**Kind**: global function  
**Returns**: <p>the trait factory</p>  

| Param | Description |
| --- | --- |
| entityName | <p>Entity name, should be in camel case</p> |
| options.actionProps | <p>param for the main request action, use the props() function for its value</p> |

**Example**  
```js
export interface TestState
extends SetEntityState<Client,'client'>{}

const traits = createEntityFeatureFactory(
addSetEntityTraits({
       entityName: 'client',
       actionProps: props<{ client: Client }
     }),
)({
     actionsGroupKey: 'Client',
     featureSelector: createFeatureSelector<
       SetEntityState<Client, 'client'>
       >('client'),
   });
//   adds following props to the state:
//    client?: Client;

// generated actions
traits.actions.setClient({client: {id:123, name: 'gabs'}});
//generated selectors
traits.selectors.selectClient()
```
<a name="addSortEntitiesTrait"></a>

## addSortEntitiesTrait(config)
<p>Generates ngrx code to sort locally or remotely a list of entities</p>

**Kind**: global function  

| Param | Description |
| --- | --- |
| config |  |
| config.defaultSort | <p>Required field, Default entity prop for the sort</p> |
| config.remote | <p>Required field, default to false, when true disables local sorting and every sort action call will now trigger a loadEntities action and the backend should sort the data, use selectSort in the effect that call backend to get the requested sort, when false all sorting is done in memory when the sort action is fired</p> |

**Example**  
```js
// The following trait config
export interface TestState
extends EntityAndStatusState<Todo>, SortState<Todo>{}

   const traits = createEntityFeatureFactory(
     {entityName: 'Todo'},
     addLoadEntitiesTrait<Todo>(),
     addSortEntitiesTrait<Todo>({
       remote: true,
       defaultSort: {active:'id', direction:'asc'}
     })
   )({
     actionsGroupKey: '[Todos]',
     featureSelector: createFeatureSelector<TestState>>(
       'todos',
     ),
   });
//   adds following props to the state:
//      sort: {
//        current: Sort<Todo>;
//        default: Sort<Todo>;
//      }

// generated actions
traits.actions.sortTodos({active:'id', direction:'desc'})
traits.actions.resetTodosSort()
//generated selectors
traits.selectors.selectTodosSort()
```
