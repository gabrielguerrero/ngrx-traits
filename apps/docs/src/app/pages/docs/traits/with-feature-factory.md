---
name: withFeatureFactory 
order: 15
---

This store feature allows access to the store's state, methods, computed signals, to store features that don't have a config factory that
can access the store. This can be useful for creating store features that need to access the store's state, methods, computed signals, etc. or to wrap store
features that don't have a config factory that can access the store.

**Kind**: global function

## Import

Import the withCalls trait from `@ngrx-traits/signals`.

```ts
import { withFeatureFactory } from '@ngrx-traits/signals';
```

## Examples

#### Use withFeatureFactory inside a custom feature to create a store feature whose config can be a factory that receives the store
```typescript
function withCustomFeature2<Input extends SignalStoreFeatureResult>(
  configFactory: FeatureConfigFactory<Input, { foo: string }>,
): SignalStoreFeature<
  Input,
  {
    state: { foo: string };
    computed: { bar: Signal<string> };
    methods: { baz: () => number };
  }
> {
  return withFeatureFactory((store: StoreSource<Input>) => {
    const config = getFeatureConfig(configFactory, store);
    return signalStoreFeature(
      withState<{ foo: string }>({ foo: config.fooValue }),
      withComputed(({ foo }) => ({ bar: computed(() => foo() + 1) })),
      withMethods(({ foo, bar }) => ({
        baz: () => foo() + bar() + 2,
      })),
    );
  }) as any;
}

// now withCustomFeature2 can be used like :
const Store = signalStore(
  // withCustomFeature2({ fooValue: 'foo' }), // usual way with a plain object
  withState({ fooValue: 'foo' }),
  // or with a factory that receives the store
  withCustomFeature2(({ fooValue }) => ({ fooValue: fooValue() })),
);

```

#### Allow a store feature that receives a plain config object to access the store's state, methods, computed signals.


```typescript
function withCustomFeature(config: { fooValue: string }) {
...// create a custom store feature
}

const Store = signalStore(
  withState({ foo: 'foo' }),
// 👇use previous state to configure custom feature
  withFeatureFactory(({ foo }) => withCustomFeature({ fooV: foo() })),
// you can also use a signalStoreFeature inside withFeatureFactory
  withFeatureFactory(({ foo }) =>
      signalStoreFeature(
        withState({ foo2: foo() }),
// ... other store features,
      ),
  ),
);
```

## API Reference


| Property       | Description                                 | Value                                    |
|----------------|---------------------------------------------|------------------------------------------|
| featureFactory | Function that should return a store feature | `(store: StoreSource<Input>) => Feature` |


## State

Generates no extra state

## Computed

Generates no extra computed signals

## Methods

Generates no extra computed methods
