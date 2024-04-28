import { TestBed } from '@angular/core/testing';
import { signalStore, withState } from '@ngrx/signals';
import { Subject, throwError } from 'rxjs';

import { withCalls } from '../index';

describe('withCalls', () => {
  const apiResponse = new Subject<string>();
  const onSuccess = jest.fn();
  const onError = jest.fn();
  const Store = signalStore(
    withState({ foo: 'bar' }),
    withCalls(() => ({
      testCall: ({ ok }: { ok: boolean }) => {
        return ok ? apiResponse : throwError(() => new Error('fail'));
      },
      testCall2: {
        call: ({ ok }: { ok: boolean }) => {
          return ok ? apiResponse : throwError(() => new Error('fail'));
        },
        resultProp: 'result',
        onSuccess,
        onError,
      },
    })),
  );
  it('Successful call should set status to loading and loaded ', async () => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      expect(store.isTestCallLoading()).toBeFalsy();
      store.testCall({ ok: true });
      expect(store.isTestCallLoading()).toBeTruthy();
      apiResponse.next('test');
      expect(store.isTestCallLoaded()).toBeTruthy();
      expect(store.testCallResult()).toBe('test');
    });
  });
  it('Fail on a call should set status return error ', async () => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      expect(store.isTestCallLoading()).toBeFalsy();
      store.testCall({ ok: false });
      expect(store.testCallError()).toEqual(new Error('fail'));
      expect(store.testCallResult()).toBe(undefined);
    });
  });

  describe('when using a CallConfig', () => {
    it('Successful call should set status to loading and loaded ', async () => {
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        expect(store.isTestCall2Loading()).toBeFalsy();
        store.testCall2({ ok: true });
        expect(store.isTestCall2Loading()).toBeTruthy();
        apiResponse.next('test');
        expect(store.isTestCall2Loaded()).toBeTruthy();
        expect(store.result()).toBe('test');
        expect(onSuccess).toHaveBeenCalledWith('test');
      });
    });
    it('Fail on a call should set status return error ', async () => {
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        expect(store.isTestCall2Loading()).toBeFalsy();
        store.testCall2({ ok: false });
        expect(store.testCall2Error()).toEqual(new Error('fail'));
        expect(store.result()).toBe(undefined);
        expect(onError).toHaveBeenCalledWith(new Error('fail'));
      });
    });
  });
});
