import { computed, Resource, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { CallResource, CallStatus, createCallResource } from '../index';

describe('createCallResource', () => {
  // the minimum a feature has to provide, no store involved: what a custom
  // feature built on withCallStatus would pass
  function setup(options?: { withHasLoadedOnce?: boolean }) {
    const withHasLoadedOnce = options?.withHasLoadedOnce ?? true;
    const callStatus = signal<CallStatus>('init');
    const value = signal<string | undefined>(undefined);
    const hasLoadedOnce = signal(false);
    // what the feature does when the call comes back
    const finishLoad = (v: string | undefined) => {
      value.set(v);
      hasLoadedOnce.set(true);
      callStatus.set('loaded');
    };
    const resource = createCallResource<string | undefined>({
      value,
      callStatus,
      error: computed(() => {
        const s = callStatus();
        return typeof s === 'object' ? s.error : undefined;
      }),
      isLoading: computed(() => callStatus() === 'loading'),
      ...(withHasLoadedOnce ? { hasLoadedOnce } : {}),
    });
    return { resource, callStatus, value, hasLoadedOnce, finishLoad };
  }

  it('should map the call status', () => {
    TestBed.runInInjectionContext(() => {
      const { resource, callStatus, finishLoad } = setup();
      expect(resource.status()).toBe('idle');
      expect(resource.hasValue()).toBe(false);

      callStatus.set('loading');
      expect(resource.status()).toBe('loading');
      expect(resource.isLoading()).toBe(true);

      finishLoad('a');
      expect(resource.status()).toBe('resolved');
      expect(resource.value()).toBe('a');
      expect(resource.hasValue()).toBe(true);
      expect(resource.snapshot()).toEqual({ status: 'resolved', value: 'a' });

      // a value is there now, so the next load is a reload
      callStatus.set('loading');
      expect(resource.status()).toBe('reloading');

      callStatus.set({ error: new Error('fail') });
      expect(resource.status()).toBe('error');
      expect(resource.error()).toEqual(new Error('fail'));
      expect(resource.hasValue()).toBe(false);
      // the last value is kept, reading it does not throw
      expect(resource.value()).toBe('a');
      expect(resource.snapshot()).toEqual({
        status: 'error',
        error: new Error('fail'),
      });
    });
  });

  it('should be read only', () => {
    TestBed.runInInjectionContext(() => {
      const { resource } = setup();
      // the result lives in the store, writing it belongs in a store method
      expect('set' in resource).toBe(false);
      expect('update' in resource).toBe(false);
      expect('asReadonly' in resource).toBe(false);
      // @ts-expect-error the value is a plain Signal, like the store's own
      resource.value.set;
    });
  });

  it('should be assignable to an Angular Resource when the error is an Error', () => {
    TestBed.runInInjectionContext(() => {
      const { resource, finishLoad } = setup();
      // the error type is the call's, so it fits Resource when it is an Error
      const asResource: Resource<string | undefined> =
        resource as unknown as CallResource<string | undefined, Error>;
      finishLoad('a');
      expect(asResource.value()).toBe('a');
      expect(asResource.status()).toBe('resolved');
    });
  });

  it('should report reloading after an error, once a value was loaded', () => {
    TestBed.runInInjectionContext(() => {
      const { resource, callStatus, finishLoad } = setup();
      finishLoad('a');
      callStatus.set({ error: new Error('fail') });
      expect(resource.status()).toBe('error');

      // a value was loaded before, so retrying is a reload
      callStatus.set('loading');
      expect(resource.status()).toBe('reloading');
    });
  });

  it('should report loading when the first call errors and is retried', () => {
    TestBed.runInInjectionContext(() => {
      const { resource, callStatus } = setup();
      callStatus.set('loading');
      expect(resource.status()).toBe('loading');
      callStatus.set({ error: new Error('fail') });
      expect(resource.status()).toBe('error');

      // nothing was ever loaded, the retry is still a first load
      callStatus.set('loading');
      expect(resource.status()).toBe('loading');
    });
  });

  it('should fall back to the value when the source has no hasLoadedOnce', () => {
    TestBed.runInInjectionContext(() => {
      const { resource, callStatus, value } = setup({
        withHasLoadedOnce: false,
      });
      callStatus.set('loading');
      // no hasLoadedOnce, so an undefined value is what marks a first load
      expect(resource.status()).toBe('loading');

      value.set('a');
      callStatus.set('loaded');
      expect(resource.status()).toBe('resolved');

      callStatus.set('loading');
      expect(resource.status()).toBe('reloading');
    });
  });

  it('should delegate destroy, and tolerate a source without one', () => {
    TestBed.runInInjectionContext(() => {
      const destroy = vi.fn();
      const withDestroy = createCallResource<string | undefined>({
        value: signal(undefined),
        callStatus: signal<CallStatus>('init'),
        error: computed(() => undefined),
        isLoading: computed(() => false),
        destroy,
      });
      withDestroy.destroy();
      expect(destroy).toHaveBeenCalled();

      // nothing to tear down when the feature gave no destroy
      const { resource } = setup();
      expect(() => resource.destroy()).not.toThrow();
    });
  });
});
