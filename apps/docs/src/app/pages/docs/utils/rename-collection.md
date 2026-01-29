---
name: Rename Collection Schematic
order: 2
---

# Rename Collection Schematic

A schematic for renaming collection-based properties in your ngrx store and related files. Useful for refactoring collection names or completing migrations the automatic migrator couldn't handle.

## Usage

```bash
ng g @ngrx-traits/signals:rename-collection --old-name=<name> [--new-name=<name>] [--path=<path>]
```

## Parameters

| Parameter    | Required | Default | Description                                         |
|--------------| -------- | ------- | --------------------------------------------------- |
| `--old-name` | Yes      | -       | Current collection name to find                     |
| `--new-name` | No       | oldName | New collection name (defaults to oldName for v21 migration) |
| `--path`     | No       | `src`   | Directory to search for files                       |

## Example: v21 Migration Fix

If the automatic migration missed some files, use this schematic:

```bash
# Adds 'Entities' suffix to 'product' collection properties
ng g @ngrx-traits/signals:rename-collection --old-name=product --path=src/app
```

This transforms:
```typescript
// Before
store.productCallStatus();
store.isProductLoading();
store.loadProductPage(1);
store.productFilter();

// After
store.productEntitiesCallStatus();
store.isProductEntitiesLoading();
store.loadProductEntitiesPage({ pageIndex: 1 });
store.productEntitiesFilter();
```

## Example: Rename Collection

Rename a collection from `product` to `item`:

```bash
ng g @ngrx-traits/signals:rename-collection --old-name=product --new-name=item --path=src/app
```

This transforms a complex store feature with filter, pagination, sort and loading:
```typescript
// Before
const productEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'product',
});

const productsStoreFeature = signalStoreFeature(
  withEntities(productEntityConfig),
  withCallStatus({
    ...productEntityConfig,
    initialValue: 'loading',
    errorType: type<string>(),
  }),
  withEntitiesRemoteFilter({
    ...productEntityConfig,
    defaultFilter: { search: '' },
  }),
  withEntitiesRemotePagination({
    ...productEntityConfig,
    pageSize: 10,
  }),
  withEntitiesRemoteSort({
    ...productEntityConfig,
    defaultSort: { field: 'name', direction: 'asc' },
  }),
  withEntitiesLoadingCall(
    ({ productEntitiesPagedRequest, productEntitiesFilter, productEntitiesSort }) => ({
      ...productEntityConfig,
      fetchEntities: async () => {
        const res = await lastValueFrom(
          inject(ProductService).getProducts({
            search: productEntitiesFilter().search,
            skip: productEntitiesPagedRequest().startIndex,
            take: productEntitiesPagedRequest().size,
            sortAscending: productEntitiesSort().direction === 'asc',
            sortColumn: productEntitiesSort().field,
          }),
        );
        return { entities: res.resultList, total: res.total };
      },
    }),
  ),
);

// Usages
store.productEntitiesFilter();
store.productEntitiesSort();
store.productEntitiesCurrentPage();
store.isProductEntitiesLoading();
store.loadProductEntitiesPage({ pageIndex: 1 });
```

```typescript
// After
const productEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'item',
});

const productsStoreFeature = signalStoreFeature(
  withEntities(productEntityConfig),
  withCallStatus({
    ...productEntityConfig,
    initialValue: 'loading',
    errorType: type<string>(),
  }),
  withEntitiesRemoteFilter({
    ...productEntityConfig,
    defaultFilter: { search: '' },
  }),
  withEntitiesRemotePagination({
    ...productEntityConfig,
    pageSize: 10,
  }),
  withEntitiesRemoteSort({
    ...productEntityConfig,
    defaultSort: { field: 'name', direction: 'asc' },
  }),
  withEntitiesLoadingCall(
    ({ itemEntitiesPagedRequest, itemEntitiesFilter, itemEntitiesSort }) => ({
      ...productEntityConfig,
      fetchEntities: async () => {
        const res = await lastValueFrom(
          inject(ProductService).getProducts({
            search: itemEntitiesFilter().search,
            skip: itemEntitiesPagedRequest().startIndex,
            take: itemEntitiesPagedRequest().size,
            sortAscending: itemEntitiesSort().direction === 'asc',
            sortColumn: itemEntitiesSort().field,
          }),
        );
        return { entities: res.resultList, total: res.total };
      },
    }),
  ),
);

// Usages
store.itemEntitiesFilter();
store.itemEntitiesSort();
store.itemEntitiesCurrentPage();
store.isItemEntitiesLoading();
store.loadItemEntitiesPage(1);
```

## What Gets Renamed

The schematic renames all collection-based properties:

### CallStatus Properties
- `{old}CallStatus` → `{new}EntitiesCallStatus`
- `{old}Error` → `{new}EntitiesError`
- `is{Old}Loading` → `is{New}EntitiesLoading`
- `is{Old}Loaded` → `is{New}EntitiesLoaded`
- `set{Old}Loading` → `set{New}EntitiesLoading`
- `set{Old}Loaded` → `set{New}EntitiesLoaded`
- `set{Old}Error` → `set{New}EntitiesError`

### Pagination Properties
- `{old}Pagination` → `{new}EntitiesPagination`
- `{old}CurrentPage` → `{new}EntitiesCurrentPage`
- `{old}PagedRequest` → `{new}EntitiesPagedRequest`
- `load{Old}Page` → `load{New}EntitiesPage`
- `set{Old}PagedResult` → `set{New}EntitiesPagedResult`
- `loadMore{Old}` → `loadMore{New}Entities`
- `load{Old}NextPage` → `load{New}EntitiesNextPage`
- `load{Old}PreviousPage` → `load{New}EntitiesPreviousPage`
- `load{Old}FirstPage` → `load{New}EntitiesFirstPage`

### Filter Properties
- `{old}Filter` → `{new}EntitiesFilter`
- `is{Old}FilterChanged` → `is{New}EntitiesFilterChanged`
- `reset{Old}Filter` → `reset{New}EntitiesFilter`
- `filter{Old}Entities` → `filter{New}Entities`

### Sort Properties
- `{old}Sort` → `{new}EntitiesSort`
- `sort{Old}` → `sort{New}Entities`

### Selection Properties
- `{old}IdsSelectedMap` → `{new}IdsSelectedMap`
- `{old}EntitiesSelected` → `{new}EntitiesSelected`
- `{old}IdsSelected` → `{new}IdsSelected`
- `isAll{Old}Selected` → `isAll{New}EntitiesSelected`
- `toggleSelectAll{Old}Entities` → `toggleSelectAll{New}Entities`
- `select{Old}Entities` → `select{New}Entities`
- `deselect{Old}Entities` → `deselect{New}Entities`
- `clear{Old}Selection` → `clear{New}EntitiesSelection`

### Entity Properties
- `{old}Entities` → `{new}Entities`
- `{old}Ids` → `{new}Ids`
- `{old}EntityMap` → `{new}EntityMap`

### Collection Config
- `collection: '{old}'` → `collection: '{new}'`

## File Types Processed

The schematic processes:
- `.ts` files (TypeScript)
- `.html` files (templates)

Files in `node_modules` and `.git` directories are automatically excluded.

## Best Practices

1. **Commit before running**: Always commit your changes before running the schematic
2. **Review changes**: Check the git diff after running to verify the changes
3. **Run tests**: Execute your test suite to catch any issues
4. **Multiple collections**: Run the schematic once per collection you need to rename

```bash
# Rename multiple collections
ng g @ngrx-traits/signals:rename-collection --old-name=product
ng g @ngrx-traits/signals:rename-collection --old-name=order
ng g @ngrx-traits/signals:rename-collection --old-name=user
```
