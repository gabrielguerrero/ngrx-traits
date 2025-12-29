# Migration Guide: @ngrx-traits/signals v20.0.0

## Overview

Version 20.0.0 introduces a naming convention change for all trait-generated properties and methods. Collection names are now followed by the `Entities` suffix for consistency with ngrx/signals patterns.

**Example:** `productFilter` → `productEntitiesFilter`

## What Changed

### Property Naming Convention

All trait-generated properties now include the `Entities` suffix between the collection name and the property type.

#### CallStatus Trait
- `{name}CallStatus` → `{name}EntitiesCallStatus`
- `{name}Error` → `{name}EntitiesError`
- `is{Name}Loading` → `is{Name}EntitiesLoading`
- `is{Name}Loaded` → `is{Name}EntitiesLoaded`
- `set{Name}Loading()` → `set{Name}EntitiesLoading()`
- `set{Name}Loaded()` → `set{Name}EntitiesLoaded()`
- `set{Name}Error()` → `set{Name}EntitiesError()`

#### Pagination Trait
- `{name}Pagination` → `{name}EntitiesPagination`
- `{name}CurrentPage` → `{name}EntitiesCurrentPage`
- `{name}PagedRequest` → `{name}EntitiesPagedRequest`
- `load{Name}Page()` → `load{Name}EntitiesPage()`
- `set{Name}PagedResult()` → `set{Name}EntitiesPagedResult()`
- `loadMore{Name}()` → `loadMore{Name}Entities()`
- `load{Name}NextPage()` → `load{Name}EntitiesNextPage()`
- `load{Name}PreviousPage()` → `load{Name}EntitiesPreviousPage()`
- `load{Name}FirstPage()` → `load{Name}EntitiesFirstPage()`

#### Filter Trait
- `{name}Filter` → `{name}EntitiesFilter`
- `is{Name}FilterChanged` → `is{Name}EntitiesFilterChanged`
- `reset{Name}Filter()` → `reset{Name}EntitiesFilter()`

#### Sort Trait
- `{name}Sort` → `{name}EntitiesSort`
- `sort{Name}()` → `sort{Name}Entities()`

## Automatic Migration

### Method 1: Using `ng update` (Recommended)

Run the automatic migration schematic:

```bash
ng update @ngrx-traits/signals --migrate-only
```

This will:
- Scan your project for @ngrx-traits/signals usage
- Rename all 17 property patterns automatically
- Process both `.ts` and `.html` files
- Generate a migration report

**Requirements:**
- Clean git working directory (use `--skip-git-check` to override)
- Angular 20.0.0 or later

### Method 2: Manual Migration

If you prefer to migrate manually, follow the pattern mappings above to rename properties in your code.

## Collection Renaming

If you want to rename your collection from plural to singular (e.g., `products` → `product`), use the collection rename schematic:

```bash
ng generate @ngrx-traits/signals:rename-collection \
  --old-name=products \
  --new-name=product \
  --path=src/app
```

This will:
- Rename all collection-related properties
- Handle capitalization automatically
- Support all trait patterns
- Work recursively through your specified path

## Examples

### Before Migration

```typescript
// Store definition
export const createProductsStore = () =>
  signalStore(
    withEntities({ entity: Product }),
    withCallStatus({ initialState: LoadingState.Init }),
    withPagination()
  );

// Component usage
export class ProductsComponent {
  store = inject(createProductsStore);

  loadData() {
    // Properties
    const filter = this.store.productsFilter();
    const page = this.store.productsCurrentPage();
    const loading = this.store.isProductsLoading();
    const error = this.store.productsError();

    // Methods
    this.store.setProductsLoading(true);
    this.store.loadProductsPage({ page: 1 });
    this.store.resetProductsFilter();
    this.store.sortProducts({ field: 'name' });
  }
}
```

### After Migration

```typescript
// Store definition (unchanged)
export const createProductsStore = () =>
  signalStore(
    withEntities({ entity: Product }),
    withCallStatus({ initialState: LoadingState.Init }),
    withPagination()
  );

// Component usage
export class ProductsComponent {
  store = inject(createProductsStore);

  loadData() {
    // Properties
    const filter = this.store.productsEntitiesFilter();
    const page = this.store.productsEntitiesCurrentPage();
    const loading = this.store.isProductsEntitiesLoading();
    const error = this.store.productsEntitiesError();

    // Methods
    this.store.setProductsEntitiesLoading(true);
    this.store.loadProductsEntitiesPage({ page: 1 });
    this.store.resetProductsEntitiesFilter();
    this.store.sortProductsEntities({ field: 'name' });
  }
}
```

### HTML Templates

```html
<!-- Before -->
<div *ngIf="store.isProductsLoading()">Loading...</div>
<button (click)="store.loadProductsPage(1)">Next</button>

<!-- After -->
<div *ngIf="store.isProductsEntitiesLoading()">Loading...</div>
<button (click)="store.loadProductsEntitiesPage(1)">Next</button>
```

## Testing After Migration

Run your test suite to ensure everything works:

```bash
npm test
npm run build
```

## Reverting Migration (if needed)

If you need to revert the migration, use git:

```bash
git checkout -- .
```

## FAQ

**Q: Will my store definitions change?**
A: No, your store definitions remain the same. Only the property and method names change.

**Q: Do I need to update my TypeScript types?**
A: The types are automatically updated during migration.

**Q: What about third-party packages using @ngrx-traits/signals?**
A: They'll need to update to v20.0.0+ which includes the new naming convention.

**Q: Can I migrate selectively?**
A: The migration tool processes all files, but you can use `--skip-confirmation` for batch processing or manually edit files.

## Troubleshooting

**Issue: Git check failed**
```bash
ng update @ngrx-traits/signals --migrate-only --skip-git-check
```

**Issue: Migration didn't find files**
- Ensure `@ngrx-traits/signals` is imported in your TypeScript files
- Check that files are not in `.gitignore` or excluded directories

**Issue: Some properties weren't renamed**
- Check for custom stores that don't use traits (only trait-generated properties are renamed)
- Verify TypeScript/HTML syntax is correct

## Support

For issues or questions:
- GitHub: https://github.com/gabrielguerrero/ngrx-traits/issues
- Documentation: https://github.com/gabrielguerrero/ngrx-traits

## See Also

- [ngrx-traits Documentation](https://github.com/gabrielguerrero/ngrx-traits)
- [@ngrx/signals Documentation](https://ngrx.io/guide/signals)
