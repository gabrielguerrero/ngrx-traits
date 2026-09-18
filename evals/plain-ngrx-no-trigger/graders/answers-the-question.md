---
type: llm
weight: 2
---

A correct answer explains plain @ngrx/signals: `withComputed` declares derived read-only signals that
recompute from state, `withMethods` declares functions on the store, and `patchState(store, ...)` is
how a method updates state (including with updater functions).

The answer must stay on plain @ngrx/signals. Steering the user to @ngrx-traits/signals features
(`withCallStatus`, `withCalls`, `withEntitiesLoadingCall`, `withStateSetter`, ...) when they asked
about the base library — or presenting trait names as if they were part of @ngrx/signals — is a
failure. A single closing sentence offering ngrx-traits as an aside is acceptable; building the
answer around it is not.
