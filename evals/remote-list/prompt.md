---
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

I use @ngrx-traits/signals in an Angular 22 app.

Write me a signal store for a product list where the backend does the filtering,
sorting and pagination. The service is `ProductService` with
`getProducts(query: { search: string; skip: number; take: number; sortColumn: string; sortAscending: boolean })`
returning `Observable<{ resultList: Product[]; total: number }>`.

Show the store and how the component reads the rows and drives a paginator.
