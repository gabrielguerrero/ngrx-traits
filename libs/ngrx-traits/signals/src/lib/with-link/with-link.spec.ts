import { computed, effect, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { patchState, signalStore, withState } from '@ngrx/signals';

import { LinkOptions, withLink } from './with-link';

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

    it('set inside an effect does not track signals read by update', () => {
      const dep = signal(0);
      const Store = signalStore(
        { protectedState: false },
        withState({ count: 1 }),
        withLink('count', {
          update: (value, store) => {
            // update reads another signal, like filterEntities reads entities()
            dep();
            patchState(store as any, { count: value });
          },
        }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const linked = store.linkCount();
        let runs = 0;
        effect(() => {
          runs++;
          linked.set(5);
        });
        TestBed.tick();
        expect(runs).toBe(1);
        expect(store.count()).toBe(5);

        // dep is not a dependency of the caller's effect
        dep.set(1);
        TestBed.tick();
        expect(runs).toBe(1);
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

  // ── Call signatures ────────────────────────────────────────────

  describe('call signatures', () => {
    it('takes no arguments', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ count: 1 }),
        withLink('count'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const linked = store.linkCount();

        expect(linked()).toBe(1);
        linked.set(2);
        expect(store.count()).toBe(2);
      });
    });

    it('rejects invalid option combinations at compile time', () => {
      const check = (options: LinkOptions<number>) => options;

      // @ts-expect-error syncWith and readFrom are mutually exclusive
      check({ syncWith: signal(1), readFrom: signal(2) });
      // @ts-expect-error initialValue is only allowed with syncWith
      check({ initialValue: 'store' });
      // @ts-expect-error initialValue is only allowed with syncWith
      check({ readFrom: signal(1), initialValue: 'store' });
      // readFrom accepts a writable signal, it just never writes to it
      check({ readFrom: signal(1) });
      check({ syncWith: signal(1), initialValue: 'store' });

      expect(check).toBeDefined();
    });

    it('accepts an external signal plus options', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ count: 1 }),
        withLink('count'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const external = signal(5);
        store.linkCount({ syncWith: external, initialValue: 'store' });
        TestBed.tick();

        expect(external()).toBe(1);
      });
    });
  });

  // ── syncWith (two-way) ─────────────────────────────────────────

  describe('syncWith', () => {
    it('always returns the delegated store view, not the external signal', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ count: 1 }),
        withLink('count'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const external = signal(5);
        const linked = store.linkCount({ syncWith: external });

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
        store.linkCount({ syncWith: external });

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
        store.linkCount({ syncWith: external, initialValue: 'store' });
        TestBed.tick();

        expect(external()).toBe(1);
        expect(store.count()).toBe(1);
      });
    });

    it("initialValue 'store' does not re-apply the link-time external value on first tick", () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ count: 1 }),
        withLink('count'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const external = signal(5);
        store.linkCount({ syncWith: external, initialValue: 'store' });
        expect(external()).toBe(1);

        // the store moves on before the first effect flush
        patchState(store, { count: 9 });
        TestBed.tick();
        // the link-time snapshot (1) must not revert the store
        expect(store.count()).toBe(9);
        expect(external()).toBe(9);
      });
    });

    it("initialValue 'store' keeps a write made before the first tick", () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ count: 1 }),
        withLink('count'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const external = signal(5);
        const linked = store.linkCount({
          syncWith: external,
          initialValue: 'store',
          updateWhen: () => true,
        });
        // buffered before any effect ran
        linked.set(7);
        TestBed.tick();
        // the link-time external snapshot (1) must not clobber the buffer
        expect(store.count()).toBe(7);
        expect(external()).toBe(7);
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
        store.linkCount({ syncWith: external });
        TestBed.tick();

        external.set(7);
        TestBed.tick();
        expect(store.count()).toBe(7);

        patchState(store, { count: 9 });
        TestBed.tick();
        expect(external()).toBe(9);
      });
    });
  });

  // ── readFrom (one-way external -> store) ───────────────────────

  describe('readFrom', () => {
    it('pushes a read-only signal into the store on link and on change', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ count: 1 }),
        withLink('count'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const writable = signal(3);
        const external = computed(() => writable());
        store.linkCount({ readFrom: external });
        TestBed.tick();
        expect(store.count()).toBe(3);

        writable.set(4);
        TestBed.tick();
        expect(store.count()).toBe(4);
      });
    });

    it('never writes back, even to a writable signal', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ count: 1 }),
        withLink('count'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        // a model() the component writes itself, e.g. on a button click
        const external = signal(3);
        store.linkCount({ readFrom: external });
        TestBed.tick();
        expect(store.count()).toBe(3);

        // the store moving on does not drag the external signal with it
        patchState(store, { count: 9 });
        TestBed.tick();
        expect(external()).toBe(3);
        expect(store.count()).toBe(9);

        // ...and the next external write still reaches the store
        external.set(4);
        TestBed.tick();
        expect(store.count()).toBe(4);
      });
    });

    it('is gated by updateWhen like any other write', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ count: 1 }),
        withLink('count'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const allowed = signal(false);
        const external = signal(5);
        const linked = store.linkCount({
          readFrom: external,
          updateWhen: () => allowed(),
        });
        TestBed.tick();

        expect(linked()).toBe(5);
        expect(store.count()).toBe(1);

        allowed.set(true);
        TestBed.tick();
        expect(store.count()).toBe(5);
      });
    });

    it('skips the update when the value is equal to the source', () => {
      const update = vi.fn();
      const Store = signalStore(
        withState({ count: 1 }),
        withLink('count', { update }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const external = signal(1);
        store.linkCount({ readFrom: external });
        TestBed.tick();

        expect(update).not.toHaveBeenCalled();

        external.set(2);
        TestBed.tick();
        expect(update).toHaveBeenCalledWith(2, expect.anything());
      });
    });

    it('function form merges a partial signal into the previous value', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: '', category: 'books' } }),
        withLink('filter'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const search = signal('initial');
        store.linkFilter({
          readFrom: (prev) => ({ ...prev, search: search() }),
        });
        TestBed.tick();
        // merged on link: search from the signal, category preserved
        expect(store.filter()).toEqual({
          search: 'initial',
          category: 'books',
        });

        // a store change elsewhere does not re-run the merge...
        patchState(store, { filter: { search: 'initial', category: 'toys' } });
        TestBed.tick();
        expect(store.filter()).toEqual({ search: 'initial', category: 'toys' });

        // ...but the next external change merges into the latest value
        search.set('typed');
        TestBed.tick();
        expect(store.filter()).toEqual({ search: 'typed', category: 'toys' });
      });
    });

    it('function form merges into the buffer when gated by updateWhen', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: '', category: 'books' } }),
        withLink('filter'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const allowed = signal(false);
        const search = signal('a');
        const linked = store.linkFilter({
          readFrom: (prev) => ({ ...prev, search: search() }),
          updateWhen: () => allowed(),
        });
        TestBed.tick();

        // buffered edit the gate is holding back
        linked.update((value) => ({ ...value, category: 'toys' }));
        TestBed.tick();
        expect(store.filter()).toEqual({ search: '', category: 'books' });

        // the merge reads the buffer, so the pending edit is preserved
        search.set('b');
        TestBed.tick();
        expect(linked()).toEqual({ search: 'b', category: 'toys' });

        allowed.set(true);
        TestBed.tick();
        expect(store.filter()).toEqual({ search: 'b', category: 'toys' });
      });
    });
  });

  // ── writeTo (one-way store -> external) ────────────────────────

  describe('writeTo', () => {
    it('sets a writable signal on store changes, but not on link', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ count: 1 }),
        withLink('count'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const external = signal(0);
        store.linkCount({ writeTo: external });
        TestBed.tick();
        // the value at link time is not pushed
        expect(external()).toBe(0);

        patchState(store, { count: 2 });
        TestBed.tick();
        expect(external()).toBe(2);
      });
    });

    it('calls a function with each committed change', () => {
      const emitted: number[] = [];
      const Store = signalStore(
        { protectedState: false },
        withState({ count: 1 }),
        withLink('count'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const linked = store.linkCount({
          writeTo: (value) => emitted.push(value),
        });
        TestBed.tick();
        expect(emitted).toEqual([]);

        linked.set(2);
        TestBed.tick();
        patchState(store, { count: 3 });
        TestBed.tick();
        expect(emitted).toEqual([2, 3]);
      });
    });

    it('never reads the external signal back into the store', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ count: 1 }),
        withLink('count'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const external = signal(0);
        store.linkCount({ writeTo: external });
        TestBed.tick();

        external.set(9);
        TestBed.tick();
        expect(store.count()).toBe(1);
      });
    });

    it('combines with readFrom into a two-way sync with a mapping each way', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: '' } }),
        withLink('filter'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        // external model of a different shape than the store state
        const search = signal('initial');
        const linked = store.linkFilter({
          readFrom: computed(() => ({ search: search() })),
          writeTo: (value) => search.set(value.search),
        });
        TestBed.tick();
        // in: model mapped to store shape
        expect(store.filter()).toEqual({ search: 'initial' });
        // the mapped initial value is not echoed back out
        expect(search()).toBe('initial');

        search.set('typed');
        TestBed.tick();
        expect(store.filter()).toEqual({ search: 'typed' });

        // out: store change mapped back to the model shape, no loop
        linked.set({ search: 'from-store' });
        TestBed.tick();
        expect(search()).toBe('from-store');
        expect(store.filter()).toEqual({ search: 'from-store' });
      });
    });

    it('only pushes values committed through the updateWhen gate', () => {
      const emitted: number[] = [];
      const Store = signalStore(
        { protectedState: false },
        withState({ count: 1 }),
        withLink('count'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const allowed = signal(false);
        const linked = store.linkCount({
          writeTo: (value) => emitted.push(value),
          updateWhen: () => allowed(),
        });
        TestBed.tick();

        linked.set(5);
        TestBed.tick();
        // buffered, not committed: nothing pushed out
        expect(emitted).toEqual([]);

        allowed.set(true);
        TestBed.tick();
        expect(emitted).toEqual([5]);
      });
    });

    it('does not push the readFrom initial value out when gated by updateWhen', () => {
      const emitted: { search: string }[] = [];
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: '' } }),
        withLink('filter'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const search = signal('initial');
        store.linkFilter({
          readFrom: computed(() => ({ search: search() })),
          writeTo: (value) => emitted.push(value),
          updateWhen: () => true,
        });
        TestBed.tick();
        // the mapped initial value is committed through the gate...
        expect(store.filter()).toEqual({ search: 'initial' });
        // ...but not pushed back out
        expect(emitted).toEqual([]);

        search.set('typed');
        TestBed.tick();
        expect(emitted).toEqual([{ search: 'typed' }]);
      });
    });

    it('rejects writeTo combined with syncWith at compile time', () => {
      const check = (options: LinkOptions<number>) => options;

      // @ts-expect-error syncWith and writeTo are mutually exclusive
      check({ syncWith: signal(1), writeTo: signal(2) });
      check({ writeTo: signal(1) });
      check({ writeTo: (value: number) => value });
      check({ readFrom: signal(1), writeTo: signal(2) });

      expect(check).toBeDefined();
    });
  });

  // ── updateWhen gate ────────────────────────────────────────────

  describe('updateWhen', () => {
    it('buffers writes and only updates the store when it returns true', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ count: 1 }),
        withLink('count'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const allowed = signal(false);
        const linked = store.linkCount({
          updateWhen: () => allowed(),
        });

        linked.set(5);
        TestBed.tick();
        // buffered: readable on the linked signal, not yet in the store
        expect(linked()).toBe(5);
        expect(store.count()).toBe(1);

        allowed.set(true);
        TestBed.tick();
        expect(store.count()).toBe(5);
      });
    });

    it('receives the latest value', () => {
      const updateWhen = vi.fn((value: number) => value > 10);
      const Store = signalStore(
        { protectedState: false },
        withState({ count: 1 }),
        withLink('count'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const linked = store.linkCount({ updateWhen });
        TestBed.tick();

        linked.set(5);
        TestBed.tick();
        expect(updateWhen).toHaveBeenCalledWith(5);
        expect(store.count()).toBe(1);

        linked.set(20);
        TestBed.tick();
        expect(store.count()).toBe(20);
      });
    });

    it('routes gated writes through a custom update', () => {
      const update = vi.fn();
      const Store = signalStore(
        withState({ filter: { search: 'initial' } }),
        withLink('filter', { update }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const allowed = signal(false);
        const linked = store.linkFilter({
          updateWhen: () => allowed(),
        });

        linked.set({ search: 'updated' });
        TestBed.tick();
        expect(update).not.toHaveBeenCalled();

        allowed.set(true);
        TestBed.tick();
        expect(update).toHaveBeenCalledWith(
          { search: 'updated' },
          expect.anything(),
        );
      });
    });

    it('resets the buffer when the store changes', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ count: 1 }),
        withLink('count'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const linked = store.linkCount({ updateWhen: () => false });

        linked.set(5);
        TestBed.tick();
        expect(store.count()).toBe(1);

        patchState(store, { count: 9 });
        TestBed.tick();
        expect(linked()).toBe(9);
      });
    });

    it('gates an external signal through the buffer as well', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ count: 1 }),
        withLink('count'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const allowed = signal(false);
        const external = signal(5);
        store.linkCount({ syncWith: external, updateWhen: () => allowed() });
        TestBed.tick();

        expect(store.count()).toBe(1);

        external.set(7);
        TestBed.tick();
        expect(store.count()).toBe(1);

        allowed.set(true);
        TestBed.tick();
        expect(store.count()).toBe(7);

        // store -> external still syncs
        patchState(store, { count: 9 });
        TestBed.tick();
        expect(external()).toBe(9);
      });
    });

    it('keeps a diverging external initial value buffered until the gate opens', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ count: 1 }),
        withLink('count'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const allowed = signal(false);
        const external = signal(5);
        const linked = store.linkCount({
          syncWith: external,
          updateWhen: () => allowed(),
        });
        TestBed.tick();

        // 5 is buffered, and the external falls back to the committed value
        expect(linked()).toBe(5);
        expect(external()).toBe(1);
        expect(store.count()).toBe(1);

        allowed.set(true);
        TestBed.tick();
        expect(store.count()).toBe(5);
        expect(external()).toBe(5);
      });
    });

    it('only mirrors committed values to the external signal', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ count: 1 }),
        withLink('count'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const allowed = signal(false);
        const external = signal(1);
        const linked = store.linkCount({
          syncWith: external,
          updateWhen: () => allowed(),
        });

        // buffered write does not leak to the external signal
        linked.set(5);
        TestBed.tick();
        expect(linked()).toBe(5);
        expect(external()).toBe(1);

        allowed.set(true);
        TestBed.tick();
        expect(store.count()).toBe(5);
        expect(external()).toBe(5);
      });
    });

    it('does not update the store when the gated value equals the source', () => {
      const update = vi.fn();
      const Store = signalStore(
        withState({ count: 1 }),
        withLink('count', { update }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const linked = store.linkCount({ updateWhen: () => true });
        TestBed.tick();

        linked.set(1);
        TestBed.tick();
        expect(update).not.toHaveBeenCalled();
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
          equal: (a, b) =>
            a.length === b.length && a.every((v, i) => v === b[i]),
        }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const external = signal(['a']);
        store.linkIds({ syncWith: external });
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
        store.linkCount({ syncWith: external });
        TestBed.tick();

        expect(setSpy).not.toHaveBeenCalled();
      });
    });
  });
});
