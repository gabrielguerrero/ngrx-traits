---
name: withLinkEntitiesSingleSelection
order: 9
---

# withLinkEntitiesSingleSelection

> **Experimental.** Ready to use, but the API may still change in response to feedback. If you hit a problem or something feels awkward, please [open an issue](https://github.com/gabrielguerrero/ngrx-traits/issues).

Generates a `link[Collection]IdSelected()` method that connects the selected entity id to component signals like `input()`, `model()` and Angular Signal Forms. Prebuilt version of [`withLink`](/docs/traits/with-link) for `withEntitiesSingleSelection`: writes route through `select[Collection]Entity` / `deselect[Collection]Entity` (setting `null` deselects). No selection always reads as `null`, never `undefined`, so Signal Forms keeps the field instead of dropping it.

It emits `Id | null` but accepts `Id | null | undefined`: a signal it reads from (`readFrom`, e.g. an `input<Product['id']>()`) can be `undefined`-typed with no map, while one it writes to (`syncWith`, `writeTo`) must accept `null`, or pass `writeMap: (id) => id ?? undefined`.

Requires withEntitiesSingleSelection to be used before it.

## Examples

### Two-way sync with a model()

```typescript
const productEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'product',
});

export const ProductsStore = signalStore(
  { providedIn: 'root' },
  withEntities(productEntityConfig),
  withEntitiesSingleSelection(productEntityConfig),
  // generates linkProductIdSelected()
  withLinkEntitiesSingleSelection(productEntityConfig),
);
```

```typescript
@Component({
  /* ... */
})
export class ProductSelectComponent {
  store = inject(ProductsStore);

  // writes from the parent select the entity in the store,
  // selecting in the store updates the parent
  selectedId = model<Product['id'] | null>(null);
  linked = this.store.linkProductIdSelected({ syncWith: this.selectedId });
}
```

### As a form field

```typescript
export class ProductSelectComponent {
  store = inject(ProductsStore);

  // reads store.productIdSelected(),
  // writing selects/deselects the entity
  selectedField = form(this.store.linkProductIdSelected());
}
```

## API

```typescript
withLinkEntitiesSingleSelection({ entity, collection? })
```

| Property     | Description                           | Type        |
| ------------ | ------------------------------------- | ----------- |
| `entity`     | The entity type                       | `type<T>()` |
| `collection` | The name of the collection (optional) | `string`    |

## Methods

`Id` is the id type of the `withEntitiesSingleSelection` before it: the return type of its config's `selectId` (`string | number` with the ngrx `entityConfig`), or else the entity's `id` prop type.

```typescript
// link[Collection]IdSelected(options?) => WritableSignal<Id | null>
{
  linkIdSelected: (options?) => WritableSignal<Id | null>;
  // or with collection 'product':
  linkProductIdSelected: (options?) => WritableSignal<Id | null>;
}
```

See [`withLink`](/docs/traits/with-link) for the `options` parameter (`syncWith`, `readFrom`, `writeTo`, `readMap`, `writeMap`, `initialValueFrom`, `storeEditsWhen`).

This feature passes `noSetter: true`, so no private `_set` method is generated — `select/deselect[Collection]Entity` already covers that write.

## State

No state signals are generated.

## Props

No props are generated.
