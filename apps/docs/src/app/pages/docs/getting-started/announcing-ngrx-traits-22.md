---
name: Announcing NgRx Traits 22
order: 7
title: "Announcing NgRx Traits 22 | NgRx Traits"
meta:
  - name: description
    content: "NgRx Traits 22 targets Angular 22, adding withLink to sync store state with component signals and Signal Forms, Resource-style call views, state setters and a shorter withEntities* syntax."
  - property: og:title
    content: "Announcing NgRx Traits 22 | NgRx Traits"
  - property: og:description
    content: "NgRx Traits 22 targets Angular 22, adding withLink to sync store state with component signals and Signal Forms, Resource-style call views, state setters and a shorter withEntities* syntax."
  - property: og:url
    content: "https://ngrx-traits.dev/docs/getting-started/announcing-ngrx-traits-22/"
  - name: twitter:title
    content: "Announcing NgRx Traits 22 | NgRx Traits"
  - name: twitter:description
    content: "NgRx Traits 22 targets Angular 22, adding withLink to sync store state with component signals and Signal Forms, Resource-style call views, state setters and a shorter withEntities* syntax."
---

# Announcing NgRx Traits 22

**Published:** Oct 8, 2026

Hey everyone! We're excited to announce NgRx Traits version 22, fully compatible with Angular 22 and NgRx Signals 22! Along with the version bump, this release brings the biggest new feature the library has had in a while: `withLink`, a way to connect your store to component signals, models, inputs, outputs and Angular Signal Forms, without writing sync logic by hand.

There is also an Angular Resource view of your calls, new state setter features, a shorter way to call the `withEntities*` features, a refreshed docs site, and an AI agent skill that teaches coding agents how to use the library.

## withLink: connecting the store to component signals and Signal Forms

When a store has to work with a form, or with a parent component's model(), input() or output(), you usually end up writing glue code: a linkedSignal to follow the store, sometimes effects to copy changes back and forth, and guards so the two sides don't keep triggering each other in an echo loop. withLink generates that for you.

Given a state prop, `withLink` generates a `link[StateProp]()` method that returns a `linkedSignal`: reading it reads the store prop, and setting it writes to the store.

```ts
const Store = signalStore(
  withState({ filter: { search: '' } }),
  // 👇 generates linkFilter()
  withLink('filter'),
);

// In component
store = inject(Store);
filter = this.store.linkFilter();

// filter() => { search: '' }
filter.set({ search: 'shoes' });
// store.filter() => { search: 'shoes' }
```

By default writes go through `patchState`, but you can route them through a store method instead with `set`:

```ts
const ProductsStore = signalStore(
  withEntities(productEntityConfig),
  withEntitiesLocalFilter(productEntityConfig, {
    defaultFilter: { search: '' },
    filterFn: (entity, filter) =>
      !filter?.search ||
      entity.name.toLowerCase().includes(filter.search.toLowerCase()),
  }),
  // 👇 generates linkProductEntitiesFilter()
  withLink('productEntitiesFilter', {
    set: (value, store) =>
      store.filterProductEntities({ filter: value, debounce: 0 }),
  }),
);
```

Because the returned value is just a `WritableSignal`, it can be handed straight to Signal Forms:

```ts
export class ProductListComponent {
  store = inject(ProductsStore);

  // typing in the form filters the entities,
  // resetting the filter in the store updates the form
  filterForm = form(this.store.linkProductEntitiesFilter(), (value) => {
    required(value.search);
  });
}
```

That form writes to the store on every keystroke, valid or not. If you only want validated data to land in the store, pass `storeEditsWhen`: the returned signal becomes a buffer, and edits are held back until the gate opens, then pushed automatically.

```ts
export class ProductListComponent {
  store = inject(ProductsStore);

  // buffers the form value, only valid data reaches the store.
  // the `: boolean` annotation is needed because filterForm is declared below,
  // without it typescript reports a circular inference
  formData = this.store.linkProductEntitiesFilter({
    storeEditsWhen: (): boolean => this.filterForm().valid(),
  });

  filterForm = form(this.formData, (value) => {
    required(value.search);
  });
}
```

If you need to keep the store in sync with a component's `model()`, pass it as `syncWith`:

```ts
export class ProductSearchComponent {
  store = inject(ProductsStore);

  // when the parent writes the model, the store updates;
  // when the store changes, the model (and the parent) updates
  filter = model<{ search: string }>({ search: '' });
  linked = this.store.linkProductEntitiesFilter({ syncWith: this.filter });

  filterForm = form(this.linked);
}
```

If the model's type doesn't match the store's, `readMap` and `writeMap` convert between the two:

```ts
export class ProductSearchComponent {
  store = inject(ProductsStore);

  // the parent works with a plain string, the store filter is { search: string }
  search = model<string>('');
  linked = this.store.linkProductEntitiesFilter({
    syncWith: this.search,
    readMap: (search) => ({ search }),
    writeMap: (filter) => filter.search,
  });
}
```

And if the component uses an `input()` and an `output()` instead of a model, `readFrom` and `writeTo` handle each direction separately — or use just one of them for a one-way sync:

```ts
export class ProductSearchComponent {
  store = inject(ProductsStore);

  filter = input<{ search: string }>({ search: '' });
  filterChange = output<{ search: string }>();

  // input changes update the store, store changes are emitted on the output
  linked = this.store.linkProductEntitiesFilter({
    readFrom: this.filter,
    writeTo: this.filterChange,
  });
}
```

Both sync directions are guarded by `equal`: a write equal to what the store already holds is skipped, and a store value equal to what the external signal already has is not pushed out. That is what stops a two-way link from echoing forever.

By default it compares by content, picking the comparison from the value at hand:

- **primitives** are compared with `Object.is`.
- **arrays** element by element, each with `Object.is`.
- **plain objects** structurally, via `JSON.stringify`.
- anything else (a `Date`, `Map`, `Set` or class instance) falls back to `Object.is`, since JSON would flatten two different ones into the same string.

When the default isn't what you want, pass your own `(a, b) => boolean`, or the name of a premade comparison: `'reference'`, `'array'`, `'set'` (same elements in any order), `'stringify'`, or a property to compare by, like `'id'` on an object and `'array.id'` / `'set.id'` on an array of them. All of them are type-checked, and the property names autocomplete from the linked value:

```ts
const Store = signalStore(
  withState({
    ids: [] as string[],
    selectedProduct: undefined as Product | undefined,
    products: [] as Product[],
  }),
  // a selection is a set, order doesn't matter
  withLink('ids', { equal: 'set' }),
  // only changed when the id changes, whatever else the product carries
  withLink('selectedProduct', { equal: 'id' }),
  // an array whose elements are rebuilt on every read is the one shape
  // the default can't settle, so compare it by the ids it holds
  withLink('products', { equal: 'array.id' }),
);
```

`withLink` also generates a private `_set<Name>()` method that writes through the same path, so other methods inside the store can reuse it.

There are more use cases in the docs. To learn more, check the [withLink docs here](/docs/traits/with-link).

`withLink` is marked experimental: it's ready to use, but the API may still change in response to feedback, so please [open an issue](https://github.com/gabrielguerrero/ngrx-traits/issues) if something feels awkward.

## Premade withLink features for entities

If you use the `withEntities*` store features, you don't need to wire `withLink` yourself. There are four prebuilt versions that write through the entity traits' own methods, and pick the right equality for each case (for example, multi selection compares ids as a set, so order doesn't matter):

- [withLinkEntitiesFilter](/docs/traits/with-link-entities-filter)
- [withLinkEntitiesSort](/docs/traits/with-link-entities-sort)
- [withLinkEntitiesSingleSelection](/docs/traits/with-link-entities-single-selection)
- [withLinkEntitiesMultiSelection](/docs/traits/with-link-entities-multi-selection)

```ts
export const ProductsStore = signalStore(
  { providedIn: 'root' },
  withEntities(productEntityConfig),
  withEntitiesLocalFilter(productEntityConfig, {
    defaultFilter: { search: '' },
    filterFn: (entity, filter) =>
      !filter?.search ||
      entity.name.toLowerCase().includes(filter.search.toLowerCase()),
  }),
  // 👇 generates linkProductEntitiesFilter()
  withLinkEntitiesFilter(productEntityConfig),
);
```

## An Angular Resource view of your calls

For each call that stores its result, `withCalls` now also generates a resource method: a factory of a read-only view of the call with the shape of Angular's `Resource` — `value`, `status`, `error`, `isLoading`, `snapshot`, `hasValue()` and `destroy()` — for components that prefer the resource API. `withEntitiesLoadingCall` generates one too, as `<collection>EntitiesResource()`.

Every signal in the view reads the store, nothing is copied, so all views of the same call agree with each other and with the generated signals.

```ts
const ProductsStore = signalStore(
  withCalls(() => ({
    loadProductDetail: callConfig({
      call: ({ id }: { id: string }) =>
        inject(ProductService).getProductDetail(id),
      resultProp: 'productDetail',
      mapError: (error) => error as HttpErrorResponse,
    }),
  })),
);

// In component
store = inject(ProductsStore);
// typed as CallResource<ProductDetail | undefined, HttpErrorResponse>
detail = this.store.productDetailResource();
```

```html
@if (detail.isLoading()) {
  <mat-spinner />
} @else if (detail.hasValue()) {
  <!-- hasValue() narrows value() to ProductDetail -->
  <product-detail [product]="detail.value()" />
} @else if (detail.status() === 'error') {
  {{ detail.error()?.message }}
}
```

The view can also drive the call. Pass `params` a signal, a function or an observable, and the call runs every time it emits, with `undefined` skipping the call, so it can be driven by an input that isn't set yet:

```ts
productId = input.required<string>();
detail = this.store.productDetailResource({
  params: () => ({ id: this.productId() }),
});
```

This one is experimental too — [check the docs here](/docs/traits/with-calls).

## withStateSetter and withStatePrivateSetter

Two small traits that can help reduce boilerplate in your store. [`withStateSetter`](/docs/traits/with-state-setter) generates a `set<Prop>()` for each state prop you name:

```ts
const Store = signalStore(
  withState({ a: { b: '' }, c: 1, d: 12 }),
  // 👇 generates setA() and setD()
  withStateSetter('a', 'd'),
);

store.setA({ b: 'hello' });
store.setD((d) => d + 1); // updater fn for partial updates
```

They are `signalMethods`, so they also accept a signal or a reactive function and keep the state in sync with it. [`withStatePrivateSetter`](/docs/traits/with-state-private-setter) does the same but generates `_set<Prop>()`, for props that should be publicly readable but only written from inside the store.

## A shorter way to call the withEntities* features

Until now every `withEntities*` feature took a single argument, so whenever you needed to pass it some options you had to spread the entity config in alongside them:

```ts
withCallStatus({ ...productEntityConfig, initialValue: 'loading' }),
withEntitiesRemotePagination({ ...productEntityConfig, pageSize: 10 }),
```

Now the entity config has its own parameter and the options go in the second one. It's easier to write, and makes the code cleaner and easier to read.

```ts
const productEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'product',
});

const ProductsStore = signalStore(
  withEntities(productEntityConfig),
  withCallStatus(productEntityConfig, { initialValue: 'loading' }),
  withEntitiesRemoteFilter(productEntityConfig, {
    defaultFilter: { search: '' },
  }),
  withEntitiesRemotePagination(productEntityConfig, { pageSize: 10 }),
  withEntitiesRemoteSort(productEntityConfig, {
    defaultSort: { field: 'name', direction: 'asc' },
  }),
  withEntitiesLoadingCall(
    productEntityConfig,
    ({ productEntitiesFilter }) => ({
      fetchEntities: () =>
        inject(ProductService).getProducts(productEntitiesFilter()),
    }),
  ),
);
```

The single-object form still works, so nothing breaks. If you want to switch, there's an optional migration that rewrites your code to the new form. Interactive `ng update` pre-selects it (it's skipped in CI), or you can run it on its own:

```bash
ng update @ngrx-traits/signals --name update-22-0-0
```

To learn more, check the [migration guide](/docs/getting-started/migrating-to-v22).

## Other improvements

**Readable errors for missing features.** Forgetting a required trait used to surface as a structural mismatch ending in something like `Property 'productEntitiesCallStatus' is missing`, which never told you what to add. Now TypeScript reports `Missing store feature: withEntitiesLoadingCall requires withCallStatus({ collection: 'product' }) to be present in the store before it`, across the 17 features that have requirements.

**`getFilterQueryMapper` and `getQueryMapperForState`.** Syncing state to route query params no longer needs a hand-written mapper for the common cases. Declare the types of your fields and you get one param per field, typed and autocompleted, instead of a JSON blob in the url:

```ts
withEntitiesSyncToRouteQueryParams(productEntityConfig, {
  prefix: 'p',
  // 👇 p-search=tv&p-range.from=2026-08-11&p-range.to=2026-08-31
  filterMapper: getFilterQueryMapper<ProductFilter>({
    search: 'string',
    range: { from: 'date', to: 'date' },
  }),
});
```

**`filterState` accepts an array.** `withSyncToWebStorage` and `withServerStateTransfer` now take a list of state prop names as well as a function: `filterState: ['productEntityMap', 'productIds']` for easier use.

**`withLogger` takes the name first.** `withLogger('MyStore', { filter: ['idsSelected'] })`, and the filter now supports sub-signals.

## A refreshed docs site

The docs got a light theme with a toggle in the navbar, an "on this page" menu for navigating long pages, and a rebuilt home page. Have a look at [the new docs](/).

## An AI agent skill for NgRx Traits

NgRx Traits now ships an [Agent Skill](https://code.claude.com/docs/en/skills) that teaches coding agents how to use the library: which store feature solves which problem, the order the features have to be composed in, and the exact names of the signals and methods each one generates. Without it, agents tend to invent names that look right (`productsLoading()`, `setFilter()`) or put features in an order that compiles but never fetches.

The skill is released together with the library, so it always matches the current API. You can install it with the [skills CLI](https://skills.sh/):

```bash
npx skills add gabrielguerrero/ngrx-traits
```

After that there's nothing to call: the agent loads it on its own whenever you mention NgRx Traits or one of its store features. For other ways to install it, check the [AI Agent Skill docs](/docs/getting-started/ai-agent-skill).

## Breaking changes

Two APIs deprecated in v21 are now removed:

- `typedCallConfig` — renamed to `callConfig`.
- `withRouteParams` — replaced by `withRoute`, which also reads query params.

Both are straight renames, so the fix is a find and replace. If you're coming from an older version, `withRoute` is covered in the [withRoute docs](/docs/traits/with-route).

## Upgrading to NgRx Traits Signals 22

Make sure to have the following minimum versions installed:

- Angular version 22.1.x
- Angular CLI version 22.1.x
- TypeScript version 6.0.x
- NgRx Signals 22.x

Then run:

```bash
ng update @ngrx-traits/signals
```

Or for a fresh install:

```bash
npm i @ngrx-traits/signals --save
```

## Thanks to All Contributors

A huge thank you to all the contributors who make this library better every day. Big thanks as well to everyone in the Discord channel — from those who share feature ideas, report bugs, test new features early, or simply jump in to discuss best practices.

And of course, a special thanks to the NgRx and Angular teams — without their amazing work, this library wouldn't exist.
