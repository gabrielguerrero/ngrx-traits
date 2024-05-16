import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { patchState, signalStore, withState } from '@ngrx/signals';
import { BehaviorSubject, Subject, tap, throwError } from 'rxjs';

import { typedCallConfig, withCalls } from '../index';

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

  it('Successful call of a no parameters method, should set status to loading and loaded ', async () => {
    const Store = signalStore(
      withState({ foo: 'bar' }),
      withCalls(() => ({
        testCall: () => {
          return apiResponse;
        },
      })),
    );
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      expect(store.isTestCallLoading()).toBeFalsy();
      store.testCall();
      expect(store.isTestCallLoading()).toBeTruthy();
      apiResponse.next('test');
      expect(store.isTestCallLoaded()).toBeTruthy();
      expect(store.testCallResult()).toBe('test');
    });
  });
  it('passing a signal should call when signal value changes ', async () => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      expect(store.isTestCallLoading()).toBeFalsy();
      const param = signal({ ok: true });
      store.testCall(param);
      TestBed.flushEffects();
      expect(store.isTestCallLoading()).toBeTruthy();
      apiResponse.next('test');
      expect(store.isTestCallLoaded()).toBeTruthy();
      expect(store.testCallResult()).toBe('test');

      param.set({ ok: true });
      TestBed.flushEffects();
      expect(store.isTestCallLoading()).toBeTruthy();
      apiResponse.next('test2');
      expect(store.isTestCallLoaded()).toBeTruthy();
      expect(store.testCallResult()).toBe('test2');
    });
  });

  it('passing a observable should call when value changes ', async () => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      expect(store.isTestCallLoading()).toBeFalsy();
      const param = new BehaviorSubject({ ok: true });

      store.testCall(param);
      expect(store.isTestCallLoading()).toBeTruthy();
      apiResponse.next('test');
      expect(store.isTestCallLoaded()).toBeTruthy();
      expect(store.testCallResult()).toBe('test');

      param.next({ ok: true });
      expect(store.isTestCallLoading()).toBeTruthy();
      apiResponse.next('test2');
      expect(store.isTestCallLoaded()).toBeTruthy();
      expect(store.testCallResult()).toBe('test2');
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
        expect(onSuccess).toHaveBeenCalledWith('test', { ok: true });
      });
    });
    it('Fail on a call should set status return error ', async () => {
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        expect(store.isTestCall2Loading()).toBeFalsy();
        store.testCall2({ ok: false });
        expect(store.testCall2Error()).toEqual(new Error('fail'));
        expect(store.result()).toBe(undefined);
        expect(onError).toHaveBeenCalledWith(new Error('fail'), { ok: false });
      });
    });
    it('Successful call of a no parameters method and resultProp, should set status to loading and loaded ', async () => {
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          withState({ foo: 'bar' }),
          withCalls(() => ({
            testCall2: typedCallConfig({
              call: () => {
                return apiResponse;
              },
              resultProp: 'result',
              onSuccess,
              onError,
            }),
          })),
        );
        const store = new Store();
        expect(store.isTestCall2Loading()).toBeFalsy();
        store.testCall2();
        expect(store.isTestCall2Loading()).toBeTruthy();
        apiResponse.next('test');
        expect(store.isTestCall2Loaded()).toBeTruthy();
        expect(store.result()).toBe('test');
        expect(onSuccess).toHaveBeenCalledWith('test', { ok: true });
      });
    });
    it('Successful call of a no parameters method and no resultProp, should set status to loading and loaded ', async () => {
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          withState({ foo: 'bar' }),
          withCalls(() => ({
            testCall2: typedCallConfig({
              call: () => {
                return apiResponse;
              },
              onSuccess,
              onError,
            }),
          })),
        );
        const store = new Store();
        expect(store.isTestCall2Loading()).toBeFalsy();
        store.testCall2();
        expect(store.isTestCall2Loading()).toBeTruthy();
        apiResponse.next('test');
        expect(store.isTestCall2Loaded()).toBeTruthy();
        expect(store.testCall2Result()).toBe('test');
        expect(onSuccess).toHaveBeenCalledWith('test', { ok: true });
      });
    });
    it('Successful call should set status to loading and loaded ', async () => {
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          withState({ foo: 'bar' }),
          withCalls((store) => ({
            testCall: typedCallConfig({
              call: ({ ok }: { ok: boolean }) => {
                return ok
                  ? apiResponse
                  : apiResponse.pipe(
                      tap(() => throwError(() => new Error('fail'))),
                    );
              },
              storeResult: false,
              onSuccess: (result) => {
                // patchState should be able to update the store inside onSuccess
                patchState(store, { foo: result });
              },
              onError,
            }),
          })),
        );
        const store = new Store();
        expect(store.isTestCallLoading()).toBeFalsy();
        store.testCall({ ok: true });
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect((store as any).testCallResult).toBeUndefined();
        expect(onSuccess).toHaveBeenCalledWith('test', { ok: true });
        expect(store.foo()).toBe('test');
      });
    });

    it('check typedCallConfig with resultProp generates custom prop name ', async () => {
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          withState({ foo: 'bar' }),
          withCalls((store) => ({
            testCall: typedCallConfig({
              call: ({ ok }: { ok: boolean }) => {
                return ok
                  ? apiResponse
                  : apiResponse.pipe(
                      tap(() => throwError(() => new Error('fail'))),
                    );
              },
              resultProp: 'baz',
              onSuccess: (result) => {
                // patchState should be able to update the store inside onSuccess
                patchState(store, { foo: result });
              },
              onError,
            }),
          })),
        );
        const store = new Store();
        expect(store.isTestCallLoading()).toBeFalsy();
        store.testCall({ ok: true });
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect((store as any).testCallResult).toBeUndefined();
        expect(store.foo()).toBe('test');
        expect(store.baz()).toBe('test');
      });
    });

    it('check onSuccess receives params', async () => {
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          withState({ foo: 'bar' }),
          withState({ ok: false }),
          withCalls((store) => ({
            testCall: typedCallConfig({
              call: ({ ok }: { ok: boolean }) => {
                return ok
                  ? apiResponse
                  : apiResponse.pipe(
                      tap(() => throwError(() => new Error('fail'))),
                    );
              },
              resultProp: 'baz',
              onSuccess: (result, { ok }) => {
                // patchState should be able to update the store inside onSuccess
                patchState(store, { foo: result, ok });
              },
              onError,
            }),
          })),
          withCalls((store) => ({
            testCall2: typedCallConfig({
              call: ({ ok }: { ok: boolean }) => {
                return apiResponse;
              },
              resultProp: 'baz2',
              onSuccess: (result, { ok }) => {
                // patchState should be able to update the store inside onSuccess
                patchState(store, { foo: result, ok });
              },
              onError,
            }),
          })),
        );
        const store = new Store();
        expect(store.isTestCallLoading()).toBeFalsy();
        store.testCall({ ok: true });
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect((store as any).testCallResult).toBeUndefined();
        expect(store.foo()).toBe('test');
        expect(store.baz()).toBe('test');
        expect(store.ok()).toBe(true);

        expect(store.isTestCall2Loading()).toBeFalsy();
        store.testCall2({ ok: true });
        expect(store.isTestCall2Loading()).toBeTruthy();
        apiResponse.next('test2');
        expect(store.isTestCall2Loaded()).toBeTruthy();
        expect((store as any).testCallResult).toBeUndefined();
        expect(store.foo()).toBe('test2');
        expect(store.baz2()).toBe('test2');
        expect(store.ok()).toBe(true);
      });
    });
  });
});
