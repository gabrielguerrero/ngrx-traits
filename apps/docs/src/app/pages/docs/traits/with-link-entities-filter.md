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
const entity = type<Product>();
const collection = 'product';

export const ProductsStore = signalStore(
  { providedIn: 'root' },
  withEntities({ entity, collection }),
  withEntitiesLocalFilter({
    entity,
    collection,
    defaultFilter: { search: '' },
    filterFn: (entity, filter) => !filter?.search || entity.name.toLowerCase().includes(filter.search.toLowerCase()),
  }),
  // generates linkProductEntitiesFilter()
  withLinkEntitiesFilter({ entity, collection }),
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

This case is very similar to the previous one, but you will need a `linkedSignal` that works as a buffer between the form and the store, so only validated data reaches the store.
For Angular 22 you can use the new `set` option in `linkedSignal` to only let valid data into the store:

```ts
export class ProductListComponent {
  store = inject(ProductsStore);

  storeSignal = this.store.linkProductEntitiesFilter();
  // buffer signal
  formData = linkedSignal(this.storeSignal, {
    // new in angular 22, only propagates valid data to the store
    set: (value) => {
      if (this.filterForm().valid()) this.storeSignal.set(value);
    },
  });

  filterForm = form(this.formData, (value) => {
    required(value.search);
  });
}
```

For Angular versions older than 22 you will need an effect to only let valid data into the store:

```ts
export class ProductListComponent {
  store = inject(ProductsStore);

  storeSignal = this.store.linkProductEntitiesFilter();
  // buffer signal
  formData = linkedSignal(this.storeSignal);

  filterForm = form(this.formData, (value) => {
    required(value.search);
  });

  constructor() {
    effect(() => {
      const value = this.formData();
      if (this.filterForm().valid()) 
          this.storeSignal.set(value);
    });
  }
}
```

### On submission, only setting validated data in the store with Signal Forms

There are two ways for this case:

The first is very similar to the previous one, with a `linkedSignal` that works as a buffer between the form and the store, but the changes are set in the store on form submission (or by your own method):

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

You can sync the signal returned by the link method with a `model()` or `input()` signal passed as a param: a `model()` is read and written (two-way sync), an `input()` is only read (one-way input → store).

```typescript
export class ProductListComponent {
  store = inject(ProductsStore);

  filter = model<{ search: string }>({ search: '' });
  linked = this.store.linkProductEntitiesFilter(this.filter);
}
```

The synced signal param also works with all the previous examples.

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
// link[Collection]EntitiesFilter(external?, options?) => WritableSignal<Filter>
{
  linkEntitiesFilter: (external?, options?) => WritableSignal<Filter>;
  // or with collection 'product':
  linkProductEntitiesFilter: (external?, options?) => WritableSignal<Filter>;
}
```

See [`withLink`](/docs/traits/with-link) for the `external` and `options` parameters.

## State

No state signals are generated.

## Props

No props are generated.
