# Selection: withEntitiesSingleSelection, withEntitiesMultiSelection

Both require `withEntities` and go after it (and after `withCallStatus` when the store has one).

| Option | Description | Default |
|---|---|---|
| `clearOnFilter` | Clear the selection when the filter changes | `true` |
| `clearOnRemoteSort` | Clear the selection when a remote sort changes | `true` |

## withEntitiesSingleSelection

```typescript
withEntitiesSingleSelection(productEntityConfig);

productIdSelected: Signal<string | number | undefined>;  // state
productEntitySelected: Signal<Product | undefined>;      // computed
selectProductEntity({ id }): void;
deselectProductEntity(): void;
toggleSelectProductEntity({ id }): void;
```

```html
@for (product of store.productEntities(); track product.id) {
  <mat-list-item
    [class.selected]="store.productIdSelected() === product.id"
    (click)="store.selectProductEntity(product)"
  >{{ product.name }}</mat-list-item>
}
```

Load a detail whenever the selection changes with `callWith` — see [calls.md](calls.md):

```typescript
withEntitiesSingleSelection(productEntityConfig),
withCalls(({ productEntitySelected }) => ({
  loadProductDetail: callConfig({
    call: ({ id }: { id: string }) => inject(ProductService).getProductDetail(id),
    resultProp: 'productDetail',
    callWith: productEntitySelected,
    mapPipe: 'switchMap',
  }),
})),
```

## withEntitiesMultiSelection

```typescript
withEntitiesMultiSelection(productEntityConfig);

productIdsSelectedMap: Record<string | number, boolean>;        // state
productIdsSelected: Signal<(string | number)[]>;                // computed
productEntitiesSelected: Signal<Product[]>;                     // computed
isAllProductEntitiesSelected: Signal<'all' | 'none' | 'some'>;  // computed
selectProductEntities({ id } | { ids } | { ids, clearSelectionBeforeSelect }): void;
deselectProductEntities({ id } | { ids }): void;
toggleSelectProductEntities({ id } | { ids }): void;
toggleSelectAllProductEntities(): void;
clearProductEntitiesSelection(): void;
```

```html
@for (item of store.productEntities(); track item.id) {
  <mat-list-option
    [selected]="!!store.productIdsSelectedMap()[item.id]"
    (click)="store.toggleSelectProductEntities({ id: item.id })"
  >{{ item.name }}</mat-list-option>
}
```

`isAllProductEntitiesSelected` and `toggleSelectAllProductEntities` only see the entities the store holds,
so they are wrong under remote pagination, where that is just the cached page window.

Multi-selection also works as "which rows are expanded", paired with
[`withEntitiesCalls`](calls.md) to load each row's detail:

```typescript
withMethods((store) => ({
  toggleShowDetail(order: OrderSummary) {
    store.toggleSelectOrderEntities(order);
    if (!store.isLoadOrderDetailLoaded(order)) store.loadOrderDetail(order);
  },
}));
```

## Binding the selection elsewhere

- To a `model()`, an `input()` or a form field: [`withLinkEntitiesSingleSelection` /
  `withLinkEntitiesMultiSelection`](links-forms.md).
- To the URL: `withEntitiesSyncToRouteQueryParams` with `syncSingleSelection` (default `true`) or
  `syncMultiSelection` — see [sync-routing.md](sync-routing.md).
