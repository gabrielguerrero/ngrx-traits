import { computed, signal } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  BehaviorSubject,
  delay,
  first,
  of,
  Subject,
  tap,
  throwError,
} from 'rxjs';

import { typedCallConfig, withCalls } from '../index';

describe('withCalls', () => {
  let apiResponse = new Subject<string>();
  let privateApiResponse = new Subject<string>();
  const onSuccess = jest.fn();
  const onError = jest.fn();
  const Store = signalStore(
    { protectedState: false },
    withState({ foo: 'bar' }),
    withCalls(() => ({
      testCall: ({ ok }: { ok: boolean }) => {
        return ok ? apiResponse : throwError(() => new Error('fail'));
      },
      _testCall: ({ ok }: { ok: boolean }) => {
        return ok ? privateApiResponse : throwError(() => new Error('fail'));
      },
      testCall2: {
        call: ({ ok }: { ok: boolean }) => {
          return ok ? apiResponse : throwError(() => new Error('fail'));
        },
        resultProp: 'result',
        onSuccess,
        onError,
      },
      _testCall2: typedCallConfig({
        call: ({ ok }: { ok: boolean }) => {
          return ok ? privateApiResponse : throwError(() => new Error('fail'));
        },
        resultProp: '_result',
        onSuccess,
        onError,
      }),
    })),
    withComputed((store) => ({
      privateIsTestCallLoading: computed(() => store._isTestCallLoading()),
      privateIsTestCallLoaded: computed(() => store._isTestCallLoaded()),
      privateTestCallResult: computed(() => store._testCallResult()),
      privateTestCallError: computed(() => store._testCallError()),
      privateIsTestCall2Loading: computed(() => store._isTestCall2Loading()),
      privateIsTestCall2Loaded: computed(() => store._isTestCall2Loaded()),
      privateResult: computed(() => store._result()),
      privateTestCall2Error: computed(() => store._testCall2Error()),
    })),
    withMethods((store) => ({
      privateTestCall: ({ ok }: { ok: boolean }) => store._testCall({ ok }),
      privateTestCall2: ({ ok }: { ok: boolean }) => store._testCall2({ ok }),
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
      apiResponse.complete();

      apiResponse = new Subject<string>();
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
      apiResponse.complete();

      apiResponse = new Subject<string>();
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
    it('Fail on a call should set status return error with correct type if mapError is used ', async () => {
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          withState({ foo: 'bar' }),
          withCalls(() => ({
            testCall2: typedCallConfig({
              call: ({ ok }: { ok: boolean }) => {
                return ok ? apiResponse : throwError(() => new Error('fail'));
              },
              mapError: (error, { ok }) => (error as Error).message + ' ' + ok,
              resultProp: 'result',
              onSuccess,
              onError,
            }),
          })),
        );
        const store = new Store();
        expect(store.isTestCall2Loading()).toBeFalsy();
        store.testCall2({ ok: false });
        expect(store.testCall2Error()).toEqual('fail false');
        expect(store.result()).toBe(undefined);
        expect(onError).toHaveBeenCalledWith('fail false', { ok: false });
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

  it('returning an observable should update when value changes ', async () => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      expect(store.isTestCallLoading()).toBeFalsy();
      const param = new BehaviorSubject({ ok: true });

      store.testCall(param);
      expect(store.isTestCallLoading()).toBeTruthy();
      apiResponse.next('test');
      expect(store.isTestCallLoaded()).toBeTruthy();
      expect(store.testCallResult()).toBe('test');

      apiResponse.next('test2');
      expect(store.isTestCallLoaded()).toBeTruthy();
      expect(store.testCallResult()).toBe('test2');

      expect(apiResponse.observed).toBe(true);
    });
  });

  it('returning an observable should update to error state when it errors', async () => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      expect(store.isTestCallLoading()).toBeFalsy();
      const param = new BehaviorSubject({ ok: true });

      store.testCall(param);
      expect(store.isTestCallLoading()).toBeTruthy();
      apiResponse.next('test');
      expect(store.isTestCallLoaded()).toBeTruthy();
      expect(store.testCallResult()).toBe('test');

      apiResponse.error(new Error('fail'));
      expect(store.testCallError()).toEqual(new Error('fail'));
      expect(store.testCallResult()).toBe('test');

      expect(apiResponse.observed).toBe(false);
    });
  });

  it('returning a promise should output when value returns', async () => {
    let response: Promise<string>;
    TestBed.runInInjectionContext(async () => {
      const Store = signalStore(
        withCalls(() => ({
          testCall: () => {
            response = Promise.resolve('test');
            return response;
          },
        })),
      );
      const store = new Store();
      expect(store.isTestCallLoading()).toBeFalsy();

      store.testCall();
      expect(store.isTestCallLoading()).toBeTruthy();
      apiResponse.next('test');
      apiResponse.complete();
      await response;
      expect(store.isTestCallLoaded()).toBeTruthy();
      expect(store.testCallResult()).toBe('test');
    });
  });

  it("should warn in dev mode if no callConfig is used when using an observable that doesn't complete within 100ms", () => {
    const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {
      /* Empty */
    });
    TestBed.runInInjectionContext(async () => {
      const Store = signalStore(
        withCalls(() => ({
          testCall: () => apiResponse,
        })),
      );
      const store = new Store();
      expect(store.isTestCallLoading()).toBeFalsy();

      store.testCall();
      expect(store.isTestCallLoading()).toBeTruthy();
      apiResponse.next('test');
      expect(store.isTestCallLoaded()).toBeTruthy();
      expect(store.testCallResult()).toBe('test');

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(consoleWarn).toHaveBeenCalledTimes(1);
    });
  });

  it("should warn in dev mode if a mapPipe has not been set when using an observable that doesn't complete within 100ms", () => {
    const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {
      /* Empty */
    });
    TestBed.runInInjectionContext(async () => {
      const Store = signalStore(
        withCalls(() => ({
          testCall: typedCallConfig({
            call: () => apiResponse,
          }),
        })),
      );
      const store = new Store();
      expect(store.isTestCallLoading()).toBeFalsy();

      store.testCall();
      expect(store.isTestCallLoading()).toBeTruthy();
      apiResponse.next('test');
      expect(store.isTestCallLoaded()).toBeTruthy();
      expect(store.testCallResult()).toBe('test');

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(consoleWarn).toHaveBeenCalledTimes(1);
    });
  });

  it("should not warn in dev mode if a mapPipe has been set when using an observable that doesn't complete within 100ms", () => {
    const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {
      /* Empty */
    });
    TestBed.runInInjectionContext(async () => {
      const Store = signalStore(
        withCalls(() => ({
          testCall: typedCallConfig({
            call: () => apiResponse,
            mapPipe: 'switchMap',
          }),
        })),
      );
      const store = new Store();
      expect(store.isTestCallLoading()).toBeFalsy();

      store.testCall();
      expect(store.isTestCallLoading()).toBeTruthy();
      apiResponse.next('test');
      expect(store.isTestCallLoaded()).toBeTruthy();
      expect(store.testCallResult()).toBe('test');

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(consoleWarn).not.toHaveBeenCalledTimes(1);
    });
  });

  it("should not warn in dev mode if a mapPipe has been explicitly set to exhaustMap when using an observable that doesn't complete within 100ms", () => {
    const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {
      /* Empty */
    });
    TestBed.runInInjectionContext(async () => {
      const Store = signalStore(
        withCalls(() => ({
          testCall: typedCallConfig({
            call: () => apiResponse,
            mapPipe: 'exhaustMap',
          }),
        })),
      );
      const store = new Store();
      expect(store.isTestCallLoading()).toBeFalsy();

      store.testCall();
      expect(store.isTestCallLoading()).toBeTruthy();
      apiResponse.next('test');
      expect(store.isTestCallLoaded()).toBeTruthy();
      expect(store.testCallResult()).toBe('test');

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(consoleWarn).not.toHaveBeenCalledTimes(1);
    });
  });
  describe('skipWhen function', () => {
    it('returning true in skipWhen should skip call ', async () => {
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {
        /* Empty */
      });
      TestBed.runInInjectionContext(async () => {
        const Store = signalStore(
          withCalls(() => ({
            testCall: typedCallConfig({
              call: () => apiResponse,
              mapPipe: 'exhaustMap',
              skipWhen: () => true,
            }),
          })),
        );
        const store = new Store();
        expect(store.isTestCallLoading()).toBeFalsy();

        store.testCall();
        expect(store.isTestCallLoading()).toBeFalsy();
        apiResponse.next('test');
        expect(store.isTestCallLoaded()).toBeFalsy();
        expect(store.testCallResult()).toBeUndefined();
        expect(store.testCallCallStatus()).toEqual('init');
        expect(consoleWarn).toHaveBeenCalledWith('Call testCall is skip');
      });
    });

    it('returning false in skipWhen should make call ', async () => {
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {
        /* Empty */
      });
      TestBed.runInInjectionContext(async () => {
        const Store = signalStore(
          withCalls(() => ({
            testCall: typedCallConfig({
              call: () => apiResponse,
              mapPipe: 'exhaustMap',
              skipWhen: () => false,
            }),
          })),
        );
        const store = new Store();
        expect(store.isTestCallLoading()).toBeFalsy();

        store.testCall();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test');
        expect(consoleWarn).not.toHaveBeenCalled();
      });
    });

    it('returning an Observable with true in skipWhen should skip call', async () => {
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {
        /* Empty */
      });
      TestBed.runInInjectionContext(async () => {
        const Store = signalStore(
          withCalls(() => ({
            testCall: typedCallConfig({
              call: () => apiResponse,
              mapPipe: 'exhaustMap',
              skipWhen: () => of(true),
            }),
          })),
        );
        const store = new Store();
        expect(store.isTestCallLoading()).toBeFalsy();

        store.testCall();
        expect(store.isTestCallLoading()).toBeFalsy();
        apiResponse.next('test');
        expect(store.isTestCallLoaded()).toBeFalsy();
        expect(store.testCallResult()).toBeUndefined();
        expect(store.testCallCallStatus()).toEqual('init');
        expect(consoleWarn).toHaveBeenCalledWith('Call testCall is skip');
      });
    });

    it('returning an Observable with false in skipWhen should run call', async () => {
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {
        /* Empty */
      });
      TestBed.runInInjectionContext(async () => {
        const Store = signalStore(
          withCalls(() => ({
            testCall: typedCallConfig({
              call: () => apiResponse,
              mapPipe: 'exhaustMap',
              skipWhen: () => of(false),
            }),
          })),
        );
        const store = new Store();
        expect(store.isTestCallLoading()).toBeFalsy();

        store.testCall();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test');
        expect(consoleWarn).not.toHaveBeenCalled();
      });
    });

    it('returning a Promise with true in skipWhen should skip call', async () => {
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {
        /* Empty */
      });
      TestBed.runInInjectionContext(async () => {
        const Store = signalStore(
          withCalls(() => ({
            testCall: typedCallConfig({
              call: () => apiResponse,
              mapPipe: 'exhaustMap',
              skipWhen: () => Promise.resolve(true),
            }),
          })),
        );
        const store = new Store();
        expect(store.isTestCallLoading()).toBeFalsy();

        store.testCall();
        expect(store.isTestCallLoading()).toBeFalsy();
        apiResponse.next('test');
        expect(store.isTestCallLoaded()).toBeFalsy();
        expect(store.testCallResult()).toBeUndefined();
        expect(store.testCallCallStatus()).toEqual('init');
        expect(consoleWarn).toHaveBeenCalledWith('Call testCall is skip');
      });
    });

    it('returning a Promise with false in skipWhen should run call', async () => {
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {
        /* Empty */
      });
      TestBed.runInInjectionContext(async () => {
        const Store = signalStore(
          withCalls(() => ({
            testCall: typedCallConfig({
              call: () => apiResponse,
              mapPipe: 'exhaustMap',
              skipWhen: () => Promise.resolve(false),
            }),
          })),
        );
        const store = new Store();
        expect(store.isTestCallLoading()).toBeFalsy();

        store.testCall();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test');
        expect(consoleWarn).not.toHaveBeenCalled();
      });
    });
  });

  describe('when using private name', () => {
    it('Successful call should set status to loading and loaded ', async () => {
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        expect(store.privateIsTestCallLoading()).toBeFalsy();
        store.privateTestCall({ ok: true });
        expect(store.privateIsTestCallLoading()).toBeTruthy();
        privateApiResponse.next('test');
        expect(store.privateIsTestCallLoaded()).toBeTruthy();
        expect(store.privateTestCallResult()).toBe('test');
      });
    });
    it('Fail on a call should set status return error ', async () => {
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        expect(store.privateIsTestCallLoading()).toBeFalsy();
        store.privateTestCall({ ok: false });
        expect(store.privateTestCallError()).toEqual(new Error('fail'));
        expect(store.privateTestCallResult()).toBe(undefined);
      });
    });

    describe('when using a CallConfig', () => {
      it('Successful call should set status to loading and loaded ', async () => {
        TestBed.runInInjectionContext(() => {
          const store = new Store();
          expect(store.privateIsTestCall2Loading()).toBeFalsy();
          store.privateTestCall2({ ok: true });
          expect(store.privateIsTestCall2Loading()).toBeTruthy();
          privateApiResponse.next('test');
          expect(store.privateIsTestCall2Loaded()).toBeTruthy();
          expect(store.privateResult()).toBe('test');
          expect(onSuccess).toHaveBeenCalledWith('test', { ok: true });
        });
      });
      it('Fail on a call should set status return error ', async () => {
        TestBed.runInInjectionContext(() => {
          const store = new Store();
          expect(store.privateIsTestCall2Loading()).toBeFalsy();
          store.privateTestCall2({ ok: false });
          expect(store.privateTestCall2Error()).toEqual(new Error('fail'));
          expect(store.privateResult()).toBe(undefined);
          expect(onError).toHaveBeenCalledWith(new Error('fail'), {
            ok: false,
          });
        });
      });
    });
  });

  describe('withCalls with mapPipe', () => {
    it('when withCall has mapPipe = switchMap should only process last call', fakeAsync(() => {
      let aux = 0;
      const call = jest.fn().mockImplementation(() => {
        aux++;
        return of('' + aux).pipe(delay(100));
      });
      const Store = signalStore(
        { providedIn: 'root' },
        withCalls(() => ({
          testCall: typedCallConfig({
            call: call,
            mapPipe: 'switchMap',
          }),
        })),
      );
      const store = TestBed.inject(Store);
      expect(store.isTestCallLoading()).toBeFalsy();

      store.testCall();
      store.testCall();
      store.testCall();

      expect(store.isTestCallLoading()).toBeTruthy();
      tick(150);
      expect(store.isTestCallLoaded()).toBeTruthy();
      expect(store.testCallResult()).toBe('3');

      expect(call).toHaveBeenCalledTimes(3);
    }));

    it('when withCall has mapPipe= exhaustMap should only process first call', fakeAsync(() => {
      let aux = 0;
      const call = jest.fn().mockImplementation(() => {
        aux++;
        return of('' + aux).pipe(delay(100));
      });
      const Store = signalStore(
        { providedIn: 'root' },
        withCalls(() => ({
          testCall: typedCallConfig({
            call: call,
            mapPipe: 'exhaustMap',
          }),
        })),
      );
      const store = TestBed.inject(Store);
      expect(store.isTestCallLoading()).toBeFalsy();

      store.testCall();
      store.testCall();
      store.testCall();

      expect(store.isTestCallLoading()).toBeTruthy();
      tick(150);
      expect(store.isTestCallLoaded()).toBeTruthy();
      expect(store.testCallResult()).toBe('1');

      expect(call).toHaveBeenCalledTimes(1);
    }));

    it('when withCall has mapPipe = concatMap should process all calls in sequence', fakeAsync(() => {
      let aux = 0;
      const call = jest.fn().mockImplementation(() => {
        aux++;
        return of('' + aux).pipe(delay(100));
      });
      const Store = signalStore(
        { providedIn: 'root' },
        withCalls(() => ({
          testCall: typedCallConfig({
            call: call,
            mapPipe: 'concatMap',
          }),
        })),
      );
      const store = TestBed.inject(Store);
      expect(store.isTestCallLoading()).toBeFalsy();

      store.testCall();
      store.testCall();
      store.testCall();

      expect(store.isTestCallLoading()).toBeTruthy();
      tick(110);
      expect(store.testCallResult()).toBe('1');
      expect(store.isTestCallLoading()).toBeTruthy();
      expect(call).toHaveBeenCalledTimes(2);
      tick(110);
      expect(store.testCallResult()).toBe('2');
      expect(store.isTestCallLoading()).toBeTruthy();
      expect(call).toHaveBeenCalledTimes(3);
      tick(110);
      expect(store.testCallResult()).toBe('3');
      expect(store.isTestCallLoaded()).toBeTruthy();
      expect(call).toHaveBeenCalledTimes(3);
    }));
  });
  describe('when using callWith', () => {
    it('should run call on init when call has no params and callWith = true', async () => {
      let apiResponse = new Subject<string>();
      const apiMockCall = jest.fn();
      await TestBed.runInInjectionContext(async () => {
        const Store = signalStore(
          withCalls(() => ({
            testCall: typedCallConfig({
              call: () => {
                apiMockCall();
                return apiResponse;
              },
              mapPipe: 'exhaustMap',
              callWith: true,
            }),
          })),
        );
        const store = new Store();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test');
        expect(apiMockCall).toHaveBeenCalled();
      });
    });

    it('should not run call on init when call has no params and callWith = false', async () => {
      let apiResponse = new Subject<string>();
      const apiMockCall = jest.fn();
      await TestBed.runInInjectionContext(async () => {
        const Store = signalStore(
          withCalls(() => ({
            testCall: typedCallConfig({
              call: () => {
                apiMockCall();
                return apiResponse;
              },
              mapPipe: 'exhaustMap',
              callWith: false,
            }),
          })),
        );
        const store = new Store();
        expect(store.isTestCallLoading()).toBeFalsy();
        apiResponse.next('test');
        expect(store.isTestCallLoaded()).toBeFalsy();
        expect(store.testCallResult()).toBeUndefined();
        expect(apiMockCall).not.toHaveBeenCalled();
      });
    });

    it('should run on init when call has params and callWith = { id: "1" }', async () => {
      const apiMockCall = jest.fn();
      let apiResponse = new Subject<string>();
      await TestBed.runInInjectionContext(async () => {
        const Store = signalStore(
          withCalls(() => ({
            testCall: typedCallConfig({
              call: (param: { id: string }) => {
                apiMockCall(param);
                return apiResponse;
              },
              mapPipe: 'exhaustMap',
              callWith: { id: 'id' },
            }),
          })),
        );
        const store = new Store();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test');
        expect(apiMockCall).toHaveBeenCalledWith({ id: 'id' });
      });
    });

    it('should not run on init when call has params and callWith = undefined', async () => {
      const apiMockCall = jest.fn();
      let apiResponse = new Subject<string>();
      await TestBed.runInInjectionContext(async () => {
        const Store = signalStore(
          withCalls(() => ({
            testCall: typedCallConfig({
              call: (param: { id: string }) => {
                apiMockCall(param);
                return apiResponse;
              },
              mapPipe: 'exhaustMap',
              callWith: undefined,
            }),
          })),
        );
        const store = new Store();
        expect(store.isTestCallLoading()).toBeFalsy();
        apiResponse.next('test');
        expect(store.isTestCallLoaded()).toBeFalsy();
        expect(store.testCallResult()).toBeUndefined();
        expect(apiMockCall).not.toHaveBeenCalled();
      });
    });

    it('should run call everytime there is new values if callWith is a signal and call has params', async () => {
      const apiMockCall = jest.fn();
      let apiResponse = new Subject<string>();
      await TestBed.runInInjectionContext(async () => {
        const idSignal = signal({ id: '1' });
        const Store = signalStore(
          withCalls(() => ({
            testCall: typedCallConfig({
              call: (param: { id: string }) => {
                apiMockCall(param);
                return apiResponse.pipe(first());
              },
              mapPipe: 'switchMap',
              callWith: idSignal,
            }),
          })),
        );
        const store = new Store();
        TestBed.flushEffects();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test');
        expect(apiMockCall).toHaveBeenCalledWith({ id: '1' });

        idSignal.set({ id: '2' });
        TestBed.flushEffects();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test2');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test2');
        expect(apiMockCall).toHaveBeenCalledWith({ id: '2' });
      });
    });

    it('should run call everytime there is new truthy values if callWith is a observable and call params', async () => {
      const apiMockCall = jest.fn();
      let apiResponse = new Subject<string>();
      await TestBed.runInInjectionContext(async () => {
        const id$ = new BehaviorSubject({ id: '1' });
        const Store = signalStore(
          withCalls(() => ({
            testCall: typedCallConfig({
              call: (param: { id: string }) => {
                apiMockCall(param);
                return apiResponse.pipe(first());
              },
              mapPipe: 'switchMap',
              callWith: id$,
            }),
          })),
        );
        const store = new Store();
        TestBed.flushEffects();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test2');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test2');
        expect(apiMockCall).toHaveBeenCalledWith({ id: '1' });

        id$.next({ id: '2' });
        TestBed.flushEffects();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test2');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test2');
        expect(apiMockCall).toHaveBeenCalledWith({ id: '2' });
      });
    });

    it('should run call everytime there is new truthy values if callWith is a function and call has params', async () => {
      const apiMockCall = jest.fn();
      let apiResponse = new Subject<string>();
      await TestBed.runInInjectionContext(async () => {
        const idSignal = signal({ id: '1' });
        const Store = signalStore(
          withCalls(() => ({
            testCall: typedCallConfig({
              call: (param: { id: string }) => {
                apiMockCall(param);
                return apiResponse.pipe(first());
              },
              mapPipe: 'switchMap',
              callWith: () => ({ id: idSignal().id }),
            }),
          })),
        );
        const store = new Store();
        TestBed.flushEffects();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test');
        expect(apiMockCall).toHaveBeenCalledWith({ id: '1' });

        idSignal.set({ id: '2' });
        TestBed.flushEffects();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test2');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test2');
        expect(apiMockCall).toHaveBeenCalledWith({ id: '2' });
      });
    });

    it('should run call everytime there is new values if callWith is a signal and call has no params', async () => {
      const apiMockCall = jest.fn();
      let apiResponse = new Subject<string>();
      await TestBed.runInInjectionContext(async () => {
        const loadingSignal = signal(true);
        const Store = signalStore(
          withCalls(() => ({
            testCall: typedCallConfig({
              call: () => {
                apiMockCall();
                return apiResponse.pipe(first());
              },
              mapPipe: 'switchMap',
              callWith: loadingSignal,
            }),
          })),
        );
        const store = new Store();
        TestBed.flushEffects();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test');
        expect(apiMockCall).toHaveBeenCalledTimes(1);

        loadingSignal.set(false);
        TestBed.flushEffects();
        expect(store.isTestCallLoading()).toBeFalsy();
        apiResponse.next('test2');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test');
        expect(apiMockCall).toHaveBeenCalledTimes(1);

        loadingSignal.set(true);
        TestBed.flushEffects();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test3');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test3');
        expect(apiMockCall).toHaveBeenCalledTimes(2);
      });
    });

    it('should run call everytime there is new values if callWith is a signal and call has no params', async () => {
      const apiMockCall = jest.fn();
      let apiResponse = new Subject<string>();
      await TestBed.runInInjectionContext(async () => {
        const id$ = new BehaviorSubject(true);
        const Store = signalStore(
          withCalls(() => ({
            testCall: typedCallConfig({
              call: () => {
                apiMockCall();
                return apiResponse.pipe(first());
              },
              mapPipe: 'switchMap',
              callWith: id$,
            }),
          })),
        );
        const store = new Store();
        TestBed.flushEffects();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test');
        expect(apiMockCall).toHaveBeenCalledTimes(1);

        id$.next(false);
        TestBed.flushEffects();
        expect(store.isTestCallLoading()).toBeFalsy();
        apiResponse.next('test2');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test');
        expect(apiMockCall).toHaveBeenCalledTimes(1);

        id$.next(true);
        TestBed.flushEffects();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test3');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test3');
        expect(apiMockCall).toHaveBeenCalledTimes(2);
      });
    });

    it('should run call everytime there is new values if callWith is a function and call has no params', async () => {
      const apiMockCall = jest.fn();
      let apiResponse = new Subject<string>();
      await TestBed.runInInjectionContext(async () => {
        const loadingSignal = signal(true);
        const Store = signalStore(
          withCalls(() => ({
            testCall: typedCallConfig({
              call: () => {
                apiMockCall();
                return apiResponse.pipe(first());
              },
              mapPipe: 'switchMap',
              callWith: () => loadingSignal(),
            }),
          })),
        );
        const store = new Store();
        TestBed.flushEffects();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test');
        expect(apiMockCall).toHaveBeenCalledTimes(1);

        loadingSignal.set(false);
        TestBed.flushEffects();
        expect(store.isTestCallLoading()).toBeFalsy();
        apiResponse.next('test2');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test');
        expect(apiMockCall).toHaveBeenCalledTimes(1);

        loadingSignal.set(true);
        TestBed.flushEffects();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test3');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test3');
        expect(apiMockCall).toHaveBeenCalledTimes(2);
      });
    });

    it('should not run call everytime there is new undefined values when callWith is a signal and not skipWhen is defined ', async () => {
      const apiMockCall = jest.fn();
      let apiResponse = new Subject<string>();
      await TestBed.runInInjectionContext(async () => {
        const idSignal = signal<{ id: string } | undefined>({ id: '1' });
        const Store = signalStore(
          withCalls(() => ({
            testCall: typedCallConfig({
              call: (param: { id: string }) => {
                apiMockCall(param);
                return apiResponse.pipe(first());
              },
              mapPipe: 'switchMap',
              callWith: idSignal,
            }),
          })),
        );
        const store = new Store();
        TestBed.flushEffects();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test');
        expect(apiMockCall).toHaveBeenCalledWith({ id: '1' });

        idSignal.set(undefined);
        TestBed.flushEffects();
        expect(store.isTestCallLoading()).toBeFalsy();
        apiResponse.next('test2');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test');
        expect(apiMockCall).not.toHaveBeenCalledWith(undefined);
      });
    });

    it('should not run call everytime there is a undefined value when callWith is a observable and skipWhen is not defined ', async () => {
      const apiMockCall = jest.fn();
      let apiResponse = new Subject<string>();
      await TestBed.runInInjectionContext(async () => {
        const id$ = new BehaviorSubject<{ id: string } | undefined>({
          id: '1',
        });
        const Store = signalStore(
          withCalls(() => ({
            testCall: typedCallConfig({
              call: (param: { id: string }) => {
                apiMockCall(param);
                return apiResponse.pipe(first());
              },
              mapPipe: 'switchMap',
              callWith: id$,
            }),
          })),
        );
        const store = new Store();
        TestBed.flushEffects();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test');
        expect(apiMockCall).toHaveBeenCalledWith({ id: '1' });

        id$.next(undefined);
        TestBed.flushEffects();
        expect(store.isTestCallLoading()).toBeFalsy();
        apiResponse.next('test2');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test');
        expect(apiMockCall).not.toHaveBeenCalledWith(undefined);
      });
    });

    it('should not run call everytime there is undefined values when callWith is a function  and not skipWhen is defined ', async () => {
      const apiMockCall = jest.fn();
      let apiResponse = new Subject<string>();
      await TestBed.runInInjectionContext(async () => {
        const idSignal = signal<{ id: string } | undefined>({ id: '1' });
        const Store = signalStore(
          withCalls(() => ({
            testCall: typedCallConfig({
              call: (param: { id: string }) => {
                apiMockCall(param);
                return apiResponse.pipe(first());
              },
              mapPipe: 'switchMap',
              callWith: () => (idSignal() ? { id: idSignal()!.id } : undefined),
            }),
          })),
        );
        const store = new Store();
        TestBed.flushEffects();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test');
        expect(apiMockCall).toHaveBeenCalledWith({ id: '1' });

        idSignal.set(undefined);
        TestBed.flushEffects();
        expect(store.isTestCallLoading()).toBeFalsy();
        apiResponse.next('test2');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test');
        expect(apiMockCall).not.toHaveBeenCalledWith(undefined);
      });
    });

    it('should run call everytime there is new undefined values when callWith is a signal  and  skipWhen is defined that allows them', async () => {
      const apiMockCall = jest.fn();
      let apiResponse = new Subject<string>();
      await TestBed.runInInjectionContext(async () => {
        const idSignal = signal<{ id: string } | undefined>({ id: '1' });
        const Store = signalStore(
          withCalls(() => ({
            testCall: typedCallConfig({
              call: (param: { id: string }) => {
                apiMockCall(param);
                return apiResponse.pipe(first());
              },
              mapPipe: 'switchMap',
              callWith: idSignal,
              skipWhen: () => false,
            }),
          })),
        );
        const store = new Store();
        TestBed.flushEffects();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test');
        expect(apiMockCall).toHaveBeenCalledWith({ id: '1' });

        idSignal.set(undefined);
        TestBed.flushEffects();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test2');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test2');
        expect(apiMockCall).toHaveBeenCalledWith(undefined);
      });
    });

    it('should run call everytime there is new undefined values when callWith is a observable  and  skipWhen is defined that allows them', async () => {
      const apiMockCall = jest.fn();
      let apiResponse = new Subject<string>();
      await TestBed.runInInjectionContext(async () => {
        const id$ = new BehaviorSubject<{ id: string } | undefined>({
          id: '1',
        });
        const Store = signalStore(
          withCalls(() => ({
            testCall: typedCallConfig({
              call: (param: { id: string }) => {
                apiMockCall(param);
                return apiResponse.pipe(first());
              },
              mapPipe: 'switchMap',
              callWith: id$,
              skipWhen: () => false,
            }),
          })),
        );
        const store = new Store();
        TestBed.flushEffects();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test');
        expect(apiMockCall).toHaveBeenCalledWith({ id: '1' });

        id$.next(undefined);
        TestBed.flushEffects();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test2');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test2');
        expect(apiMockCall).toHaveBeenCalledWith(undefined);
      });
    });

    it('should run call everytime there is new undefined values when callWith is a function  and  skipWhen is defined that allows them', async () => {
      const apiMockCall = jest.fn();
      let apiResponse = new Subject<string>();
      await TestBed.runInInjectionContext(async () => {
        const idSignal = signal<{ id: string } | undefined>({ id: '1' });
        const Store = signalStore(
          withCalls(() => ({
            testCall: typedCallConfig({
              call: (param: { id: string }) => {
                apiMockCall(param);
                return apiResponse.pipe(first());
              },
              mapPipe: 'switchMap',
              callWith: () => (idSignal() ? { id: idSignal()!.id } : undefined),
              skipWhen: () => false,
            }),
          })),
        );
        const store = new Store();
        TestBed.flushEffects();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test');
        expect(apiMockCall).toHaveBeenCalledWith({ id: '1' });

        idSignal.set(undefined);
        TestBed.flushEffects();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test2');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test2');
        expect(apiMockCall).toHaveBeenCalledWith(undefined);
      });
    });
  });

  it('should initialize result with default value if set', async () => {
    let apiResponse = new Subject<string>();
    await TestBed.runInInjectionContext(async () => {
      const Store = signalStore(
        withCalls(() => ({
          testCall: typedCallConfig({
            call: (param: { id: string }) => {
              return apiResponse.pipe(first());
            },
            defaultResult: 'test initial value',
          }),
        })),
      );
      const store = new Store();

      expect(store.testCallResult()).toEqual('test initial value');
      // bellow is just to check that the testCallResult is no longer nullable
      expect(store.testCallResult().length).toEqual(
        'test initial value'.length,
      );
    });
  });
});
