---
type: llm
weight: 1
---

The fix must stay within the real API: reordering the existing features (and, if mentioned, wiring
the input to `filterProductEntities({ filter: { search }, patch: true })`).

Fail the response if it invents API that does not exist — a `watch`/`deps`/`triggers` option on
`withEntitiesLoadingCall`, a `reloadOnFilterChange` flag, a manual `effect()` calling
`setProductEntitiesLoading` presented as the required fix, or a `withEntitiesRemoteFilter` option
that re-triggers the call.
