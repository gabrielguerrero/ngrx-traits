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
- The status dropdown call carries the entity plus the new status. Both shapes are acceptable: a param
  the library can find the id in on its own (`{ entity: Order; status: string }` — it looks for an
  `entity` prop), or any other shape (e.g. `{ id, status }`) declared with `entityCallConfig` and
  `paramsSelectId`. Do not fail an answer for omitting `paramsSelectId` when the param holds `entity`.

Answering with a plain `withCalls` (one shared status for all rows) fails this case.
