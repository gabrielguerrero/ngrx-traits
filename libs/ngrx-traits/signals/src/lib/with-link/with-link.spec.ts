import {
  computed,
  effect,
  EventEmitter,
  output,
  Signal,
  signal,
  untracked,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { required, form as signalForm } from '@angular/forms/signals';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

import { LinkOptions, withLink } from './with-link';

/**
 * An emit-only sink, the shape of an `output()`: it can be emitted but not
 * read, so the link has to remember what it was last given.
 */
function emitInto<T>(collected: T[]): EventEmitter<T> {
  const emitter = new EventEmitter<T>();
  emitter.subscribe((value) => collected.push(value));
  return emitter;
}

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

    it('takes a premade name on the computation form, where the value type comes from the computation', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ ids: ['a', 'b'] as string[] }),
        withLink('selectedIds', {
          // the value type is only known once this callback is typed, so the
          // name must not be checked against an unresolved type
          computation: (store) => store.ids(),
          set: (value, store) => patchState(store as any, { ids: value }),
          equal: 'set',
        }),
        // @ts-expect-error 'missing' is not a property of the computed value
        withLink('firstId', {
          computation: (store) => ({ id: store.ids()[0] }),
          set: () => void 0,
          equal: 'missing',
        }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const external = signal(['b', 'a']);
        const setSpy = vi.spyOn(external, 'set');
        store.linkSelectedIds({ syncWith: external });
        TestBed.tick();

        // same ids in another order: 'set' resolved, so neither side is written
        expect(setSpy).not.toHaveBeenCalled();
        expect(store.ids()).toEqual(['a', 'b']);
      });
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
    it('re-calls a transforming set only for values it actually changes', () => {
      // writes are compared against what the store settled on, so a value
      // already in its final form dedupes as usual, while one the transform
      // rewrites never matches and reaches `set` every time
      const calls: string[] = [];
      const Store = signalStore(
        { protectedState: false },
        withState({ v: 'x' }),
        withLink('v', {
          set: (value, store) => {
            calls.push(value);
            patchState(store as any, { v: value.trim() });
          },
        }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const linked = store.linkV();

        linked.set(' b ');
        linked.set(' b ');
        linked.set(' b ');
        expect(store.v()).toBe('b');
        expect(calls).toEqual([' b ', ' b ', ' b ']);

        calls.length = 0;
        linked.set('c');
        linked.set('c');
        linked.set('c');
        expect(store.v()).toBe('c');
        expect(calls).toEqual(['c']);
      });
    });

    it('does not repeat anything downstream of a re-entered set', () => {
      // the repeat stops at `set`: writeTo compares against what it already
      // gave the sink, so three writes of the same raw value emit once
      const emitted: string[] = [];
      const Store = signalStore(
        { protectedState: false },
        withState({ v: 'x' }),
        withLink('v', {
          set: (value, store) => patchState(store as any, { v: value.trim() }),
        }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const linked = store.linkV({ writeTo: emitInto(emitted) });

        linked.set(' b ');
        TestBed.tick();
        linked.set(' b ');
        TestBed.tick();
        linked.set(' b ');
        TestBed.tick();

        expect(store.v()).toBe('b');
        expect(emitted).toEqual(['b']);
      });
    });

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
          storeEditsWhen: () => true,
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

    it('is not gated by storeEditsWhen', () => {
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
          storeEditsWhen: () => allowed(),
        });
        TestBed.tick();

        // the gate only applies to writes made through the returned signal;
        // readFrom tells the store what to read, so it writes through
        expect(linked()).toBe(5);
        expect(store.count()).toBe(5);

        external.set(7);
        TestBed.tick();
        expect(store.count()).toBe(7);

        // a write through the signal is still gated
        linked.set(9);
        TestBed.tick();
        expect(store.count()).toBe(7);

        allowed.set(true);
        TestBed.tick();
        expect(store.count()).toBe(9);
      });
    });

    it('rejects a value by returning prev from the function form', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ count: 1 }),
        withLink('count'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const external = signal(5);
        // validation for readFrom values lives here, since the gate does not
        // apply to them: return prev to keep the store as it is
        store.linkCount({
          readFrom: (prev) => (external() % 2 === 0 ? external() : prev),
        });
        TestBed.tick();
        expect(store.count()).toBe(1);

        external.set(8);
        TestBed.tick();
        expect(store.count()).toBe(8);

        external.set(9);
        TestBed.tick();
        expect(store.count()).toBe(8);
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

    it('function form merges into the committed value when gated', () => {
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
          storeEditsWhen: () => allowed(),
        });
        TestBed.tick();

        // readFrom is not gated, so its merge is already committed
        expect(store.filter()).toEqual({ search: 'a', category: 'books' });

        // buffered edit the gate is holding back
        linked.update((value) => ({ ...value, category: 'toys' }));
        TestBed.tick();
        expect(store.filter()).toEqual({ search: 'a', category: 'books' });

        // the merge reads the committed value, not the buffer: merging the
        // pending edit in would commit it behind the gate's back. Writing to
        // the store resets the buffer, so the pending edit is dropped
        search.set('b');
        TestBed.tick();
        expect(store.filter()).toEqual({ search: 'b', category: 'books' });
        expect(linked()).toEqual({ search: 'b', category: 'books' });

        allowed.set(true);
        TestBed.tick();
        expect(store.filter()).toEqual({ search: 'b', category: 'books' });
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

    it('emits each committed change to the sink', () => {
      const emitted: number[] = [];
      const Store = signalStore(
        { protectedState: false },
        withState({ count: 1 }),
        withLink('count'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const linked = store.linkCount({
          writeTo: emitInto(emitted),
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

    it('does not echo a readFrom change back out', () => {
      // the target does not feed back into readFrom's source, which is the
      // shape an output() has — and the one where an echo is visible
      const emitted: { search: string }[] = [];
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: 'store-initial' } }),
        withLink('filter'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const search = signal('a');
        store.linkFilter({
          readFrom: computed(() => ({ search: search() })),
          writeTo: emitInto(emitted),
        });
        TestBed.tick();
        expect(emitted).toEqual([]);

        search.set('b');
        TestBed.tick();
        expect(store.filter()).toEqual({ search: 'b' });
        expect(emitted).toEqual([]);
      });
    });

    it('pushes a store change back to the readFrom value after another push', () => {
      // the intervening push left the external side holding 'b', so a change
      // back to what readFrom supplies is news to it again. Without that
      // push it would be suppressed — see the transforming-set test
      const emitted: { search: string }[] = [];
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: 'a' } }),
        withLink('filter'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        store.linkFilter({
          readFrom: signal({ search: 'a' }),
          writeTo: emitInto(emitted),
        });
        TestBed.tick();
        expect(emitted).toEqual([]);

        patchState(store, { filter: { search: 'b' } });
        TestBed.tick();
        expect(emitted).toEqual([{ search: 'b' }]);

        // back to what readFrom supplies, e.g. a reset
        patchState(store, { filter: { search: 'a' } });
        TestBed.tick();
        expect(emitted).toEqual([{ search: 'b' }, { search: 'a' }]);
      });
    });

    it('does not push a store change back to the value readFrom holds', () => {
      // the store settles on the trimmed value, so it never held what
      // readFrom supplied. A later change to exactly that value is still not
      // pushed: the external side is where it came from, it holds it already.
      // Once something else is pushed the external side holds that instead,
      // and the readFrom value is a change again
      const emitted: { search: string }[] = [];
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: 'a' } }),
        withLink('filter', {
          set: (value, store) =>
            patchState(store as any, {
              filter: { search: value.search.trim() },
            }),
        }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        store.linkFilter({
          readFrom: signal({ search: ' typed ' }),
          writeTo: emitInto(emitted),
        });
        TestBed.tick();
        expect(store.filter()).toEqual({ search: 'typed' });
        expect(emitted).toEqual([]);

        patchState(store, { filter: { search: ' typed ' } });
        TestBed.tick();
        expect(emitted).toEqual([]);

        patchState(store, { filter: { search: 'x' } });
        TestBed.tick();
        patchState(store, { filter: { search: ' typed ' } });
        TestBed.tick();
        expect(emitted).toEqual([{ search: 'x' }, { search: ' typed ' }]);
      });
    });

    it('re-pushes a pending async readFrom value that lands after an interleaved change', async () => {
      // the interleaved push told the external side 'other', so when the
      // readFrom value finally lands it is a change from what the external
      // side holds. A redundant emit for a fire-and-forget callback, but
      // never a divergence: a parent wiring the output back into the input
      // ends up consistent either way
      const emitted: { search: string }[] = [];
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: 'a' } }),
        withLink('filter', {
          set: (value, store) =>
            void setTimeout(() => patchState(store as any, { filter: value })),
        }),
      );
      await TestBed.runInInjectionContext(async () => {
        const store = new Store();
        store.linkFilter({
          readFrom: signal({ search: 'from-input' }),
          writeTo: emitInto(emitted),
        });
        TestBed.tick();

        patchState(store, { filter: { search: 'other' } });
        TestBed.tick();
        await new Promise((resolve) => setTimeout(resolve, 10));
        TestBed.tick();

        expect(store.filter()).toEqual({ search: 'from-input' });
        expect(emitted).toEqual([
          { search: 'other' },
          { search: 'from-input' },
        ]);
      });
    });

    it('pushes a store change made before the first tick', () => {
      // changes only means relative to the link-time value, not to whatever
      // the first effect run happens to see
      const emitted: { search: string }[] = [];
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: 'a' } }),
        withLink('filter'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        store.linkFilter({ writeTo: emitInto(emitted) });
        patchState(store, { filter: { search: 'b' } });
        TestBed.tick();
        expect(emitted).toEqual([{ search: 'b' }]);
      });
    });

    it('pushes a store change made before the first tick with a readFrom', () => {
      const emitted: { search: string }[] = [];
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: 'a' } }),
        withLink('filter'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        store.linkFilter({
          readFrom: signal({ search: 'in' }),
          writeTo: emitInto(emitted),
        });
        patchState(store, { filter: { search: 'b' } });
        TestBed.tick();
        expect(emitted).toEqual([{ search: 'b' }]);
      });
    });

    it('pushes a gated write that equals the readFrom value', () => {
      const emitted: { search: string }[] = [];
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: 'a' } }),
        withLink('filter'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const allowed = signal(false);
        const linked = store.linkFilter({
          readFrom: signal({ search: 'a' }),
          writeTo: emitInto(emitted),
          storeEditsWhen: () => allowed(),
        });
        TestBed.tick();

        // held back by the gate, then committed by the flush effect
        linked.set({ search: 'b' });
        TestBed.tick();
        expect(emitted).toEqual([]);

        allowed.set(true);
        TestBed.tick();
        expect(emitted).toEqual([{ search: 'b' }]);

        // a gated write back to the value readFrom supplies is still a real
        // change the external side does not know about
        linked.set({ search: 'a' });
        TestBed.tick();
        expect(emitted).toEqual([{ search: 'b' }, { search: 'a' }]);
      });
    });

    it('pushes a field the readFrom merge does not control', () => {
      // lastEmitted carries the whole merged value, category included, and
      // every push replaces it — so a category the merge does not control is
      // never frozen on the value it had when the merge last ran
      const emitted: { search: string; category: string }[] = [];
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: 'x', category: 'books' } }),
        withLink('filter'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const search = signal('x');
        store.linkFilter({
          readFrom: (prev) => ({ ...prev, search: search() }),
          writeTo: emitInto(emitted),
        });
        TestBed.tick();

        patchState(store, { filter: { search: 'x', category: 'films' } });
        TestBed.tick();
        patchState(store, { filter: { search: 'x', category: 'books' } });
        TestBed.tick();
        expect(emitted).toEqual([
          { search: 'x', category: 'films' },
          { search: 'x', category: 'books' },
        ]);
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
          writeTo: search,
          writeMap: (value) => value.search,
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

    it('only pushes values committed through the storeEditsWhen gate', () => {
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
          writeTo: emitInto(emitted),
          storeEditsWhen: () => allowed(),
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

    it('does not push the readFrom initial value out when gated by storeEditsWhen', () => {
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
          writeTo: emitInto(emitted),
          storeEditsWhen: () => true,
        });
        TestBed.tick();
        // the mapped initial value is committed through the gate...
        expect(store.filter()).toEqual({ search: 'initial' });
        // ...but not pushed back out
        expect(emitted).toEqual([]);

        // nor is any later readFrom value: the external side supplied it, so
        // it already agrees with the store
        search.set('typed');
        TestBed.tick();
        expect(store.filter()).toEqual({ search: 'typed' });
        expect(emitted).toEqual([]);

        // a change the external side did not supply is pushed
        patchState(store, { filter: { search: 'from-store' } });
        TestBed.tick();
        expect(emitted).toEqual([{ search: 'from-store' }]);
      });
    });

    // regression: the store's pre-link value used to be pushed out on the
    // first tick here, because the guard was seeded from the buffer while a
    // closed gate held the readFrom seed back from the store
    it('does not push the pre-link store value out when the gate starts closed', () => {
      const emitted: { search: string }[] = [];
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: 'store-initial' } }),
        withLink('filter'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const search = signal('from-input');
        const allowed = signal(false);
        store.linkFilter({
          readFrom: computed(() => ({ search: search() })),
          writeTo: emitInto(emitted),
          storeEditsWhen: () => allowed(),
        });
        TestBed.tick();
        // readFrom is not gated, so the seed is committed at link time — and
        // being the value at link time, it must not be pushed out
        expect(store.filter()).toEqual({ search: 'from-input' });
        expect(emitted).toEqual([]);

        allowed.set(true);
        TestBed.tick();
        expect(emitted).toEqual([]);

        search.set('typed');
        TestBed.tick();
        expect(store.filter()).toEqual({ search: 'typed' });
        // still nothing: readFrom supplied it, so the external side agrees
        expect(emitted).toEqual([]);

        // only a change the external side did not supply is pushed
        patchState(store, { filter: { search: 'from-store' } });
        TestBed.tick();
        expect(emitted).toEqual([{ search: 'from-store' }]);
      });
    });

    // regression: the link-time skip only covers the value the store held at
    // link time, which is still the pre-link one when `set` writes
    // asynchronously. lastEmitted is what suppresses the echo when the
    // readFrom value finally lands.
    it('does not push the link-time value out when set writes asynchronously', async () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: 'store-initial' } }),
        withLink('filter', {
          // does not land in the source synchronously, like filterEntities
          // with a debounce
          set: (value, store) =>
            void setTimeout(() => patchState(store as any, { filter: value })),
        }),
      );
      await TestBed.runInInjectionContext(async () => {
        const store = new Store();
        const emitted: { search: string }[] = [];
        store.linkFilter({
          readFrom: signal({ search: 'from-input' }),
          writeTo: emitInto(emitted),
        });
        TestBed.tick();
        await new Promise((resolve) => setTimeout(resolve, 10));
        TestBed.tick();

        // the readFrom seed is the value at link time, however late it lands
        expect(store.filter()).toEqual({ search: 'from-input' });
        expect(emitted).toEqual([]);
      });
    });

    // same, through readFrom's function form — a separate read path, since
    // it merges into the committed value. (The syncWith seed has the same
    // shape but cannot be observed this way: syncWith and writeTo are
    // mutually exclusive.)
    it('does not push the link-time value out with an async set and a readFrom merge', async () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: 'store-initial', category: 'books' } }),
        withLink('filter', {
          set: (value, store) =>
            void setTimeout(() => patchState(store as any, { filter: value })),
        }),
      );
      await TestBed.runInInjectionContext(async () => {
        const store = new Store();
        const emitted: { search: string; category: string }[] = [];
        const search = signal('from-input');
        store.linkFilter({
          readFrom: (prev) => ({ ...prev, search: search() }),
          writeTo: emitInto(emitted),
        });
        TestBed.tick();
        await new Promise((resolve) => setTimeout(resolve, 10));
        TestBed.tick();

        expect(store.filter()).toEqual({
          search: 'from-input',
          category: 'books',
        });
        expect(emitted).toEqual([]);
      });
    });

    it('dedupes emissions in the external type, not the store type', () => {
      // the point of writeMap: the parent only ever sees `search`, so a page
      // change it can not observe must not reach it. Deduping in store space
      // emitted 'a', 'a', 'b' here
      const emitted: string[] = [];
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: 'a', page: 1 } }),
        withLink('filter'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        store.linkFilter({
          writeTo: emitInto(emitted),
          writeMap: (value) => value.search,
        });
        TestBed.tick();

        patchState(store, { filter: { search: 'a', page: 2 } });
        TestBed.tick();
        patchState(store, { filter: { search: 'a', page: 3 } });
        TestBed.tick();
        patchState(store, { filter: { search: 'b', page: 3 } });
        TestBed.tick();

        expect(emitted).toEqual(['b']);
      });
    });

    it('checks a writable sink against what it currently holds', () => {
      // a readable sink needs no memo: it is asked directly, so a mapped
      // value it already holds is never set again
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: 'a', page: 1 } }),
        withLink('filter'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const external = signal('a');
        const sets = vi.spyOn(external, 'set');
        store.linkFilter({
          writeTo: external,
          writeMap: (value) => value.search,
        });
        TestBed.tick();
        expect(sets).not.toHaveBeenCalled();

        // invisible through the mapping, so the sink is left alone
        patchState(store, { filter: { search: 'a', page: 2 } });
        TestBed.tick();
        expect(sets).not.toHaveBeenCalled();

        patchState(store, { filter: { search: 'b', page: 2 } });
        TestBed.tick();
        expect(external()).toBe('b');
        expect(sets).toHaveBeenCalledTimes(1);
      });
    });

    it('re-reads a writable sink the parent changed behind the link', () => {
      // the live check is the whole point of not keeping a memo for a
      // readable sink: the parent moved it on its own, so a store change to
      // the value it now holds writes nothing
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: 'a', page: 1 } }),
        withLink('filter'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const external = signal('a');
        store.linkFilter({
          writeTo: external,
          writeMap: (value) => value.search,
        });
        TestBed.tick();

        external.set('b');
        const sets = vi.spyOn(external, 'set');
        patchState(store, { filter: { search: 'b', page: 1 } });
        TestBed.tick();
        expect(sets).not.toHaveBeenCalled();
      });
    });

    it('does not push at link time even when a writable sink disagrees', () => {
      // changes only, whatever the sink holds — a model() and an output()
      // behave the same on link
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: 'store', page: 1 } }),
        withLink('filter'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const external = signal('external');
        store.linkFilter({
          writeTo: external,
          writeMap: (value) => value.search,
        });
        TestBed.tick();
        expect(external()).toBe('external');
      });
    });

    it('does not echo a mapped readFrom change back out', () => {
      // every value readFrom supplies is recorded as one the sink holds, in
      // the external type — so an output() does not fire on its own input
      const emitted: string[] = [];
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: 'store-initial', page: 1 } }),
        withLink('filter'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const search = signal('a');
        store.linkFilter({
          readFrom: search,
          readMap: (value) => ({ search: value, page: 1 }),
          writeTo: emitInto(emitted),
          writeMap: (value) => value.search,
        });
        TestBed.tick();
        expect(emitted).toEqual([]);

        search.set('b');
        TestBed.tick();
        expect(store.filter()).toEqual({ search: 'b', page: 1 });
        expect(emitted).toEqual([]);
      });
    });

    it('never misses an emit to a sink it can not read', () => {
      // the memo has to follow every emit, not only what readFrom supplied:
      // once 'b' went out the parent no longer knows 'a', so a change back to
      // it is news again. At most one redundant emit per value, never a
      // missed one — a readable sink has no such slack, it is just read
      const emitted: string[] = [];
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: 'a', page: 1 } }),
        withLink('filter'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const search = signal('a');
        store.linkFilter({
          readFrom: search,
          readMap: (value) => ({ search: value, page: 1 }),
          writeTo: emitInto(emitted),
          writeMap: (value) => value.search,
        });
        TestBed.tick();
        expect(emitted).toEqual([]);

        patchState(store, { filter: { search: 'b', page: 1 } });
        TestBed.tick();
        expect(emitted).toEqual(['b']);

        // readFrom still holds 'a', but the sink was last given 'b'
        patchState(store, { filter: { search: 'a', page: 1 } });
        TestBed.tick();
        expect(emitted).toEqual(['b', 'a']);
      });
    });

    it('does not push the value a transforming set produced at link time', () => {
      // the store settles on the trimmed value while the link is still
      // wiring, so that is the value at link time — and the untrimmed one
      // readFrom supplied is what the external side is recorded as holding
      const emitted: string[] = [];
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: 'a' } }),
        withLink('filter', {
          set: (value, store) =>
            patchState(store as any, {
              filter: { search: value.search.trim() },
            }),
        }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        store.linkFilter({
          readFrom: signal(' typed '),
          readMap: (search) => ({ search }),
          writeTo: emitInto(emitted),
          writeMap: (value) => value.search,
        });
        TestBed.tick();
        expect(store.filter()).toEqual({ search: 'typed' });
        expect(emitted).toEqual([]);

        // nor is the untrimmed value, which the store never held
        patchState(store, { filter: { search: ' typed ' } });
        TestBed.tick();
        expect(emitted).toEqual([]);
      });
    });

    it('emits to an output()', () => {
      const emitted: number[] = [];
      const Store = signalStore(
        { protectedState: false },
        withState({ count: 1 }),
        withLink('count'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const changed = output<number>();
        changed.subscribe((value) => emitted.push(value));
        store.linkCount({ writeTo: changed });
        TestBed.tick();
        expect(emitted).toEqual([]);

        patchState(store, { count: 2 });
        TestBed.tick();
        expect(emitted).toEqual([2]);
      });
    });

    it('drops an array equal when the map changes the shape', () => {
      // 'array' and 'set' report every non-array unequal, so carrying one onto
      // an object-shaped mapped value would stop the side deduping at all —
      // the link-time value would leak out and an unchanged value would emit
      // again
      const emitted: { list: string[] }[] = [];
      const Store = signalStore(
        { protectedState: false },
        withState({ ids: ['a'] as string[] }),
        withLink('ids', { equal: 'set' }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        store.linkIds({
          writeTo: emitInto(emitted),
          writeMap: (ids) => ({ list: ids }),
        });
        TestBed.tick();
        // changes only: the link-time value is not pushed
        expect(emitted).toEqual([]);

        patchState(store, { ids: ['a', 'b'] });
        TestBed.tick();
        patchState(store, { ids: ['b', 'a'] });
        TestBed.tick();
        // the same value again, which must not emit a second time
        patchState(store, { ids: ['b', 'a'] });
        TestBed.tick();
        expect(emitted).toEqual([{ list: ['a', 'b'] }, { list: ['b', 'a'] }]);
      });
    });

    it('keeps a structural equal across a map, drops a property one', () => {
      // 'set' means "same members" whatever the members are, so it still
      // holds after writeMap; 'id' names a property of the store's type and
      // would compare undefined to undefined once mapped, dropping everything
      const Ids = signalStore(
        { protectedState: false },
        withState({ ids: [] as (string | number)[] }),
        withLink('ids', {
          equal: 'set',
          // the store does not preserve the order it was given
          set: (v: any, store) =>
            patchState(store as any, { ids: [...v].reverse() }),
        }),
      );
      const Sel = signalStore(
        { protectedState: false },
        withState({ sel: { id: 1, label: 'a' } }),
        withLink('sel', { equal: 'id' }),
      );
      TestBed.runInInjectionContext(() => {
        const ids = new Ids();
        const model = signal<string[]>([]);
        ids.linkIds({ syncWith: model, writeMap: (v) => v as string[] });
        TestBed.tick();
        model.set(['a', 'b']);
        TestBed.tick();
        // reordered in the store, but 'set' says they agree, so the model is
        // left holding the order the user gave it
        expect(ids.ids()).toEqual(['b', 'a']);
        expect(model()).toEqual(['a', 'b']);

        const sel = new Sel();
        const sink = signal('a');
        sel.linkSel({ writeTo: sink, writeMap: (v) => v.label });
        TestBed.tick();
        patchState(sel, { sel: { id: 1, label: 'zz' } });
        TestBed.tick();
        expect(sink()).toEqual('zz');
      });
    });

    it('requires a map only in the direction the types do not flow', () => {
      // a narrower external type is already a store value, so it flows in
      // unmapped; sending a store value back out to it still narrows
      type Genre = 'rock' | 'jazz';
      const Store = signalStore(
        { protectedState: false },
        withState({ ids: [] as (string | number)[] }),
        withLink('ids'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const genres = signal<Genre[]>([]);

        // readFrom alone: Genre[] is assignable to (string|number)[], no map
        store.linkIds({ readFrom: genres });
        // writeTo alone: the store's type does not narrow on its own
        // @ts-expect-error writeMap is required, (string|number)[] is wider
        store.linkIds({ writeTo: genres });
        // syncWith: only the outbound direction needs the map
        store.linkIds({
          syncWith: genres,
          writeMap: (ids) => ids as Genre[],
        });
      });
    });

    it('requires the maps when the external type differs', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: '' } }),
        withLink('filter'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const search = signal('');
        const changed = new EventEmitter<string>();

        // @ts-expect-error readMap is required, the types differ
        store.linkFilter({ readFrom: search });
        // @ts-expect-error writeMap is required, the types differ
        store.linkFilter({ writeTo: changed });
        // @ts-expect-error both maps are required, the types differ
        store.linkFilter({ syncWith: search });
        // with the maps it compiles
        store.linkFilter({
          readFrom: search,
          readMap: (value) => ({ search: value }),
          writeTo: changed,
          writeMap: (value) => value.search,
        });
        // and neither map is needed when the types match
        store.linkFilter({ writeTo: signal({ search: '' }) });

        expect(store.linkFilter).toBeDefined();
      });
    });

    it('rejects writeTo combined with syncWith at compile time', () => {
      const check = (options: LinkOptions<number>) => options;

      // @ts-expect-error syncWith and writeTo are mutually exclusive
      check({ syncWith: signal(1), writeTo: signal(2) });
      check({ writeTo: signal(1) });
      check({ writeTo: new EventEmitter<number>() });
      // @ts-expect-error writeTo takes a sink, not a callback
      check({ writeTo: (value: number) => value });
      check({ readFrom: signal(1), writeTo: signal(2) });

      expect(check).toBeDefined();
    });
  });

  // ── readMap / writeMap ─────────────────────────────────────────

  describe('readMap / writeMap', () => {
    const CountStore = signalStore(
      { protectedState: false },
      withState({ count: 1 }),
      withLink('count'),
    );

    it('maps a syncWith signal both ways', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: '' } }),
        withLink('filter'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const search = signal('initial');
        store.linkFilter({
          syncWith: search,
          readMap: (value) => ({ search: value }),
          writeMap: (value) => value.search,
        });
        TestBed.tick();
        expect(store.filter()).toEqual({ search: 'initial' });

        search.set('typed');
        TestBed.tick();
        expect(store.filter()).toEqual({ search: 'typed' });

        patchState(store, { filter: { search: 'from-store' } });
        TestBed.tick();
        expect(search()).toBe('from-store');
      });
    });

    it('writes the mapped store value with initialValueFrom store', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: 'from-store' } }),
        withLink('filter'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const search = signal('external');
        store.linkFilter({
          syncWith: search,
          initialValueFrom: 'store',
          readMap: (value) => ({ search: value }),
          writeMap: (value) => value.search,
        });
        TestBed.tick();
        expect(search()).toBe('from-store');
        expect(store.filter()).toEqual({ search: 'from-store' });
      });
    });

    it('leaves both sides alone when writeMap skips the initial store value', () => {
      // initialValueFrom 'store' with a writeMap that rejects the store
      // value: nothing is written to the signal, and its own value is not
      // pushed to the store either — 'store' said the store wins, and skip
      // only stopped the push
      const Store = signalStore(
        { protectedState: false },
        withState({ count: 2 }),
        withLink('count'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const external = signal(9);
        store.linkCount({
          syncWith: external,
          initialValueFrom: 'store',
          writeMap: (value, skip) => (value % 2 ? value : skip()),
        });
        TestBed.tick();
        expect(external()).toBe(9);
        expect(store.count()).toBe(2);
      });
    });

    it('compares readFrom values by content when readMap is in play', () => {
      // `equal` describes the store's type: applying it to the external one
      // deduped every change here, since no external value has an `id`
      const Store = signalStore(
        { protectedState: false },
        withState({ selected: { id: 1 } }),
        withLink('selected', { equal: 'id' }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const search = signal({ search: 'a' });
        store.linkSelected({
          readFrom: search,
          readMap: (value) => ({ id: value.search.length }),
        });
        TestBed.tick();
        expect(store.selected()).toEqual({ id: 1 });

        search.set({ search: 'bb' });
        TestBed.tick();
        expect(store.selected()).toEqual({ id: 2 });
      });
    });

    it('compares pushed values by content when writeMap is in play', () => {
      // same on the way out: `equal: 'id'` reports two mapped labels equal,
      // since neither carries an id
      const emitted: { label: string }[] = [];
      const Store = signalStore(
        { protectedState: false },
        withState({ selected: { id: 1 } }),
        withLink('selected', { equal: 'id' }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        store.linkSelected({
          writeTo: emitInto(emitted),
          writeMap: (value) => ({ label: `#${value.id}` }),
        });
        TestBed.tick();
        expect(emitted).toEqual([]);

        patchState(store, { selected: { id: 2 } });
        TestBed.tick();
        expect(emitted).toEqual([{ label: '#2' }]);
      });
    });

    it('rejects a readFrom value with skip(), leaving the store as it is', () => {
      TestBed.runInInjectionContext(() => {
        const store = new CountStore();
        const external = signal(2);
        store.linkCount({
          readFrom: external,
          readMap: (value, skip) => (value % 2 ? value : skip()),
        });
        TestBed.tick();
        // rejected at link time, so the store keeps its own value
        expect(store.count()).toBe(1);

        external.set(3);
        TestBed.tick();
        expect(store.count()).toBe(3);

        external.set(4);
        TestBed.tick();
        expect(store.count()).toBe(3);
      });
    });

    it('rejects a syncWith value with skip(), leaving the signal alone', () => {
      TestBed.runInInjectionContext(() => {
        const store = new CountStore();
        const external = signal(4);
        store.linkCount({
          syncWith: external,
          readMap: (value, skip) => (value % 2 ? value : skip()),
        });
        TestBed.tick();
        // the store keeps its value, and the rejected one is left where it
        // was put: correcting it would fight a user mid-edit
        expect(store.count()).toBe(1);
        expect(external()).toBe(4);

        // and the same after link, not only on the first tick
        external.set(6);
        TestBed.tick();
        expect(store.count()).toBe(1);
        expect(external()).toBe(6);

        // an accepted value still syncs
        external.set(5);
        TestBed.tick();
        expect(store.count()).toBe(5);
        expect(external()).toBe(5);

        // and the store still pushes its own changes out
        patchState(store, { count: 7 });
        TestBed.tick();
        expect(external()).toBe(7);
      });
    });

    it('skips an emission with skip() in writeMap', () => {
      const emitted: number[] = [];
      TestBed.runInInjectionContext(() => {
        const store = new CountStore();
        store.linkCount({
          writeTo: emitInto(emitted),
          writeMap: (value, skip) => (value % 2 ? value : skip()),
        });
        TestBed.tick();

        patchState(store, { count: 2 });
        TestBed.tick();
        expect(emitted).toEqual([]);

        patchState(store, { count: 3 });
        TestBed.tick();
        expect(emitted).toEqual([3]);
      });
    });

    it('leaves a writable sink alone when writeMap skips', () => {
      TestBed.runInInjectionContext(() => {
        const store = new CountStore();
        const external = signal(0);
        store.linkCount({
          writeTo: external,
          writeMap: (value, skip) => (value % 2 ? value : skip()),
        });
        TestBed.tick();

        patchState(store, { count: 2 });
        TestBed.tick();
        expect(external()).toBe(0);

        patchState(store, { count: 3 });
        TestBed.tick();
        expect(external()).toBe(3);
      });
    });

    it('honours skip() called outside a return', () => {
      const reached: number[] = [];
      TestBed.runInInjectionContext(() => {
        const store = new CountStore();
        const external = signal(2);
        store.linkCount({
          readFrom: external,
          readMap: (value, skip) => {
            if (value % 2 === 0) skip();
            reached.push(value);
            return value;
          },
        });
        TestBed.tick();
        // the rest of the map never ran
        expect(reached).toEqual([]);
        expect(store.count()).toBe(1);

        external.set(3);
        TestBed.tick();
        expect(reached).toEqual([3]);
        expect(store.count()).toBe(3);
      });
    });

    it('lets an error other than skip out of readMap', () => {
      TestBed.runInInjectionContext(() => {
        const store = new CountStore();
        expect(() =>
          store.linkCount({
            readFrom: signal(2),
            readMap: () => {
              throw new Error('boom');
            },
          }),
        ).toThrow('boom');
      });
    });

    it('lets an error other than skip out of writeMap', () => {
      TestBed.runInInjectionContext(() => {
        const store = new CountStore();
        expect(() =>
          store.linkCount({
            writeTo: signal(0),
            writeMap: () => {
              throw new Error('boom');
            },
          }),
        ).toThrow('boom');
      });
    });
  });

  // ── writeEqual ─────────────────────────────────────────────────

  describe('writeEqual', () => {
    const PickedStore = signalStore(
      { protectedState: false },
      withState({ picked: [{ id: 1 }, { id: 2 }] }),
      withLink('picked'),
    );

    it('dedupes the outbound side in the mapped type', () => {
      const emitted: { key: string }[][] = [];
      TestBed.runInInjectionContext(() => {
        const store = new PickedStore();
        store.linkPicked({
          writeTo: emitInto(emitted),
          writeMap: (value) => value.map((p) => ({ key: `k${p.id}` })),
          writeEqual: 'set.key',
        });
        TestBed.tick();

        // rebuilt and reordered: the same keys, so nothing goes out
        patchState(store, { picked: [{ id: 2 }, { id: 1 }] });
        TestBed.tick();
        expect(emitted).toEqual([]);

        patchState(store, { picked: [{ id: 3 }] });
        TestBed.tick();
        expect(emitted).toEqual([[{ key: 'k3' }]]);
      });
    });

    it('pushes those same values without it', () => {
      // the default on a mapped side compares element by element and writeMap
      // builds fresh objects, so nothing above is ever equal — not even the
      // link-time value against itself
      const emitted: { key: string }[][] = [];
      TestBed.runInInjectionContext(() => {
        const store = new PickedStore();
        store.linkPicked({
          writeTo: emitInto(emitted),
          writeMap: (value) => value.map((p) => ({ key: `k${p.id}` })),
        });
        TestBed.tick();

        patchState(store, { picked: [{ id: 2 }, { id: 1 }] });
        TestBed.tick();
        expect(emitted).toEqual([
          [{ key: 'k1' }, { key: 'k2' }],
          [{ key: 'k2' }, { key: 'k1' }],
        ]);
      });
    });

    it('leaves the inbound side and store writes alone', () => {
      // 'set.key' reports every store value equal — nothing there has a `key`
      // — so a leak into either comparison drops the writes below
      const Store = signalStore(
        { protectedState: false },
        withState({ picked: [] as { id: string }[] }),
        withLink('picked'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const external = signal([{ key: 'a' }, { key: 'b' }]);
        const linked = store.linkPicked({
          syncWith: external,
          readMap: (value) => value.map((k) => ({ id: k.key })),
          writeMap: (value) => value.map((p) => ({ key: p.id })),
          writeEqual: 'set.key',
        });
        TestBed.tick();
        expect(store.picked()).toEqual([{ id: 'a' }, { id: 'b' }]);

        // inbound: a reorder is a change, whatever writeEqual says about it
        external.set([{ key: 'b' }, { key: 'a' }]);
        TestBed.tick();
        expect(store.picked()).toEqual([{ id: 'b' }, { id: 'a' }]);

        // store space: the write path is guarded by `equal`, not writeEqual
        linked.set([{ id: 'a' }, { id: 'b' }]);
        expect(store.picked()).toEqual([{ id: 'a' }, { id: 'b' }]);
      });
    });

    it('is type-checked against the external type', () => {
      TestBed.runInInjectionContext(() => {
        const store = new PickedStore();
        const sink = signal<{ key: string }[]>([]);
        const writeMap = (value: { id: number }[]) =>
          value.map((p) => ({ key: `k${p.id}` }));

        store.linkPicked({ writeTo: sink, writeMap, writeEqual: 'set.key' });
        store.linkPicked({ writeTo: sink, writeMap, writeEqual: 'stringify' });
        store.linkPicked({
          writeTo: sink,
          writeMap,
          // @ts-expect-error 'id' is a property of the store's type, not the external one
          writeEqual: 'set.id',
        });
        store.linkPicked({
          writeTo: sink,
          writeMap,
          // @ts-expect-error the external value is an array, so it takes the prefixed form
          writeEqual: 'key',
        });

        expect(store.linkPicked).toBeDefined();
      });
    });

    it('is only offered when there is a writeMap', () => {
      TestBed.runInInjectionContext(() => {
        const store = new PickedStore();
        const same = signal([{ id: 1 }]);

        store.linkPicked({ writeTo: same });
        // @ts-expect-error writeEqual needs a writeMap, `equal` covers the rest
        store.linkPicked({ writeTo: same, writeEqual: 'array.id' });
        // @ts-expect-error writeEqual needs a writeMap, `equal` covers the rest
        store.linkPicked({ syncWith: same, writeEqual: 'array.id' });
        // @ts-expect-error writeEqual needs a writeMap, `equal` covers the rest
        store.linkPicked({ writeEqual: 'array.id' });

        expect(store.linkPicked).toBeDefined();
      });
    });
  });

  // ── storeEditsWhen gate ────────────────────────────────────────────

  describe('storeEditsWhen', () => {
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
          storeEditsWhen: () => allowed(),
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
      const storeEditsWhen = vi.fn((value: number) => value > 10);
      const Store = signalStore(
        { protectedState: false },
        withState({ count: 1 }),
        withLink('count'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const linked = store.linkCount({ storeEditsWhen });
        TestBed.tick();

        linked.set(5);
        TestBed.tick();
        expect(storeEditsWhen).toHaveBeenCalledWith(5);
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
          storeEditsWhen: () => allowed(),
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
        const linked = store.linkCount({ storeEditsWhen: () => false });

        linked.set(5);
        TestBed.tick();
        expect(store.count()).toBe(1);

        patchState(store, { count: 9 });
        TestBed.tick();
        expect(linked()).toBe(9);
      });
    });

    it('is not gated by storeEditsWhen either', () => {
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
          storeEditsWhen: () => allowed(),
        });
        TestBed.tick();

        // like readFrom, the external signal writes through
        expect(store.count()).toBe(5);

        external.set(7);
        TestBed.tick();
        expect(store.count()).toBe(7);

        // a write through the returned signal is still gated
        linked.set(9);
        TestBed.tick();
        expect(store.count()).toBe(7);

        allowed.set(true);
        TestBed.tick();
        expect(store.count()).toBe(9);

        // store -> external still syncs
        patchState(store, { count: 11 });
        TestBed.tick();
        expect(external()).toBe(11);
      });
    });

    it('does not overwrite a diverging external initial value', () => {
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
          storeEditsWhen: () => false,
        });
        TestBed.tick();

        // the external value wins at link time and is committed, so the
        // model is not clobbered with the store's pre-link value
        expect(linked()).toBe(5);
        expect(external()).toBe(5);
        expect(store.count()).toBe(5);
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
          storeEditsWhen: () => allowed(),
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
        const linked = store.linkCount({ storeEditsWhen: () => true });
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
        // before storeEditsWhen ran
        let linked!: ReturnType<typeof store.linkCount>;
        const valid = computed(() => linked() > 10);
        linked = store.linkCount({ storeEditsWhen: () => valid() });
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
        const linked = store.linkCount({ storeEditsWhen: () => true });
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
        const linked = store.linkCount({ storeEditsWhen: () => true });
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
        const linked = store.linkCount({ storeEditsWhen: () => allowed() });
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

    it('is never called while linking, so it can read a form built from the link', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: '', category: 'books' } }),
        withLink('filter'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const search = signal('a');
        // mirrors a component: readFrom pushes an input into the store while
        // the gate reads a form built from the linked signal, so the form
        // does not exist yet while linkFilter() runs. readFrom bypasses the
        // gate, so it is never called there
        class Cmp {
          data = store.linkFilter({
            readFrom: (prev) => ({ ...prev, search: search() }),
            storeEditsWhen: (): boolean => this.form().valid(),
          });
          form = fakeForm(this.data);
        }
        const cmp = new Cmp();
        TestBed.tick();

        expect(cmp.data()).toEqual({ search: 'a', category: 'books' });
        expect(store.filter()).toEqual({ search: 'a', category: 'books' });

        search.set('bb');
        TestBed.tick();
        expect(store.filter()).toEqual({ search: 'bb', category: 'books' });
      });
    });

    it('is never called while linking with syncWith either', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: '', category: 'books' } }),
        withLink('filter'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const external = signal({ search: 'a', category: 'books' });
        class Cmp {
          data = store.linkFilter({
            syncWith: external,
            storeEditsWhen: (): boolean => this.form().valid(),
          });
          form = fakeForm(this.data);
        }
        const cmp = new Cmp();
        TestBed.tick();

        expect(cmp.data()).toEqual({ search: 'a', category: 'books' });
        expect(store.filter()).toEqual({ search: 'a', category: 'books' });
        expect(external()).toEqual({ search: 'a', category: 'books' });
      });
    });

    it('commits the readFrom seed synchronously when the gate can run', () => {
      // a gate that does not depend on a later field must not be delayed to
      // the first tick: a one-shot reader of the store (a callWith, an
      // ngOnInit) would otherwise see the pre-link value and never be
      // corrected
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: '' } }),
        withLink('filter'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        store.linkFilter({
          readFrom: signal({ search: 'from-input' }),
          storeEditsWhen: () => true,
        });
        // no tick
        expect(store.filter()).toEqual({ search: 'from-input' });
      });
    });

    it('commits the readFrom seed even while the form is invalid', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: 'store-initial', category: 'books' } }),
        withLink('filter'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const search = signal('');
        // the form starts invalid (empty search), but readFrom is not gated,
        // so the value it supplies still reaches the store
        class Cmp {
          data = store.linkFilter({
            readFrom: (prev) => ({ ...prev, search: search() }),
            storeEditsWhen: (): boolean => this.form().valid(),
          });
          form = fakeForm(this.data);
        }
        const cmp = new Cmp();
        TestBed.tick();

        expect(cmp.form().valid()).toBe(false);
        expect(store.filter()).toEqual({ search: '', category: 'books' });

        // an edit through the returned signal is still gated on the form
        cmp.data.update((value) => ({ ...value, category: 'toys' }));
        TestBed.tick();
        expect(store.filter()).toEqual({ search: '', category: 'books' });

        search.set('now valid');
        TestBed.tick();
        expect(store.filter()).toEqual({
          search: 'now valid',
          category: 'books',
        });
      });
    });

    it('does not swallow a gate that is genuinely broken', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: '' } }),
        withLink('filter'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        // readFrom does not consult the gate, so the link itself succeeds...
        expect(() =>
          store.linkFilter({
            readFrom: signal({ search: 'a' }),
            storeEditsWhen: () => {
              throw new Error('boom');
            },
          }),
        ).not.toThrow();
        // ...but the flush effect does evaluate it, and the error has to
        // surface there rather than disappearing
        expect(() => TestBed.tick()).toThrow('boom');
      });
    });

    it('works with a real signal form built from the link', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: 'store-initial', category: 'books' } }),
        withLink('filter'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const search = signal('');
        class Cmp {
          data = store.linkFilter({
            readFrom: (prev) => ({ ...prev, search: search() }),
            storeEditsWhen: (): boolean => this.form().valid(),
          });
          form = signalForm(this.data, (path) => {
            required(path.search);
          });
        }
        const cmp = new Cmp();
        TestBed.tick();

        // the form starts invalid, but readFrom still writes through
        expect(cmp.form().valid()).toBe(false);
        expect(store.filter()).toEqual({ search: '', category: 'books' });

        // an edit through the form is gated on its validity. category, not
        // search: it has to differ from the store for the write to be
        // attempted at all, while leaving the form invalid
        cmp.data.update((value) => ({ ...value, category: 'toys' }));
        TestBed.tick();
        expect(cmp.form().valid()).toBe(false);
        expect(store.filter()).toEqual({ search: '', category: 'books' });

        search.set('typed');
        TestBed.tick();
        expect(cmp.form().valid()).toBe(true);
        expect(store.filter()).toEqual({ search: 'typed', category: 'books' });
      });
    });

    it('rethrows a gate error on an ordinary write', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ count: 1 }),
        withLink('count'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const linked = store.linkCount({
          storeEditsWhen: () => {
            throw new Error('boom');
          },
        });
        // a write through the returned signal calls the gate, so a broken
        // gate fails at the call site
        expect(() => linked.set(5)).toThrow('boom');
      });
    });

    it('does not push the readFrom value out with a form gate', () => {
      // the writeTo guard is seeded from the source, which readFrom has
      // already written by then, so the value at link time is not echoed back
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: 'store-initial' } }),
        withLink('filter'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        const pushed: { search: string }[] = [];
        class Cmp {
          data = store.linkFilter({
            readFrom: signal({ search: 'from-input' }),
            writeTo: emitInto(pushed),
            storeEditsWhen: (): boolean => this.form().valid(),
          });
          form = fakeForm(this.data);
        }
        new Cmp();
        TestBed.tick();

        expect(pushed).toEqual([]);
        expect(store.filter()).toEqual({ search: 'from-input' });
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
          storeEditsWhen: () => true,
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
        store.linkFilter({ readFrom: read, storeEditsWhen: () => true });
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
        store.linkFilter({ readFrom: read, storeEditsWhen: () => true });
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

/**
 * Stand-in for a signal form built over a linked signal: like `form()`, it is
 * a signal of a node with a `valid()` derived from the value, and it is
 * declared after the link, so `this.form()` throws while `link<Name>()` runs.
 */
function fakeForm<T extends { search: string }>(data: Signal<T>) {
  const valid = computed(() => data().search.length > 0);
  return signal({ valid });
}
