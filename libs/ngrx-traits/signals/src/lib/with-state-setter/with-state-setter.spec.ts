import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { signalStore, withState } from '@ngrx/signals';

import { withStateSetter } from './with-state-setter';

describe('withStateSetter', () => {
  const Store = signalStore(
    withState({
      a: { b: '' },
      c: 1,
      d: 12,
    }),
    withStateSetter('a', 'd'),
  );

  it('should generate setters for the given props', () => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      expect(store.setA).toBeDefined();
      expect(store.setD).toBeDefined();
      expect((store as any).setC).toBeUndefined();
    });
  });

  it('should patch state when called with a value', () => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      store.setA({ b: 'hello' });
      store.setD(42);
      expect(store.a()).toEqual({ b: 'hello' });
      expect(store.d()).toBe(42);
      expect(store.c()).toBe(1); // untouched
    });
  });

  it('should apply updater fn with current prop value for partial updates', () => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      store.setA({ b: 'hello' });
      store.setA((a) => ({ ...a, b: a.b + '!' }));
      store.setD((d) => d + 1);
      expect(store.a()).toEqual({ b: 'hello!' });
      expect(store.d()).toBe(13);
    });
  });

  it('should keep state in sync when called with a signal', () => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      const dValue = signal(5);
      store.setD(dValue);
      TestBed.tick();
      expect(store.d()).toBe(5);

      dValue.set(99);
      TestBed.tick();
      expect(store.d()).toBe(99);
    });
  });

  it('should warn when a key does not match a state prop', () => {
    TestBed.runInInjectionContext(() => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const BadStore = signalStore(
        withState({ c: 1 }),
        withStateSetter('missing' as any),
      );
      new BadStore();
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining("withStateSetter('missing')"),
      );
      warn.mockRestore();
    });
  });
});
