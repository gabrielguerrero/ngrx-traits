---
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Angular 22, @ngrx-traits/signals, and I want to use the new Signal Forms.

My store already has `withEntitiesRemoteFilter` with `defaultFilter: { search: '' }`. I want a search
form in the component bound to that filter, so typing updates the store and resetting the filter in
the store updates the form. It should only hit the backend once the user stops typing, and I do not
want invalid form values reaching the store.

How do I wire that up?
