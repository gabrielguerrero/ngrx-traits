import { TestBed } from '@angular/core/testing';
import { patchState, signalStore, withState } from '@ngrx/signals';

import { withLinkedSignal } from './with-linked-signal';

describe('withLinkedSignal', () => {
  // ── Prop naming ────────────────────────────────────────────────

  describe('prop naming', () => {
    it('string shorthand creates <source>Linked prop', () => {
      const Store = signalStore(
        withState({ filter: { search: '' } }),
        withLinkedSignal('filter'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        expect(store.filterLinked).toBeDefined();
      });
    });

    it('config without name creates <source>Linked prop', () => {
      const Store = signalStore(
        withState({ filter: { search: '' } }),
        withLinkedSignal({ source: 'filter' }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        expect(store.filterLinked).toBeDefined();
      });
    });

    it('config with explicit name uses that name', () => {
      const Store = signalStore(
        withState({ filter: { search: '' } }),
        withLinkedSignal({ name: 'myLinked', source: 'filter' }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        expect(store.myLinked).toBeDefined();
      });
    });

    it('multiple withLinkedSignal calls produce separate props', () => {
      const Store = signalStore(
        withState({ filter: { search: '' }, settings: { theme: 'dark' } }),
        withLinkedSignal('filter'),
        withLinkedSignal('settings'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        expect(store.filterLinked).toBeDefined();
        expect(store.settingsLinked).toBeDefined();
      });
    });
  });

  // ── Initial value ──────────────────────────────────────────────

  describe('initial value', () => {
    it('linked signal has the same initial value as source', () => {
      const Store = signalStore(
        withState({ filter: { search: 'hello' } }),
        withLinkedSignal({ source: 'filter', onChange: null }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        expect(store.filterLinked()).toEqual({ search: 'hello' });
      });
    });
  });

  // ── onChange behavior ──────────────────────────────────────────

  describe('onChange', () => {
    it('string shorthand defaults to patchState sync', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: 'initial' } }),
        withLinkedSignal('filter'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        TestBed.tick();

        store.filterLinked.set({ search: 'updated' });
        TestBed.tick();

        expect(store.filter()).toEqual({ search: 'updated' });
      });
    });

    it('onChange patchState syncs linked signal to store', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: 'initial' } }),
        withLinkedSignal({ source: 'filter', onChange: 'patchState' }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        TestBed.tick();

        store.filterLinked.set({ search: 'updated' });
        TestBed.tick();

        expect(store.filter()).toEqual({ search: 'updated' });
      });
    });

    it('onChange null does not sync', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: 'initial' } }),
        withLinkedSignal({ source: 'filter', onChange: null }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        TestBed.tick();

        store.filterLinked.set({ search: 'updated' });
        TestBed.tick();

        expect(store.filter()).toEqual({ search: 'initial' });
      });
    });

    it('custom onChange callback receives signal and store', () => {
      const onChangeSpy = vi.fn();
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: 'initial' } }),
        withLinkedSignal({ source: 'filter', onChange: onChangeSpy }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        TestBed.tick();

        store.filterLinked.set({ search: 'updated' });
        TestBed.tick();

        expect(onChangeSpy).toHaveBeenCalled();
        const [signalArg, storeArg] = onChangeSpy.mock.calls[0];
        expect(signalArg).toBeDefined();
        expect(signalArg()).toEqual({ search: 'updated' });
        expect(storeArg).toBeDefined();
        expect(storeArg.filter).toBeDefined();
      });
    });
  });

  // ── Store → linked signal sync ─────────────────────────────────

  describe('store to linked signal sync', () => {
    it('patchState on source updates linked signal', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: 'initial' } }),
        withLinkedSignal({ source: 'filter', onChange: null }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        TestBed.tick();

        patchState(store, { filter: { search: 'fromStore' } });
        TestBed.tick();

        expect(store.filterLinked()).toEqual({ search: 'fromStore' });
      });
    });
  });

  // ── Primitive values ───────────────────────────────────────────

  describe('primitive values', () => {
    it('works with primitive state values', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ count: 0 }),
        withLinkedSignal('count'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        TestBed.tick();

        expect(store.countLinked()).toBe(0);

        store.countLinked.set(42);
        TestBed.tick();

        expect(store.count()).toBe(42);
      });
    });

    it('works with string state values', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ name: 'hello' }),
        withLinkedSignal('name'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        TestBed.tick();

        expect(store.nameLinked()).toBe('hello');

        store.nameLinked.set('world');
        TestBed.tick();

        expect(store.name()).toBe('world');
      });
    });
  });
});
