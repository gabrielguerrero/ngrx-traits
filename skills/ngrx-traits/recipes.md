# Recipes

Complete stores for the common cases. All of them assume:

```typescript
import { type, signalStore, signalStoreFeature, withState, patchState } from '@ngrx/signals';
import { entityConfig, withEntities, setAllEntities } from '@ngrx/signals/entities';
import { /* traits */ } from '@ngrx-traits/signals';

const productEntityConfig = entityConfig({ entity: type<Product>(), collection: 'product' });
```

## 1. List loaded once, filtered/sorted/paginated in memory

```typescript
export const ProductsLocalStore = signalStore(
  { providedIn: 'root' },
  withEntities(productEntityConfig),
  withCallStatus(productEntityConfig, { initialValue: 'loading' }),
  withEntitiesLocalPagination(productEntityConfig, { pageSize: 10 }),
  withEntitiesLocalFilter(productEntityConfig, {
    defaultFilter: { search: '' },
    filterFn: (entity, filter) =>
      !filter?.search || entity.name.toLowerCase().includes(filter.search.toLowerCase()),
  }),
  withEntitiesLocalSort(productEntityConfig, {
    defaultSort: { field: 'name', direction: 'asc' },
  }),
  withEntitiesSingleSelection(productEntityConfig), // optional
  withEntitiesLoadingCall(productEntityConfig, {
    fetchEntities: () => inject(ProductService).getProducts().pipe(map((d) => d.resultList)),
  }),
);
```

Component: `store.productEntitiesCurrentPage.entities()`, `store.filterProductEntities({ filter: { search }, patch: true })`,
`store.sortProductEntities({ sort })`, `store.loadProductEntitiesPage({ pageIndex })`.

## 2. Backend does the filtering, sorting and paging

```typescript
export const ProductsRemoteStore = signalStore(
  { providedIn: 'root' },
  withEntities(productEntityConfig),
  withCallStatus(productEntityConfig, { initialValue: 'loading', errorType: type<string>() }),
  withEntitiesRemoteFilter(productEntityConfig, { defaultFilter: { search: '' } }),
  withEntitiesRemotePagination(productEntityConfig, { pageSize: 10, pagesToCache: 2 }),
  withEntitiesRemoteSort(productEntityConfig, { defaultSort: { field: 'name', direction: 'asc' } }),
  withEntitiesSyncToRouteQueryParams(productEntityConfig), // optional URL sync
  withEntitiesLoadingCall(
    productEntityConfig,
    (
      { productEntitiesFilter, productEntitiesPagedRequest, productEntitiesSort },
      service = inject(ProductService),
    ) => ({
      fetchEntities: async () => {
        const res = await lastValueFrom(
          service.getProducts({
            search: productEntitiesFilter().search,
            skip: productEntitiesPagedRequest().startIndex,
            take: productEntitiesPagedRequest().size,
            sortColumn: productEntitiesSort().field,
            sortAscending: productEntitiesSort().direction === 'asc',
          }),
        );
        return { entities: res.resultList, total: res.total };
      },
    }),
  ),
);
```

`fetchEntities` must return `{ entities, total }` here — the total feeds the paginator.

## 3. Infinite scroll

```typescript
export const ProductsScrollStore = signalStore(
  withEntities(productEntityConfig),
  withCallStatus(productEntityConfig, { initialValue: 'loading' }),
  withEntitiesRemoteFilter(productEntityConfig, { defaultFilter: { search: '' } }),
  withEntitiesRemoteScrollPagination(productEntityConfig, { pageSize: 20, pagesToCache: 3 }),
  withEntitiesLoadingCall(
    productEntityConfig,
    ({ productEntitiesFilter, productEntitiesPagedRequest }) => ({
      fetchEntities: () =>
        inject(ProductService)
          .getProducts({
            search: productEntitiesFilter().search,
            skip: productEntitiesPagedRequest().startIndex,
            take: productEntitiesPagedRequest().size,
          })
          .pipe(map((res) => ({ entities: res.resultList, total: res.total }))),
    }),
  ),
);

// component
dataSource = getInfiniteScrollDataSource({
  store: this.store,
  collection: 'product',
  entity: type<Product>(),
});
```

## 4. List + detail loaded from the selected row

```typescript
export const ProductsStore = signalStore(
  withEntities(productEntityConfig),
  withCallStatus(productEntityConfig, { initialValue: 'loading' }),
  withEntitiesSingleSelection(productEntityConfig),
  withEntitiesLoadingCall(productEntityConfig, {
    fetchEntities: () => inject(ProductService).getProducts().pipe(map((d) => d.resultList)),
  }),
  withCalls(({ productEntitySelected }) => ({
    loadProductDetail: callConfig({
      call: ({ id }: { id: string }) => inject(ProductService).getProductDetail(id),
      resultProp: 'productDetail',
      callWith: productEntitySelected, // runs on every selection change, undefined skips it
      mapPipe: 'switchMap',            // a new selection cancels the previous detail
    }),
  })),
);
// store.productDetail(), store.isLoadProductDetailLoading(), store.productDetailResource()
```

## 5. Submitting a call and showing its error

```typescript
export const RegisterUserStore = signalStore(
  withCalls(() => ({
    registerUser: callConfig({
      call: (params: { name: string; email: string; password: string }) =>
        inject(UserService).register(params),
      mapError: (error) => (error as HttpErrorResponse).error.message,
    }),
  })),
);

// component
async onSubmit() {
  const result = await this.store.registerUser(this.model());
  if (result.ok) this.snackBar.open('Registered!', 'Close');
  else this.snackBar.open(result.error() as string, 'Close');
}
```

## 6. Per-entity calls (expandable rows, per-row actions)

```typescript
const orderEntityConfig = entityConfig({
  entity: type<OrderSummary & { items?: OrderDetail['items'] }>(),
  collection: 'order',
});

export const OrderStore = signalStore(
  withEntities(orderEntityConfig),
  withCallStatus(orderEntityConfig, { initialValue: 'loading' }),
  withEntitiesLoadingCall(orderEntityConfig, {
    fetchEntities: () => inject(OrderService).getOrders().pipe(map((res) => res.resultList)),
  }),
  withEntitiesMultiSelection(orderEntityConfig), // tracks which rows are expanded
  withEntitiesCalls(orderEntityConfig, (store, orderService = inject(OrderService)) => ({
    // return a Partial<Entity> to merge into the entity, undefined to remove it
    loadOrderDetail: (entity) =>
      orderService.getOrderDetail(entity.id).pipe(map(({ items }) => ({ items }))),
  })),
  withMethods((store) => ({
    toggleShowDetail(order: OrderSummary) {
      store.toggleSelectOrderEntities(order);
      if (!store.isLoadOrderDetailLoaded(order)) store.loadOrderDetail(order);
    },
  })),
);
```

## 7. Filter form bound to the store (Signal Forms)

```typescript
export const ProductsStore = signalStore(
  withEntities(productEntityConfig),
  withCallStatus(productEntityConfig, { initialValue: 'loading' }),
  withEntitiesRemoteFilter(productEntityConfig, { defaultFilter: { search: '' } }),
  withLinkEntitiesFilter(productEntityConfig), // generates linkProductEntitiesFilter()
  withEntitiesLoadingCall(productEntityConfig, ({ productEntitiesFilter }) => ({
    fetchEntities: () => inject(ProductService).getProducts({ search: productEntitiesFilter().search }),
  })),
);

// component
filterForm = form(this.store.linkProductEntitiesFilter(), (path) => {
  required(path.search);
  debounce(path.search, 300); // writes through the link are not debounced
});
```

See [links-forms.md](links-forms.md) for `model()`/`input()` syncing and for only letting valid data reach the store.

## 8. Splitting a store with ExtractStoreFeatureOutput

```typescript
// product-entities.feature.ts
export function withProductEntities() {
  return signalStoreFeature(
    withEntities(productEntityConfig),
    withCallStatus(productEntityConfig, { initialValue: 'loading' }),
    withEntitiesRemoteFilter(productEntityConfig, { defaultFilter: { search: '' } }),
    withEntitiesRemotePagination(productEntityConfig, { pageSize: 10 }),
  );
}
export type ProductEntitiesOutput = ExtractStoreFeatureOutput<typeof withProductEntities>;

// product-calls.feature.ts
export function withProductCalls() {
  return signalStoreFeature(
    type<ProductEntitiesOutput>(), // declares what this feature needs
    withEntitiesLoadingCall(
      productEntityConfig,
      ({ productEntitiesFilter, productEntitiesPagedRequest }) => ({
        fetchEntities: async () => {
          /* ... */
        },
      }),
    ),
  );
}

export const ProductStore = signalStore(withProductEntities(), withProductCalls());
```

`signalStore` takes at most 15 features — split before hitting that, and split anyway when a
feature needs to declare what it depends on.

## 9. Persisting to web storage

```typescript
signalStore(
  withEntities(productEntityConfig),
  withCallStatus(productEntityConfig, { initialValue: 'loading' }),
  withEntitiesLocalFilter(productEntityConfig, { defaultFilter: { search: '' }, filterFn }),
  withSyncToWebStorage({
    key: 'products-cache',
    type: 'session',
    expires: 1000 * 60 * 60 * 12,
  }), // before the loading call, so restored state can skip the fetch
  withEntitiesLoadingCall(productEntityConfig, { fetchEntities }),
);
```

## 10. SSR state transfer

```typescript
signalStore(
  withEntities(productEntityConfig),
  withCallStatus(productEntityConfig, { initialValue: 'loading' }),
  withEntitiesLocalSort(productEntityConfig, { defaultSort: { field: 'name', direction: 'asc' } }),
  withServerStateTransfer({ key: 'product-list-ssr' }), // before the loading call
  withEntitiesLoadingCall(productEntityConfig, { fetchEntities }),
);
```

The server serializes the state into the page; on the client the restored status is `loaded`, so the
loading call does not fetch again.

## 11. Caching a call

```typescript
withCalls((store, service = inject(ProductService)) => ({
  loadProductDetail: ({ id }: { id: string }) =>
    cacheRxCall({
      key: ['products', id],
      call: service.getProductDetail(id),
      expires: 1000 * 60 * 5,
    }),
}));
```

See [caching.md](caching.md) for `cacheCall` (promises), scoped caches and manual invalidation.
