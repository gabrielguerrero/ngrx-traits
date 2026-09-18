---
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

@ngrx-traits/signals question.

I have an orders table. Clicking a row expands it and loads that order's line items from
`OrderService.getOrderDetail(id)` (returns `Observable<{ items: OrderItem[] }>`). Several rows can be
expanded at once and each one should show its own spinner while it loads. There is also a status
dropdown per row that calls `OrderService.changeStatus(id, status)`.

What is the right way to model this in the store?
