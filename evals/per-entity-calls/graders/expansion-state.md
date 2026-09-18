---
type: llm
weight: 1
---

Tracking which rows are expanded should reuse `withEntitiesMultiSelection`
(e.g. `toggleSelectOrderEntities(order)` plus `orderIdsSelectedMap()`), or some other state the
library already provides, rather than a hand-rolled `Set` in the component — and the answer should
avoid re-fetching a detail that is already loaded (checking `isLoadOrderDetailLoaded`, or `skipWhen`).

This is a secondary criterion: an otherwise correct answer that keeps expansion state in the component
still passes if it is deliberate and coherent.
