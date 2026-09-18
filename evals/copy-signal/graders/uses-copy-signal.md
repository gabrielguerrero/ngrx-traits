---
type: llm
weight: 3
---

The answer must use the pieces the library provides for this:

- Two `withLink` features, one per state slice (e.g. `withLink('contact')`, `withLink('address')`).
- Each generated link method called with `readFrom: this.checkout` plus a `readMap` that keeps only
  the half that slice owns — so both forms follow when the parent writes the model.
- A `computed` in the store that recombines the two slices into the `Checkout` shape.
- `copySignal(this.store.checkout, this.checkout)` (imported from `@ngrx-traits/signals`) to copy that
  recombined computed back into the model.

Fail the response if it never mentions `copySignal`, or if it pushes the value back to the model with a
hand-written `effect()` that calls `this.checkout.set(...)` when `copySignal` would do it.
