import { withCallStatus } from '@ngrx-traits/signals';
import { signalStore } from '@ngrx/signals';

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
});
