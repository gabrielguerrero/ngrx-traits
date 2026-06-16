# Sorting: withEntitiesLocalSort, withEntitiesRemoteSort

Both generate, with `collection: 'product'`:

```typescript
productEntitiesSort: Signal<Sort<Entity>>; // { field: keyof Entity; direction: 'asc' | 'desc' | '' }
sortProductEntities(options?): void;
// options accepts a Sort<Entity> ({ field, direction }), a CdkSort<Entity> ({ active, direction }),
// either of them wrapped in { sort }, or an observable / reactive fn of those.
// Remote sort also accepts { sort, skipLoadingCall } to store the sort without fetching.
```

Calling `sortProductEntities()` with no argument reapplies the current sort.

## withEntitiesLocalSort

Sorts in memory, reapplied whenever the entities change. Requires `withEntities`.

```typescript
withEntitiesLocalSort(productEntityConfig, {
  defaultSort: { field: 'name', direction: 'asc' },
});
```

| Option | Description |
|---|---|
| `defaultSort` | `{ field, direction }`; the field autocompletes from the entity type |

## withEntitiesRemoteSort

Stores the sort and calls `setProductEntitiesLoading()`, so `withEntitiesLoadingCall` refetches sorted data.
Requires `withEntities` + `withCallStatus`.

```typescript
signalStore(
  withEntities(productEntityConfig),
  withCallStatus(productEntityConfig, { initialValue: 'loading' }),
  withEntitiesRemoteSort(productEntityConfig, { defaultSort: { field: 'name', direction: 'asc' } }),
  withEntitiesLoadingCall(productEntityConfig, ({ productEntitiesSort }) => ({
    fetchEntities: () =>
      inject(ProductService).getProducts({
        sortColumn: productEntitiesSort().field,
        sortAscending: productEntitiesSort().direction === 'asc',
      }),
  })),
);
```

Pass `skipLoadingCall: true` to change other state before triggering the fetch yourself.

## Templates

`sortProductEntities` accepts the CDK/Material shape (`{ active, direction }`) as well, so `matSortChange`
events can be passed straight through:

```html
<table mat-table matSort
  [matSortActive]="store.productEntitiesSort().field"
  [matSortDirection]="store.productEntitiesSort().direction"
  (matSortChange)="store.sortProductEntities({ sort: $event })">
  ...
</table>
```

To bind sorting to a `model()` or a form control, use [`withLinkEntitiesSort`](links-forms.md).
