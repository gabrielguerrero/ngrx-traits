import { TestBed } from '@angular/core/testing';
import { withCalls, withCallStatus } from '@ngrx-traits/signals';
import { signalStore } from '@ngrx/signals';
import { first, Subject } from 'rxjs';

import { withAllCallStatus } from './with-all-call-status';

describe('withAllCallStatus', () => {
  it('isAnyCallLoading should be true if any call in the store is loading', async () => {
    let apiResponse = new Subject<string>();
    await TestBed.runInInjectionContext(async () => {
      const Store = signalStore(
        withAllCallStatus(),
        withCalls(() => ({
          testCall: (param: { id: string }) => {
            return apiResponse.pipe(first());
          },
        })),
        withCallStatus({ collection: 'test' }),
      );
      const store = new Store();

      expect(store.isAnyCallLoading()).toEqual(false);
      store.testCall({ id: '1' });
      expect(store.isAnyCallLoading()).toEqual(true);
      apiResponse.next('test response');
      expect(store.isAnyCallLoading()).toEqual(false);

      store.setTestLoading();
      expect(store.isAnyCallLoading()).toEqual(true);
      store.setTestLoaded();
      expect(store.isAnyCallLoading()).toEqual(false);
    });
  });

  it('callsErrors should return the errors of any call in error state', async () => {
    let apiResponse = new Subject<string>();
    await TestBed.runInInjectionContext(async () => {
      const Store = signalStore(
        withAllCallStatus(),
        withCalls(() => ({
          testCall: (param: { id: string }) => {
            return apiResponse.pipe(first());
          },
        })),
        withCallStatus({ collection: 'test2' }),
      );
      const store = new Store();

      expect(store.isAnyCallLoading()).toEqual(false);
      store.testCall({ id: '1' });
      expect(store.isAnyCallLoading()).toEqual(true);
      apiResponse.error(new Error('fail'));
      expect(store.callsErrors()[0]).toEqual(new Error('fail'));

      store.setTest2Error(new Error('fail2'));
      expect(store.isAnyCallLoading()).toEqual(false);
      expect(store.callsErrors()[0]).toEqual(new Error('fail'));
      expect(store.callsErrors()[1]).toEqual(new Error('fail2'));

      store.setTest2Loaded();
      apiResponse = new Subject<string>();
      store.testCall({ id: '1' });
      apiResponse.next('test response');
      expect(store.isAnyCallLoading()).toEqual(false);
      expect(store.callsErrors()).toEqual([]);
    });
  });
});
