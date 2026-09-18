---
type: llm
weight: 2
---

The store must compose the traits in a working order:

- `withEntities` first, built from an `entityConfig({ entity: type<Product>(), collection: ... })`.
- `withCallStatus` with `initialValue: 'loading'`, placed BEFORE every other `withEntities*` feature.
- `withEntitiesRemoteFilter`, `withEntitiesRemotePagination` and `withEntitiesRemoteSort` after `withCallStatus`.
- `withEntitiesLoadingCall` LAST of the entity features.

Fail the response if `withEntitiesLoadingCall` appears before any feature whose signals it reads,
or if `withCallStatus` is missing or placed after the filter/sort/pagination features.
