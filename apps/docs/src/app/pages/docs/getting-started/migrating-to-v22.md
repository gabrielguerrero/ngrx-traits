---
name: Migrating to v22
order: 0
---

# Migrating to v22

Version 22 targets Angular 22 and @ngrx/signals 22, update them together with @ngrx-traits/signals:

```bash
ng update @angular/core@22 @angular/cli@22 @ngrx/signals@22 @ngrx-traits/signals@22
```

## Removed APIs

### typedCallConfig

`typedCallConfig` was deprecated in favour of `callConfig`, and is now removed. `callConfig` takes the same config, so rename the calls:

```typescript
// Before
withCalls(() => ({
  loadProduct: typedCallConfig({
    call: (id: string) => inject(ProductService).getProductDetail(id),
    resultProp: 'product',
  }),
}));

// After
withCalls(() => ({
  loadProduct: callConfig({
    call: (id: string) => inject(ProductService).getProductDetail(id),
    resultProp: 'product',
  }),
}));
```

### withRouteParams

`withRouteParams` is removed, use [withRoute](/docs/traits/with-route) instead. Its `mapParams` function receives an object with `params`, `queryParams` and `data`, instead of the params directly:

```typescript
// Before
withRouteParams(({ id }) => ({ id }));

// After
withRoute(({ params }) => ({ id: params['id'] as string }));
```

## Deprecated

### withInputBindings

`withInputBindings` is deprecated, use [withLink](/docs/traits/with-link) or [withStateSetter](/docs/traits/with-state-setter) instead.

## New (entityConfig, options) call form

The `withEntities*` features now take the entityConfig as the first argument and the options as the second, `withX({ ...entityConfig, ...options })` becomes `withX(entityConfig, options)`:

```typescript
// Before
withEntitiesLocalFilter({
  ...productsEntityConfig,
  defaultFilter: { search: '' },
  filterFn: (entity, filter) => entity.name.includes(filter.search),
});

// After
withEntitiesLocalFilter(productsEntityConfig, {
  defaultFilter: { search: '' },
  filterFn: (entity, filter) => entity.name.includes(filter.search),
});
```

The single config object form still works, so this change is not required.

### Optional migration

The `update-22-0-0` migration rewrites your code to the new call form. It is optional and recommended: `ng update @ngrx-traits/signals` pre-selects it in the interactive prompt, while in non-interactive runs (no TTY or `CI` set) the Angular CLI skips it and prints the command to run it later. You can run it later, or on its own, with either of:

```bash
ng update @ngrx-traits/signals --name update-22-0-0
ng generate @ngrx-traits/signals:migrate-entity-config-args
```

> `nx migrate` ignores `optional`, so Nx users who want to skip it should remove `update-22-0-0` from `migrations.json` before running the migrations.

It rewrites:

- Spread entityConfig: `withEntitiesLocalFilter({ ...cfg, defaultFilter, filterFn })` -> `withEntitiesLocalFilter(cfg, { defaultFilter, filterFn })`, and `withEntitiesSyncToRouteQueryParams({ ...cfg })` -> `withEntitiesSyncToRouteQueryParams(cfg)`
- Inline entity and collection, split from the options: `withEntitiesLocalSort({ entity, collection, defaultSort })` -> `withEntitiesLocalSort({ entity, collection }, { defaultSort })`
- `withEntitiesCalls({ ...cfg, calls: (store) => ({...}) })` -> `withEntitiesCalls(cfg, (store) => ({...}))`
- Factory form: `withEntitiesLoadingCall((store) => ({ ...cfg, fetchEntities }))` -> `withEntitiesLoadingCall(cfg, (store) => ({ fetchEntities }))`

It leaves as they are:

- Inline configs without a collection, `withX({ entity, ...options })`
- `withCallStatus({ prop })` and `withCallStatus({ collection })`

It warns and skips ambiguous calls, like several spreads, a spread plus `entity`/`collection`, options before the spread, a spread that is not a variable, a factory spread that reads the store or is declared after the call, or calls through `import * as`. Those keep working in the single object form, so they need no change.

Only features imported from `@ngrx-traits/signals` are touched. Run your formatter afterwards.
