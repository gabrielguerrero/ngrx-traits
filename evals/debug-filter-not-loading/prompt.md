---
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

This @ngrx-traits/signals store is broken: the list loads once on init, but typing in the search box
never reloads anything from the backend. No errors in the console. What is wrong?

```ts
const productEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'product',
});

export const ProductsStore = signalStore(
  { providedIn: 'root' },
  withEntities(productEntityConfig),
  withEntitiesLoadingCall(productEntityConfig, ({ productEntitiesFilter }) => ({
    fetchEntities: () =>
      inject(ProductService).getProducts({ search: productEntitiesFilter().search }),
  })),
  withCallStatus(productEntityConfig, { initialValue: 'loading' }),
  withEntitiesRemoteFilter(productEntityConfig, {
    defaultFilter: { search: '' },
  }),
);
```
