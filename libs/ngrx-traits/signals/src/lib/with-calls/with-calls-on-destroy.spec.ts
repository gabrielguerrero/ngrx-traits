import { TestBed } from '@angular/core/testing';
import { signalStore } from '@ngrx/signals';
import { Subject } from 'rxjs';

import { callConfig, withCalls } from '../index';
import { emptyErrorsWhileDestroying } from '../test.utils';

// kept in its own spec file: unhandled rejections left behind by other tests
// land asynchronously and would otherwise pollute the console.error window
// these tests inspect
describe('withCalls promises that never settle', () => {
  it('should not log an unhandled rejection when a callWith call is cut short by destroy', async () => {
    const apiResponse = new Subject<string>();
    const Store = signalStore(
      withCalls(() => ({
        testCall: callConfig({
          call: () => apiResponse,
          mapPipe: 'exhaustMap',
          callWith: true,
        }),
      })),
    );
    const emptyErrors = await emptyErrorsWhileDestroying(() => {
      const store = TestBed.runInInjectionContext(() => new Store());
      expect(store.isTestCallLoading()).toBeTruthy();
      // destroys the environment injector while the call is still in flight,
      // which completes the toObservable of the call status without emitting
      TestBed.resetTestingModule();
    });
    expect(emptyErrors).toEqual([]);
  });

  it('should still reject for callers that attach their own handler', async () => {
    const apiResponse = new Subject<string>();
    const Store = signalStore(
      withCalls(() => ({
        testCall: callConfig({
          call: () => apiResponse,
          mapPipe: 'exhaustMap',
          skipWhen: () => true,
        }),
      })),
    );
    const onRejected = vi.fn();
    const store = TestBed.runInInjectionContext(() => new Store());
    // the no-op handler the library attaches only marks the rejection as
    // handled, it does not swallow it: a handler added here still fires
    store.testCall().catch(onRejected);
    TestBed.resetTestingModule();
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(onRejected).toHaveBeenCalledTimes(1);
    expect((onRejected.mock.calls[0][0] as Error).name).toBe('EmptyError');
  });

  it('should not log an unhandled rejection when skipWhen skips the call', async () => {
    const apiResponse = new Subject<string>();
    const Store = signalStore(
      withCalls(() => ({
        testCall: callConfig({
          call: () => apiResponse,
          mapPipe: 'exhaustMap',
          skipWhen: () => true,
        }),
      })),
    );
    const emptyErrors = await emptyErrorsWhileDestroying(() => {
      const store = TestBed.runInInjectionContext(() => new Store());
      // a skipped call leaves the status at 'init', so this promise is never
      // going to settle, and discarding it must stay harmless
      store.testCall();
      expect(store.testCallCallStatus()).toEqual('init');
      TestBed.resetTestingModule();
    });
    expect(emptyErrors).toEqual([]);
  });
});
