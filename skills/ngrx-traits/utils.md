# Utils: withFeatureFactory, withLogger, ExtractStoreFeatureOutput, rename-collection schematic

## ExtractStoreFeatureOutput

TypeScript utility type — extracts the output type of a `signalStoreFeature` function so it can be used as the input type of a dependent feature. Essential when splitting large stores.

```typescript
import { ExtractStoreFeatureOutput } from '@ngrx-traits/signals';

// feature-a.ts
export function withProductEntities() {
  return signalStoreFeature(
    withEntities(cfg),
    withCallStatus({ ...cfg, initialValue: 'loading', errorType: type<string>() }),
    withEntitiesRemoteFilter({ ...cfg, defaultFilter: { search: '' } }),
    withEntitiesRemotePagination({ ...cfg, pageSize: 10 }),
    withEntitiesRemoteSort({ ...cfg, defaultSort: { field: 'name', direction: 'asc' } }),
    withEntitiesSingleSelection(cfg),
  );
}
// Extract the output type
export type ProductEntitiesOutput = ExtractStoreFeatureOutput<typeof withProductEntities>;

// feature-b.ts — depends on feature-a's output
export function withProductCalls() {
  return signalStoreFeature(
    type<ProductEntitiesOutput>(), // ← declares dependency, enables type inference
    withEntitiesLoadingCall(
      ({ productEntitiesFilter, productEntitiesPagedRequest, productEntitiesSort }) => ({
        ...cfg,
        fetchEntities: async () => {
          const res = await lastValueFrom(inject(ProductService).getProducts({
            search: productEntitiesFilter().search,
            skip: productEntitiesPagedRequest().startIndex,
            take: productEntitiesPagedRequest().size,
          }));
          return { entities: res.resultList, total: res.total };
        },
      }),
    ),
    withCalls((store, svc = inject(ProductService)) => ({
      loadProductDetail: ({ id }: { id: string }) => svc.getProductDetail(id),
    })),
  );
}

// store.ts
export const ProductStore = signalStore(withProductEntities(), withProductCalls());
```

**Rules:**
- Wrap `signalStoreFeature(...)` in a function to use `typeof`
- Use `type<ExtractedType>()` as the **first** argument in the dependent feature
- `signalStore` can only accept up to 10 parameters — split features when approaching this limit

---

## withFeatureFactory

Lets a custom store feature's config be a factory function that receives the current store state. Useful for wrapping traits that don't natively support store-accessing factories.

```typescript
import { withFeatureFactory, getFeatureConfig } from '@ngrx-traits/signals';

// Use current store state to configure a feature
const Store = signalStore(
  withState({ pageSize: 10 }),
  withFeatureFactory(({ pageSize }) =>
    signalStoreFeature(
      withEntitiesLocalPagination({ ...cfg, pageSize: pageSize() }),
    )
  ),
);

// Build a reusable feature that accepts a store-accessing factory
function withCustomFeature<Input extends SignalStoreFeatureResult>(
  configFactory: FeatureConfigFactory<Input, { fooValue: string }>,
) {
  return withFeatureFactory((store: StoreSource<Input>) => {
    const config = getFeatureConfig(configFactory, store);
    return signalStoreFeature(
      withState({ foo: config.fooValue }),
      withComputed(({ foo }) => ({ bar: computed(() => foo() + '!') })),
    );
  }) as any;
}

// Now supports both plain object and factory
const Store = signalStore(
  withState({ name: 'hello' }),
  withCustomFeature(({ name }) => ({ fooValue: name() })), // factory form
  // withCustomFeature({ fooValue: 'literal' }),            // plain form
);
```

Generates no extra state, computed, or methods.

---

## withLogger

Development utility. Logs state and computed signal changes to the console.

```typescript
import { withLogger } from '@ngrx-traits/signals';

// Log all signals
signalStore(
  withState({ foo: 'bar' }),
  withEntities(cfg),
  withLogger({ name: 'MyStore' }), // put last
)

// Log only specific signals
withLogger({
  name: 'MyStore',
  filter: ['productIds', 'productEntitiesFilter'], // array of signal names
})

// Log with function filter
withLogger({
  name: 'MyStore',
  filter: ({ productEntityMap, productIds }) => ({ productEntityMap, productIds }),
})
```

**Config:**

| Property | Description |
|---|---|
| `name` | Label shown in console output |
| `filter` | Optional: `string[]` of signal names, or `(store) => filteredStore` |

Place `withLogger` last in the store so it can observe all signals.

---

## rename-collection schematic

Angular schematic for renaming collection-based properties across `.ts` and `.html` files.

**Rename a collection:**
```bash
ng g @ngrx-traits/signals:rename-collection --old-name=product --new-name=item --path=src/app
```

**v21 migration fix** (adds `Entities` suffix):
```bash
ng g @ngrx-traits/signals:rename-collection --old-name=product --path=src/app
```

**Multiple collections:**
```bash
ng g @ngrx-traits/signals:rename-collection --old-name=product
ng g @ngrx-traits/signals:rename-collection --old-name=order
ng g @ngrx-traits/signals:rename-collection --old-name=user
```

**Parameters:**

| Parameter | Required | Default | Description |
|---|---|---|---|
| `--old-name` | yes | — | Current collection name |
| `--new-name` | no | old-name | New collection name |
| `--path` | no | `src` | Directory to search |

**Best practices:** Commit before running; review git diff; run tests after.

**What gets renamed** (example: `product` → `item`):

| Before | After |
|---|---|
| `productEntities()` | `itemEntities()` |
| `isProductEntitiesLoading()` | `isItemEntitiesLoading()` |
| `filterProductEntities()` | `filterItemEntities()` |
| `productEntitiesSort()` | `itemEntitiesSort()` |
| `loadProductEntitiesPage()` | `loadItemEntitiesPage()` |
| `productEntitySelected()` | `itemEntitySelected()` |
| `collection: 'product'` | `collection: 'item'` |
