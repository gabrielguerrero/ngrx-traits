# Pagination: withEntitiesLocalPagination, withEntitiesRemotePagination, withEntitiesRemoteScrollPagination

## withEntitiesLocalPagination

Client-side pagination over a fully-loaded entity list. Requires `withEntities`.

```typescript
import { withEntitiesLocalPagination } from '@ngrx-traits/signals';

const cfg = entityConfig({ entity: type<Product>(), collection: 'product' });

const store = signalStore(
  withEntities(cfg),
  withCallStatus({ ...cfg, initialValue: 'loading' }),
  withEntitiesLocalPagination({ ...cfg, pageSize: 10 }),
  withEntitiesLoadingCall({ ...cfg, fetchEntities: () => inject(Service).getProducts().pipe(map(d => d.resultList)) }),
);
```

**Template:**
```html
@for (product of store.productEntitiesCurrentPage().entities(); track product.id) {
  {{ product.name }}
}
<mat-paginator
  [length]="store.productEntitiesCurrentPage().total()"
  [pageSize]="store.productEntitiesCurrentPage().pageSize()"
  [pageIndex]="store.productEntitiesCurrentPage().pageIndex()"
  (page)="store.loadProductEntitiesPage($event)"
/>
```

**Config:**

| Property | Description | Default |
|---|---|---|
| `entity` | Entity type | required |
| `collection` | Collection name | — |
| `pageSize` | Initial page size | required |
| `currentPage` | Initial page index | `0` |

**Generated (collection = `product`):**
```typescript
// State
productEntitiesPagination: Signal<{ currentPage: number; pageSize: number }>

// Computed
productEntitiesCurrentPage: Signal<{ entities: T[]; pageIndex: number; total: number; pageSize: number }>

// Methods
loadProductEntitiesPage({ pageIndex: number }): void
```

---

## withEntitiesRemotePagination

Server-side pagination with caching. Requires `withEntities` and `withCallStatus`.

Changing page calls `setLoading()` → triggers `fetchEntities` in `withEntitiesLoadingCall`. Caches `pagesToCache` pages in memory.

```typescript
import { withEntitiesRemotePagination } from '@ngrx-traits/signals';

const store = signalStore(
  withEntities(cfg),
  withCallStatus({ ...cfg, initialValue: 'loading' }),
  withEntitiesRemoteFilter({ ...cfg, defaultFilter: { search: '' } }),
  withEntitiesRemotePagination({ ...cfg, pageSize: 10, pagesToCache: 2 }),
  withEntitiesRemoteSort({ ...cfg, defaultSort: { field: 'name', direction: 'asc' } }),
  withEntitiesLoadingCall(
    ({ productEntitiesFilter, productEntitiesPagedRequest, productEntitiesSort }) => ({
      ...cfg,
      fetchEntities: async () => {
        const res = await lastValueFrom(inject(Service).getProducts({
          search: productEntitiesFilter().search,
          skip: productEntitiesPagedRequest().startIndex,
          take: productEntitiesPagedRequest().size,
          sortColumn: productEntitiesSort().field,
          sortAscending: productEntitiesSort().direction === 'asc',
        }));
        return { entities: res.resultList, total: res.total };
      },
    }),
  ),
);
```

**Template:**
```html
@for (product of store.productEntitiesCurrentPage().entities(); track product.id) { ... }
<mat-paginator
  [length]="store.productEntitiesCurrentPage().total()"
  [pageSize]="store.productEntitiesCurrentPage().pageSize()"
  [pageIndex]="store.productEntitiesCurrentPage().pageIndex()"
  (page)="store.loadProductEntitiesPage($event)"
/>
```

**Config:**

| Property | Description | Default |
|---|---|---|
| `entity` | Entity type | required |
| `collection` | Collection name | — |
| `pageSize` | Entities per page | required |
| `pagesToCache` | Pages to keep in cache | required |
| `currentPage` | Initial page | `0` |
| `selectId` | Custom id selector | — |

**Generated (collection = `product`):**
```typescript
// State
productEntitiesPagination: Signal<{ currentPage: number; requestPage: number; pageSize: number; total: number; pagesToCache: number; cache: { start: number; end: number } }>

// Computed
productEntitiesCurrentPage: Signal<{ entities: T[]; pageIndex: number; total: number; pageSize: number; pagesCount: number; hasPrevious: boolean; hasNext: boolean; isLoading: boolean }>
productEntitiesPagedRequest: Signal<{ startIndex: number; size: number; page: number }>

// Methods
loadProductEntitiesPage({ pageIndex: number; forceLoad?: boolean; skipLoadingCall?: boolean }): void
setProductEntitiesPagedResult(entities: T[], total: number): void
```

**Note:** Pass `skipLoadingCall: true` to `loadProductEntitiesPage` if you want to update state before manually triggering a fetch.

---

## withEntitiesRemoteScrollPagination

Infinite scroll with growing entity cache. Requires `withEntities` and `withCallStatus`.

Use `getInfiniteScrollDataSource` in the component for CDK virtual scroll.

```typescript
import { withEntitiesRemoteScrollPagination } from '@ngrx-traits/signals';

const store = signalStore(
  withEntities(cfg),
  withCallStatus({ ...cfg, initialValue: 'loading' }),
  withEntitiesRemoteScrollPagination({ ...cfg, pageSize: 20, pagesToCache: 3 }),
  withEntitiesLoadingCall(
    ({ productEntitiesPagedRequest }) => ({
      ...cfg,
      fetchEntities: async () => {
        const res = await lastValueFrom(inject(Service).getProducts({
          skip: productEntitiesPagedRequest().startIndex,
          take: productEntitiesPagedRequest().size,
        }));
        return { entities: res.resultList, total: res.total };
        // or { entities, hasMore: boolean } if total unknown
      },
    }),
  ),
);
```

**Component:**
```typescript
store = inject(ProductsScrollStore);
dataSource = getInfiniteScrollDataSource(store, { collection: 'product' });
```

**Template:**
```html
<cdk-virtual-scroll-viewport itemSize="42">
  <mat-list>
    <mat-list-item *cdkVirtualFor="let item of dataSource; trackBy: trackByFn">
      {{ item.name }}
    </mat-list-item>
  </mat-list>
</cdk-virtual-scroll-viewport>
```

**`setEntitiesPagedResult` accepts:**
- `{ entities }` — assumes no more if fewer than buffer size
- `{ entities, total }` — calculates if more pages exist
- `{ entities, hasMore }` — explicit hasMore flag

**Generated (collection = `product`):**
```typescript
// Methods
loadProductEntitiesNextPage(): void
loadProductEntitiesPreviousPage(): void
loadMoreProductEntities(): void
setProductEntitiesPagedResult(entities: T[], total?: number, hasMore?: boolean): void
```

**Computed** (same shape as `withEntitiesRemotePagination`):
```typescript
productEntitiesCurrentPage: Signal<{ entities: T[]; pageIndex: number; total: number; hasNext: boolean; hasPrevious: boolean; isLoading: boolean }>
productEntitiesPagedRequest: Signal<{ startIndex: number; size: number; page: number }>
```
