---
name: withCalls
order: 2
---

# withCalls

Generates necessary state, computed and methods to track the progress of the call and store the result of the call. The generated methods are rxMethods with the same name as the original call, which accepts either the original parameters or a Signal or Observable of the same type as the original parameters. The original call can only have zero or one parameter, use an object with multiple props as first param if you need more.

**Kind**: global function

**Warning**: The default mapPipe is [exhaustMap](https://www.learnrxjs.io/learn-rxjs/operators/transformation/exhaustmap). If your call returns an observable that does not complete after the first value is emitted, any changes to the input params will be ignored. Either specify [switchMap](https://www.learnrxjs.io/learn-rxjs/operators/transformation/switchmap) as mapPipe, or use [take(1)](https://www.learnrxjs.io/learn-rxjs/operators/filtering/take) or [first()](https://www.learnrxjs.io/learn-rxjs/operators/filtering/first) as part of your call.

## Import

Import the withCalls trait from `@ngrx-traits/signals`.

```ts
import { withCalls } from '@ngrx-traits/signals';
```

## Usage

```typescript
const store = signalStore(
  withCalls(() => ({
    'callName': typedCallConfig(
        callConfig,
    ),
    ...more calls,
  })),
);
```

## Examples

```typescript
const store = signalStore(
  withCalls(({ productsSelectedEntity }) => ({
    loadProductDetail: typedCallConfig({
      call: ({ id }: { id: string }) => inject(ProductService).getProductDetail(id),
      resultProp: 'productDetail',
      // storeResult: false, // will omit storing the result, and remove the result prop from the store
      mapPipe: 'switchMap', // default is 'exhaustMap'
      onSuccess: (result, callParam) => {
        // do something with the result
      },
      mapError: (error, callParam) => {
        return; // transform the error before storing it
      },
      onError: (error, callParam) => {
        // do something with the error
      },
    }),
  })),
);
```

## API Reference

This trait receives and object to allow specific configurations:

| Property    | Description                                                 | Value                                                                 |
| ----------- | ----------------------------------------------------------- | --------------------------------------------------------------------- |
| call        | Async callback.                                             | `(param: ParamType)=> Observable<T>  (param: ParamType)=> Promise<T>` |
| resultProp  | State property name to store the result of the call.        | string                                                                |
| storeResult | Whether the result is stored as a signal or not             | boolean                                                               |
| mapPipe     | Rxjs pipe to use for each call. Default value: `exhaustMap` | `switchMap` \| `exhaustMap` \| `concatMap`                            |
| onSuccess   | Callback executed after call emits value                    | `()=> void \| (result, param: ParamType)=> void`                      |
| mapError    | Callback to transform and give type to error                | `(error)=> ErrorType`                                                 |
| onError     | Callback executed after call emits error                    | `(error: ErrorType, param: ParamType)=> void`                         |

## State

Generates the following signals for each call defined within the trait

Eg: callName: 'getUser', resultProp: user

```typescript
user: Signal<T> <-- if storeResult=true
```

## Computed

Generates the following computed signals

```typescript
isGetUserLoading: Signal<boolean>;
isGetUserLoaded: Signal<boolean>;
getUserError: Signal<ErrorType>;
```

## Methods

Generates the following methods

```typescript
getUser: (param: ParamType) => void;
```
