---
name: withCallStatus 
order: 1
---

# withCallStatus

Generates necessary state, computed and methods for call progress status to the store

**Kind**: global function

## Import

Import the withCallStatus trait from `@ngrx-traits/signals`.

```ts
import { withCallStatus } from '@ngrx-traits/signals';
```

## Usage

Use this when you need a special way to call you backend that is not handled by [withCalls](/docs/traits/withCalls)

### Minimal use case
The following generates a callStatus signal, and getters isLoading isLoaded error, and computed
setLoading setLoaded and setError
```typescript
const store = signalStore(withCallStatus());
```
### Using prop or collection to rename generated
The following generates a usersCallStatus signal, and getters isUsersLoading isUsersLoaded usersError, and computed
setUsersLoading setUsersLoaded and setUsersError
```typescript
const store = signalStore(withCallStatus({ prop: 'users' }));
```
Prop and collection are aliases they cause the same effect, collection is there just so it can be use more easily combined with withEntities* store features

### Typing error
```typescript
const store = signalStore(withCallStatus({ collection: 'users', initialValue: 'loading', errorType: type<string>() }));
```

### Using withCallStatus and withMethods to call backend

```typescript
import { withEntities } from '@ngrx/signals/entities';

const entity = type<Product>();
const collection = 'products';

export const ProductsRemoteStore = signalStore(
  { providedIn: 'root' },
  withEntities({ entity, collection }),
  withCallStatus({ collection, initialValue: 'loading' }),
  withMethods(({setProductsLoading, setProductsLoaded, setProductsError, ...store}) => ({
    loadProducts: rxMethod(pipe(switchMap(() => {
      setProductsLoading()
      return inject(ProductService)
        .getProducts()
        .pipe(
          tap((res) =>
            patchState(
              store,
              setAllEntities(res.resultList, { collection: 'products' }),
            ),
          ),
          catchError((error) => {
            setProductsError(error);
            return EMPTY;
          }));
    })))
  }))
  );
```
### withCallStatus and withEntitiesLoadingCall example

```typescript

const entity = type<Product>();
const collection = 'products';

export const ProductsRemoteStore = signalStore(
  { providedIn: 'root' },
  withEntities({ entity, collection }),
  withCallStatus({ prop: collection, initialValue: 'loading' }),
  // withEntitiesLoading will Call the fetch function when the status is set to loading
  // in this case it will happen on init because the initial value is loading
  withEntitiesLoadingCall({
    collection,
    fetchEntities: () => {
      return inject(ProductService)
        .getProducts()
        .pipe(
          map((d) => ({
            entities: d.resultList,
            total: d.total,
          })),
        );
    },
  });
```
  To know more about withEntitiesLoadingCall see docs [here](/docs/traits/withEntitiesLoadingCall)



## API Reference

This trait receives an object to allow specific configurations:

| Property     | Description                                                                                    | Value                           |
| ------------ | ---------------------------------------------------------------------------------------------- | ------------------------------- |
| prop         | The name of the property for which this represents the call status.                            | string                          |
| initialValue | The initial value of the call status.                                                          | `init` \| `loading` \| `loaded` |
| collection   | The name of the collection for which this represents the call status is an alias to prop param | string                          |
| errorType    | The type of the error                                                                          | `T`                             |

## State

Generates the following signals

```typescript
callStatus: 'init' | 'loading' | 'loaded' | { error: unknown };
```

If collection provided, the following signals are generated, example: **users**

```typescript
callUsersStatus: 'init' | 'loading' | 'loaded' | { error: unknown };
```

## Computed

Generates the following computed signals

```typescript
isLoading: Signal<boolean>;
isLoaded: Signal<boolean>;
error: Signal<unknown | null>;
```

If collection provided, the following computed signals are generated, example: **users**

```typescript
isUsersLoading: Signal<boolean>;
isUsersLoaded: Signal<boolean>;
usersError: Signal<unknown | null>;
```

## Methods

Generates the following methods

```typescript
setLoading: () => void;
setLoaded:() => void;
setError:(error?: unknown) => void;
```

If collection provided, the following methods are generated, example: **users**

```typescript
setUsersLoading: () => void;
setUsersLoaded:() => void;
setUsersError:(error?: unknown) => void;
```
