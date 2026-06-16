# Sorting: withEntitiesLocalSort, withEntitiesRemoteSort

## withEntitiesLocalSort

Client-side sorting. Requires `withEntities`. Sort is reapplied in memory whenever entities change.

```typescript
import { withEntitiesLocalSort } from '@ngrx-traits/signals';

const cfg = entityConfig({ entity: type<Product>(), collection: 'product' });

withEntitiesLocalSort({
  ...cfg,
  defaultSort: { field: 'name', direction: 'asc' },
})
```

**Config:**

| Property | Description |
|---|---|
| `entity` | Entity type |
| `collection` | Collection name (optional) |
| `defaultSort` | `{ field: string; direction: 'asc' \| 'desc' \| '' }` |

**Generated (collection = `product`):**
```typescript
// State
productEntitiesSort: Signal<{ field: string; direction: 'asc' | 'desc' | '' }>

// Methods
sortProductEntities(options?: { sort: Sort<Entity> | CdkSort<Entity> }): void
```

Call `sortProductEntities()` without args to reapply current sort after manual entity changes.

**Sort dropdown:**
```html
<sort-dropdown
  [sort]="store.productEntitiesSort()"
  (sortChange)="store.sortProductEntities({ sort: $event })"
/>
```

**Angular Material table (`MatSort` integration):**

`sortProductEntities` accepts both `Sort<Entity>` (`{ field, direction }`) and `CdkSort<Entity>` (`{ active, direction }`) format, so you can pass `MatSort` events directly:

```html
<table mat-table matSort
  [matSortActive]="store.productEntitiesSort().field"
  [matSortDirection]="store.productEntitiesSort().direction"
  (matSortChange)="store.sortProductEntities({ sort: $event })">
  <ng-container matColumnDef="name">
    <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
    <td mat-cell *matCellDef="let row">{{ row.name }}</td>
  </ng-container>
  ...
</table>
```

---

## withEntitiesRemoteSort

Server-side sorting. Requires `withEntities` and `withCallStatus`.

Calling `sortProductEntities` stores the sort and calls `setProductEntitiesLoading()`, which triggers `withEntitiesLoadingCall` to fetch sorted results from the backend.

```typescript
import { withEntitiesRemoteSort } from '@ngrx-traits/signals';

const store = signalStore(
  withEntities(cfg),
  withCallStatus({ ...cfg, initialValue: 'loading' }),
  withEntitiesRemoteSort({ ...cfg, defaultSort: { field: 'name', direction: 'asc' } }),
  withEntitiesLoadingCall(
    ({ productEntitiesSort }) => ({
      ...cfg,
      fetchEntities: () =>
        inject(ProductService).getProducts({
          sortColumn: productEntitiesSort().field,
          sortAscending: productEntitiesSort().direction === 'asc',
        }),
    }),
  ),
);
```

**Config:**

| Property | Description |
|---|---|
| `entity` | Entity type |
| `collection` | Collection name (optional) |
| `defaultSort` | `Sort<Entity>` initial sort |

**Generated (collection = `product`):**
```typescript
// State
productEntitiesSort: Signal<Sort<Entity>>

// Methods
sortProductEntities(options?: { sort: Sort<Entity> | CdkSort<Entity>; skipLoadingCall?: boolean }): void
```

**Note:** Pass `skipLoadingCall: true` if you want to update additional state before manually triggering `setProductEntitiesLoading()`.

**Sort dropdown:**
```html
<sort-dropdown
  [sort]="store.productEntitiesSort()"
  (sortChange)="store.sortProductEntities({ sort: $event })"
/>
```

**Material table** — same as local sort, pass `MatSort` events directly to `sortProductEntities`.

---

## Combining sort + filter + pagination

**Local (all client-side):**
```typescript
signalStore(
  withEntities(cfg),
  withCallStatus({ ...cfg, initialValue: 'loading' }),
  withEntitiesLocalPagination({ ...cfg, pageSize: 10 }),
  withEntitiesLocalFilter({ ...cfg, defaultFilter: { search: '' }, filterFn: ... }),
  withEntitiesLocalSort({ ...cfg, defaultSort: { field: 'name', direction: 'asc' } }),
  withEntitiesLoadingCall({ ...cfg, fetchEntities: () => ... }), // loads all data once
)
```

**Remote (all server-side):**
```typescript
signalStore(
  withEntities(cfg),
  withCallStatus({ ...cfg, initialValue: 'loading' }),
  withEntitiesRemoteFilter({ ...cfg, defaultFilter: { search: '' } }),
  withEntitiesRemotePagination({ ...cfg, pageSize: 10, pagesToCache: 2 }),
  withEntitiesRemoteSort({ ...cfg, defaultSort: { field: 'name', direction: 'asc' } }),
  withEntitiesLoadingCall(({ productEntitiesFilter, productEntitiesPagedRequest, productEntitiesSort }) => ({
    ...cfg,
    fetchEntities: async () => { /* read all three signals */ },
  })),
)
```
