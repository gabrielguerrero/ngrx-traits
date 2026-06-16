---
name: AI Agent Skill
order: 6
---

# AI Agent Skill

Ngrx Traits ships an [Agent Skill](https://code.claude.com/docs/en/skills) that teaches coding agents how
to use the library: which store feature solves which problem, the order the features have to be composed
in, the exact names of the signals and methods each one generates, and the options they take.

Without it agents tend to invent names that look right (`productsLoading()`, `setFilter()`) and to place
features in an order that compiles but never fetches. With it they write stores that match the docs.

The skill lives in the repository under [`skills/ngrx-traits`](https://github.com/gabrielguerrero/ngrx-traits/tree/main/skills/ngrx-traits)
and is released together with the library, so it always describes the current API.

## Install

Skills are folders of markdown, so installing one is copying that folder where your agent looks for
skills. The [skills CLI](https://skills.sh/) does it for every agent it detects, or you can copy it
yourself.

<tab-group>
<tab-item label="Skills CLI">

```bash
# in your project, adds it to .claude/skills and .agents/skills
npx skills add gabrielguerrero/ngrx-traits

# or for every project on your machine
npx skills add gabrielguerrero/ngrx-traits -g
```

Useful flags: `--copy` copies the files instead of symlinking them, `-a claude-code` installs for one
agent only, and `npx skills update` pulls the latest version later.

</tab-item>

<tab-item label="Copy it yourself">

```bash
git clone --depth 1 https://github.com/gabrielguerrero/ngrx-traits.git /tmp/ngrx-traits
mkdir -p .claude/skills
cp -r /tmp/ngrx-traits/skills/ngrx-traits .claude/skills/
```

`.claude/skills` is what Claude Code reads in a project, `~/.claude/skills` for every project. Other
agents that support the Agent Skills format read their own skills directory the same way.

</tab-item>
</tab-group>

For anything that does not support skills, point the agent at `skills/ngrx-traits/SKILL.md` and let it
follow the links from there.

## Use it

Nothing to call: the agent loads the skill on its own when a prompt mentions Ngrx Traits or one of its
store features, and reads only the reference files the task needs.

```text
Create a product store with server side filtering, sorting and pagination,
and load the detail of the selected row.
```

```text
Why does my filter not reload the list?
```

```text
Bind this filter form to the store with signal forms.
```

## What it covers

| File | Contents |
| --- | --- |
| `SKILL.md` | Composition ordering rules, config style, generated naming conventions, common mistakes, testing |
| `recipes.md` | Complete stores: local list, remote list, infinite scroll, list + detail, forms, split store, SSR, caching |
| `entities-loading.md` | `withEntities`, `withCallStatus`, `withEntitiesLoadingCall`, `withAllCallStatus`, `withCallStatusMap` |
| `calls.md` | `withCalls`, `withEntitiesCalls`, awaiting results, the resource view of a call |
| `filtering.md` / `sorting.md` / `pagination.md` / `selection.md` | The `withEntities*` feature families |
| `links-forms.md` | `withLink`, `withLinkEntities*`, `withStateSetter`, Signal Forms binding |
| `sync-routing.md` | `withRoute`, URL query params sync, web storage, SSR state transfer |
| `caching.md` | `cacheCall`, `cacheRxCall`, `CacheStore` |
| `utils.md` | `ExtractStoreFeatureOutput`, `withFeatureFactory`, `withLogger`, the rename-collection schematic |

## Next Steps

- [Start Coding](/docs/getting-started/start-coding)
- [Working with Entities](/docs/getting-started/working-with-entities)
