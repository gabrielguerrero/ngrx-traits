---
type: llm
weight: 2
---

The generated code must use the real @ngrx-traits/signals API:

- `withEntitiesLoadingCall` reads the request from the generated signals — `productEntitiesFilter()`,
  `productEntitiesPagedRequest()` (with `.startIndex` and `.size`) and `productEntitiesSort()`
  (with `.field` and `.direction`) — rather than inventing its own state.
- `fetchEntities` returns `{ entities, total }` (the total is required for remote pagination).
- The component renders from `productEntitiesCurrentPage`, accessed as a DeepSignal:
  `store.productEntitiesCurrentPage.entities()`, `.total()`, `.pageIndex()`, `.pageSize()`.
  Accessing it as `store.productEntitiesCurrentPage().entities()` is WRONG and must fail.
- Page changes go through `store.loadProductEntitiesPage(...)`.

Invented names such as `productsLoading()`, `setFilter()`, `store.products()` or
`entitiesCurrentPage.items()` are a failure.
