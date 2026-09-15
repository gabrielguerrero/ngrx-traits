import { signalStore, type, withState } from '@ngrx/signals';
import { entityConfig } from '@ngrx/signals/entities';

import { CallStatus, withCallStatus } from '../index';

describe('withCallStatus', () => {
  const Store = signalStore(withCallStatus());

  it('setLoading should make isLoading return true', () => {
    const store = new Store();
    expect(store.isLoading()).toEqual(false);
    store.setLoading();
    expect(store.isLoading()).toEqual(true);
  });

  it('setLoaded should make isLoaded return true', () => {
    const store = new Store();
    expect(store.isLoaded()).toEqual(false);
    store.setLoaded();
    expect(store.isLoaded()).toEqual(true);
  });

  it('setError should make error return the object set', () => {
    const store = new Store();
    expect(store.error()).toEqual(undefined);
    store.setError({ message: 'error' });
    expect(store.error()).toEqual({ message: 'error' });
  });

  it('check initialValue works', () => {
    const Store = signalStore(withCallStatus({ initialValue: 'loading' }));
    const store = new Store();
    expect(store.isLoading()).toEqual(true);
  });

  it('use config factory to set initialValue', () => {
    const Store = signalStore(
      withState({ myValue: 'loading' }),
      withCallStatus(({ myValue }) => ({
        initialValue: myValue() as CallStatus,
      })),
    );
    const store = new Store();
    expect(store.isLoading()).toEqual(true);
  });

  it('setError should make error return the object set with typed error', () => {
    const Store = signalStore(
      withCallStatus({ errorType: type<'error1' | 'error2'>() }),
    );
    const store = new Store();
    expect(store.error()).toEqual(undefined);
    store.setError('error1');
    expect(store.error() === 'error1').toBeTruthy();
  });

  it('check prop rename works', () => {
    const Store = signalStore(withCallStatus({ prop: 'test' }));
    const store = new Store();
    expect(store.isTestLoading()).toEqual(false);
    store.setTestLoading();
    expect(store.isTestLoading()).toEqual(true);
    expect(store.isTestLoaded()).toEqual(false);
    store.setTestLoaded();
    expect(store.isTestLoaded()).toEqual(true);
    expect(store.testError()).toEqual(undefined);
    store.setTestError({ message: 'error' });
    expect(store.testError()).toEqual({ message: 'error' });
  });

  describe('withCallStatus with collection param', () => {
    it('generates Entities-suffixed methods for collection param', () => {
      const Store = signalStore(withCallStatus({ collection: 'pet' }));
      const store = new Store();

      expect(store.isPetEntitiesLoading()).toBe(false);
      store.setPetEntitiesLoading();
      expect(store.isPetEntitiesLoading()).toBe(true);

      store.setPetEntitiesLoaded();
      expect(store.isPetEntitiesLoaded()).toBe(true);

      expect(store.petEntitiesError()).toEqual(undefined);
      store.setPetEntitiesError({ message: 'error' });
      expect(store.petEntitiesError()).toEqual({ message: 'error' });
    });

    it('does NOT add Entities suffix when using prop param', () => {
      const Store = signalStore(withCallStatus({ prop: 'user' }));
      const store = new Store();

      expect(store.isUserLoading).toBeDefined();
      expect((store as any).isUserEntitiesLoading).toBeUndefined();
      expect((store as any).setUserEntitiesLoading).toBeUndefined();
    });

    it('collection param with errorType works', () => {
      const Store = signalStore(
        withCallStatus({
          collection: 'data',
          errorType: type<string>(),
        }),
      );
      const store = new Store();

      store.setDataEntitiesError('Not found');
      expect(store.dataEntitiesError()).toBe('Not found');
    });
  });

  describe('two-arg (entityConfig, options) form', () => {
    const petEntityConfig = entityConfig({
      entity: type<{ id: string }>(),
      collection: 'pet',
    });

    it('generates Entities-suffixed methods for collection param, same as single object form', () => {
      const Store = signalStore(
        withCallStatus(petEntityConfig, { initialValue: 'loading' }),
      );
      const store = new Store();

      expect(store.isPetEntitiesLoading()).toBe(true);
      store.setPetEntitiesLoaded();
      expect(store.isPetEntitiesLoaded()).toBe(true);

      expect(store.petEntitiesError()).toEqual(undefined);
      store.setPetEntitiesError({ message: 'error' });
      expect(store.petEntitiesError()).toEqual({ message: 'error' });
    });

    it('options as config factory can read previous state', () => {
      const Store = signalStore(
        withState({ myValue: 'loading' }),
        withCallStatus(petEntityConfig, ({ myValue }) => ({
          initialValue: myValue() as CallStatus,
        })),
      );
      const store = new Store();
      expect(store.isPetEntitiesLoading()).toEqual(true);
    });

    it('generates unnamed methods when entityConfig has no collection', () => {
      const Store = signalStore(
        withCallStatus(entityConfig({ entity: type<{ id: string }>() }), {
          initialValue: 'loading',
        }),
      );
      const store = new Store();

      expect(store.callStatus()).toBe('loading');
      expect(store.isLoading()).toBe(true);
      store.setLoaded();
      expect(store.isLoaded()).toBe(true);
      store.setError('error');
      expect(store.error()).toEqual('error');
    });

    it('requires entity in entityConfig', () => {
      signalStore(
        // @ts-expect-error entity is required in the two-arg form
        withCallStatus({ collection: 'pet' }, { initialValue: 'loading' }),
      );
    });
  });
});
