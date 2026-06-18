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

Please note that this will set in the store valid or invalid form data if you want to only let valid data check the next case

### Only setting validated data in the store with signalForm

This case is very similar to previous one, but you will need a linkedSignal that works as a buffer between the form and the store that only lets validated data in the store
For angular 22 you can use the new set in linkedSignal to only let valid data in the store

```ts
export class ProductListComponent {
  store = inject(ProductsStore);

  storeSignal = this.store.linkProductEntitiesFilter();
  formData = linkedSignal(
    this.storeSignal,
    (value) => {
      required(value.search);
    },
    {
      // new in angular 22 will only propagate valid data in the store
      set: (value) => {
        if (this.filterForm.valid()) storeSignal.set(value);
      },
    },
  );

  filterForm = form(this.formData(), (value) => {
    required(value.search);
  });

  constructor() {
    effect(() => {
      const value = _formData();
    });
  }
}
```

For code with angular older than 22 you will need an effect to only let valid data in the store

```ts
export class ProductListComponent {
  store = inject(ProductsStore);

  storeSignal = this.store.linkProductEntitiesFilter();
  formData = linkedSignal(this.storeSignal);

  filterForm = form(this.formData, (value) => {
    required(value.search);
  });

  constructor() {
    effect(() => {
      const value = this.formData();
      this.storeSignal.set(value);
    });
  }
}
```

### On submission, only setting validated data in the store with signalForm

There are two ways for this case:

First is very similar to previous one, with a linkedSignal that works as a buffer between the form and the store, and you will use the form submission or your own method to set the changes in the store

```ts
export class ProductListComponent {
  store = inject(ProductsStore);

  formData = linkedSignal(this.store.linkProductEntitiesFilter());

  filterForm = form(this.formData, (value) => {
    required(value.search);
  }, {
    // using angular signal form submission you will need formRoot directive
    submission: {
      action: async (){
        if (this.filterForm.().valid()){
          const value = this.formData();
          this.storeSignal.set(value);
        }
        return Promise.resolve(true)
      }
    }
  });

    // or <button (click)="onSubmit()">
    onSubmit () {// called on lcik in a button
        if (this.filterForm.().valid()){
          const value = this.formData();
          this.storeSignal.set(value);
        }
    }

}
```

Second way is not using the withLink and instead using the store read prod signal and calling the method in the store that saves the state or calls the backend, this is very useful because you can handle backend errors

```ts
export class ProductListComponent {
  store = inject(ProductsStore);

  formData = linkedSignal(this.store.productEntitiesFilter());

  filterForm = form(this.formData(), (value) => {
    required(value.search);
  }, {
    // using angular signal form submission you will need formRoot directive
    submission: {
      action: async (){
        const value = this.formData();
        await result this.store.filterProductEntities(value);
        if (!result.ok) {
          return {
            kind: 'server',
            message: result.error as string,
          } satisfies TreeValidationResult;
        }
      }
    }
  });

    // or <button (click)="onSubmit()">
    onSubmit () {// called on lcik in a button
        if (this.filterForm.().valid()){
          submit(this.filterForm, async (form) => {
            const value = this.formData();
            await result this.store.filterProductEntities(value);
            if (!result.ok) {
              return {
                kind: 'server',
                message: result.error as string,
              } satisfies TreeValidationResult;
            }
          });
        }
    }

}
```

### Syncing with a model() or input
You can sync the chnages of the signal return by the link function with a param model or signal, if is a model it will read and write to it, for inputs it will only read from it 

```typescript
export class ProductListComponent {
  store = inject(ProductsStore);

  filter = model<{ search: string }>({ search: '' });
  linked = this.store.linkProductEntitiesFilter(this.filter);
}
```
The sync signal param will also work with all the previous examples

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
