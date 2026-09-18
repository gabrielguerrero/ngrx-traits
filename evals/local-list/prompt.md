---
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Angular 22 app using @ngrx-traits/signals.

`ProductService.getProducts()` returns `Observable<{ resultList: Product[] }>` — the whole list in one
call, no server side paging. I want a signal store that loads it once and then filters by a search
term, sorts by name and paginates 10 per page, all in the browser.

Show the store plus the template bits for the list and the paginator.
