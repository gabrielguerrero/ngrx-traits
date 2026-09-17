import {
  computed,
  EventEmitter,
  Injector,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { signalStore, withComputed, withState } from '@ngrx/signals';

import { copySignal } from './copy-signal';
import { withLink } from './with-link';

/**
 * An emit-only target, the shape of an `output()`: it can be emitted but not
 * read, so only the last value read guards against repeats.
 */
function emitInto<T>(collected: T[]): EventEmitter<T> {
  const emitter = new EventEmitter<T>();
  emitter.subscribe((value) => collected.push(value));
  return emitter;
}

describe('copySignal', () => {
  // ── Copying ────────────────────────────────────────────────────

  describe('signal to signal', () => {
    it('copies the value at call time, before the first tick', () => {
      TestBed.runInInjectionContext(() => {
        const source = signal('a');
        const target = signal('');
        copySignal(source, target);
        expect(target()).toBe('a');
      });
    });

    it('copies later changes', () => {
      TestBed.runInInjectionContext(() => {
        const source = signal('a');
        const target = signal('');
        copySignal(source, target);
        source.set('b');
        TestBed.tick();
        expect(target()).toBe('b');
      });
    });

    it('does not write back: the target can be edited on its own', () => {
      TestBed.runInInjectionContext(() => {
        const source = signal('a');
        const target = signal('');
        copySignal(source, target);
        target.set('local');
        TestBed.tick();
        expect(target()).toBe('local');
        expect(source()).toBe('a');
      });
    });

    it('copies into a model()', () => {
      TestBed.runInInjectionContext(() => {
        const source = signal('a');
        const target = model('');
        copySignal(source, target);
        expect(target()).toBe('a');
        source.set('b');
        TestBed.tick();
        expect(target()).toBe('b');
      });
    });

    it('copies from a computed', () => {
      TestBed.runInInjectionContext(() => {
        const first = signal('a');
        const last = signal('b');
        const target = signal('');
        copySignal(
          computed(() => `${first()} ${last()}`),
          target,
        );
        expect(target()).toBe('a b');
        last.set('c');
        TestBed.tick();
        expect(target()).toBe('a c');
      });
    });

    it('stops copying once the returned ref is destroyed', () => {
      TestBed.runInInjectionContext(() => {
        const source = signal('a');
        const target = signal('');
        const ref = copySignal(source, target);
        ref.destroy();
        source.set('b');
        TestBed.tick();
        expect(target()).toBe('a');
      });
    });

    it('accepts an injector instead of an injection context', () => {
      const injector = TestBed.inject(Injector);
      const source = signal('a');
      const target = signal('');
      copySignal(source, target, { injector });
      expect(target()).toBe('a');
      source.set('b');
      TestBed.tick();
      expect(target()).toBe('b');
    });

    it('throws without an injection context, before writing anything', () => {
      const emitted: string[] = [];
      const source = signal('a');
      const target = signal('');
      expect(() => copySignal(source, target)).toThrow();
      // the check comes first, so nothing was written and, for an output,
      // nothing was emitted that could not be taken back
      expect(target()).toBe('');
      expect(() => copySignal(source, emitInto(emitted))).toThrow();
      expect(emitted).toEqual([]);
    });
  });

  // ── Function source ────────────────────────────────────────────

  describe('function source', () => {
    it('tracks the signals it reads, like a computed', () => {
      TestBed.runInInjectionContext(() => {
        const search = signal('a');
        const page = signal(1);
        const target = signal({ search: '', page: 0 });
        copySignal(() => ({ search: search(), page: page() }), target);
        expect(target()).toEqual({ search: 'a', page: 1 });
        page.set(2);
        TestBed.tick();
        expect(target()).toEqual({ search: 'a', page: 2 });
      });
    });

    it('maps into the target type', () => {
      TestBed.runInInjectionContext(() => {
        const filter = signal({ search: 'a' });
        const target = signal('');
        copySignal(() => filter().search, target);
        expect(target()).toBe('a');
        filter.set({ search: 'b' });
        TestBed.tick();
        expect(target()).toBe('b');
      });
    });

    it('an edit to the target survives a recompute that changes nothing', () => {
      TestBed.runInInjectionContext(() => {
        const filter = signal({ search: 'a', page: 1 });
        const target = signal('');
        copySignal(() => filter().search, target);
        target.set('edited');
        // the source re-runs, but produces what it copied last time
        filter.set({ search: 'a', page: 2 });
        TestBed.tick();
        expect(target()).toBe('edited');
        // a real change is copied
        filter.set({ search: 'b', page: 2 });
        TestBed.tick();
        expect(target()).toBe('b');
      });
    });

    it('copies a rebuilt value once, not again on the first effect run', () => {
      TestBed.runInInjectionContext(() => {
        const emitted: { id: number }[][] = [];
        const items = signal([{ id: 1 }]);
        // fresh objects on every run, which the default equal does not match
        // element by element: only the memoized source stops a second copy
        copySignal(
          () => items().map((item) => ({ ...item })),
          emitInto(emitted),
        );
        TestBed.tick();
        expect(emitted).toEqual([[{ id: 1 }]]);
      });
    });

    it("with 'reference', a function source is copied once", () => {
      TestBed.runInInjectionContext(() => {
        const emitted: { a: number }[] = [];
        const a = signal(1);
        copySignal(() => ({ a: a() }), emitInto(emitted), {
          equal: 'reference',
        });
        TestBed.tick();
        expect(emitted).toEqual([{ a: 1 }]);
      });
    });

    it('does not overwrite a target set before the first tick', () => {
      TestBed.runInInjectionContext(() => {
        const items = signal([{ id: 1 }]);
        const target = signal<{ id: number }[]>([]);
        copySignal(() => items().map((item) => ({ ...item })), target);
        // e.g. the parent binding of a model(), set after the copy was created
        target.set([{ id: 9 }]);
        TestBed.tick();
        expect(target()).toEqual([{ id: 9 }]);
      });
    });

    it('an error that is not a skip propagates', () => {
      TestBed.runInInjectionContext(() => {
        const target = signal('');
        expect(() =>
          copySignal((): string => {
            throw new Error('boom');
          }, target),
        ).toThrow('boom');
      });
    });

    it('recovers from a later error on the next change', () => {
      TestBed.runInInjectionContext(() => {
        const source = signal(1);
        const target = signal(0);
        copySignal(() => {
          if (source() < 0) throw new Error('negative');
          return source();
        }, target);
        source.set(-1);
        expect(() => TestBed.tick()).toThrow('negative');
        expect(target()).toBe(1);
        source.set(2);
        TestBed.tick();
        expect(target()).toBe(2);
      });
    });
  });

  // ── skip ───────────────────────────────────────────────────────

  describe('skip', () => {
    it('leaves the target as it is', () => {
      TestBed.runInInjectionContext(() => {
        const source = signal('a');
        const target = signal('initial');
        copySignal((skip) => (source() === 'a' ? skip() : source()), target);
        expect(target()).toBe('initial');
        source.set('b');
        TestBed.tick();
        expect(target()).toBe('b');
      });
    });

    it('pushes nothing to an emit-only target', () => {
      TestBed.runInInjectionContext(() => {
        const emitted: string[] = [];
        const filter = signal({ search: '' });
        copySignal((skip) => filter().search || skip(), emitInto(emitted));
        expect(emitted).toEqual([]);
        filter.set({ search: 'a' });
        TestBed.tick();
        expect(emitted).toEqual(['a']);
      });
    });

    it('is honoured when called outside a return', () => {
      TestBed.runInInjectionContext(() => {
        const source = signal('a');
        const target = signal('initial');
        copySignal((skip) => {
          // not returned, and nested a call deep: it is the throw that
          // rejects the value, not the return
          const reject = () => skip();
          if (source() === 'a') reject();
          return source();
        }, target);
        expect(target()).toBe('initial');
      });
    });

    it('keeps tracking the signals read before it', () => {
      TestBed.runInInjectionContext(() => {
        const source = signal('');
        const target = signal('initial');
        copySignal((skip) => source() || skip(), target);
        // skipped on the first read, still re-run when the source changes
        source.set('a');
        TestBed.tick();
        expect(target()).toBe('a');
      });
    });

    it('a return to the last copied value after a skip is not copied again', () => {
      TestBed.runInInjectionContext(() => {
        const source = signal('a');
        const target = signal('');
        copySignal((skip) => (source() === 'x' ? skip() : source()), target);
        expect(target()).toBe('a');
        source.set('x');
        TestBed.tick();
        target.set('edited');
        // back to what was copied last: not a change, so the edit survives
        source.set('a');
        TestBed.tick();
        expect(target()).toBe('edited');
      });
    });
  });

  // ── Emit-only targets ──────────────────────────────────────────

  describe('emit-only target', () => {
    it('emits the value at call time and every change after it', () => {
      TestBed.runInInjectionContext(() => {
        const emitted: string[] = [];
        const source = signal('a');
        copySignal(source, emitInto(emitted));
        expect(emitted).toEqual(['a']);
        source.set('b');
        TestBed.tick();
        expect(emitted).toEqual(['a', 'b']);
      });
    });

    it('does not emit a value equal to the last one it was given', () => {
      TestBed.runInInjectionContext(() => {
        const emitted: { search: string }[] = [];
        const source = signal({ search: 'a' });
        copySignal(source, emitInto(emitted));
        // a fresh object with the same content: equal by the default
        // content comparison, so nothing is emitted
        source.set({ search: 'a' });
        TestBed.tick();
        expect(emitted).toEqual([{ search: 'a' }]);
      });
    });

    it('emits to an output()', () => {
      TestBed.runInInjectionContext(() => {
        const emitted: string[] = [];
        const changed = output<string>();
        changed.subscribe((value) => emitted.push(value));
        const source = signal('a');
        copySignal(source, changed);
        source.set('b');
        TestBed.tick();
        expect(emitted).toEqual(['a', 'b']);
      });
    });

    it('does not re-emit the value it was last given, across a skip', () => {
      TestBed.runInInjectionContext(() => {
        const emitted: string[] = [];
        const source = signal('a');
        copySignal(
          (skip) => (source() === 'a' ? skip() : source()),
          emitInto(emitted),
        );
        source.set('b');
        TestBed.tick();
        source.set('a');
        TestBed.tick();
        source.set('b');
        TestBed.tick();
        // 'b' is still the last value read — the skipped 'a' does not replace
        // it — so the return to it is not emitted again
        expect(emitted).toEqual(['b']);
      });
    });
  });

  // ── Equality ───────────────────────────────────────────────────

  describe('equal', () => {
    it('does not write a value equal by content to what the target holds', () => {
      TestBed.runInInjectionContext(() => {
        const source = signal({ search: 'a' });
        const target = signal({ search: 'a' });
        const initial = untracked(target);
        copySignal(source, target);
        // same content, so the target keeps the object it already had
        expect(target()).toBe(initial);
      });
    });

    it('takes a premade name, typed from the target', () => {
      TestBed.runInInjectionContext(() => {
        const source = signal([{ id: 1, name: 'a' }]);
        const target = signal<{ id: number; name: string }[]>([]);
        copySignal(source, target, { equal: 'array.id' });
        expect(target()).toEqual([{ id: 1, name: 'a' }]);
        // same ids, different content: not a change under 'array.id'
        source.set([{ id: 1, name: 'renamed' }]);
        TestBed.tick();
        expect(target()).toEqual([{ id: 1, name: 'a' }]);
        source.set([{ id: 2, name: 'b' }]);
        TestBed.tick();
        expect(target()).toEqual([{ id: 2, name: 'b' }]);
      });
    });

    it('compares a nullable target by property name', () => {
      TestBed.runInInjectionContext(() => {
        const source = signal<{ id: number; name: string } | null>(null);
        const target = signal<{ id: number; name: string } | null>({
          id: 0,
          name: 'x',
        });
        copySignal(source, target, { equal: 'id' });
        expect(target()).toBeNull();
        source.set({ id: 1, name: 'a' });
        TestBed.tick();
        expect(target()).toEqual({ id: 1, name: 'a' });
        // same id: not a change under 'id'
        source.set({ id: 1, name: 'b' });
        TestBed.tick();
        expect(target()).toEqual({ id: 1, name: 'a' });
        source.set(null);
        TestBed.tick();
        expect(target()).toBeNull();
      });
    });

    it('takes a custom function', () => {
      TestBed.runInInjectionContext(() => {
        const source = signal('a');
        const target = signal('');
        // only the first letter counts as a change
        copySignal(source, target, { equal: (a, b) => a[0] === b[0] });
        expect(target()).toBe('a');
        source.set('ab');
        TestBed.tick();
        expect(target()).toBe('a');
        source.set('b');
        TestBed.tick();
        expect(target()).toBe('b');
      });
    });

    it('applies to a mapped value, which is in the target type', () => {
      TestBed.runInInjectionContext(() => {
        const emitted: { id: number; name: string }[] = [];
        const id = signal(1);
        const name = signal('a');
        copySignal(() => ({ id: id(), name: name() }), emitInto(emitted), {
          equal: 'id',
        });
        // a new name with the same id is not a change under 'id'
        name.set('b');
        TestBed.tick();
        expect(emitted).toEqual([{ id: 1, name: 'a' }]);
        id.set(2);
        TestBed.tick();
        expect(emitted).toEqual([
          { id: 1, name: 'a' },
          { id: 2, name: 'b' },
        ]);
      });
    });
  });

  // ── Types ──────────────────────────────────────────────────────

  describe('compile time', () => {
    it('checks the source against the target type', () => {
      // never called: these calls are here to be type checked, not run
      const typeCheck = () => {
        const search = signal('');
        const filter = signal({ search: '' });
        const wide = signal({ search: '', page: 1 });
        const nullable = signal<string | null>(null);

        // @ts-expect-error the source's type is not the target's
        copySignal(search, filter);
        // mapped in the source function it fits
        copySignal(() => ({ search: search() }), filter);
        // a related type is not an assignable one: the source has no page to
        // give. `set` is a method, so this only errors because the source is
        // what is checked
        // @ts-expect-error the source has no page to give
        copySignal(filter, wide);
        // @ts-expect-error null does not fit a string target
        copySignal(nullable, signal(''));
        // a narrower source into a wider target is fine, nothing is missing
        copySignal(signal('a'), nullable);
      };
      expect(typeCheck).toBeDefined();
    });

    it('types skip, and equal from the target', () => {
      // never called: these calls are here to be type checked, not run
      const typeCheck = () => {
        const search = signal('');
        const filter = signal({ search: '', page: 1 });
        // skip() is never, so it does not widen what the source returns
        copySignal((skip) => search() || skip(), signal(''));
        copySignal(filter, filter, { equal: 'search' });
        // @ts-expect-error 'missing' is not a property of the value
        copySignal(filter, filter, { equal: 'missing' });
      };
      expect(typeCheck).toBeDefined();
    });

    it('offers property names for a nullable or optional target', () => {
      // never called: these calls are here to be type checked, not run
      const typeCheck = () => {
        const item = signal({ id: 1, name: 'a' });
        const nullable = signal<{ id: number; name: string } | null>(null);
        copySignal(item, nullable, { equal: 'id' });
        const list = signal([{ id: 1 }]);
        const optional = signal<{ id: number }[] | undefined>(undefined);
        copySignal(list, optional, { equal: 'array.id' });
        // @ts-expect-error 'missing' is still not a property of the value
        copySignal(item, nullable, { equal: 'missing' });
      };
      expect(typeCheck).toBeDefined();
    });

    it('takes a writable target, and nothing a link takes', () => {
      // never called: these calls are here to be type checked, not run
      const typeCheck = () => {
        const source = signal('a');
        // @ts-expect-error the target is a sink, not a callback
        copySignal(source, (value: string) => value);
        const readOnly = computed(() => 'a');
        // @ts-expect-error a read-only signal can not be written to
        copySignal(source, readOnly);
        // @ts-expect-error the target is required
        copySignal(source);
        // @ts-expect-error storeEditsWhen belongs to a link, not a copy
        copySignal(source, signal(''), { storeEditsWhen: () => true });
        // @ts-expect-error there are no maps, the source function maps
        copySignal(source, signal(''), { writeMap: (value: string) => value });
      };
      expect(typeCheck).toBeDefined();
    });
  });

  // ── Echo suppression ───────────────────────────────────────────

  describe('echo suppression', () => {
    it('settles when the source reads the target it writes', () => {
      TestBed.runInInjectionContext(() => {
        const search = signal('a');
        const target = signal({ search: '', page: 3 });
        let reads = 0;
        // a merge into the target: it is read in the source, so a write that
        // changes nothing stops the cycle
        copySignal(() => {
          reads++;
          return { ...target(), search: search() };
        }, target);
        TestBed.tick();
        const settled = reads;
        expect(target()).toEqual({ search: 'a', page: 3 });
        search.set('b');
        TestBed.tick();
        expect(target()).toEqual({ search: 'b', page: 3 });
        // a bounded number of reads: the copy does not keep feeding itself
        expect(reads).toBeLessThanOrEqual(settled + 3);
      });
    });

    it('does not write an object rebuilt on every read', () => {
      TestBed.runInInjectionContext(() => {
        const first = signal('a');
        const target = signal({ name: 'a' });
        // a fresh object every read, never reference-equal to itself
        copySignal(() => ({ name: first() }), target);
        const settled = untracked(target);
        TestBed.tick();
        expect(target()).toBe(settled);
      });
    });

    it('reference equality writes what content equality would drop', () => {
      TestBed.runInInjectionContext(() => {
        const source = signal({ search: 'a' });
        const target = signal({ search: 'a' });
        const initial = untracked(target);
        copySignal(source, target, { equal: 'reference' });
        expect(target()).not.toBe(initial);
      });
    });
  });

  // ── With withLink ──────────────────────────────────────────────

  describe('two links over one model', () => {
    // the doc example: the model holds the whole object, each link owns a
    // slice of it, and the store computes both back together for the copy
    type Checkout = {
      name: string;
      email: string;
      street: string;
      city: string;
    };
    const empty: Checkout = { name: '', email: '', street: '', city: '' };

    const CheckoutStore = signalStore(
      { protectedState: false },
      withState({
        contact: { name: '', email: '' },
        address: { street: '', city: '' },
      }),
      withLink('contact'),
      withLink('address'),
      withComputed(({ contact, address }) => ({
        checkout: computed<Checkout>(() => ({ ...contact(), ...address() })),
      })),
    );

    function setup() {
      const store = new CheckoutStore();
      const model = signal<Checkout>(empty);
      const contactData = store.linkContact({
        readFrom: model,
        readMap: ({ name, email }) => ({ name, email }),
      });
      const addressData = store.linkAddress({
        readFrom: model,
        readMap: ({ street, city }) => ({ street, city }),
      });
      copySignal(store.checkout, model);
      return { store, model, contactData, addressData };
    }

    it('writes both slices back to the model as one object', () => {
      TestBed.runInInjectionContext(() => {
        const { model, contactData, addressData } = setup();
        contactData.set({ name: 'ada', email: 'ada@mail.com' });
        TestBed.tick();
        expect(model()).toEqual({
          ...empty,
          name: 'ada',
          email: 'ada@mail.com',
        });
        addressData.set({ street: '1 Main St', city: 'Bristol' });
        TestBed.tick();
        expect(model()).toEqual({
          name: 'ada',
          email: 'ada@mail.com',
          street: '1 Main St',
          city: 'Bristol',
        });
      });
    });

    it('a write from the parent reaches both slices, and does not echo', () => {
      TestBed.runInInjectionContext(() => {
        const { store, model, contactData, addressData } = setup();
        const filled: Checkout = {
          name: 'ada',
          email: 'ada@mail.com',
          street: '1 Main St',
          city: 'Bristol',
        };
        model.set(filled);
        TestBed.tick();
        expect(contactData()).toEqual({ name: 'ada', email: 'ada@mail.com' });
        expect(addressData()).toEqual({
          street: '1 Main St',
          city: 'Bristol',
        });
        expect(store.checkout()).toEqual(filled);
        // the copy pushes the recombined value back, which the model already
        // holds, so the object the parent set is left untouched
        expect(model()).toBe(filled);
      });
    });
  });
});
