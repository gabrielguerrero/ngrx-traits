---
type: llm
weight: 2
---

The template must read the current page as a DeepSignal, one property at a time:
`store.productEntitiesCurrentPage.entities()`, `.total()`, `.pageIndex()`, `.pageSize()`
(or the collection-less `entitiesCurrentPage` form if no collection was configured).

Calling the signal first and then the property — `store.productEntitiesCurrentPage().entities()` —
is the mistake this case exists to catch: fail the response if it appears.

The filter and sort must be driven by the generated methods (`filterProductEntities({ filter, patch })`,
`sortProductEntities({ sort })`), not by hand-written `patchState` calls.
