---
type: llm
weight: 2
---

Two specific requirements from the prompt must be handled correctly:

1. Only valid data reaching the store — the answer must pass `storeEditsWhen` to the link method
   (e.g. `storeEditsWhen: (): boolean => this.filterForm().valid()`), which buffers writes until the
   form is valid. An answer that ignores validity, or that only mentions it in prose without showing
   the option, fails.

2. Debouncing — the answer must say that writes through the link are NOT debounced, and debounce the
   form field instead with Signal Forms' `debounce(path, ms)` (or call `filterProductEntities` with a
   debounce directly). Claiming the link debounces on its own, or passing a `debounce` option to
   `withLinkEntitiesFilter`, is a failure — that option does not exist.
