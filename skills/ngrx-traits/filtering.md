# Filtering: withEntitiesLocalFilter, withEntitiesRemoteFilter, withEntitiesHybridFilter

## withEntitiesLocalFilter

Client-side filtering. Requires `withEntities`. Filter is applied in memory every time entities reload.

```typescript
import { withEntitiesLocalFilter } from '@ngrx-traits/signals';

const cfg = entityConfig({ entity: type<Product>(), collection: 'product' });

withEntitiesLocalFilter({
  ...cfg,
  defaultFilter: { search: '' },
  filterFn: (entity, filter) =>
    !filter?.search || entity.name.toLowerCase().includes(filter.search.toLowerCase()),
})
```

**Config:**

| Property | Description |
|---|---|
| `entity` | Entity type |
| `collection` | Collection name (optional) |
| `defaultFilter` | Initial filter — type inferred from this value |
| `filterFn` | `(entity: T, filter: FilterType) => boolean` |
| `defaultDebounce` | Debounce ms (default ~300) |

**Generated (collection = `product`):**
```typescript
// State
productEntitiesFilter: Signal<FilterType>

// Computed
isProductEntitiesFilterChanged: Signal<boolean>

// Methods
filterProductEntities({ filter: FilterType; debounce?: number; patch?: boolean; forceLoad?: boolean }): void
resetProductEntitiesFilter(): void
```

**Template patterns:**

Full filter on submit (set `debounce: 0` for immediate):
```html
<form (submit)="store.filterProductEntities({ filter: { search: searchInput.value }, debounce: 0 })">
  <input #searchInput type="text" />
  <button type="submit">Apply</button>
</form>
```

Live filter with debounce (patch updates only changed fields):
```html
<input type="text"
  (input)="store.filterProductEntities({ filter: { search: $event.target.value }, patch: true })" />
```

Call without args to reapply current filter after manual entity changes:
```typescript
store.filterProductEntities();
```

---

## withEntitiesRemoteFilter

Remote filtering via backend. Requires `withEntities` and `withCallStatus`.

Calling `filterProductEntities` stores the filter and calls `setProductEntitiesLoading()`, which triggers `withEntitiesLoadingCall`.

```typescript
import { withEntitiesRemoteFilter } from '@ngrx-traits/signals';

const store = signalStore(
  withEntities(cfg),
  withCallStatus({ ...cfg, initialValue: 'loading' }),
  withEntitiesRemoteFilter({ ...cfg, defaultFilter: { search: '', category: '' } }),
  withEntitiesLoadingCall(
    ({ productEntitiesFilter }) => ({
      ...cfg,
      fetchEntities: () =>
        inject(ProductService).getProducts({
          search: productEntitiesFilter().search,
          category: productEntitiesFilter().category,
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
| `defaultFilter` | Initial filter — type inferred from this value |
| `defaultDebounce` | Debounce ms |

**Note:** Pass `skipLoadingCall: true` to `filterProductEntities` if you want to update additional state before manually triggering `setProductEntitiesLoading()`.

**Generated (collection = `product`):**
```typescript
// State
productEntitiesFilter: Signal<FilterType>

// Computed
isProductEntitiesFilterChanged: Signal<boolean>

// Methods
filterProductEntities({ filter: FilterType; debounce?: number; patch?: boolean; skipLoadingCall?: boolean }): void
resetProductEntitiesFilter(): void
```

**Using with signal forms:**
```typescript
filter = linkedSignal(this.store.productEntitiesFilter);
filterForm = form(this.filter);

async submitSearch() {
  submit(this.filterForm, async () => {
    const result = await this.store.filterProductEntities({ filter: this.filter() });
    if (!result.ok) return { kind: 'server', message: result.error() as string };
    return undefined;
  });
}
```

---

## withEntitiesHybridFilter

Mixes local and remote filtering. Local filter applies `filterFn` in memory; remote filter calls `setLoading()` to fetch from backend. Requires `withEntities` and `withCallStatus`.

**Use case:** Category dropdown reloads from server; search box filters locally.

```typescript
import { withEntitiesHybridFilter } from '@ngrx-traits/signals';

withEntitiesHybridFilter({
  ...cfg,
  defaultFilter: { search: '', categoryId: 'all' },
  isRemoteFilter: (previous, current) => previous.categoryId !== current.categoryId,
  filterFn: (entity, filter) =>
    !filter?.search || entity.name.toLowerCase().includes(filter.search.toLowerCase()),
})
```

**Config:**

| Property | Description |
|---|---|
| `entity` | Entity type |
| `collection` | Collection name (optional) |
| `defaultFilter` | Initial filter |
| `filterFn` | Local filter function |
| `isRemoteFilter` | `(previous, current) => boolean` — true = fetch from server |
| `defaultDebounce` | Debounce ms |

**Important:** Do NOT combine with `withEntitiesRemotePagination` or `withEntitiesRemoteScrollPagination` — local filter needs the full entity list which paged fetch does not provide. Use `withEntitiesLocalPagination` instead.

**Generated** — same API as `withEntitiesLocalFilter`/`withEntitiesRemoteFilter`:
```typescript
productEntitiesFilter: Signal<FilterType>
isProductEntitiesFilterChanged: Signal<boolean>
filterProductEntities({ filter, debounce?, patch? }): void
resetProductEntitiesFilter(): void
```
