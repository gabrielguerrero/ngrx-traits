---
name: ngrx-traits
description: Compose, explain and debug @ngrx-traits/signals signal stores — trait ordering, generated signal and method names, entity loading, filtering, sorting, pagination, selection, per-entity calls, linking store state to component signals and Signal Forms, URL/web-storage/SSR sync, and call caching. Use when the user mentions ngrx-traits or one of its store features (withCallStatus, withCalls, withEntitiesLoadingCall, withEntitiesCalls, withEntitiesLocalFilter, withEntitiesRemoteFilter, withEntitiesHybridFilter, withEntitiesLocalPagination, withEntitiesRemotePagination, withEntitiesRemoteScrollPagination, withEntitiesLocalSort, withEntitiesRemoteSort, withEntitiesSingleSelection, withEntitiesMultiSelection, withLink, withLinkEntitiesFilter, copySignal, withStateSetter, withRoute, withSyncToWebStorage, withEntitiesSyncToRouteQueryParams, withServerStateTransfer, withLogger, cacheRxCall). Do not use for plain @ngrx/signals stores that do not use ngrx-traits.
---

# ngrx-traits

Prebuilt `@ngrx/signals` custom store features. Peer deps: `@angular/core` 22, `@ngrx/signals` 22, `rxjs` 7.
Everything is imported from `@ngrx-traits/signals`, except `withEntities` / `entityConfig` / `setAllEntities`
which come from `@ngrx/signals/entities`.

## How to work

1. Read the user's existing store, service and model files first when they exist.
2. Pick the store shape from [recipes.md](recipes.md) — it has a full working store for each common case.
3. Open the reference file for each trait involved before writing config options or generated names.

| Read | For |
|---|---|
| [recipes.md](recipes.md) | Full store recipes: local/remote list, infinite scroll, detail call, forms, split store, SSR, caching |
| [entities-loading.md](entities-loading.md) | `withEntities`, `withCallStatus`, `withEntitiesLoadingCall`, `withAllCallStatus`, `withCallStatusMap`, entities resource view |
| [calls.md](calls.md) | `withCalls`, `withEntitiesCalls`, `callConfig`, awaiting results, resource view of a call |
| [filtering.md](filtering.md) | `withEntitiesLocalFilter`, `withEntitiesRemoteFilter`, `withEntitiesHybridFilter` |
| [sorting.md](sorting.md) | `withEntitiesLocalSort`, `withEntitiesRemoteSort` |
| [pagination.md](pagination.md) | `withEntitiesLocalPagination`, `withEntitiesRemotePagination`, `withEntitiesRemoteScrollPagination` |
| [selection.md](selection.md) | `withEntitiesSingleSelection`, `withEntitiesMultiSelection` |
| [links-forms.md](links-forms.md) | `withLink`, `withLinkEntities*`, `copySignal`, `withStateSetter`, `withStatePrivateSetter`, Signal Forms binding |
| [sync-routing.md](sync-routing.md) | `withRoute`, `withEntitiesSyncToRouteQueryParams`, `withSyncToRouteQueryParams`, `withSyncToWebStorage`, `withServerStateTransfer` |
| [caching.md](caching.md) | `cacheCall`, `cacheRxCall`, `CacheStore` |
| [utils.md](utils.md) | `withFeatureFactory`, `withLogger`, `ExtractStoreFeatureOutput`, rename-collection schematic |

## Config style

Declare the entity once with `entityConfig`, then pass it as the **first argument** of every entity trait,
with that trait's own options in a second object:

```typescript
const productEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'product',            // optional, prefixes every generated name
  selectId: (e) => e.productId,     // optional, when the id prop is not `id`
});

signalStore(
  withEntities(productEntityConfig),
  withCallStatus(productEntityConfig, { initialValue: 'loading' }),
  withEntitiesLocalPagination(productEntityConfig, { pageSize: 10 }),
);
```

Traits that read state from earlier traits take a factory as the last argument; it receives the store
(and optional injected services as extra params):

```typescript
withEntitiesLoadingCall(
  productEntityConfig,
  ({ productEntitiesFilter }, service = inject(ProductService)) => ({
    fetchEntities: () => service.getProducts({ search: productEntitiesFilter().search }),
  }),
);
```

A single config object (`withEntitiesLocalPagination({ ...productEntityConfig, pageSize: 10 })`) still
compiles, but prefer the two-argument form — it is what the docs and examples use. The `withLink*` traits
are the exception: they only take one config object, so spread the entity config into it when they need
options of their own.

## Ordering rules

Order matters: a trait that reads a signal must come after the trait that generates it.

1. `withEntities` — first in an entity store.
2. `withCallStatus` — before every other `withEntities*` trait; they talk to each other through it.
3. `withAllCallStatus` — before the `withCalls` / `withCallStatus` / `withEntitiesCalls` it monitors.
4. Filter / sort / pagination / selection traits — after `withCallStatus`.
5. `withLink*` traits — after the trait whose state they link (filter, sort, selection, `withState`).
6. `withSyncToWebStorage`, `withServerStateTransfer`, `withEntitiesSyncToRouteQueryParams` — after the
   state features they persist, **before** the loading call, so restored state can skip the fetch.
7. `withEntitiesLoadingCall` — last of the entity traits.
8. `withCalls` — after any state its factory reads; use a second `withCalls` to chain onto another call's result.
9. `withLogger` — last.

## Naming conventions

With `collection: 'product'`; drop the prefix when there is no collection (`entities()`, `entitiesCurrentPage()`, …).

| Generated | Name |
|---|---|
| entities | `productEntities()`, `productEntityMap()`, `productIds()` |
| call status | `isProductEntitiesLoading()`, `isProductEntitiesLoaded()`, `productEntitiesError()`, `setProductEntitiesLoading()` |
| filter | `productEntitiesFilter()`, `filterProductEntities({ filter })`, `resetProductEntitiesFilter()` |
| sort | `productEntitiesSort()`, `sortProductEntities({ sort })` |
| pagination | `productEntitiesCurrentPage` (DeepSignal), `productEntitiesPagedRequest()`, `loadProductEntitiesPage({ pageIndex })` |
| single selection | `productIdSelected()`, `productEntitySelected()`, `selectProductEntity({ id })` |
| multi selection | `productIdsSelectedMap()`, `productIdsSelected()`, `productEntitiesSelected()`, `toggleSelectProductEntities({ id })` |
| resource view | `productEntitiesResource()`, `<resultProp>Resource()` |
| link | `linkProductEntitiesFilter()`, `linkProductIdSelected()` |

A generated member whose name starts with `_` is private to the store (an `@ngrx/signals` rule), so a call
named `_loadProductDetail` keeps its method and status inside the store while its `resultProp` stays public.

## Common mistakes

- `productEntitiesCurrentPage` is a `DeepSignal`: read `store.productEntitiesCurrentPage.entities()`,
  not `store.productEntitiesCurrentPage().entities()`.
- `withCalls` defaults to `mapPipe: 'exhaustMap'`; use `'switchMap'` when a newer call should cancel the previous one,
  and for any observable that does not complete.
- Remote filter/sort/pagination methods only set the status to loading — nothing fetches without
  `withEntitiesLoadingCall` (or your own effect on `is[Collection]Loading`).
- Do not combine a local filter (`withEntitiesLocalFilter`, the local half of `withEntitiesHybridFilter`)
  with remote pagination — the store only holds the cached page window.
- `withInputBindings` is deprecated: use [`withLink`](links-forms.md) or `withStateSetter`.

## Testing

- A store needs an injection context, because traits call `inject()` in their factories. Either provide it —
  `TestBed.configureTestingModule({ providers: [MyStore] })`, then `TestBed.inject(MyStore)` — or build it inside
  `TestBed.runInInjectionContext(() => new Store())`, which is what this library's own specs do.
- Fetching runs through rxjs and effects, so flush after each action that triggers a call (store creation
  with `initialValue: 'loading'`, `setProductEntitiesLoading()`, a filter/sort/page change): `TestBed.tick()`,
  or `fakeAsync` + `tick()` when the call is delayed or debounced. The library's specs use both.
- Without `initialValue: 'loading'`, start a load with `store.setProductEntitiesLoading()`. Use the
  generated setters rather than patching the status state: the state key is `productCallStatus`
  (no `Entities` infix, unlike every other generated name), so a `patchState` aimed at
  `productEntitiesCallStatus` typechecks and silently does nothing.

Full documentation: https://ngrx-traits.dev
