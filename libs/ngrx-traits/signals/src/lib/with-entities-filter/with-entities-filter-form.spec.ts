import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { required } from '@angular/forms/signals';
import { patchState, signalStore, type } from '@ngrx/signals';
import {
  entityConfig,
  setAllEntities,
  withEntities,
} from '@ngrx/signals/entities';

import { withEntitiesLocalFilter } from '../index';
import { mockProducts } from '../test.mocks';
import { Product } from '../test.model';
import { withEntitiesFilterForm } from './with-entities-filter-form';

describe('withEntitiesFilterForm', () => {
  const entity = type<Product>();

  describe('without collection', () => {
    const Store = signalStore(
      { protectedState: false },
      withEntities({ entity }),
      withEntitiesLocalFilter({
        entity,
        defaultFilter: { search: '', foo: 'bar' },
        filterFn: (entity, filter) =>
          !filter?.search ||
          entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
      }),
      withEntitiesFilterForm({ entity, filterOnChanges: false }),
    );

    it('should create entitiesFilterForm prop', () => {
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        expect(store.entitiesFilterForm).toBeDefined();
      });
    });

    it('should have typed fields from filter state', () => {
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        expect(store.entitiesFilterForm.search).toBeDefined();
        expect(store.entitiesFilterForm.foo).toBeDefined();
      });
    });

    it('should reflect initial filter values', () => {
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        TestBed.tick();
        expect(store.entitiesFilterForm().value()).toEqual({
          search: '',
          foo: 'bar',
        });
      });
    });

    it('should update form when filter state changes', fakeAsync(() => {
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        patchState(store, setAllEntities(mockProducts));
        store.filterEntities({ filter: { search: 'zero', foo: 'bar' } });
        tick(400);

        TestBed.tick();
        expect(store.entitiesFilterForm().value()).toEqual({
          search: 'zero',
          foo: 'bar',
        });
      });
    }));

    it('should sync valid form changes to store by default (filterOnChanges)', fakeAsync(() => {
      const StoreDefault = signalStore(
        { protectedState: false },
        withEntities({ entity }),
        withEntitiesLocalFilter({
          entity,
          defaultFilter: { search: '', foo: 'bar' },
          filterFn: (entity, filter) =>
            !filter?.search ||
            entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
        }),
        withEntitiesFilterForm({ entity }),
      );
      TestBed.runInInjectionContext(() => {
        const store = new StoreDefault();
        patchState(store, setAllEntities(mockProducts));
        store.filterEntities({
          filter: { search: '', foo: 'bar' },
          debounce: 0,
        });
        tick(400);
        expect(store.entities().length).toEqual(mockProducts.length);

        store.entitiesFilterForm.search().value.set('zero');
        TestBed.tick();
        tick(400);

        // filterOnChanges defaults to true
        expect(store.entities().length).toEqual(2);
      });
    }));
  });

  describe('with collection', () => {
    const config = entityConfig({
      entity,
      collection: 'product',
    });

    const Store = signalStore(
      { protectedState: false },
      withEntities(config),
      withEntitiesLocalFilter({
        ...config,
        defaultFilter: { search: '', foo: 'bar' },
        filterFn: (entity, filter) =>
          !filter?.search ||
          entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
      }),
      withEntitiesFilterForm({ ...config, filterOnChanges: false }),
    );

    it('should create <collection>EntitiesFilterForm prop', () => {
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        expect(store.productEntitiesFilterForm).toBeDefined();
      });
    });

    it('should have typed fields from filter state', () => {
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        expect(store.productEntitiesFilterForm.search).toBeDefined();
        expect(store.productEntitiesFilterForm.foo).toBeDefined();
      });
    });

    it('should reflect initial filter values', () => {
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        TestBed.tick();
        expect(store.productEntitiesFilterForm().value()).toEqual({
          search: '',
          foo: 'bar',
        });
      });
    });

    it('should update form when filter state changes', fakeAsync(() => {
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        patchState(store, setAllEntities(mockProducts, config));
        store.filterProductEntities({
          filter: { search: 'zero', foo: 'bar' },
        });
        tick(400);

        TestBed.tick();
        expect(store.productEntitiesFilterForm().value()).toEqual({
          search: 'zero',
          foo: 'bar',
        });
      });
    }));
  });

  describe('with filterOnChanges', () => {
    const Store = signalStore(
      { protectedState: false },
      withEntities({ entity }),
      withEntitiesLocalFilter({
        entity,
        defaultFilter: { search: '' },
        filterFn: (entity, filter) =>
          !filter?.search ||
          entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
      }),
      withEntitiesFilterForm({ entity, filterOnChanges: true }),
    );

    it('should sync valid form changes to filter', fakeAsync(() => {
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        patchState(store, setAllEntities(mockProducts));
        store.filterEntities({ filter: { search: '' }, debounce: 0 });
        tick(400);
        expect(store.entities().length).toEqual(mockProducts.length);

        store.entitiesFilterForm.search().value.set('zero');
        TestBed.tick();
        tick(400);

        expect(store.entities().length).toEqual(2);
      });
    }));
  });

  describe('with validation', () => {
    const Store = signalStore(
      { protectedState: false },
      withEntities({ entity }),
      withEntitiesLocalFilter({
        entity,
        defaultFilter: { search: '' },
        filterFn: (entity, filter) =>
          !filter?.search ||
          entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
      }),
      withEntitiesFilterForm({
        entity,
        validation: (v) => {
          required(v.search);
        },
      }),
    );

    it('should mark form invalid when validation fails', () => {
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        TestBed.tick();

        // empty search -> invalid
        expect(store.entitiesFilterForm().valid()).toBe(false);

        store.entitiesFilterForm.search().value.set('filled');
        TestBed.tick();

        expect(store.entitiesFilterForm().valid()).toBe(true);
      });
    });

    it('filterOnChanges should only filter when form is valid', fakeAsync(() => {
      const StoreWithFilterOnChanges = signalStore(
        { protectedState: false },
        withEntities({ entity }),
        withEntitiesLocalFilter({
          entity,
          defaultFilter: { search: '' },
          filterFn: (entity, filter) =>
            !filter?.search ||
            entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
        }),
        withEntitiesFilterForm({
          entity,
          filterOnChanges: true,
          validation: (v) => {
            required(v.search);
          },
        }),
      );

      TestBed.runInInjectionContext(() => {
        const store = new StoreWithFilterOnChanges();
        patchState(store, setAllEntities(mockProducts));
        store.filterEntities({ filter: { search: '' }, debounce: 0 });
        tick(400);

        // set empty (invalid) -> should not filter
        store.entitiesFilterForm.search().value.set('');
        TestBed.tick();
        tick(400);
        expect(store.entities().length).toEqual(mockProducts.length);

        // set valid value -> should filter
        store.entitiesFilterForm.search().value.set('zero');
        TestBed.tick();
        tick(400);
        expect(store.entities().length).toEqual(2);
      });
    }));
  });
});
