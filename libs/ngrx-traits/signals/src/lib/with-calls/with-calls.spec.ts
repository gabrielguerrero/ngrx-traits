import { TestBed } from '@angular/core/testing';
import { withCalls } from '@ngrx-traits/signals';
import { signalStore, withState } from '@ngrx/signals';
import { Subject, throwError } from 'rxjs';

describe('withCalls', () => {
  const apiResponse = new Subject<string>();
  const Store = signalStore(
    withState({ foo: 'bar' }),
    withCalls(() => ({
      testCall: ({ ok }: { ok: boolean }) => {
        return ok ? apiResponse : throwError(() => new Error('fail'));
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
      console.log(store.testCallCallStatus());
      expect(store.testCallError()).toEqual(new Error('fail'));
      expect(store.testCallResult()).toBe(undefined);
    });
  });
});
