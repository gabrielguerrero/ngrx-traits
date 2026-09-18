---
type: llm
weight: 2
---

The answer must bind the form through the link API:

- `withLinkEntitiesFilter(productEntityConfig)` added to the store (or `withLink('productEntitiesFilter', ...)`
  with a `set` that calls `filterProductEntities`), and
- `form(this.store.linkProductEntitiesFilter())` in the component.

Recommending the deprecated `withInputBindings` is a failure. Hand-rolling an `effect()` that copies
the form value into the store with `patchState`, when the link API would do it, is also a failure.
