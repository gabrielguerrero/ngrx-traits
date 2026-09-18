---
type: llm
weight: 2
---

The answer must reach for `withEntitiesCalls`, which is what gives a per-entity call status:

- Each call returns a `Partial<Entity>` that gets merged into the entity (e.g.
  `map(({ items }) => ({ items }))`), or `undefined` to remove it.
- The entity type accounts for the lazily loaded part (e.g. `OrderSummary & { items?: OrderItem[] }`).
- Per-row status is read with the generated per-entity predicates —
  `store.isLoadOrderDetailLoading(order)` / `isLoadOrderDetailLoaded(order)` — not a single shared
  boolean, and not one store per row.
- The status dropdown call, whose parameter is neither an id nor the entity, uses `entityCallConfig`
  with `paramsSelectId`.

Answering with a plain `withCalls` (one shared status for all rows) fails this case.
