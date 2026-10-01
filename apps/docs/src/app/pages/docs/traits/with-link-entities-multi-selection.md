---
name: withLinkEntitiesMultiSelection
order: 10
title: "withLinkEntitiesMultiSelection | NgRx Traits"
meta:
  - name: description
    content: "Generates a link[Collection]IdsSelected() method that connects the selected entity ids to component signals like input(), model() and Angular Signal Forms."
  - property: og:title
    content: "withLinkEntitiesMultiSelection | NgRx Traits"
  - property: og:description
    content: "Generates a link[Collection]IdsSelected() method that connects the selected entity ids to component signals like input(), model() and Angular Signal Forms."
  - property: og:url
    content: "https://ngrx-traits.dev/docs/traits/with-link-entities-multi-selection/"
  - name: twitter:title
    content: "withLinkEntitiesMultiSelection | NgRx Traits"
  - name: twitter:description
    content: "Generates a link[Collection]IdsSelected() method that connects the selected entity ids to component signals like input(), model() and Angular Signal Forms."
---

# withLinkEntitiesMultiSelection

> **Experimental.** Ready to use, but the API may still change in response to feedback. If you hit a problem or something feels awkward, please [open an issue](https://github.com/gabrielguerrero/ngrx-traits/issues).

Generates a `link[Collection]IdsSelected()` method that connects the selected entity ids to component signals like `input()`, `model()` and Angular Signal Forms. Prebuilt version of [`withLink`](/docs/traits/with-link) for `withEntitiesMultiSelection`. It reads the `[collection]IdsSelected` computed, and writes route through `select[Collection]Entities` with `clearSelectionBeforeSelect`, so each write replaces the selection and an empty array clears it.

Syncs are compared with an order-insensitive ids equality: the selection does not preserve the order it was given, and an order-sensitive compare would echo loop.

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
@Component({
  /* ... */
})
export class GenreMultiSelectComponent {
  store = inject(GenresStore);

  // writes from the parent select the entities in the store,
  // selecting in the store updates the parent
  value = model<Genre['id'][]>([]);
  valueField = form(this.store.linkIdsSelected({ syncWith: this.value }));
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

`Id` is the id type of the `withEntitiesMultiSelection` before it: the return type of its config's `selectId` (`string | number` with the ngrx `entityConfig`), or else the entity's `id` prop type.

```typescript
// link[Collection]IdsSelected(options?) => WritableSignal<Id[]>
{
  linkIdsSelected: (options?) => WritableSignal<Id[]>;
  // or with collection 'product':
  linkProductIdsSelected: (options?) => WritableSignal<Id[]>;
}
```

See [`withLink`](/docs/traits/with-link) for the `options` parameter (`syncWith`, `readFrom`, `writeTo`, `readMap`, `writeMap`, `initialValueFrom`, `storeEditsWhen`).

This feature passes `noSetter: true`, so no private `_set` method is generated — `select/clear[Collection]Entities` already covers that write.

## State

No state signals are generated.

## Props

No props are generated.
