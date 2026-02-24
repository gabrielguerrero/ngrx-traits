import { TestBed } from '@angular/core/testing';
import { required } from '@angular/forms/signals';
import { patchState, signalStore, withState } from '@ngrx/signals';

import { withForm } from './with-form';

describe('withForm', () => {
  // ── Prop naming ────────────────────────────────────────────────

  describe('prop naming', () => {
    it('string shorthand creates <source>Form prop', () => {
      const Store = signalStore(
        withState({ filter: { search: '' } }),
        withForm('filter'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        expect(store.filterForm).toBeDefined();
      });
    });

    it('config without name creates <source>Form prop', () => {
      const Store = signalStore(
        withState({ filter: { search: '' } }),
        withForm({ source: 'filter' }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        expect(store.filterForm).toBeDefined();
      });
    });

    it('config with explicit name uses that name', () => {
      const Store = signalStore(
        withState({ filter: { search: '' } }),
        withForm({ name: 'myForm', source: 'filter' }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        expect(store.myForm).toBeDefined();
      });
    });

    it('multiple withForm calls produce separate props', () => {
      const Store = signalStore(
        withState({ filter: { search: '' }, settings: { theme: 'dark' } }),
        withForm('filter'),
        withForm('settings'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        expect(store.filterForm).toBeDefined();
        expect(store.settingsForm).toBeDefined();
      });
    });
  });

  // ── onChange behavior ──────────────────────────────────────────

  describe('onChange', () => {
    it('string shorthand defaults to patchState sync', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: 'initial' } }),
        withForm('filter'),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        TestBed.tick();

        store.filterForm.search().value.set('updated');
        TestBed.tick();

        expect(store.filter()).toEqual({ search: 'updated' });
      });
    });

    it('onChange patchState syncs form to store', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: 'initial' } }),
        withForm({ source: 'filter', onChange: 'patchState' }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        TestBed.tick();

        store.filterForm.search().value.set('updated');
        TestBed.tick();

        expect(store.filter()).toEqual({ search: 'updated' });
      });
    });

    it('onChange patchStateIfValid only patches when form is valid', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: '' } }),
        withForm({
          source: 'filter',
          onChange: 'patchStateIfValid',
          validation: (v) => {
            required(v.search);
          },
        }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        TestBed.tick();

        // empty search -> invalid, state should not change
        store.filterForm.search().value.set('');
        TestBed.tick();
        expect(store.filter()).toEqual({ search: '' });

        // valid value -> state should update
        store.filterForm.search().value.set('valid');
        TestBed.tick();
        expect(store.filter()).toEqual({ search: 'valid' });
      });
    });

    it('onChange null does not sync', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: 'initial' } }),
        withForm({ source: 'filter', onChange: null }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        TestBed.tick();

        store.filterForm.search().value.set('updated');
        TestBed.tick();

        // state stays unchanged
        expect(store.filter()).toEqual({ search: 'initial' });
      });
    });

    it('custom onChange callback receives form and store', () => {
      const onChangeSpy = vi.fn();
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: 'initial' } }),
        withForm({ source: 'filter', onChange: onChangeSpy }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        TestBed.tick();

        store.filterForm.search().value.set('updated');
        TestBed.tick();

        expect(onChangeSpy).toHaveBeenCalled();
        // first arg is the form FieldTree, second is the store
        const [formArg, storeArg] = onChangeSpy.mock.calls[0];
        expect(formArg).toBeDefined();
        expect(storeArg).toBeDefined();
        expect(storeArg.filter).toBeDefined();
      });
    });
  });

  // ── linkedSignal (store → form sync) ──────────────────────────

  describe('store to form sync', () => {
    it('patchState on source updates linked form', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ filter: { search: 'initial' } }),
        withForm({ source: 'filter', onChange: null }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        TestBed.tick();

        patchState(store, { filter: { search: 'fromStore' } });
        TestBed.tick();

        expect(store.filterForm().value()).toEqual({ search: 'fromStore' });
      });
    });
  });

  // ── Validation ─────────────────────────────────────────────────

  describe('validation', () => {
    it('validation function marks field invalid when empty', () => {
      const Store = signalStore(
        withState({ filter: { search: '' } }),
        withForm({
          source: 'filter',
          onChange: null,
          validation: (v) => {
            required(v.search);
          },
        }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        TestBed.tick();

        expect(store.filterForm().valid()).toBe(false);

        store.filterForm.search().value.set('filled');
        TestBed.tick();

        expect(store.filterForm().valid()).toBe(true);
      });
    });
  });
});
