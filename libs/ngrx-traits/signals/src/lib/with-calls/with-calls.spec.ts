import { computed, Injector, Resource, signal } from '@angular/core';
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

import { callConfig, CallResource, withCalls } from '../index';

describe('withCalls', () => {
  let apiResponse = new Subject<string>();
  let privateApiResponse = new Subject<string>();
  const onSuccess = vi.fn();
  const onError = vi.fn();
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
      _testCall2: callConfig({
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

  it('should return promise with value on success', async () => {
    await TestBed.runInInjectionContext(async () => {
      const store = new Store();
      const resultPromise = store.testCall({ ok: true });
      apiResponse.next('test');
      TestBed.tick();
      const result = await resultPromise;
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value()).toBe('test');
      }
    });
  });

  it('should return promise with error on failure', async () => {
    await TestBed.runInInjectionContext(async () => {
      const store = new Store();
      const resultPromise = store.testCall({ ok: false });
      TestBed.tick();
      const result = await resultPromise;
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error()).toEqual(new Error('fail'));
      }
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

  it('should return promise with value on success for a call with no params', async () => {
    const Store = signalStore(
      withCalls(() => ({
        testCall: () => apiResponse,
      })),
    );
    await TestBed.runInInjectionContext(async () => {
      const store = new Store();
      const resultPromise = store.testCall();
      apiResponse.next('test');
      TestBed.tick();
      const result = await resultPromise;
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value()).toBe('test');
      }
    });
  });

  it('passing a signal should call when signal value changes ', async () => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      expect(store.isTestCallLoading()).toBeFalsy();
      const param = signal({ ok: true });
      store.testCall(param);
      TestBed.tick();
      expect(store.isTestCallLoading()).toBeTruthy();
      apiResponse.next('test');
      expect(store.isTestCallLoaded()).toBeTruthy();
      expect(store.testCallResult()).toBe('test');
      apiResponse.complete();

      apiResponse = new Subject<string>();
      param.set({ ok: true });
      TestBed.tick();
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
        expect(onSuccess).toHaveBeenCalledWith('test', { ok: true }, undefined);
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
    it('should return promise with value on success', async () => {
      await TestBed.runInInjectionContext(async () => {
        const store = new Store();
        const resultPromise = store.testCall2({ ok: true });
        apiResponse.next('test');
        TestBed.tick();
        const result = await resultPromise;
        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value()).toBe('test');
        }
      });
    });
    it('should return promise with error on failure', async () => {
      await TestBed.runInInjectionContext(async () => {
        const store = new Store();
        const resultPromise = store.testCall2({ ok: false });
        TestBed.tick();
        const result = await resultPromise;
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error()).toEqual(new Error('fail'));
        }
      });
    });
    it('should return promise with mapped error when mapError is used', async () => {
      await TestBed.runInInjectionContext(async () => {
        const Store = signalStore(
          withState({ foo: 'bar' }),
          withCalls(() => ({
            testCall2: callConfig({
              call: ({ ok }: { ok: boolean }) => {
                return ok ? apiResponse : throwError(() => new Error('fail'));
              },
              mapError: (error, { ok }) => (error as Error).message + ' ' + ok,
              resultProp: 'result',
            }),
          })),
        );
        const store = new Store();
        const resultPromise = store.testCall2({ ok: false });
        TestBed.tick();
        const result = await resultPromise;
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error()).toEqual('fail false');
        }
      });
    });
    it('Fail on a call should set status return error with correct type if mapError is used ', async () => {
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          withState({ foo: 'bar' }),
          withCalls(() => ({
            testCall2: callConfig({
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
            testCall2: callConfig({
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
        expect(onSuccess).toHaveBeenCalledWith('test', { ok: true }, undefined);
      });
    });

    it('Successful call of a no parameters method and no resultProp, should set status to loading and loaded ', async () => {
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          withState({ foo: 'bar' }),
          withCalls(() => ({
            testCall2: callConfig({
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
        expect(onSuccess).toHaveBeenCalledWith('test', { ok: true }, undefined);
      });
    });

    it('Successful call should set status to loading and loaded 2 ', async () => {
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          withState({ foo: 'bar' }),
          withCalls((store) => ({
            testCall: callConfig({
              call: ({ ok }: { ok: boolean }) => {
                return ok
                  ? apiResponse
                  : apiResponse.pipe(
                      tap(() => throwError(() => new Error('fail'))),
                    );
              },
              storeResult: false,
              onSuccess: (result, param, previousResult) => {
                onSuccess(result, { ok: true }, previousResult);
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
        expect(onSuccess).toHaveBeenCalledWith('test', { ok: true }, undefined);
        expect(store.foo()).toBe('test');
      });
    });

    it('check callConfig with resultProp generates custom prop name ', async () => {
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          withState({ foo: 'bar' }),
          withCalls((store) => ({
            testCall: callConfig({
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
      const onSuccess = vi.fn();
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          withState({ foo: 'bar' }),
          withState({ ok: false }),
          withCalls((store) => ({
            testCall: callConfig({
              call: ({ ok }: { ok: boolean }) => {
                return ok
                  ? apiResponse.pipe(first())
                  : apiResponse.pipe(
                      tap(() => throwError(() => new Error('fail'))),
                    );
              },
              resultProp: 'baz',
              onSuccess: (result, { ok }, previousResult) => {
                onSuccess(result, { ok }, previousResult);
                // patchState should be able to update the store inside onSuccess
                patchState(store, { foo: result, ok });
              },
              onError,
            }),
          })),
          withCalls((store) => ({
            testCall2: callConfig({
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
        expect(onSuccess).toHaveBeenCalledWith('test', { ok: true }, undefined);

        //calling again to check previous result
        expect(store.isTestCallLoading()).toBeFalsy();
        store.testCall({ ok: true });
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test2');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect((store as any).testCallResult).toBeUndefined();
        expect(store.foo()).toBe('test2');
        expect(store.baz()).toBe('test2');
        expect(store.ok()).toBe(true);
        expect(onSuccess).toHaveBeenCalledWith('test2', { ok: true }, 'test');

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
    const consoleError = vi.spyOn(console, 'error');
    consoleError.mockClear();
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
      expect(consoleError).toHaveBeenCalledTimes(1);
    });
  });

  it('returning a promise should output when value returns', async () => {
    let response: Promise<string>;
    await TestBed.runInInjectionContext(async () => {
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

  it("should warn in dev mode if no callConfig is used when using an observable that doesn't complete within 100ms", async () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {
      /* Empty */
    });
    consoleWarn.mockClear();
    let apiResponse = new Subject<string>();
    await TestBed.runInInjectionContext(async () => {
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
    consoleWarn.mockRestore();
  });

  it("should warn in dev mode if a mapPipe has not been set when using an observable that doesn't complete within 100ms", async () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {
      /* Empty */
    });
    consoleWarn.mockClear();
    let apiResponse = new Subject<string>();
    await TestBed.runInInjectionContext(async () => {
      const Store = signalStore(
        withCalls(() => ({
          testCall: callConfig({
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
    consoleWarn.mockRestore();
  });

  it("should not warn in dev mode if a mapPipe has been set when using an observable that doesn't complete within 100ms", async () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {
      /* Empty */
    });
    consoleWarn.mockClear();
    let apiResponse = new Subject<string>();
    await TestBed.runInInjectionContext(async () => {
      const Store = signalStore(
        withCalls(() => ({
          testCall: callConfig({
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
    consoleWarn.mockRestore();
  });

  it("should not warn in dev mode if a mapPipe has been explicitly set to exhaustMap when using an observable that doesn't complete within 100ms", async () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {
      /* Empty */
    });
    consoleWarn.mockClear();
    let apiResponse = new Subject<string>();
    await TestBed.runInInjectionContext(async () => {
      const Store = signalStore(
        withCalls(() => ({
          testCall: callConfig({
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
    consoleWarn.mockRestore();
  });
  describe('skipWhen function', () => {
    it('returning true in skipWhen should skip call ', async () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {
        /* Empty */
      });
      consoleWarn.mockClear();
      await TestBed.runInInjectionContext(async () => {
        const Store = signalStore(
          withCalls(() => ({
            testCall: callConfig({
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
      consoleWarn.mockRestore();
    });

    it('returning true in skipWhen should skip call using previousResult ', async () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {
        /* Empty */
      });
      consoleWarn.mockClear();
      let apiResponse = new Subject<string>();
      await TestBed.runInInjectionContext(async () => {
        const Store = signalStore(
          withCalls(() => ({
            testCall: callConfig({
              call: ({ id }: { id: string }) => apiResponse.pipe(first()),
              mapPipe: 'exhaustMap',
              skipWhen: ({ id }, previousResult) =>
                id.length > 0 && previousResult === 'test',
            }),
          })),
        );
        // first call shoukld pass
        const store = new Store();
        expect(store.isTestCallLoading()).toBeFalsy();
        apiResponse.next('test');
        store.testCall({ id: 'ss' });
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test');
        expect(consoleWarn).not.toHaveBeenCalledWith('Call testCall is skip');

        // second call should skip because previous result is test
        store.testCall({ id: 'ss2' });
        expect(store.isTestCallLoading()).toBeFalsy();
        apiResponse.next('test2');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test');
        expect(consoleWarn).toHaveBeenCalledWith('Call testCall is skip');
      });
      consoleWarn.mockRestore();
    });

    it('returning false in skipWhen should make call ', async () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {
        /* Empty */
      });
      consoleWarn.mockClear();
      let apiResponse = new Subject<string>();
      await TestBed.runInInjectionContext(async () => {
        const Store = signalStore(
          withCalls(() => ({
            testCall: callConfig({
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
      consoleWarn.mockRestore();
    });

    it('returning an Observable with true in skipWhen should skip call', async () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {
        /* Empty */
      });
      consoleWarn.mockClear();
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          withCalls(() => ({
            testCall: callConfig({
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
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {
        /* Empty */
      });
      consoleWarn.mockClear();
      let apiResponse = new Subject<string>();
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          withCalls(() => ({
            testCall: callConfig({
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
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {
        /* Empty */
      });
      consoleWarn.mockClear();
      await TestBed.runInInjectionContext(async () => {
        const Store = signalStore(
          withCalls(() => ({
            testCall: callConfig({
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
        await Promise.resolve(true); // force to wait till microtask are done
        expect(consoleWarn).toHaveBeenCalledWith('Call testCall is skip');
      });
      consoleWarn.mockRestore();
    });

    it('returning a Promise with false in skipWhen should run call', async () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {
        /* Empty */
      });
      consoleWarn.mockClear();
      let apiResponse = new Subject<string>();
      await TestBed.runInInjectionContext(async () => {
        const Store = signalStore(
          withCalls(() => ({
            testCall: callConfig({
              call: () => apiResponse,
              mapPipe: 'exhaustMap',
              skipWhen: () => Promise.resolve(false),
            }),
          })),
        );
        const store = new Store();
        expect(store.isTestCallLoading()).toBeFalsy();

        store.testCall();
        await expect.poll(() => store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test');
        expect(consoleWarn).not.toHaveBeenCalled();
      });
      consoleWarn.mockRestore();
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
      const consoleError = vi.spyOn(console, 'error');
      consoleError.mockClear();
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        expect(store.privateIsTestCallLoading()).toBeFalsy();
        store.privateTestCall({ ok: false });
        expect(store.privateTestCallError()).toEqual(new Error('fail'));
        expect(store.privateTestCallResult()).toBe(undefined);
        expect(consoleError).toHaveBeenCalledTimes(1);
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
          expect(onSuccess).toHaveBeenCalledWith(
            'test',
            { ok: true },
            undefined,
          );
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
      // typed, so the call has no parameter rather than one of `any`
      const call = vi.fn(() => {
        aux++;
        return of('' + aux).pipe(delay(100));
      });
      const Store = signalStore(
        { providedIn: 'root' },
        withCalls(() => ({
          testCall: callConfig({
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
      // typed, so the call has no parameter rather than one of `any`
      const call = vi.fn(() => {
        aux++;
        return of('' + aux).pipe(delay(100));
      });
      const Store = signalStore(
        { providedIn: 'root' },
        withCalls(() => ({
          testCall: callConfig({
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
      // typed, so the call has no parameter rather than one of `any`
      const call = vi.fn(() => {
        aux++;
        return of('' + aux).pipe(delay(100));
      });
      const Store = signalStore(
        { providedIn: 'root' },
        withCalls(() => ({
          testCall: callConfig({
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
      const apiMockCall = vi.fn();
      await TestBed.runInInjectionContext(async () => {
        const Store = signalStore(
          withCalls(() => ({
            testCall: callConfig({
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
      const apiMockCall = vi.fn();
      await TestBed.runInInjectionContext(async () => {
        const Store = signalStore(
          withCalls(() => ({
            testCall: callConfig({
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
      const apiMockCall = vi.fn();
      let apiResponse = new Subject<string>();
      await TestBed.runInInjectionContext(async () => {
        const Store = signalStore(
          withCalls(() => ({
            testCall: callConfig({
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
      const apiMockCall = vi.fn();
      let apiResponse = new Subject<string>();
      await TestBed.runInInjectionContext(async () => {
        const Store = signalStore(
          withCalls(() => ({
            testCall: callConfig({
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
      const apiMockCall = vi.fn();
      let apiResponse = new Subject<string>();
      await TestBed.runInInjectionContext(async () => {
        const idSignal = signal({ id: '1' });
        const Store = signalStore(
          withCalls(() => ({
            testCall: callConfig({
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
        TestBed.tick();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test');
        expect(apiMockCall).toHaveBeenCalledWith({ id: '1' });

        idSignal.set({ id: '2' });
        TestBed.tick();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test2');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test2');
        expect(apiMockCall).toHaveBeenCalledWith({ id: '2' });
      });
    });

    it('should run call everytime there is new truthy values if callWith is a observable and call params', async () => {
      const apiMockCall = vi.fn();
      let apiResponse = new Subject<string>();
      await TestBed.runInInjectionContext(async () => {
        const id$ = new BehaviorSubject({ id: '1' });
        const Store = signalStore(
          withCalls(() => ({
            testCall: callConfig({
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
        TestBed.tick();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test2');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test2');
        expect(apiMockCall).toHaveBeenCalledWith({ id: '1' });

        id$.next({ id: '2' });
        TestBed.tick();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test2');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test2');
        expect(apiMockCall).toHaveBeenCalledWith({ id: '2' });
      });
    });

    it('should run call everytime there is new truthy values if callWith is a function and call has params', async () => {
      const apiMockCall = vi.fn();
      let apiResponse = new Subject<string>();
      await TestBed.runInInjectionContext(async () => {
        const idSignal = signal({ id: '1' });
        const Store = signalStore(
          withCalls(() => ({
            testCall: callConfig({
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
        TestBed.tick();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test');
        expect(apiMockCall).toHaveBeenCalledWith({ id: '1' });

        idSignal.set({ id: '2' });
        TestBed.tick();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test2');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test2');
        expect(apiMockCall).toHaveBeenCalledWith({ id: '2' });
      });
    });

    it('should run call everytime there is new values if callWith is a signal and call has no params', async () => {
      const apiMockCall = vi.fn();
      let apiResponse = new Subject<string>();
      await TestBed.runInInjectionContext(async () => {
        const loadingSignal = signal(true);
        const Store = signalStore(
          withCalls(() => ({
            testCall: callConfig({
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
        TestBed.tick();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test');
        expect(apiMockCall).toHaveBeenCalledTimes(1);

        loadingSignal.set(false);
        TestBed.tick();
        expect(store.isTestCallLoading()).toBeFalsy();
        apiResponse.next('test2');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test');
        expect(apiMockCall).toHaveBeenCalledTimes(1);

        loadingSignal.set(true);
        TestBed.tick();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test3');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test3');
        expect(apiMockCall).toHaveBeenCalledTimes(2);
      });
    });

    it('should run call everytime there is new values if callWith is a signal and call has no params', async () => {
      const apiMockCall = vi.fn();
      let apiResponse = new Subject<string>();
      await TestBed.runInInjectionContext(async () => {
        const id$ = new BehaviorSubject(true);
        const Store = signalStore(
          withCalls(() => ({
            testCall: callConfig({
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
        TestBed.tick();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test');
        expect(apiMockCall).toHaveBeenCalledTimes(1);

        id$.next(false);
        TestBed.tick();
        expect(store.isTestCallLoading()).toBeFalsy();
        apiResponse.next('test2');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test');
        expect(apiMockCall).toHaveBeenCalledTimes(1);

        id$.next(true);
        TestBed.tick();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test3');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test3');
        expect(apiMockCall).toHaveBeenCalledTimes(2);
      });
    });

    it('should run call everytime there is new values if callWith is a function and call has no params', async () => {
      const apiMockCall = vi.fn();
      let apiResponse = new Subject<string>();
      await TestBed.runInInjectionContext(async () => {
        const loadingSignal = signal(true);
        const Store = signalStore(
          withCalls(() => ({
            testCall: callConfig({
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
        TestBed.tick();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test');
        expect(apiMockCall).toHaveBeenCalledTimes(1);

        loadingSignal.set(false);
        TestBed.tick();
        expect(store.isTestCallLoading()).toBeFalsy();
        apiResponse.next('test2');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test');
        expect(apiMockCall).toHaveBeenCalledTimes(1);

        loadingSignal.set(true);
        TestBed.tick();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test3');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test3');
        expect(apiMockCall).toHaveBeenCalledTimes(2);
      });
    });

    it('should not run call everytime there is new undefined values when callWith is a signal and not skipWhen is defined ', async () => {
      const apiMockCall = vi.fn();
      let apiResponse = new Subject<string>();
      await TestBed.runInInjectionContext(async () => {
        const idSignal = signal<{ id: string } | undefined>({ id: '1' });
        const Store = signalStore(
          withCalls(() => ({
            testCall: callConfig({
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
        TestBed.tick();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test');
        expect(apiMockCall).toHaveBeenCalledWith({ id: '1' });

        idSignal.set(undefined);
        TestBed.tick();
        expect(store.isTestCallLoading()).toBeFalsy();
        apiResponse.next('test2');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test');
        expect(apiMockCall).not.toHaveBeenCalledWith(undefined);
      });
    });

    it('should not run call everytime there is a undefined value when callWith is a observable and skipWhen is not defined ', async () => {
      const apiMockCall = vi.fn();
      let apiResponse = new Subject<string>();
      await TestBed.runInInjectionContext(async () => {
        const id$ = new BehaviorSubject<{ id: string } | undefined>({
          id: '1',
        });
        const Store = signalStore(
          withCalls(() => ({
            testCall: callConfig({
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
        TestBed.tick();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test');
        expect(apiMockCall).toHaveBeenCalledWith({ id: '1' });

        id$.next(undefined);
        TestBed.tick();
        expect(store.isTestCallLoading()).toBeFalsy();
        apiResponse.next('test2');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test');
        expect(apiMockCall).not.toHaveBeenCalledWith(undefined);
      });
    });

    it('should not run call everytime there is undefined values when callWith is a function  and not skipWhen is defined ', async () => {
      const apiMockCall = vi.fn();
      let apiResponse = new Subject<string>();
      await TestBed.runInInjectionContext(async () => {
        const idSignal = signal<{ id: string } | undefined>({ id: '1' });
        const Store = signalStore(
          withCalls(() => ({
            testCall: callConfig({
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
        TestBed.tick();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test');
        expect(apiMockCall).toHaveBeenCalledWith({ id: '1' });

        idSignal.set(undefined);
        TestBed.tick();
        expect(store.isTestCallLoading()).toBeFalsy();
        apiResponse.next('test2');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test');
        expect(apiMockCall).not.toHaveBeenCalledWith(undefined);
      });
    });

    it('should run call everytime there is new undefined values when callWith is a signal  and  skipWhen is defined that allows them', async () => {
      const apiMockCall = vi.fn();
      let apiResponse = new Subject<string>();
      await TestBed.runInInjectionContext(async () => {
        const idSignal = signal<{ id: string } | undefined>({ id: '1' });
        const Store = signalStore(
          withCalls(() => ({
            testCall: callConfig({
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
        TestBed.tick();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test');
        expect(apiMockCall).toHaveBeenCalledWith({ id: '1' });

        idSignal.set(undefined);
        TestBed.tick();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test2');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test2');
        expect(apiMockCall).toHaveBeenCalledWith(undefined);
      });
    });

    it('should run call everytime there is new undefined values when callWith is a observable  and  skipWhen is defined that allows them', async () => {
      const apiMockCall = vi.fn();
      let apiResponse = new Subject<string>();
      await TestBed.runInInjectionContext(async () => {
        const id$ = new BehaviorSubject<{ id: string } | undefined>({
          id: '1',
        });
        const Store = signalStore(
          withCalls(() => ({
            testCall: callConfig({
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
        TestBed.tick();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test');
        expect(apiMockCall).toHaveBeenCalledWith({ id: '1' });

        id$.next(undefined);
        TestBed.tick();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test2');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test2');
        expect(apiMockCall).toHaveBeenCalledWith(undefined);
      });
    });

    it('should run call everytime there is new undefined values when callWith is a function  and  skipWhen is defined that allows them', async () => {
      const apiMockCall = vi.fn();
      let apiResponse = new Subject<string>();
      await TestBed.runInInjectionContext(async () => {
        const idSignal = signal<{ id: string } | undefined>({ id: '1' });
        const Store = signalStore(
          withCalls(() => ({
            testCall: callConfig({
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
        TestBed.tick();
        expect(store.isTestCallLoading()).toBeTruthy();
        apiResponse.next('test');
        expect(store.isTestCallLoaded()).toBeTruthy();
        expect(store.testCallResult()).toEqual('test');
        expect(apiMockCall).toHaveBeenCalledWith({ id: '1' });

        idSignal.set(undefined);
        TestBed.tick();
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
          testCall: callConfig({
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

  describe('resource view', () => {
    function setup(mapPipe?: 'switchMap' | 'concatMap' | 'exhaustMap') {
      const apiResponse = new Subject<string>();
      const call = vi.fn(({ ok }: { ok: boolean }) =>
        ok ? apiResponse.pipe(first()) : throwError(() => new Error('fail')),
      );
      const Store = signalStore(
        { protectedState: false },
        withCalls(() => ({
          testCall: callConfig({ call, mapPipe }),
          testCall2: callConfig({
            call: ({ id }: { id: string }) => apiResponse.pipe(first()),
            resultProp: 'detail',
            mapError: (error) => (error as Error).message,
          }),
          noParamsCall: () => apiResponse.pipe(first()),
          _privateCall: ({ ok }: { ok: boolean }) => apiResponse.pipe(first()),
          noResult: callConfig({
            call: () => apiResponse.pipe(first()),
            storeResult: false,
          }),
        })),
        withMethods((store) => ({
          privateResource: () => store._privateCallResource(),
          privateCall: (param: { ok: boolean }) => store._privateCall(param),
        })),
      );
      return { apiResponse, call, Store };
    }

    it('should map the call status to a resource status', () => {
      TestBed.runInInjectionContext(() => {
        const { Store, apiResponse } = setup();
        const store = new Store();
        const res = store.testCallResource();
        expect(res.status()).toBe('idle');
        expect(res.value()).toBeUndefined();
        expect(res.hasValue()).toBe(false);
        expect(res.isLoading()).toBe(false);
        expect(res.snapshot()).toEqual({ status: 'idle', value: undefined });

        store.testCall({ ok: true });
        expect(res.status()).toBe('loading');
        expect(res.isLoading()).toBe(true);
        expect(res.snapshot()).toEqual({ status: 'loading', value: undefined });

        apiResponse.next('test');
        expect(res.status()).toBe('resolved');
        expect(res.isLoading()).toBe(false);
        expect(res.value()).toBe('test');
        expect(res.hasValue()).toBe(true);
        expect(res.snapshot()).toEqual({ status: 'resolved', value: 'test' });

        // a load with a previous value is a reload, which keeps the value
        store.testCall({ ok: true });
        expect(res.status()).toBe('reloading');
        expect(res.isLoading()).toBe(true);
        expect(res.value()).toBe('test');
        apiResponse.next('test2');
        expect(res.status()).toBe('resolved');
        expect(res.value()).toBe('test2');
      });
    });

    it('should report the error state, keeping the last value', () => {
      TestBed.runInInjectionContext(() => {
        const { Store, apiResponse } = setup();
        const store = new Store();
        const res = store.testCallResource();
        store.testCall({ ok: true });
        apiResponse.next('test');

        store.testCall({ ok: false });
        expect(res.status()).toBe('error');
        expect(res.isLoading()).toBe(false);
        expect(res.error()).toEqual(new Error('fail'));
        expect(res.hasValue()).toBe(false);
        expect(res.value()).toBe('test');
        expect(res.snapshot()).toEqual({
          status: 'error',
          error: new Error('fail'),
        });
      });
    });

    it('should be read only, the result is written through the store', () => {
      TestBed.runInInjectionContext(() => {
        const { Store, apiResponse } = setup();
        const store = new Store();
        const res = store.testCallResource();
        expect('set' in res).toBe(false);
        expect('update' in res).toBe(false);
        // @ts-expect-error the value is a plain Signal, like the store's own
        res.value.set;

        // patching the store is what a store method would do, and every view
        // reads it, there is nothing local about it
        patchState(store, { testCallResult: 'written' });
        expect(res.value()).toBe('written');
        expect(res.status()).toBe('idle');

        store.testCall({ ok: true });
        apiResponse.next('loaded');
        expect(res.status()).toBe('resolved');
        expect(res.value()).toBe('loaded');
      });
    });

    it('should count a hydrated loaded status as loaded', () => {
      TestBed.runInInjectionContext(() => {
        const { Store } = setup();
        const store = new Store();
        // what withServerStateTransfer or withSyncToWebStorage restore: the
        // result and the status, without any call running here
        patchState(store, {
          testCallResult: 'from the server',
          testCallCallStatus: 'loaded',
        });

        const res = store.testCallResource();
        expect(res.status()).toBe('resolved');
        // so a refresh keeps the value on screen instead of starting over
        store.testCall({ ok: true });
        expect(res.status()).toBe('reloading');
      });
    });

    it('should report no error as undefined', () => {
      TestBed.runInInjectionContext(() => {
        const { Store, apiResponse } = setup();
        const store = new Store();
        const res = store.testCallResource();
        expect(res.error()).toBeUndefined();
        expect(store.testCallError()).toBeUndefined();

        store.testCall({ ok: true });
        apiResponse.next('test');
        expect(res.error()).toBeUndefined();

        store.testCall({ ok: false });
        expect(res.error()).toEqual(new Error('fail'));
      });
    });

    it('should report reloading even if nothing read the status in between', () => {
      TestBed.runInInjectionContext(() => {
        const { Store, apiResponse } = setup();
        const store = new Store();
        const res = store.testCallResource();
        // nothing reads the resolved state, so it cannot be derived from the
        // status transitions: a lazy computed would only see the last one
        store.testCall({ ok: true });
        apiResponse.next('a');

        store.testCall({ ok: true });
        expect(res.status()).toBe('reloading');
      });
    });

    it('should report loading on the first call when there is a defaultResult', () => {
      TestBed.runInInjectionContext(() => {
        const apiResponse = new Subject<string[]>();
        const Store = signalStore(
          withCalls(() => ({
            loadTags: callConfig({
              call: () => apiResponse.pipe(first()),
              // the result is seeded, so it is never undefined and the value
              // alone cannot tell a first load from a reload
              defaultResult: [] as string[],
            }),
          })),
        );
        const store = new Store();
        const res = store.loadTagsResource();

        store.loadTags();
        expect(res.status()).toBe('loading');
        apiResponse.next(['a']);
        expect(res.status()).toBe('resolved');

        store.loadTags();
        expect(res.status()).toBe('reloading');
      });
    });

    it('params should drive the call, skipping undefined, until destroyed', () => {
      TestBed.runInInjectionContext(() => {
        const { Store, apiResponse, call } = setup();
        const store = new Store();
        const param = signal<{ ok: boolean } | undefined>(undefined);
        const res = store.testCallResource({ params: param });
        TestBed.tick();
        expect(call).not.toHaveBeenCalled();
        expect(res.status()).toBe('idle');

        param.set({ ok: true });
        TestBed.tick();
        expect(call).toHaveBeenCalledWith({ ok: true });
        expect(res.status()).toBe('loading');
        apiResponse.next('a');
        expect(res.value()).toBe('a');

        res.destroy();
        param.set({ ok: false });
        TestBed.tick();
        expect(call).toHaveBeenCalledTimes(1);
      });
    });

    it('params should accept a function and an observable', () => {
      TestBed.runInInjectionContext(() => {
        const { Store, apiResponse, call } = setup();
        const store = new Store();
        const ok = signal(true);
        store.testCallResource({ params: () => ({ ok: ok() }) });
        TestBed.tick();
        expect(call).toHaveBeenCalledWith({ ok: true });
        apiResponse.next('a');

        const param = new BehaviorSubject<{ ok: boolean } | undefined>(
          undefined,
        );
        store.testCallResource({ params: param });
        expect(call).toHaveBeenCalledTimes(1);
        param.next({ ok: true });
        expect(call).toHaveBeenCalledTimes(2);
      });
    });

    it('params should require an injection context or an injector', () => {
      const { Store, call } = setup();
      const store = TestBed.runInInjectionContext(() => new Store());
      const param = signal({ ok: true });
      expect(() => store.testCallResource({ params: param })).toThrow();

      const res = store.testCallResource({
        params: param,
        injector: TestBed.inject(Injector),
      });
      TestBed.tick();
      expect(call).toHaveBeenCalledWith({ ok: true });
      expect(res.status()).toBe('loading');
    });

    it('should not need an injection context without params', () => {
      const { Store } = setup();
      const store = TestBed.runInInjectionContext(() => new Store());
      const res = store.testCallResource();
      expect(res.status()).toBe('idle');
    });

    it('should generate a private resource method for a private call', () => {
      TestBed.runInInjectionContext(() => {
        const { Store, apiResponse } = setup();
        const store = new Store();
        const res = store.privateResource();
        expect(res.status()).toBe('idle');
        store.privateCall({ ok: true });
        expect(res.status()).toBe('loading');
        apiResponse.next('a');
        expect(res.value()).toBe('a');
      });
    });

    it('should not generate a resource method for a call that does not store its result', () => {
      TestBed.runInInjectionContext(() => {
        const { Store } = setup();
        const store = new Store();
        // @ts-expect-error no value for a resource to hold
        expect(store.noResultResource).toBeUndefined();
      });
    });

    it('should name the resource after the resultProp when there is one', () => {
      TestBed.runInInjectionContext(() => {
        const { Store } = setup();
        const store = new Store();
        // testCall2 has resultProp 'detail'
        expect(store.detailResource).toBeDefined();
        // @ts-expect-error named after the resultProp, not the call
        expect(store.testCall2Resource).toBeUndefined();
        // testCall has none, so it falls back to the call name
        expect(store.testCallResource).toBeDefined();
        expectTypeOf(store.detailResource()).toEqualTypeOf<
          CallResource<string | undefined, string>
        >();
      });
    });

    it('should make the resource public when a private call has a public resultProp', () => {
      TestBed.runInInjectionContext(() => {
        const apiResponse = new Subject<string>();
        const Store = signalStore(
          withCalls(() => ({
            _loadProductDetail: callConfig({
              call: ({ id }: { id: string }) => apiResponse.pipe(first()),
              resultProp: 'productDetail',
            }),
            _loadPrivate: callConfig({
              call: () => apiResponse.pipe(first()),
              resultProp: '_privateDetail',
            }),
          })),
        );
        const store = new Store();
        // the call, its status and error stay private, the result and the
        // resource are public, so a component can only use the resource
        // (private members are hidden from the store type, not at runtime)
        // @ts-expect-error private call
        store._loadProductDetail;
        expect(store.productDetail).toBeDefined();
        const res = store.productDetailResource();
        expect(res.status()).toBe('idle');

        // an underscore on the resultProp keeps the resource private too
        // @ts-expect-error private resource
        store._privateDetailResource;
      });
    });

    it('should warn in dev mode when the resource name is already taken', () => {
      TestBed.runInInjectionContext(() => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const apiResponse = new Subject<string>();
        const Store = signalStore(
          withCalls(() => ({
            loadProductDetail: callConfig({
              call: () => apiResponse.pipe(first()),
              resultProp: 'productDetail',
            }),
            // its resource wants the same name as the one above
            productDetail: () => apiResponse.pipe(first()),
          })),
        );
        new Store();
        expect(warn).toHaveBeenCalledWith(
          expect.stringContaining('productDetailResource'),
        );
        warn.mockRestore();
      });
    });

    it('should read a renamed result prop and type the error with mapError', () => {
      TestBed.runInInjectionContext(() => {
        const { Store, apiResponse } = setup();
        const store = new Store();
        const res = store.detailResource();
        store.testCall2({ id: '1' });
        apiResponse.next('detail');
        expect(res.value()).toBe('detail');
        expect(store.detail()).toBe('detail');
        expectTypeOf(res.value()).toEqualTypeOf<string | undefined>();
        expectTypeOf(res.error()).toEqualTypeOf<string | undefined>();
        if (res.hasValue()) {
          expectTypeOf(res.value()).toEqualTypeOf<string>();
        }
      });
    });

    it('should type the params option from the call parameter', () => {
      TestBed.runInInjectionContext(() => {
        const { Store } = setup();
        const store = new Store();
        store.detailResource({
          // @ts-expect-error not the call parameter
          params: () => ({ ok: true }),
        });
        store.noParamsCallResource({
          // @ts-expect-error the call has no parameter
          params: () => undefined,
        });
      });
    });

    it('should be assignable to an Angular Resource when the error is an Error', () => {
      TestBed.runInInjectionContext(() => {
        const apiResponse = new Subject<string>();
        const Store = signalStore(
          withCalls(() => ({
            testCall: callConfig({
              call: ({ ok }: { ok: boolean }) => apiResponse.pipe(first()),
              mapError: (error) => error as Error,
            }),
          })),
        );
        const store = new Store();
        const res: Resource<string | undefined> = store.testCallResource();
        expect(res.status()).toBe('idle');
      });
    });
  });
});
