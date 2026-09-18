---
type: llm
weight: 2
---

The store must use the LOCAL features — `withEntitiesLocalFilter` (with a `filterFn`),
`withEntitiesLocalSort`, `withEntitiesLocalPagination` — with `withEntities` first and
`withCallStatus({ initialValue: 'loading' })` before them, and `withEntitiesLoadingCall` last.

Using the remote variants (`withEntitiesRemoteFilter` etc.) for this prompt is a failure:
the backend returns the full list and takes no query parameters.

`fetchEntities` must return the plain entity array (e.g. `map((d) => d.resultList)`), NOT
`{ entities, total }` — there is no remote pagination here.
