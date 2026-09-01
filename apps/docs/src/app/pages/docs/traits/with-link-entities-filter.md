---
name: withLinkEntitiesFilter
order: 5
---

# withLinkEntitiesFilter

Generates a `link[Collection]EntitiesFilter()` method that connects the entities filter to component signals like `input()`, `model()` and Angular Signal Forms. Prebuilt version of [`withLink`](/docs/traits/with-link) for `withEntitiesLocalFilter`, `withEntitiesRemoteFilter` and `withEntitiesHybridFilter`: writes route through `filter[Collection]Entities`, so filtering (and its debounce) still happen, and syncs are guarded with a structural equality on the filter to prevent echo loops.

Requires one of the withEntities\*Filter traits to be used before it.

## Examples

### Basic usage with Signal Forms

```typescript
const productEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'product',
});

export const ProductsStore = signalStore(
  { providedIn: 'root' },
  withEntities(productEntityConfig),
  withEntitiesLocalFilter(productEntityConfig, {
    defaultFilter: { search: '' },
    filterFn: (entity, filter) => !filter?.search || entity.name.toLowerCase().includes(filter.search.toLowerCase()),
  }),
  // generates linkProductEntitiesFilter()
  withLinkEntitiesFilter(productEntityConfig),
);
```

```typescript
@Component({
  template: `
    <mat-form-field>
      <mat-label>Search</mat-label>
      <input type="text" matInput [formField]="filterForm.search" />
    </mat-form-field>
  `,
  imports: [MatFormField, MatLabel, MatInput, FormField],
})
export class ProductListComponent {
  store = inject(ProductsStore);

  // typing in the form filters the entities,
  // resetting the filter in the store updates the form
  filterForm = form(this.store.linkProductEntitiesFilter(), (value) => {
    required(value.search);
  });
}
```

Please note that this will set both valid and invalid form data in the store. If you want to only let valid data through, check the next case.

### Only setting validated data in the store with Signal Forms

Pass `updateStoreWhen` to the link method: the returned signal becomes a buffer over the store, and writes only reach it while `updateStoreWhen` returns true. It is checked on each write and again inside an effect, so it is reactive — a write made while the form is valid reaches the store straight away, and a value held back while it was invalid is pushed as soon as it becomes valid:

```ts
export class ProductListComponent {
  store = inject(ProductsStore);

  // buffers the form value, only valid data reaches the store.
  // the `: boolean` annotation is needed because filterForm is declared below,
  // without it typescript reports a circular inference
  formData = this.store.linkProductEntitiesFilter({
    updateStoreWhen: (): boolean => this.filterForm().valid(),
  });

  filterForm = form(this.formData, (value) => {
    required(value.search);
  });
}
```

If the store changes from elsewhere, the buffer resets to the store value (it is a `linkedSignal` over it), so the form follows the store as usual.

> `updateStoreWhen` requires an injection context (field initializer or constructor), because an effect is created.

### On submission, only setting validated data in the store with Signal Forms

There are two ways for this case:

Use a `linkedSignal` that works as a buffer between the form and the store, but the changes are set in the store on form submission (or by your own method):

```ts
export class ProductListComponent {
  store = inject(ProductsStore);

  storeSignal = this.store.linkProductEntitiesFilter();
  // buffer signal
  formData = linkedSignal(this.storeSignal);

  filterForm = form(
    this.formData,
    (value) => {
      required(value.search);
    },
    {
      // using signal form submission requires the formRoot directive
      submission: {
        action: async () => {
          // submit is only allowed if the form is valid
          this.storeSignal.set(this.formData());
        },
      },
    },
  );

  // or <button (click)="onSubmit()">
  onSubmit() {
    submit(this.filterForm, async () => {
      // submit is only allowed if the form is valid
      this.storeSignal.set(this.formData());
    });
  }
}
```

The second way is not using withLink, and instead reading the store filter signal directly and calling a store method that saves the state or calls the backend. This is very useful because you can handle backend errors:

```ts
export class ProductListComponent {
  store = inject(ProductsStore);

  formData = linkedSignal(this.store.productEntitiesFilter);

  filterForm = form(
    this.formData,
    (value) => {
      required(value.search);
    },
    {
      // using signal form submission requires the formRoot directive
      submission: {
        action: async () => {
          const result = await this.store.filterProductEntities(this.formData());
          if (!result.ok) {
            return {
              kind: 'server',
              message: result.error as string,
            } satisfies TreeValidationResult;
          }
        },
      },
    },
  );

  // or <button (click)="onSubmit()">
  onSubmit() {
    submit(this.filterForm, async () => {
      const result = await this.store.filterProductEntities(this.formData());
      if (!result.ok) {
        return {
          kind: 'server',
          message: result.error as string,
        } satisfies TreeValidationResult;
      }
    });
  }
}
```

### Syncing with a model() or input

You can connect the signal returned by the link method to a `model()` or `input()` signal: use `syncWith` for a two-way sync with a `model()`, or `readFrom` to only read a signal (e.g. an `input()`) into the store.

```typescript
export class ProductListComponent {
  store = inject(ProductsStore);

  filter = model<{ search: string }>({ search: '' });
  linked = this.store.linkProductEntitiesFilter({ syncWith: this.filter });
}
```

These options also work with all the previous examples.

## API

```typescript
withLinkEntitiesFilter({ entity, collection?, debounce?, forceLoad? })
```

| Property     | Description                                                                                                         | Type        |
| ------------ | ------------------------------------------------------------------------------------------------------------------- | ----------- |
| `entity`     | The entity type                                                                                                     | `type<T>()` |
| `collection` | The name of the collection (optional)                                                                               | `string`    |
| `debounce`   | Debounce passed to `filter[Collection]Entities` on each sync (optional, defaults to the filter trait's own default) | `number`    |
| `forceLoad`  | forceLoad passed to `filter[Collection]Entities` (optional)                                                         | `boolean`   |

## Methods

```typescript
// link[Collection]EntitiesFilter(options?) => WritableSignal<Filter>
{
  linkEntitiesFilter: (options?) => WritableSignal<Filter>;
  // or with collection 'product':
  linkProductEntitiesFilter: (options?) => WritableSignal<Filter>;
}
```

See [`withLink`](/docs/traits/with-link) for the `options` parameter (`syncWith`, `readFrom`, `writeTo`, `initialValueFrom`, `updateStoreWhen`).

This feature passes `noSetter: true`, so no private `_set` method is generated — `filter[Collection]Entities` already covers that write.

## State

No state signals are generated.

## Props

No props are generated.
