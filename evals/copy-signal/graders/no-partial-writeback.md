---
type: llm
weight: 2
---

Each link owns only half of the object, so neither may push to the model directly: a `writeTo:
this.checkout` (or a `syncWith: this.checkout`) on either link would send a partial value to a model
the other half also writes, and the halves would overwrite each other.

Fail the response if either link is given `writeTo` or `syncWith` pointing at the whole-object model.

A correct answer routes the write-back only through the recombined value — and ideally says why:
the recombined `computed` is the only value that is the whole object, and it is not the source of any
link, which is what `copySignal` is for.
