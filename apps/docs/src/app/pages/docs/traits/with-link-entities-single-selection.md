---
name: withLinkEntitiesSingleSelection
order: 9
---

# withLinkEntitiesSingleSelection

Generates a `link[Collection]IdSelected()` method that connects the selected entity id to component signals like `input()`, `model()` and Angular Signal Forms. Prebuilt version of [`withLink`](/docs/traits/with-link) for `withEntitiesSingleSelection`: writes route through `select[Collection]Entity` / `deselect[Collection]Entity` (setting `undefined` deselects).

Requires withEntitiesSingleSelection to be used before it.

## Examples

### Two-way sync with a model()

```typescript
const entity = type<Product>();
const collection = 'product';

export const ProductsStore = signalStore(
  { providedIn: 'root' },
  withEntities({ entity, collection }),
  withEntitiesSingleSelection({ entity, collection }),
  // generates linkProductIdSelected()
  withLinkEntitiesSingleSelection({ entity, collection }),
);
```

```typescript
@Component({ /* ... */ })
export class ProductSelectComponent {
  store = inject(ProductsStore);

  // parent writes select the entity in the store,
  // selecting in the store updates the parent
  selectedId = model<string | number | undefined>(undefined);
  linked = this.store.linkProductIdSelected(this.selectedId);
}
```

### As a form field

```typescript
export class ProductSelectComponent {
  store = inject(ProductsStore);

  selectedField = form(this.store.linkProductIdSelected());
  // linked() reads store.productIdSelected(),
  // writing selects/deselects the entity
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

```typescript
// link[Collection]IdSelected(external?, options?) => WritableSignal<string | number | undefined>
{
  linkIdSelected: (external?, options?) => WritableSignal<string | number | undefined>;
  // or with collection 'product':
  linkProductIdSelected: (external?, options?) => WritableSignal<string | number | undefined>;
}
```

See [`withLink`](/docs/traits/with-link) for the `external` and `options` parameters.

## State

No state signals are generated.

## Props

No props are generated.
