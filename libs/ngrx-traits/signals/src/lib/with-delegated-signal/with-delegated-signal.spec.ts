import { TestBed } from '@angular/core/testing';
import { patchState, signalStore, withState } from '@ngrx/signals';

import { withDelegatedSignal } from './with-delegated-signal';

describe('withDelegatedSignal', () => {

  describe('prop naming', () => {
    it('string shorthand creates <source>Delegated prop', () => {
      const Store = signalStore(
        withState({ filter: { search: '' } }),
        withDelegatedSignal('filter'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        expect(store.filterDelegated).toBeDefined();
      });
    });

    it('config without name creates <source>Delegated prop', () => {
      const Store = signalStore(
        withState({ filter: { search: '' } }),
        withDelegatedSignal({ source: 'filter' }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        expect(store.filterDelegated).toBeDefined();
      });
    });

    it('config with explicit name uses that name', () => {
      const Store = signalStore(
        withState({ filter: { search: '' } }),
        withDelegatedSignal({ name: 'myDelegated', source: 'filter' }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        expect(store.myDelegated).toBeDefined();
      });
    });

    it('multiple withDelegatedSignal calls produce separate props', () => {
      const Store = signalStore(
        withState({ filter: { search: '' }, settings: { theme: 'dark' } }),
        withDelegatedSignal('filter'),
        withDelegatedSignal('settings'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        expect(store.filterDelegated).toBeDefined();
        expect(store.settingsDelegated).toBeDefined();
      });
    });
  });


  describe('initial value', () => {
    it('delegated signal has the same initial value as source', () => {
      const Store = signalStore(
        withState({ filter: { search: 'hello' } }),
        withDelegatedSignal({ source: 'filter' }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        expect(store.filterDelegated()).toEqual({ search: 'hello' });
      });
    });
  });


  describe('update', () => {
    it('string shorthand defaults to patchState sync', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: 'initial' } }),
        withDelegatedSignal('filter'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        TestBed.tick();

        store.filterDelegated.set({ search: 'updated' });
        TestBed.tick();

        expect(store.filter()).toEqual({ search: 'updated' });
      });
    });

    it('update patchState syncs delegated signal to store', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: 'initial' } }),
        withDelegatedSignal({ source: 'filter' }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        TestBed.tick();

        store.filterDelegated.set({ search: 'updated' });
        TestBed.tick();

        expect(store.filter()).toEqual({ search: 'updated' });
      });
    });

    it('custom update callback receives signal and store', () => {
      const updateSpy = vi.fn();
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: 'initial' } }),
        withDelegatedSignal({ source: 'filter', update: updateSpy }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        TestBed.tick();

        store.filterDelegated.set({ search: 'updated' });
        TestBed.tick();

        expect(updateSpy).toHaveBeenCalled();
        const [signalArg, storeArg] = updateSpy.mock.calls[0];
        expect(signalArg).toBeDefined();
        expect(signalArg()).toEqual({ search: 'initial' });
        expect(storeArg).toBeDefined();
        expect(storeArg.filter).toBeDefined();
      });
    });
  });


  describe('store to delegated signal sync', () => {
    it('patchState on source updates delegated signal', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: 'initial' } }),
        withDelegatedSignal({ source: 'filter' }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        TestBed.tick();

        patchState(store, { filter: { search: 'fromStore' } });
        TestBed.tick();

        expect(store.filterDelegated()).toEqual({ search: 'fromStore' });
      });
    });
  });

  describe('computation + update', () => {
    it('creates a delegated signal from computation joining multiple state props', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({
          user: { name: 'John', email: 'john@test.com' },
          permissions: ['read', 'write'],
        }),
        withDelegatedSignal({
          name: 'userDetail',
          computation: (store: any) => ({
            ...store.user(),
            permissions: store.permissions(),
          }),
          update: (value: any, store: any) => {
            const { permissions, ...user } = value;
            patchState(store, { user, permissions });
          },
        }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        expect(store.userDetail()).toEqual({
          name: 'John',
          email: 'john@test.com',
          permissions: ['read', 'write'],
        });
      });
    });

    it('.set() triggers update callback and patches state back', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({
          user: { name: 'John', email: 'john@test.com' },
          permissions: ['read'],
        }),
        withDelegatedSignal({
          name: 'userDetail',
          computation: (store: any) => ({
            ...store.user(),
            permissions: store.permissions(),
          }),
          update: (value: any, store: any) => {
            const { permissions, ...user } = value;
            patchState(store, { user, permissions });
          },
        }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();

        store.userDetail.set({
          name: 'Jane',
          email: 'jane@test.com',
          permissions: ['read', 'write', 'admin'],
        });
        TestBed.tick();

        expect(store.user()).toEqual({ name: 'Jane', email: 'jane@test.com' });
        expect(store.permissions()).toEqual(['read', 'write', 'admin']);
      });
    });

    it('store state changes flow through to computed signal', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({
          user: { name: 'John', email: 'john@test.com' },
          permissions: ['read'],
        }),
        withDelegatedSignal({
          name: 'userDetail',
          computation: (store: any) => ({
            ...store.user(),
            permissions: store.permissions(),
          }),
          update: (value: any, store: any) => {
            const { permissions, ...user } = value;
            patchState(store, { user, permissions });
          },
        }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        TestBed.tick();

        patchState(store, { permissions: ['read', 'write'] });
        TestBed.tick();

        expect(store.userDetail().permissions).toEqual(['read', 'write']);
        expect(store.userDetail().name).toBe('John');
      });
    });
  });

  // ── Primitive values ───────────────────────────────────────────

  describe('primitive values', () => {
    it('works with primitive state values', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ count: 0 }),
        withDelegatedSignal('count'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        TestBed.tick();

        expect(store.countDelegated()).toBe(0);

        store.countDelegated.set(42);
        TestBed.tick();

        expect(store.count()).toBe(42);
      });
    });

    it('works with string state values', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ name: 'hello' }),
        withDelegatedSignal('name'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        TestBed.tick();

        expect(store.nameDelegated()).toBe('hello');

        store.nameDelegated.set('world');
        TestBed.tick();

        expect(store.name()).toBe('world');
      });
    });
  });
});
