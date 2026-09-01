---
name: withLinkEntitiesSort
order: 12
---

# withLinkEntitiesSort

Generates a `link[Collection]EntitiesSort()` method that connects the entities sort to component signals like `input()`, `model()` and Angular Signal Forms. Prebuilt version of [`withLink`](/docs/traits/with-link) for `withEntitiesLocalSort` and `withEntitiesRemoteSort`: writes route through `sort[Collection]Entities`, so the entities are re-sorted, and syncs are guarded with a structural equality on the sort (`field` + `direction`) to prevent echo loops.

Requires withEntitiesLocalSort or withEntitiesRemoteSort to be used before it.

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
  withEntitiesLocalSort(productEntityConfig, {
    defaultSort: { field: 'name', direction: 'asc' },
  }),
  // generates linkProductEntitiesSort()
  withLinkEntitiesSort(productEntityConfig),
);
```

```typescript
@Component({
  /* ... */
})
export class ProductListComponent {
  store = inject(ProductsStore);

  // writing the model sorts the entities,
  // sorting in the store updates the model
  sort = model<Sort<Product>>({ field: 'name', direction: 'asc' });
  linked = this.store.linkProductEntitiesSort({ syncWith: this.sort });
}
```

### Direct usage

```typescript
const linked = store.linkProductEntitiesSort();

linked.set({ field: 'price', direction: 'desc' }); // re-sorts the entities
linked(); // => store.productEntitiesSort()
```

## API

```typescript
withLinkEntitiesSort({ entity, collection? })
```

| Property     | Description                           | Type        |
| ------------ | ------------------------------------- | ----------- |
| `entity`     | The entity type                       | `type<T>()` |
| `collection` | The name of the collection (optional) | `string`    |

## Methods

```typescript
// link[Collection]EntitiesSort(options?) => WritableSignal<Sort<Entity>>
{
  linkEntitiesSort: (options?) => WritableSignal<Sort<Entity>>;
  // or with collection 'product':
  linkProductEntitiesSort: (options?) => WritableSignal<Sort<Entity>>;
}
```

See [`withLink`](/docs/traits/with-link) for the `options` parameter (`syncWith`, `readFrom`, `writeTo`, `initialValueFrom`, `updateStoreWhen`).

This feature passes `noSetter: true`, so no private `_set` method is generated — `sort[Collection]Entities` already covers that write.

## State

No state signals are generated.

## Props

No props are generated.
