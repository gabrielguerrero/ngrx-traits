# Filtering: withEntitiesLocalFilter, withEntitiesRemoteFilter, withEntitiesHybridFilter

All three generate the same shape. With `collection: 'product'`:

```typescript
productEntitiesFilter: Signal<FilterType>;
isProductEntitiesFilterChanged: Signal<boolean>;

// a plain filter, or an options object:
filterProductEntities(options?: {
  filter: FilterType | Partial<FilterType>;
  patch?: boolean;           // merge into the current filter instead of replacing it
  debounce?: number;         // overrides defaultDebounce, 0 applies immediately
  forceLoad?: boolean;
  skipLoadingCall?: boolean; // remote/hybrid: store the filter without triggering a fetch
}): Promise<{ value: Signal<Entity[]>; ok: true } | { error: Signal<unknown>; ok: false }>;
// given a signal fn or an observable of those options it returns an RxMethodRef instead,
// and keeps filtering on every emission

resetProductEntitiesFilter(options?: {
  newDefaultFilter?: FilterType;
  debounce?: number;
  forceLoad?: boolean;
  skipLoadingCall?: boolean;
}): void;
```

Calling `filterProductEntities()` with no argument reapplies the current filter — useful after entities
were changed by hand. The returned promise resolves once the resulting load settles, so a filter form can
show a server error on submit.

## withEntitiesLocalFilter

Filters in memory with `filterFn`, reapplied every time the entities reload. Requires `withEntities`.

```typescript
withEntitiesLocalFilter(productEntityConfig, {
  defaultFilter: { search: '' },
  filterFn: (entity, filter) =>
    !filter?.search || entity.name.toLowerCase().includes(filter.search.toLowerCase()),
});
```

| Option | Description |
|---|---|
| `defaultFilter` | Initial filter; its type is inferred from this value |
| `filterFn` | `(entity, filter) => boolean` |
| `defaultDebounce` | Debounce in ms applied to `filterProductEntities` |

## withEntitiesRemoteFilter

Stores the filter and calls `setProductEntitiesLoading()`, which makes `withEntitiesLoadingCall` refetch.
Requires `withEntities` + `withCallStatus`. Debounced by default.

```typescript
signalStore(
  withEntities(productEntityConfig),
  withCallStatus(productEntityConfig, { initialValue: 'loading' }),
  withEntitiesRemoteFilter(productEntityConfig, { defaultFilter: { search: '', category: '' } }),
  withEntitiesLoadingCall(productEntityConfig, ({ productEntitiesFilter }) => ({
    fetchEntities: () =>
      inject(ProductService).getProducts({
        search: productEntitiesFilter().search,
        category: productEntitiesFilter().category,
      }),
  })),
);
```

Options: `defaultFilter`, `defaultDebounce`. There is no `filterFn` — the backend filters.

## withEntitiesHybridFilter

Decides per change whether to filter locally or refetch. Requires `withEntities` + `withCallStatus`.

```typescript
withEntitiesHybridFilter(productEntityConfig, {
  defaultFilter: { search: '', categoryId: 'snes' },
  // only the category is filtered by the backend
  isRemoteFilter: (previous, current) => previous.categoryId !== current.categoryId,
  filterFn: (entity, filter) =>
    !filter?.search || entity.name.toLowerCase().includes(filter.search.toLowerCase()),
});
```

Options: `defaultFilter`, `filterFn`, `isRemoteFilter`, `defaultDebounce`.

**Do not** combine the local half with `withEntitiesRemotePagination` / `withEntitiesRemoteScrollPagination`:
the store only holds the cached page window, so a local filter would filter a fragment of the data.
Use `withEntitiesLocalPagination` instead.

## Templates

Live filtering (debounced by default, `patch` updates one field):

```html
<input type="text" (input)="store.filterProductEntities({ filter: { search: $event.target.value }, patch: true })" />
```

Apply button — pass `debounce: 0` so the filter is not delayed:

```html
<form (submit)="store.filterProductEntities({ filter: { search: searchInput.value }, debounce: 0 })">
  <input #searchInput type="text" />
  <button type="submit">Apply</button>
</form>
```

Signal Forms, applying on submit and surfacing a server error:

```typescript
filter = linkedSignal(this.store.productEntitiesFilter);
filterForm = form(this.filter);

submitSearch() {
  submit(this.filterForm, async () => {
    const result = await this.store.filterProductEntities({ filter: this.filter() });
    if (!result.ok) return { kind: 'server', message: result.error() as string } satisfies TreeValidationResult;
    return undefined;
  });
}
```

To bind a form or a `model()` directly to the filter instead, use
[`withLinkEntitiesFilter`](links-forms.md).
