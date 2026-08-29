import { computed, effect, Signal, signal, untracked } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

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
          set: (value, store) => patchState(store as any, { ids: value }),
        }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        expect(store.linkSelectedIds).toBeDefined();
      });
    });
  });

  // ── Private setter ─────────────────────────────────────────────

  describe('_set<Name>', () => {
    const CountStore = signalStore(
      { protectedState: false },
      withState({ count: 1 }),
      withLink('count'),
      withMethods((store) => ({
        // the setter is only reachable from inside the store
        setCount: (
          value: number | Signal<number> | ((current: number) => number),
        ) => store._setCount(value),
      })),
    );

    it('is not part of the public store type', () => {
      TestBed.runInInjectionContext(() => {
        const store = new CountStore();
        // @ts-expect-error _setCount is private, only reachable inside the store
        expect(store._setCount).toBeInstanceOf(Function);
      });
    });

    it('is not generated with noSetter', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ count: 1 }),
        withLink('count', { noSetter: true }),
        // inside the store is where a private setter would be visible
        withMethods((store) => {
          // @ts-expect-error noSetter: true, so _setCount is not generated
          const setter = store._setCount;
          return { hasSetter: () => setter !== undefined };
        }),
      );
      TestBed.runInInjectionContext(() => {
        expect(new Store().hasSetter()).toBe(false);
      });
    });

    it('is still generated when noSetter is false', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ count: 1 }),
        withLink('count', { noSetter: false }),
        withMethods((store) => ({
          setCount: (value: number) => store._setCount(value),
        })),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        store.setCount(3);
        expect(store.count()).toBe(3);
      });
    });

    it('writes the value through the link update path', () => {
      const update = vi.fn();
      const Store = signalStore(
        withState({ filter: { search: 'initial' } }),
        withLink('filter', { set: update }),
        withMethods((store) => ({
          setFilter: (value: { search: string }) => store._setFilter(value),
        })),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        store.setFilter({ search: 'updated' });

        expect(update).toHaveBeenCalledWith(
          { search: 'updated' },
          expect.anything(),
        );
      });
    });

    it('patches state by default', () => {
      TestBed.runInInjectionContext(() => {
        const store = new CountStore();
        store.setCount(5);

        expect(store.count()).toBe(5);
      });
    });

    it('accepts an updater receiving the current value', () => {
      TestBed.runInInjectionContext(() => {
        const store = new CountStore();
        store.setCount((current) => current + 1);

        expect(store.count()).toBe(2);
      });
    });

    it('accepts a signal, keeping the store in sync with it', () => {
      TestBed.runInInjectionContext(() => {
        const store = new CountStore();
        const source = signal(5);
        store.setCount(source);
        TestBed.tick();
        expect(store.count()).toBe(5);

        source.set(7);
        TestBed.tick();
        expect(store.count()).toBe(7);
      });
    });

    it('writes through update with a computation source', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ ids: ['a'] as string[] }),
        withLink('selectedIds', {
          computation: (store) => store.ids(),
          set: (value, store) => patchState(store as any, { ids: value }),
        }),
        withMethods((store) => ({
          addId: (id: string) => store._setSelectedIds((ids) => [...ids, id]),
        })),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        store.addId('b');

        expect(store.ids()).toEqual(['a', 'b']);
      });
    });

    it('skips the update using a custom equal', () => {
      const update = vi.fn();
      const Store = signalStore(
        withState({ ids: ['a', 'b'] as string[] }),
        withLink('ids', {
          set: update,
          equal: (a, b) =>
            a.length === b.length && a.every((v, i) => v === b[i]),
        }),
        withMethods((store) => ({
          setIds: (value: string[]) => store._setIds(value),
        })),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        // structurally equal, fresh reference
        store.setIds(['a', 'b']);
        expect(update).not.toHaveBeenCalled();

        store.setIds(['a', 'c']);
        expect(update).toHaveBeenCalledWith(['a', 'c'], expect.anything());
      });
    });

    it('skips the update when the value is equal to the source', () => {
      const update = vi.fn();
      const Store = signalStore(
        withState({ count: 1 }),
        withLink('count', { set: update }),
        withMethods((store) => ({
          setCount: (value: number) => store._setCount(value),
        })),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        store.setCount(1);
        expect(update).not.toHaveBeenCalled();

        store.setCount(2);
        expect(update).toHaveBeenCalledWith(2, expect.anything());
      });
    });
  });

  // ── Premade equal ──────────────────────────────────────────────

  describe('premade equal', () => {
    const storeWith = (equal: 'array' | 'set' | 'stringify', update: any) =>
      signalStore(
        withState({ ids: ['a', 'b'] as string[] }),
        withLink('ids', { set: update, equal }),
        withMethods((store) => ({
          setIds: (value: string[]) => store._setIds(value),
        })),
      );

    it("'array' compares elements in order", () => {
      const update = vi.fn();
      const Store = storeWith('array', update);
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        // structurally equal, fresh reference
        store.setIds(['a', 'b']);
        expect(update).not.toHaveBeenCalled();

        store.setIds(['b', 'a']);
        expect(update).toHaveBeenCalledWith(['b', 'a'], expect.anything());
      });
    });

    it("'set' ignores the order of the elements", () => {
      const update = vi.fn();
      const Store = storeWith('set', update);
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        store.setIds(['b', 'a']);
        expect(update).not.toHaveBeenCalled();

        store.setIds(['a', 'c']);
        expect(update).toHaveBeenCalledWith(['a', 'c'], expect.anything());
      });
    });

    it("'stringify' compares objects structurally", () => {
      const update = vi.fn();
      const Store = signalStore(
        withState({ filter: { search: '', category: 'a' } }),
        withLink('filter', { set: update, equal: 'stringify' }),
        withMethods((store) => ({
          setFilter: (value: { search: string; category: string }) =>
            store._setFilter(value),
        })),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        store.setFilter({ search: '', category: 'a' });
        expect(update).not.toHaveBeenCalled();

        store.setFilter({ search: 'x', category: 'a' });
        expect(update).toHaveBeenCalledWith(
          { search: 'x', category: 'a' },
          expect.anything(),
        );
      });
    });

    it('a property name compares by that property', () => {
      const update = vi.fn();
      const Store = signalStore(
        withState({
          selected: { id: 1, name: 'a' } as { id: number; name: string },
        }),
        withLink('selected', { set: update, equal: 'id' }),
        withMethods((store) => ({
          setSelected: (value: { id: number; name: string }) =>
            store._setSelected(value),
        })),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        // same id, the rest of the object is ignored
        store.setSelected({ id: 1, name: 'renamed' });
        expect(update).not.toHaveBeenCalled();

        store.setSelected({ id: 2, name: 'a' });
        expect(update).toHaveBeenCalledWith(
          { id: 2, name: 'a' },
          expect.anything(),
        );
      });
    });

    it("'array.<prop>' compares the elements by that property, in order", () => {
      const update = vi.fn();
      const Store = signalStore(
        withState({
          products: [
            { id: 1, name: 'a' },
            { id: 2, name: 'b' },
          ] as { id: number; name: string }[],
        }),
        withLink('products', { set: update, equal: 'array.id' }),
        withMethods((store) => ({
          setProducts: (value: { id: number; name: string }[]) =>
            store._setProducts(value),
        })),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        // same ids in the same positions, the rest of the elements is ignored
        store.setProducts([
          { id: 1, name: 'renamed' },
          { id: 2, name: 'b' },
        ]);
        expect(update).not.toHaveBeenCalled();

        const reordered = [
          { id: 2, name: 'b' },
          { id: 1, name: 'a' },
        ];
        store.setProducts(reordered);
        expect(update).toHaveBeenCalledWith(reordered, expect.anything());
      });
    });

    it("'set.<prop>' compares the elements by that property, in any order", () => {
      const update = vi.fn();
      const Store = signalStore(
        withState({
          products: [
            { id: 1, name: 'a' },
            { id: 2, name: 'b' },
          ] as { id: number; name: string }[],
        }),
        withLink('products', { set: update, equal: 'set.id' }),
        withMethods((store) => ({
          setProducts: (value: { id: number; name: string }[]) =>
            store._setProducts(value),
        })),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        store.setProducts([
          { id: 2, name: 'renamed' },
          { id: 1, name: 'a' },
        ]);
        expect(update).not.toHaveBeenCalled();

        const changed = [
          { id: 1, name: 'a' },
          { id: 3, name: 'c' },
        ];
        store.setProducts(changed);
        expect(update).toHaveBeenCalledWith(changed, expect.anything());
      });
    });

    it('compares by a property that shadows one of Object.prototype', () => {
      const update = vi.fn();
      const Store = signalStore(
        withState({ item: { toString: 'a', payload: 1 } }),
        // a real property of the value, not a premade name: it must not
        // resolve to the Object.prototype member of the same name, which
        // reports every value equal and so drops every write
        withLink('item', { set: update, equal: 'toString' }),
        withMethods((store) => ({
          setItem: (value: { toString: string; payload: number }) =>
            store._setItem(value),
        })),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        store.setItem({ toString: 'a', payload: 2 });
        expect(update).not.toHaveBeenCalled();

        const changed = { toString: 'b', payload: 2 };
        store.setItem(changed);
        expect(update).toHaveBeenCalledWith(changed, expect.anything());
      });
    });

    it('only offers the properties of the linked value', () => {
      signalStore(
        withState({
          selected: { id: 1, name: 'a' },
          products: [] as { id: number; name: string }[],
          count: 1,
        }),
        // @ts-expect-error 'missing' is not a property of the linked value
        withLink('selected', { equal: 'missing' }),
        // @ts-expect-error a number has no properties to compare by
        withLink('count', { equal: 'id' }),
        // @ts-expect-error an array takes the prefixed form, array.id or set.id
        withLink('products', { equal: 'id' }),
        // @ts-expect-error 'missing' is not a property of the elements
        withLink('products', { equal: 'array.missing' }),
      );
    });

    it("guards the sync to an external signal, and 'array'/'set' are not offered for non arrays", () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ ids: ['a', 'b'] as string[], count: 1 }),
        withLink('ids', { equal: 'set' }),
        // @ts-expect-error 'set' is only offered when the value is an array
        withLink('count', { equal: 'set' }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const external = signal(['b', 'a']);
        const setSpy = vi.spyOn(external, 'set');
        store.linkIds({ syncWith: external });
        TestBed.tick();

        // same ids in another order: neither side is written back
        expect(setSpy).not.toHaveBeenCalled();
        expect(store.ids()).toEqual(['a', 'b']);
      });
    });
  });

  // ── Delegated signal (no external) ─────────────────────────────

  describe('store-delegating writes', () => {
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
        withLink('filter', { set: update }),
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
          set: (value, store) => patchState(store as any, { ids: value }),
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
          set: (value, store) => {
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
        withLink('count', { set: update }),
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
      // @ts-expect-error initialValueFrom is only allowed with syncWith
      check({ initialValueFrom: 'store' });
      // @ts-expect-error initialValueFrom is only allowed with syncWith
      check({ readFrom: signal(1), initialValueFrom: 'store' });
      // readFrom accepts a writable signal, it just never writes to it
      check({ readFrom: signal(1) });
      check({ syncWith: signal(1), initialValueFrom: 'store' });

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
        store.linkCount({ syncWith: external, initialValueFrom: 'store' });
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

    it("initialValueFrom 'external' (default) pushes the external value to the store", () => {
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

    it("initialValueFrom 'store' writes the store value to the external signal", () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ count: 1 }),
        withLink('count'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const external = signal(5);
        store.linkCount({ syncWith: external, initialValueFrom: 'store' });
        TestBed.tick();

        expect(external()).toBe(1);
        expect(store.count()).toBe(1);
      });
    });

    it("initialValueFrom 'store' does not re-apply the link-time external value on first tick", () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ count: 1 }),
        withLink('count'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const external = signal(5);
        store.linkCount({ syncWith: external, initialValueFrom: 'store' });
        expect(external()).toBe(1);

        // the store moves on before the first effect flush
        patchState(store, { count: 9 });
        TestBed.tick();
        // the link-time snapshot (1) must not revert the store
        expect(store.count()).toBe(9);
        expect(external()).toBe(9);
      });
    });

    it("initialValueFrom 'store' keeps a write made before the first tick", () => {
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
          initialValueFrom: 'store',
          updateStoreWhen: () => true,
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

    it('is gated by updateStoreWhen like any other write', () => {
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
          updateStoreWhen: () => allowed(),
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
        withLink('count', { set: update }),
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

    it('function form merges into the buffer when gated by updateStoreWhen', () => {
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
          updateStoreWhen: () => allowed(),
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

    it('only pushes values committed through the updateStoreWhen gate', () => {
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
          updateStoreWhen: () => allowed(),
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

    it('does not push the readFrom initial value out when gated by updateStoreWhen', () => {
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
          updateStoreWhen: () => true,
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

  // ── updateStoreWhen gate ────────────────────────────────────────────

  describe('updateStoreWhen', () => {
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
          updateStoreWhen: () => allowed(),
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
      const updateStoreWhen = vi.fn((value: number) => value > 10);
      const Store = signalStore(
        { protectedState: false },
        withState({ count: 1 }),
        withLink('count'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const linked = store.linkCount({ updateStoreWhen });
        TestBed.tick();

        linked.set(5);
        TestBed.tick();
        expect(updateStoreWhen).toHaveBeenCalledWith(5);
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
        withLink('filter', { set: update }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const allowed = signal(false);
        const linked = store.linkFilter({
          updateStoreWhen: () => allowed(),
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
        const linked = store.linkCount({ updateStoreWhen: () => false });

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
        store.linkCount({
          syncWith: external,
          updateStoreWhen: () => allowed(),
        });
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
          updateStoreWhen: () => allowed(),
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
          updateStoreWhen: () => allowed(),
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
        withLink('count', { set: update }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const linked = store.linkCount({ updateStoreWhen: () => true });
        TestBed.tick();

        linked.set(1);
        TestBed.tick();
        expect(update).not.toHaveBeenCalled();
      });
    });

    it('a gate derived from the linked value sees the just-written state', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ count: 1 }),
        withLink('count'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        // the gate reads the linked value reactively rather than its
        // argument, so it only opens if the write landed in the buffer
        // before updateStoreWhen ran
        let linked!: ReturnType<typeof store.linkCount>;
        const valid = computed(() => linked() > 10);
        linked = store.linkCount({ updateStoreWhen: () => valid() });
        TestBed.tick();

        linked.set(20);
        expect(store.count()).toBe(20);
      });
    });

    it('commits synchronously while the gate is open', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ count: 1 }),
        withLink('count'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const linked = store.linkCount({ updateStoreWhen: () => true });
        TestBed.tick();

        linked.set(5);
        // no tick: an open gate must not wait for the flush effect
        expect(store.count()).toBe(5);
      });
    });

    it('writes once per write while the gate is open', () => {
      // a set that does not update the store synchronously, so the flush
      // effect can not tell the value has already been committed
      const update = vi.fn();
      const Store = signalStore(
        withState({ count: 1 }),
        withLink('count', { set: update }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const linked = store.linkCount({ updateStoreWhen: () => true });
        TestBed.tick();

        linked.set(5);
        TestBed.tick();
        expect(update).toHaveBeenCalledTimes(1);
      });
    });

    it('buffers again when the gate closes after a commit', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ count: 1 }),
        withLink('count'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const allowed = signal(true);
        const linked = store.linkCount({ updateStoreWhen: () => allowed() });
        TestBed.tick();

        linked.set(5);
        TestBed.tick();
        expect(store.count()).toBe(5);

        allowed.set(false);
        TestBed.tick();

        linked.set(9);
        TestBed.tick();
        expect(linked()).toBe(9);
        expect(store.count()).toBe(5);

        allowed.set(true);
        TestBed.tick();
        expect(store.count()).toBe(9);
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
          set: update,
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

    it('does not loop when the computation returns a fresh value on every read', () => {
      // guards the loop: without it a regression hangs the suite instead of
      // failing, the buffer and the store push each other forever
      const update = vi.fn((value: { id: number }[], store: unknown) => {
        if (update.mock.calls.length > 10) throw new Error('update loop');
        patchState(store as any, { rows: value });
      });
      const Store = signalStore(
        withState({ rows: [{ id: 1 }] }),
        withLink('mapped', {
          // rebuilt elements, so the default equality can not dedupe this:
          // two reads of the source are not equal to each other
          computation: (store) => store.rows().map((row) => ({ ...row })),
          set: update,
        }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const external = signal([{ id: 7 }]);
        const linked = store.linkMapped({
          readFrom: external,
          updateStoreWhen: () => true,
        });
        TestBed.tick();

        expect(store.rows()).toEqual([{ id: 7 }]);
        expect(linked()).toEqual([{ id: 7 }]);
        expect(update).toHaveBeenCalledTimes(1);
      });
    });

    it('does not loop when readFrom feeds itself', () => {
      const update = vi.fn();
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: '', category: 'books' } }),
        withLink('filter', {
          set: (value, store) => {
            update(value);
            patchState(store as any, { filter: value });
          },
        }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const search = signal('a');
        // reads the linked state and rebuilds a fresh object from it: under
        // reference equality every write would re-trigger the read forever
        const read = computed(() => ({
          ...store.filter(),
          search: search(),
        }));
        store.linkFilter({ readFrom: read, updateStoreWhen: () => true });
        TestBed.tick();

        expect(store.filter()).toEqual({ search: 'a', category: 'books' });
        expect(update).toHaveBeenCalledTimes(1);

        search.set('b');
        TestBed.tick();
        expect(store.filter()).toEqual({ search: 'b', category: 'books' });
        expect(update).toHaveBeenCalledTimes(2);
      });
    });

    it('does not loop when a self-feeding readFrom is given an equality', () => {
      const update = vi.fn();
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: '', category: 'books' } }),
        withLink('filter', {
          set: (value, store) => {
            update(value);
            patchState(store as any, { filter: value });
          },
          equal: 'stringify',
        }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const search = signal('a');
        const read = computed(() => ({
          ...store.filter(),
          search: search(),
        }));
        store.linkFilter({ readFrom: read, updateStoreWhen: () => true });
        TestBed.tick();

        expect(store.filter()).toEqual({ search: 'a', category: 'books' });
        expect(update).toHaveBeenCalledTimes(1);

        search.set('b');
        TestBed.tick();
        expect(store.filter()).toEqual({ search: 'b', category: 'books' });
        expect(update).toHaveBeenCalledTimes(2);
      });
    });

    it('settles on every one of a long run of real changes', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: '', category: 'books' } }),
        withLink('filter'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const search = signal('');
        // a fresh object per change: each one is a real edit, so each has to
        // reach the store rather than being dropped as an echo
        store.linkFilter({
          readFrom: computed(() => ({
            search: search(),
            category: 'books',
          })),
        });

        for (let i = 0; i < 200; i++) {
          search.set('typed ' + i);
          TestBed.tick();
        }
        expect(store.filter()).toEqual({
          search: 'typed 199',
          category: 'books',
        });
      });
    });

    it('does not serialize primitives or arrays of stable references', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ count: 0, ids: [] as { id: number }[] }),
        withLink('count'),
        withLink('ids'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const a = { id: 1 };
        const b = { id: 2 };
        const count = signal(0);
        const ids = signal([a]);
        store.linkCount({ readFrom: count });
        store.linkIds({ readFrom: ids });
        TestBed.tick();

        // the default only reaches for a structural comparison when the cheap
        // ones can not answer: never for a primitive, and not for an array
        // whose elements are the same references
        const stringify = vi.spyOn(JSON, 'stringify');
        count.set(1);
        ids.set([a, b]);
        TestBed.tick();

        expect(stringify).not.toHaveBeenCalled();
        stringify.mockRestore();
        expect(store.count()).toBe(1);
        expect(store.ids()).toEqual([a, b]);
      });
    });

    it("compares by reference when asked with 'reference'", () => {
      const update = vi.fn();
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: 'a' } }),
        withLink('filter', {
          set: (value, store) => {
            update(value);
            patchState(store as any, { filter: value });
          },
          equal: 'reference',
        }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const external = signal({ search: 'a' });
        store.linkFilter({ readFrom: external });
        TestBed.tick();

        // same content, new reference: pushed, unlike under the default
        expect(update).toHaveBeenCalledTimes(1);
        expect(store.filter()).toBe(untracked(external));
      });
    });

    it('falls back to reference equality for values JSON would flatten', () => {
      const update = vi.fn();
      const Store = signalStore(
        { protectedState: false },
        withState({ picked: new Set<number>() }),
        withLink('picked', {
          set: (value, store) => {
            update(value);
            patchState(store as any, { picked: value });
          },
        }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const external = signal(new Set([1]));
        store.linkPicked({ readFrom: external });
        TestBed.tick();
        expect(update).toHaveBeenCalledTimes(1);

        // two Sets both serialize to '{}', so a structural comparison would
        // call them equal and silently drop this update
        external.set(new Set([1, 2]));
        TestBed.tick();
        expect(update).toHaveBeenCalledTimes(2);
        expect(store.picked()).toEqual(new Set([1, 2]));
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
