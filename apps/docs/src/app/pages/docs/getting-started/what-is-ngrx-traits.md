---
name: What is NgRx Traits?
order: 1
title: "What is NgRx Traits? | NgRx Traits"
meta:
  - name: description
    content: "NgRx Traits is a set of prebuilt NgRx Signals custom store features that solve common problems: backend calls, pagination, sorting, filtering, selection."
  - property: og:title
    content: "What is NgRx Traits? | NgRx Traits"
  - property: og:description
    content: "NgRx Traits is a set of prebuilt NgRx Signals custom store features that solve common problems: backend calls, pagination, sorting, filtering, selection."
  - property: og:url
    content: "https://ngrx-traits.dev/docs/getting-started/what-is-ngrx-traits/"
  - name: twitter:title
    content: "What is NgRx Traits? | NgRx Traits"
  - name: twitter:description
    content: "NgRx Traits is a set of prebuilt NgRx Signals custom store features that solve common problems: backend calls, pagination, sorting, filtering, selection."
---

# Introduction

NgRx Traits is a set of prebuilt NgRx Signals custom store features that solve common problems such as calling a backend API, adding pagination, sorting, filtering, selection of entities, and more.

## Features

- **Typed and generated**: every feature adds strongly typed signals and methods, so you write less boilerplate.
- **Backend calls**: [withCalls](/docs/traits/with-calls), [withCallStatus](/docs/traits/with-call-status), [withCallStatusMap](/docs/traits/with-call-status-map) / [withAllCallStatus](/docs/traits/with-all-call-status), per-entity calls with [withEntitiesCalls](/docs/traits/with-entities-calls), and [caching](/docs/getting-started/caching) with cacheRxCall.
- **Entities**: loading with [withEntitiesLoadingCall](/docs/traits/with-entities-loading-call); [local](/docs/traits/with-entities-local-filter), [remote](/docs/traits/with-entities-remote-filter) or [hybrid](/docs/traits/with-entities-hybrid-filter) filter; [local](/docs/traits/with-entities-local-sort) or [remote](/docs/traits/with-entities-remote-sort) sort; [local](/docs/traits/with-entities-local-pagination) or [remote](/docs/traits/with-entities-remote-pagination) pagination; [infinite scroll](/docs/traits/with-entities-remote-scroll-pagination); [single](/docs/traits/with-entities-single-selection) or [multi](/docs/traits/with-entities-multi-selection) selection.
- **Link state to components**: sync store state with component signals and Signal Forms using [withLink](/docs/traits/with-link) (plus [withLinkEntitiesFilter](/docs/traits/with-link-entities-filter), [Sort](/docs/traits/with-link-entities-sort), [SingleSelection](/docs/traits/with-link-entities-single-selection), [MultiSelection](/docs/traits/with-link-entities-multi-selection)) and [copySignal](/docs/traits/with-link#copysignal).
- **State setters**: [withStateSetter](/docs/traits/with-state-setter), [withStatePrivateSetter](/docs/traits/with-state-private-setter).
- **Sync and SSR**: [withSyncToWebStorage](/docs/traits/with-sync-to-web-storage), [withSyncToRouteQueryParams](/docs/traits/with-sync-to-route-query-params) / [withEntitiesSyncToRouteQueryParams](/docs/traits/with-entities-sync-to-route-query-params), [withRoute](/docs/traits/with-route), [withServerStateTransfer](/docs/traits/with-server-state-transfer).
- **Tooling**: [withLogger](/docs/traits/with-logger), [withFeatureFactory](/docs/traits/with-feature-factory), an [AI agent skill](/docs/getting-started/ai-agent-skill) and [migration schematics](/docs/getting-started/migrating-to-v22).

## Support Us
- Visit and Star the [GitHub Repo](https://github.com/gabrielguerrero/ngrx-traits)
- Join the [Discord](https://discord.gg/CEjF5D3NCh)
- Become a [Sponsor](/docs/other/sponsor)

## Quick Install

```bash
npm i @ngrx/signals @ngrx-traits/signals
```

See [Installation](/docs/getting-started/installation) for Yarn and more details.

## Next Steps
- [Start Coding](/docs/getting-started/start-coding): build your first store with NgRx Traits
- [Playground](https://stackblitz.com/github/gabrielguerrero/ngrx-traits-signals-playground?file=src%2Fapp%2Fproduct-list-detail%2Fproduct-local.store.ts): try it without installing
- [Installation](/docs/getting-started/installation): install details
