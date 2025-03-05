import { signalStore, type, withState } from '@ngrx/signals';

import { CallStatus, withCallStatusMap } from '../index';

describe('withCallStatusMap', () => {
  const Store = signalStore(withCallStatusMap({ prop: 'test' }));

  it('setLoading should make isLoading return true', () => {
    const store = new Store();
    expect(store.isTestLoading('1')).toEqual(false);
    store.setTestLoading('1');
    expect(store.isTestLoading('1')).toEqual(true);
  });

  it('setLoading should make isAnyLoading return true', () => {
    const store = new Store();
    expect(store.isAnyTestLoading()).toEqual(false);
    store.setTestLoading('1');
    expect(store.isAnyTestLoading()).toEqual(true);
    store.setTestLoaded('1');
    store.setTestLoading('2');
    expect(store.isAnyTestLoading()).toEqual(true);
    store.setTestLoaded('2');
    expect(store.isAnyTestLoading()).toEqual(false);
  });

  it('setLoaded should make areAllTestLoaded return true', () => {
    const store = new Store();
    expect(store.areAllTestLoaded()).toEqual(false);
    store.setTestLoaded('1');
    expect(store.areAllTestLoaded()).toEqual(true);
    store.setTestLoaded('1');
    store.setTestLoaded('2');
    expect(store.areAllTestLoaded()).toEqual(true);
    store.setTestLoading('2');
    expect(store.areAllTestLoaded()).toEqual(false);
  });

  it('errors should return all the failed calls ', () => {
    const store = new Store();
    expect(store.testErrors()).toBeUndefined();
    store.setTestError('1', new Error('error1'));
    expect(store.testErrors()).toEqual([new Error('error1')]);
    store.setTestLoaded('1');
    store.setTestError('2', new Error('error2'));
    expect(store.testErrors()).toEqual([new Error('error2')]);
    store.setTestError('1', new Error('error1'));
    expect(store.testErrors()).toEqual([
      new Error('error1'),
      new Error('error2'),
    ]);
  });

  it('setLoaded should make isLoaded return true', () => {
    const store = new Store();
    expect(store.isTestLoaded('1')).toEqual(false);
    store.setTestLoaded('1');
    expect(store.isTestLoaded('1')).toEqual(true);
  });

  it('setError should make error return the object set', () => {
    const store = new Store();
    expect(store.testError('1')).toEqual(undefined);
    store.setTestError('1', { message: 'error' });
    expect(store.testError('1')).toEqual({ message: 'error' });
  });

  it('check initialValue works', () => {
    const Store = signalStore(
      withCallStatusMap({ prop: 'test', initialValue: { '1': 'loading' } }),
    );
    const store = new Store();
    expect(store.isTestLoading('1')).toEqual(true);
  });

  it('use config factory to set initialValue', () => {
    const Store = signalStore(
      withState({ myValue: { '1': 'loading' } }),
      withCallStatusMap(({ myValue }) => ({
        initialValue: myValue() as Record<string, CallStatus>,
        prop: 'test',
      })),
    );
    const store = new Store();
    expect(store.isTestLoading('1')).toEqual(true);
  });

  it('setError should make error return the object set with typed error', () => {
    const Store = signalStore(
      withCallStatusMap({
        prop: 'test',
        errorType: type<'error1' | 'error2'>(),
      }),
    );
    const store = new Store();
    expect(store.testError('1')).toEqual(undefined);
    store.setTestError('1', 'error1');
    expect(store.testError('1') === 'error1').toBeTruthy();
  });
});
