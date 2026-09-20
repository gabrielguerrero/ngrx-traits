# Utils: ExtractStoreFeatureOutput, withFeatureFactory, withLogger, rename-collection

## ExtractStoreFeatureOutput

Extracts the output type of a custom store feature so a dependent feature can declare it as input.
Needed when splitting a store: a feature cannot see the signals of another one unless it declares them
(`signalStore` also caps out at 15 features).

```typescript
import { ExtractStoreFeatureOutput } from '@ngrx-traits/signals';

export function withProductEntities() {
  return signalStoreFeature(
    withEntities(productEntityConfig),
    withCallStatus(productEntityConfig, { initialValue: 'loading', errorType: type<string>() }),
    withEntitiesRemoteFilter(productEntityConfig, { defaultFilter: { search: '' } }),
    withEntitiesRemotePagination(productEntityConfig, { pageSize: 10 }),
    withEntitiesSingleSelection(productEntityConfig),
  );
}
export type ProductEntitiesOutput = ExtractStoreFeatureOutput<typeof withProductEntities>;

export function withProductCalls() {
  return signalStoreFeature(
    type<ProductEntitiesOutput>(), // must be the first argument
    withEntitiesLoadingCall(
      productEntityConfig,
      ({ productEntitiesFilter, productEntitiesPagedRequest }, service = inject(ProductService)) => ({
        fetchEntities: async () => {
          /* ... */
        },
      }),
    ),
  );
}

export const ProductStore = signalStore(withProductEntities(), withProductCalls());
```

Rules: wrap `signalStoreFeature(...)` in a function so `typeof` has something to read, and put
`type<ExtractedType>()` first in the dependent feature.

## withFeatureFactory

Lets a feature's config be a factory that receives the store, for features that do not accept one
natively, and is how you build your own traits with that capability.

```typescript
import { withFeatureFactory, getFeatureConfig } from '@ngrx-traits/signals';

// configure a feature from state already in the store
signalStore(
  withState({ pageSize: 10 }),
  withFeatureFactory(({ pageSize }) =>
    signalStoreFeature(withEntitiesLocalPagination(productEntityConfig, { pageSize: pageSize() })),
  ),
);

// a reusable feature accepting either a plain config or a factory
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
```

## withLogger

Logs state and computed signal changes. The name is the **first argument**; passing a single config
object is deprecated. Put it last so it sees every signal, and keep it out of production builds.

```typescript
withLogger('ProductStore');
withLogger('ProductStore', { filter: ['productIds', 'productEntitiesFilter'] });
withLogger('ProductStore', { filter: ({ productEntityMap, productIds }) => ({ productEntityMap, productIds }) });
withLogger('ProductStore', { showDiff: true });
```

| Option | Description |
|---|---|
| `filter` | Prop names to log, or a fn returning the slice to log |
| `showDiff` | Also log the diff between the previous and the new state |

## rename-collection schematic

Renames every generated name of a collection across `.ts` and `.html` files.

```bash
# rename a collection
ng g @ngrx-traits/signals:rename-collection --old-name=product --new-name=item --path=src/app

# v21 migration: adds the `Entities` infix to the old names, run once per collection
ng g @ngrx-traits/signals:rename-collection --old-name=product
```

| Parameter | Required | Default | Description |
|---|---|---|---|
| `--old-name` | yes | — | Current collection name |
| `--new-name` | no | `""` | New collection name; empty only adds the `Entities` infix |
| `--path` | no | `src` | Directory to search |
| `--skip-git-check` | no | `false` | Run with uncommitted changes in the tree |

It rewrites `productEntities()`, `isProductEntitiesLoading()`, `filterProductEntities()`,
`productEntitySelected()`, `collection: 'product'` and the rest. Commit first, then review the diff and
run the tests.

## Deprecated

- `withInputBindings` → [`withLink`](links-forms.md) or `withStateSetter`.
- `withLogger({ name })` → `withLogger('name', { ... })`.
