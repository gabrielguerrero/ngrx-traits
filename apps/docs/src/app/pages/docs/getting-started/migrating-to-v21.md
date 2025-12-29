---
name: Migrating to v21
order: 1
---

# Migrating to v21

Version 21 introduces a breaking change: collection-based properties now include an `Entities` suffix for consistency and clarity.

## Breaking Change Summary

When using traits with a `collection` parameter, generated property names now include `Entities`:

| v20 (Old)               | v21 (New)                      |
| ----------------------- | ------------------------------ |
| `productCallStatus`     | `productEntitiesCallStatus`    |
| `isProductLoading`      | `isProductEntitiesLoading`     |
| `productFilter`         | `productEntitiesFilter`        |
| `productPagination`     | `productEntitiesPagination`    |
| `loadProductPage()`     | `loadProductEntitiesPage()`    |
| `isAllProductSelected`  | `isAllProductEntitiesSelected` |

## Automatic Migration

Run the automatic migration schematic:

```bash
ng update @ngrx-traits/signals
```

This will:
1. Analyze your stores to find collections
2. Detect custom `signalStoreFeature` functions
3. Update all property references in TypeScript and HTML files
4. Only modify files that actually use the detected collections

## What Gets Migrated

The migration handles:

- **Store definitions** using `signalStore()` with collection-based traits
- **Custom features** using `signalStoreFeature()` (functions and variables)
- **Consumer files** (components, services) that use the stores
- **Templates** (both inline and external HTML files)
- **Patterns supported**:
  - Direct collection: `withCallStatus({ collection: 'product' })`
  - Spread entityConfig: `withCallStatus({ ...productEntityConfig })`
  - Variable reference: `withCallStatus(productEntityConfig)`
  - Variable features: `const productsFeature = signalStoreFeature(...)`
  - Inline features: `signalStore(signalStoreFeature(...))`
  - withFeature wrapper: `withFeature((store) => customFeature())`

## Troubleshooting

### Migration didn't update some files

The migration only updates files that import or use detected stores. If you have files using collection properties indirectly, you may need to run the [rename-collection](/docs/utils/rename-collection) schematic manually.

### Custom patterns not detected

If your store uses an unusual pattern not detected by the analyzer, use the rename-collection schematic:

```bash
ng g @ngrx-traits/signals:rename-collection --oldName=product --path=src/app
```

## Manual Migration

If you prefer to migrate manually or need to handle edge cases:

### 1. Update Property References

Replace old property names with new ones:

```typescript
// Before
store.productCallStatus();
store.isProductLoading();
store.loadProductPage({ pageIndex: 1 });

// After
store.productEntitiesCallStatus();
store.isProductEntitiesLoading();
store.loadProductEntitiesPage({ pageIndex: 1 });
```

### 2. Update Template Bindings

```html
<!-- Before -->
<div *ngIf="store.isProductLoading()">Loading...</div>
<button (click)="store.loadProductPage(1)">Load</button>

<!-- After -->
<div *ngIf="store.isProductEntitiesLoading()">Loading...</div>
<button (click)="store.loadProductEntitiesPage(1)">Load</button>
```

## Full Property Reference

### CallStatus

| v20                     | v21                            |
| ----------------------- | ------------------------------ |
| `{col}CallStatus`       | `{col}EntitiesCallStatus`      |
| `{col}Error`            | `{col}EntitiesError`           |
| `is{Col}Loading`        | `is{Col}EntitiesLoading`       |
| `is{Col}Loaded`         | `is{Col}EntitiesLoaded`        |
| `set{Col}Loading`       | `set{Col}EntitiesLoading`      |
| `set{Col}Loaded`        | `set{Col}EntitiesLoaded`       |
| `set{Col}Error`         | `set{Col}EntitiesError`        |

### Pagination

| v20                       | v21                              |
| ------------------------- | -------------------------------- |
| `{col}Pagination`         | `{col}EntitiesPagination`        |
| `{col}CurrentPage`        | `{col}EntitiesCurrentPage`       |
| `{col}PagedRequest`       | `{col}EntitiesPagedRequest`      |
| `load{Col}Page`           | `load{Col}EntitiesPage`          |
| `set{Col}PagedResult`     | `set{Col}EntitiesPagedResult`    |
| `loadMore{Col}`           | `loadMore{Col}Entities`          |
| `load{Col}NextPage`       | `load{Col}EntitiesNextPage`      |
| `load{Col}PreviousPage`   | `load{Col}EntitiesPreviousPage`  |
| `load{Col}FirstPage`      | `load{Col}EntitiesFirstPage`     |

### Filter

| v20                       | v21                              |
| ------------------------- | -------------------------------- |
| `{col}Filter`             | `{col}EntitiesFilter`            |
| `is{Col}FilterChanged`    | `is{Col}EntitiesFilterChanged`   |
| `reset{Col}Filter`        | `reset{Col}EntitiesFilter`       |

### Sort

| v20              | v21                     |
| ---------------- | ----------------------- |
| `{col}Sort`      | `{col}EntitiesSort`     |
| `sort{Col}`      | `sort{Col}Entities`     |

### Selection

| v20                         | v21                                |
| --------------------------- | ---------------------------------- |
| `isAll{Col}Selected`        | `isAll{Col}EntitiesSelected`       |
| `clear{Col}Selection`       | `clear{Col}EntitiesSelection`      |

> Note: Single selection properties (`{col}IdSelected`, `{col}EntitySelected`, etc.) remain unchanged.


