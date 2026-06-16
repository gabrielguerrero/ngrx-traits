# Selection: withEntitiesSingleSelection, withEntitiesMultiSelection

Both require `withEntities` and must come after it. They can appear before or after remote/local filter/sort/pagination.

---

## withEntitiesSingleSelection

Track a single selected entity by id.

```typescript
import { withEntitiesSingleSelection } from '@ngrx-traits/signals';

const cfg = entityConfig({ entity: type<Product>(), collection: 'product' });

const store = signalStore(
  withEntities(cfg),
  withEntitiesSingleSelection(cfg),
  // ... other traits
);
```

**Config:**

| Property | Description | Default |
|---|---|---|
| `entity` | Entity type | required |
| `collection` | Collection name (optional) | — |
| `clearOnFilter` | Clear selection when filter changes | `true` |
| `clearOnRemoteSort` | Clear selection when remote sort changes | `true` |

**Generated (collection = `product`):**
```typescript
// State
productEntityIdSelected: Signal<string | number | undefined>

// Computed
productEntitySelected: Signal<Product | undefined>

// Methods
selectProductEntity({ id: string | number }): void
deselectProductEntity({ id: string | number }): void
toggleProductEntity({ id: string | number }): void
```

**Template — list with selection:**
```html
<mat-list>
  @for (product of store.productEntities(); track product.id) {
    <mat-list-item
      [class.selected]="store.productEntitySelected() === product"
      (click)="store.selectProductEntity(product)"
    >
      {{ product.name }}
    </mat-list-item>
  }
</mat-list>
```

**Reactive callWith pattern** — load detail whenever selection changes:
```typescript
withEntitiesSingleSelection(cfg),
withCalls(({ productEntitySelected }) => ({
  loadProductDetail: callConfig({
    call: ({ id }: { id: string }) => inject(ProductService).getProductDetail(id),
    resultProp: 'productDetail',
    callWith: productEntitySelected, // Signal<Product | undefined> — skips if undefined
  }),
})),
// store.productDetail() — result signal
// store.isLoadProductDetailLoading() / isLoadProductDetailLoaded()
```

---

## withEntitiesMultiSelection

Track multiple selected entity ids in a map.

```typescript
import { withEntitiesMultiSelection } from '@ngrx-traits/signals';

const store = signalStore(
  withEntities(cfg),
  withEntitiesMultiSelection(cfg),
  // ... other traits
);
```

**Config:**

| Property | Description | Default |
|---|---|---|
| `entity` | Entity type | required |
| `collection` | Collection name (optional) | — |
| `clearOnFilter` | Clear selection when filter changes | `true` |
| `clearOnRemoteSort` | Clear selection when remote sort changes | `true` |

**Generated (collection = `product`):**
```typescript
// State
productIdsSelectedMap: Record<string | number, boolean>

// Computed
productEntitiesSelected: Signal<Product[]>
isAllProductEntitiesSelected: Signal<'all' | 'none' | 'some'>

// Methods
selectProductEntities({ id: string | number } | { ids: (string | number)[] }): void
deselectProductEntities({ id: string | number } | { ids: (string | number)[] }): void
toggleSelectProductEntities({ id: string | number } | { ids: (string | number)[] }): void
toggleSelectAllProductEntities(): void
```

**Template — checkbox list:**
```html
<mat-selection-list [multiple]="true">
  @for (item of store.productEntities(); track item.id) {
    <mat-list-option
      [value]="item.id"
      [selected]="!!store.productIdsSelectedMap()[item.id]"
      (click)="store.toggleSelectProductEntities({ id: item.id })"
    >
      {{ item.name }}
    </mat-list-option>
  }
</mat-selection-list>
```

**Warning:** `isAllProductEntitiesSelected` and `toggleSelectAllProductEntities` do not work correctly with remote pagination — they can only see the currently cached page, not the full dataset.

**Use multi-selection to track expanded rows** (e.g. in `withEntitiesCalls`):
```typescript
withEntitiesMultiSelection(orderCfg), // track which rows are expanded
withEntitiesCalls({
  ...orderCfg,
  calls: (store, svc = inject(OrderService)) => ({
    loadOrderDetail: (entity: Order) => svc.getOrderDetail(entity.id).pipe(map(({ items }) => ({ items }))),
  }),
}),
withMethods((store) => ({
  toggleShowDetail(order: Order) {
    store.toggleSelectOrdersEntities(order);
    if (!store.isLoadOrderDetailLoaded(order)) {
      store.loadOrderDetail(order);
    }
  },
})),
```

---

## Syncing selection to URL

Use `withEntitiesSyncToRouteQueryParams` with `syncSingleSelection: true` (default) or `syncMultiSelection: true` — see [sync-routing.md](sync-routing.md).
