import { computed, Signal } from '@angular/core';
import {
  signalStore,
  SignalStoreFeature,
  signalStoreFeature,
  SignalStoreFeatureResult,
  type,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';

import { withFeatureFactory } from './with-feature-factory';
import {
  ExtractStoreFeatureOutput,
  FeatureConfigFactory,
  getFeatureConfig,
  StoreSource,
} from './with-feature-factory.model';

describe('withFeatureFactory', () => {
  function withCustomFeature(config: { fooValue: string }) {
    return signalStoreFeature(
      withState({ foo: config.fooValue }),
      withComputed(({ foo }) => ({ bar: computed(() => foo() + 1) })),
      withMethods(({ foo, bar }) => ({
        baz: () => foo() + bar() + 2,
      })),
    );
  }

  it('store features inside withFeatureFactory should have access to previous state, methods and computed', () => {
    const Store = signalStore(
      withState({ fooValue: 'foo' }),
      // check withCustomFeature has access to fooValue
      withFeatureFactory(({ fooValue }) =>
        withCustomFeature({ fooValue: fooValue() }),
      ),
      withComputed(({ bar }) => ({
        s: computed(() => bar() + 's'),
      })),
      // check signalStoreFeature has access to previous state, computed and methods
      withFeatureFactory(({ foo, bar, baz, s }) =>
        signalStoreFeature(
          withState({ foo2: 'foo2' }),
          withState({ bar2: 'bar2' }),
          withComputed(({ bar2 }) => ({
            s2: computed(() => bar2() + 's'),
          })),
          withMethods(({ foo2, bar2, s2 }) => ({
            all: () => foo() + bar() + baz() + s() + foo2() + bar2() + s2(),
          })),
        ),
      ),
    );
    const store = new Store();

    expect(store.foo()).toBe('foo');
    expect(store.bar()).toBe('foo1');
    expect(store.baz()).toBe('foofoo12');
    expect(store.s()).toBe('foo1s');
    expect(store.foo2()).toBe('foo2');
    expect(store.bar2()).toBe('bar2');
    expect(store.all()).toBe('foofoo1foofoo12foo1sfoo2bar2bar2s');
  });

  it('withFeatureFactory should return a SignalStoreFeature that has the same input and output as store feature inside', () => {
    function withCustomFeature2(config: { fooValue: string }) {
      return signalStoreFeature(
        type<{ state: { xyz: string } }>(), // check if type is passed
        withState({ foo: config.fooValue }),
        withComputed(({ foo }) => ({ bar: computed(() => foo() + 1) })),
        withMethods(({ foo, bar }) => ({
          baz: () => foo() + bar() + 2,
        })),
      );
    }

    const Store = signalStore(
      withState({ xyz: 'xyz' }), // we provide dependency to check if it is passed
      withFeatureFactory(() => withCustomFeature2({ fooValue: 'foo' })),
      withMethods(({ foo, bar, baz }) => ({
        // check output of withFeatureFactory is the same as withCustomFeature2
        all: () => {
          return foo() + bar() + baz();
        },
      })),
    );
    const store = new Store();

    expect(store.all()).toEqual('foofoo1foofoo12');
    const Store2 = signalStore(
      // @ts-expect-error // we expect an error here because we didn't provide the dependency
      withFeatureFactory(() => withCustomFeature2({ fooValue: 'foo' })),
    );
  });

  describe('ExtractStoreFeatureOutput', () => {
    it('should extract state, props and methods from a zero-arg feature factory', () => {
      function withSimpleFeature() {
        return signalStoreFeature(
          withState({ foo: 'foo' }),
          withComputed(({ foo }) => ({ bar: computed(() => foo() + '!') })),
          withMethods(({ foo }) => ({
            baz: () => foo(),
          })),
        );
      }

      type Result = ExtractStoreFeatureOutput<typeof withSimpleFeature>;
      // verify state, props and methods are accessible
      const check: Result = {} as Result;
      const _state: Result['state'] = {} as Result['state'];
      const _props: Result['props'] = {} as Result['props'];
      const _methods: Result['methods'] = {} as Result['methods'];
      // verify specific members exist
      const _foo: string = {} as Result['state']['foo'];
      const _bar: Signal<string> = {} as Result['props']['bar'];
      const _baz: () => string = {} as Result['methods']['baz'];
      expect(true).toBe(true);
    });

    it('should extract from a feature factory with parameters', () => {
      function withParamFeature(config: { value: string }) {
        return signalStoreFeature(
          withState({ param: config.value }),
          withMethods(() => ({
            getValue: () => config.value,
          })),
        );
      }

      type Result = ExtractStoreFeatureOutput<typeof withParamFeature>;
      const _param: string = {} as Result['state']['param'];
      const _getValue: () => string = {} as Result['methods']['getValue'];
      expect(true).toBe(true);
    });

    it('should include input state/props/methods from features with input requirements', () => {
      function withDependentFeature() {
        return signalStoreFeature(
          type<{ state: { xyz: string }; props: {}; methods: {} }>(),
          withState({ extra: 123 }),
        );
      }

      type Result = ExtractStoreFeatureOutput<typeof withDependentFeature>;
      // input state should be included
      const _xyz: string = {} as Result['state']['xyz'];
      // output state should be included
      const _extra: number = {} as Result['state']['extra'];
      expect(true).toBe(true);
    });

    it('should return never for non-feature functions', () => {
      // @ts-expect-error - a function not returning SignalStoreFeature should not be accepted
      type Invalid = ExtractStoreFeatureOutput<() => string>;
      expect(true).toBe(true);
    });
  });

  it('should feature using FeatureConfigFactory should be callable with a config object or a factory', () => {
    function withCustomFeature3<Input extends SignalStoreFeatureResult>(
      configFactory: FeatureConfigFactory<Input, { fooValue: string }>,
    ): SignalStoreFeature<
      Input,
      {
        state: { foo: string };
        props: { bar: Signal<string> };
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

    const Store = signalStore(
      withCustomFeature3({ fooValue: 'foo' }),
      withMethods(({ foo, bar, baz }) => ({
        all: () => {
          return foo() + bar() + baz();
        },
      })),
    );
    const store = new Store();
    const Store2 = signalStore(
      withState({ fooValue: 'foo' }),
      withCustomFeature3(({ fooValue }) => ({ fooValue: fooValue() })),
      withMethods(({ foo, bar, baz }) => ({
        all: () => {
          return foo() + bar() + baz();
        },
      })),
    );
    const store2 = new Store2();
    expect(store.all()).toEqual(store2.all());
  });
});
