---
name: withLinkEntitiesMultiSelection
order: 10
---

# withLinkEntitiesMultiSelection

Generates a `link[Collection]IdsSelected()` method that connects the selected entity ids to component signals like `input()`, `model()` and Angular Signal Forms. Prebuilt version of [`withLink`](/docs/traits/with-link) for `withEntitiesMultiSelection`: reads the `[collection]IdsSelected` computed, writes route through `select[Collection]Entities` with `clearSelectionBeforeSelect` (so each write replaces the selection, and an empty array clears it), and syncs are guarded with an order-insensitive ids equality — the selection map does not preserve the order of the ids it was given, so an order-sensitive compare would cause echo loops.

Requires withEntitiesMultiSelection to be used before it.

## Examples

### Two-way sync with a model()

```typescript
const entity = type<Genre>();

export const GenresStore = signalStore(
  { providedIn: 'root' },
  withEntities({ entity }),
  withEntitiesMultiSelection({ entity }),
  // generates linkIdsSelected()
  withLinkEntitiesMultiSelection({ entity }),
);
```

```typescript
@Component({ /* ... */ })
export class GenreMultiSelectComponent {
  store = inject(GenresStore);

  // parent writes select the entities in the store,
  // selecting in the store updates the parent
  value = model<(string | number)[]>([]);
  valueField = form(this.store.linkIdsSelected(this.value));
}
```

### Direct usage

```typescript
const linked = store.linkIdsSelected();

linked.set(['1', '2']); // selects entities 1 and 2, replacing the selection
linked.set([]); // clears the selection
linked(); // => store.idsSelected()
```

## API

```typescript
withLinkEntitiesMultiSelection({ entity, collection? })
```

| Property     | Description                           | Type        |
| ------------ | ------------------------------------- | ----------- |
| `entity`     | The entity type                       | `type<T>()` |
| `collection` | The name of the collection (optional) | `string`    |

## Methods

```typescript
// link[Collection]IdsSelected(external?, options?) => WritableSignal<(string | number)[]>
{
  linkIdsSelected: (external?, options?) => WritableSignal<(string | number)[]>;
  // or with collection 'product':
  linkProductIdsSelected: (external?, options?) => WritableSignal<(string | number)[]>;
}
```

See [`withLink`](/docs/traits/with-link) for the `external` and `options` parameters.

## State

No state signals are generated.

## Props

No props are generated.
