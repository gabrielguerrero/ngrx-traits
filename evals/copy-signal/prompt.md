---
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

@ngrx-traits/signals, Angular 22 with Signal Forms.

A parent component passes me one object through a `model<Checkout>()`, where
`Checkout = { name: string; email: string; street: string; city: string }`.

Inside my component I want to edit it as two separate forms — contact (name, email) and address
(street, city) — each with its own validation, and each kept in my store as its own state slice.
When either form changes, the parent should get the whole updated object back through the model;
when the parent writes the model, both forms should follow.

How do I wire this up?
