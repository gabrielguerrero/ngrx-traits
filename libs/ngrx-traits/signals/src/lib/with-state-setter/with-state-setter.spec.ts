import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { signalStore, withMethods, withState } from '@ngrx/signals';

import { withStatePrivateSetter, withStateSetter } from './with-state-setter';

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

  it('should generate a public setter for a private state prop', () => {
    TestBed.runInInjectionContext(() => {
      const Store = signalStore(
        withState({ _filter: 'init', c: 1 }),
        withStateSetter('_filter'),
      );
      const store = new Store();
      expect(store.setFilter).toBeDefined();
      expect((store as any).set_filter).toBeUndefined();
      expect((store as any)._setFilter).toBeUndefined();
      store.setFilter('hello');
      expect((store as any)._filter()).toBe('hello');
    });
  });
});

describe('withStatePrivateSetter', () => {
  const Store = signalStore(
    withState({
      filter: '',
      d: 12,
    }),
    withStatePrivateSetter('filter', 'd'),
    withMethods((store) => ({
      clearFilter: () => store._setFilter(''),
    })),
  );

  it('should generate _set setters that patch state', () => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      expect((store as any)._setFilter).toBeDefined();
      expect((store as any)._setD).toBeDefined();
      expect((store as any).setFilter).toBeUndefined();
      (store as any)._setFilter('hello');
      (store as any)._setD(42);
      expect(store.filter()).toBe('hello');
      expect(store.d()).toBe(42);
    });
  });

  it('should apply updater fn with current prop value', () => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      (store as any)._setFilter('hello');
      (store as any)._setFilter((f: string) => f + '!');
      (store as any)._setD((d: number) => d + 1);
      expect(store.filter()).toBe('hello!');
      expect(store.d()).toBe(13);
    });
  });

  it('should keep state in sync when called with a signal', () => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      const dValue = signal(5);
      (store as any)._setD(dValue);
      TestBed.tick();
      expect(store.d()).toBe(5);

      dValue.set(99);
      TestBed.tick();
      expect(store.d()).toBe(99);
    });
  });

  it('should generate _setProp for a private prop, without doubling the underscore', () => {
    TestBed.runInInjectionContext(() => {
      const Store2 = signalStore(
        withState({ _filter: '' }),
        withStatePrivateSetter('_filter'),
      );
      const store = new Store2();
      expect((store as any)._setFilter).toBeDefined();
      expect((store as any).__setFilter).toBeUndefined();
      (store as any)._setFilter('x');
      expect((store as any)._filter()).toBe('x');
    });
  });

  it('should warn when a key does not match a state prop', () => {
    TestBed.runInInjectionContext(() => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const BadStore = signalStore(
        withState({ c: 1 }),
        withStatePrivateSetter('missing' as any),
      );
      new BadStore();
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining("withStatePrivateSetter('missing')"),
      );
      warn.mockRestore();
    });
  });
});
