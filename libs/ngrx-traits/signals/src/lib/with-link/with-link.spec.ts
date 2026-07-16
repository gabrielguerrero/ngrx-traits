import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { patchState, signalStore, withState } from '@ngrx/signals';

import { withLink } from './with-link';

describe('withLink', () => {
  // ── Method naming ──────────────────────────────────────────────

  describe('method naming', () => {
    it('string shorthand creates link<Source> method', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: '' } }),
        withLink('filter'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        expect(store.linkFilter).toBeDefined();
      });
    });

    it('custom name with computation creates link<Name> method', () => {
      const Store = signalStore(
        withState({ ids: [] as string[] }),
        withLink('selectedIds', {
          computation: (store) => store.ids(),
          update: (value, store) => patchState(store as any, { ids: value }),
        }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        expect(store.linkSelectedIds).toBeDefined();
      });
    });
  });

  // ── Delegated signal (no external) ─────────────────────────────

  describe('delegated signal', () => {
    it('reads the source and patches state on set by default', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: 'initial' } }),
        withLink('filter'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const linked = store.linkFilter();

        expect(linked()).toEqual({ search: 'initial' });

        linked.set({ search: 'updated' });
        expect(store.filter()).toEqual({ search: 'updated' });
        expect(linked()).toEqual({ search: 'updated' });
      });
    });

    it('routes writes through a custom update', () => {
      const update = vi.fn();
      const Store = signalStore(
        withState({ filter: { search: 'initial' } }),
        withLink('filter', { update }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const linked = store.linkFilter();

        linked.set({ search: 'updated' });
        expect(update).toHaveBeenCalledWith(
          { search: 'updated' },
          expect.anything(),
        );
      });
    });

    it('supports computation as source', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ ids: ['a'] }),
        withLink('selectedIds', {
          computation: (store) => store.ids(),
          update: (value, store) => patchState(store as any, { ids: value }),
        }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const linked = store.linkSelectedIds();

        expect(linked()).toEqual(['a']);
        linked.set(['a', 'b']);
        expect(store.ids()).toEqual(['a', 'b']);
      });
    });

    it('update() derives the new value from the current one', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ count: 1 }),
        withLink('count'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const linked = store.linkCount();

        linked.update((v) => v + 1);
        expect(store.count()).toBe(2);
        expect(linked()).toBe(2);
      });
    });

    it('skips update when the value is equal to the source', () => {
      const update = vi.fn();
      const Store = signalStore(
        withState({ count: 1 }),
        withLink('count', { update }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const linked = store.linkCount();

        linked.set(1);
        expect(update).not.toHaveBeenCalled();

        linked.set(2);
        expect(update).toHaveBeenCalledWith(2, expect.anything());
      });
    });
  });

  // ── External signal sync ───────────────────────────────────────

  describe('external signal sync', () => {
    it('always returns the delegated store view, not the external signal', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ count: 1 }),
        withLink('count'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const external = signal(5);
        const linked = store.linkCount(external);

        expect(linked).not.toBe(external);
        expect(linked()).toBe(store.count());
      });
    });

    it("initialValue 'external' (default) pushes the external value to the store", () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ count: 1 }),
        withLink('count'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const external = signal(5);
        store.linkCount(external);

        expect(store.count()).toBe(5);
      });
    });

    it("initialValue 'store' writes the store value to the external signal", () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ count: 1 }),
        withLink('count'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const external = signal(5);
        store.linkCount(external, { initialValue: 'store' });
        TestBed.tick();

        expect(external()).toBe(1);
        expect(store.count()).toBe(1);
      });
    });

    it('two-way syncs a writable external signal', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ count: 1 }),
        withLink('count'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const external = signal(1);
        store.linkCount(external);
        TestBed.tick();

        external.set(7);
        TestBed.tick();
        expect(store.count()).toBe(7);

        patchState(store, { count: 9 });
        TestBed.tick();
        expect(external()).toBe(9);
      });
    });

    it('one-way syncs a read-only external signal into the store', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ count: 1 }),
        withLink('count'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const writable = signal(3);
        const external = computed(() => writable());
        store.linkCount(external);
        TestBed.tick();
        expect(store.count()).toBe(3);

        writable.set(4);
        TestBed.tick();
        expect(store.count()).toBe(4);

        // store changes do not throw and do not touch the read-only signal
        patchState(store, { count: 8 });
        TestBed.tick();
        expect(external()).toBe(4);
      });
    });
  });

  // ── Echo suppression ───────────────────────────────────────────

  describe('echo suppression', () => {
    it('does not loop when update transforms values into fresh references', () => {
      const update = vi.fn((value: string[], store: unknown) => {
        // normalizing update: stores a fresh sorted copy, like entity selection
        patchState(store as any, { ids: [...value].sort() });
      });
      const Store = signalStore(
        withState({ ids: ['a'] as string[] }),
        withLink('ids', {
          update,
          equal: (a, b) => a.length === b.length && a.every((v, i) => v === b[i]),
        }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const external = signal(['a']);
        store.linkIds(external);
        TestBed.tick();
        expect(update).not.toHaveBeenCalled(); // equal values, initial push skipped

        external.set(['b', 'a']);
        TestBed.tick();
        TestBed.tick();
        TestBed.tick();

        expect(store.ids()).toEqual(['a', 'b']);
        // one real change → exactly one update, no echo cycles
        expect(update).toHaveBeenCalledTimes(1);
        // external converges to the store's normalized value
        expect(external()).toEqual(['a', 'b']);
      });
    });

    it('does not write the external signal back when values are equal', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ count: 1 }),
        withLink('count'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const external = signal(1);
        const setSpy = vi.spyOn(external, 'set');
        store.linkCount(external);
        TestBed.tick();

        expect(setSpy).not.toHaveBeenCalled();
      });
    });
  });
});
