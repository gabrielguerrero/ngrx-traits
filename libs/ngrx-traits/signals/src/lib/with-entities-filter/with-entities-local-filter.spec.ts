import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { patchState, signalStore, type } from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';

import {
  withCallStatus,
  withEntitiesLocalFilter,
  withEntitiesLocalPagination,
  withEntitiesMultiSelection,
  withEntitiesSingleSelection,
} from '../index';
import { mockProducts } from '../test.mocks';
import { Product } from '../test.model';

describe('withEntitiesLocalFilter', () => {
  const entity = type<Product>();
  const collection = 'products';
  const Store = signalStore(
    withEntities({
      entity,
    }),
    withEntitiesLocalFilter({
      entity,
      defaultFilter: { search: '', foo: 'bar' },
      filterFn: (entity, filter) =>
        !filter?.search ||
        entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
    }),
  );

  it('should filter entities and store filter', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      store.filterEntities({
        filter: { search: 'zero', foo: 'bar2' },
      });
      expect(store.entities().length).toEqual(mockProducts.length);
      tick(400);
      expect(store.entities().length).toEqual(2);
      expect(store.entities()).toEqual([
        {
          description: 'Super Nintendo Game',
          id: '1',
          name: 'F-Zero',
          price: 12,
        },
        {
          description: 'GameCube Game',
          id: '80',
          name: 'F-Zero GX',
          price: 55,
        },
      ]);
      expect(store.entitiesFilter()).toEqual({ search: 'zero', foo: 'bar2' });
    });
  }));

  it('should filter entities after debounce', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      store.filterEntities({
        filter: { search: 'zero', foo: 'bar2' },
        debounce: 1000,
      });
      expect(store.entities().length).toEqual(mockProducts.length);
      tick(1100);
      expect(store.entities().length).toEqual(2);
    });
  }));

  it('should filter entities using previous filter when withCallStatus loaded', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const Store = signalStore(
        withEntities({
          entity,
        }),
        withCallStatus(),
        withEntitiesLocalFilter({
          entity,
          defaultFilter: { search: 'zero', foo: 'bar2' },
          filterFn: (entity, filter) =>
            !filter?.search ||
            entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
        }),
      );
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      store.setLoaded();
      TestBed.flushEffects();
      expect(store.entities().length).toEqual(2);
      expect(store.entities()).toEqual([
        {
          description: 'Super Nintendo Game',
          id: '1',
          name: 'F-Zero',
          price: 12,
        },
        {
          description: 'GameCube Game',
          id: '80',
          name: 'F-Zero GX',
          price: 55,
        },
      ]);
      expect(store.entitiesFilter()).toEqual({ search: 'zero', foo: 'bar2' });
    });
  }));
  it('should filter entities after default debounce', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const Store = signalStore(
        withEntities({
          entity,
        }),
        withEntitiesLocalFilter({
          entity,
          defaultFilter: { search: '', foo: 'bar' },
          defaultDebounce: 1000,
          filterFn: (entity, filter) =>
            !filter?.search ||
            entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
        }),
      );
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      store.filterEntities({
        filter: { search: 'zero', foo: 'bar2' },
      });
      expect(store.entities().length).toEqual(mockProducts.length);
      tick(1100);
      expect(store.entities().length).toEqual(2);
    });
  }));

  it('should filter entities immediately when forceLoad is true', () => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      store.filterEntities({
        filter: { search: 'zero', foo: 'bar2' },
        forceLoad: true,
      });
      expect(store.entities().length).toEqual(2);
    });
  });

  it('should merge new filter with previous if patch true is set ', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      store.filterEntities({
        filter: { search: 'zero' },
        patch: true,
      });
      expect(store.entities().length).toEqual(mockProducts.length);
      tick(400);
      expect(store.entities().length).toEqual(2);
      store.filterEntities({
        filter: { search: 'zero', foo: 'bar' },
        forceLoad: true,
      });
    });
  }));

  it(' should resetPage to and selection when filter is executed', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const Store = signalStore(
        withEntities({
          entity,
        }),
        withEntitiesLocalPagination({ entity }),
        withEntitiesSingleSelection({ entity }),
        withEntitiesMultiSelection({ entity }),
        withEntitiesLocalFilter({
          entity,
          defaultFilter: { search: '', foo: 'bar' },
          filterFn: (entity, filter) =>
            !filter?.search ||
            entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
        }),
      );
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      store.selectEntity({ id: mockProducts[0].id });
      store.selectEntities({ ids: [mockProducts[2].id, mockProducts[3].id] });
      store.loadEntitiesPage({ pageIndex: 3 });
      expect(store.entitySelected()).toEqual(mockProducts[0]);
      expect(store.entitiesSelected?.()).toEqual([
        mockProducts[2],
        mockProducts[3],
      ]);
      expect(store.entitiesCurrentPage().pageIndex).toEqual(3);

      store.filterEntities({
        filter: { search: 'zero' },
        patch: true,
      });
      tick(400);
      // check selection and page reset
      expect(store.entitySelected()).toEqual(undefined);
      expect(store.entitiesSelected()).toEqual([]);
      expect(store.entitiesCurrentPage().pageIndex).toEqual(0);
      // check filter
      expect(store.entities().length).toEqual(2);
    });
  }));

  it(' should rename props when collection param is set', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const Store = signalStore(
        withEntities({
          entity,
          collection,
        }),
        withEntitiesLocalPagination({ entity, collection }),
        withEntitiesLocalFilter({
          entity,
          collection,
          defaultFilter: { search: '', foo: 'bar' },
          filterFn: (entity, filter) =>
            !filter?.search ||
            entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
        }),
      );
      const store = new Store();
      patchState(store, setAllEntities(mockProducts, { collection }));
      store.loadProductsPage({ pageIndex: 3 });
      expect(store.productsCurrentPage().pageIndex).toEqual(3);

      store.filterProductsEntities({
        filter: { search: 'zero' },
        patch: true,
      });
      tick(400);
      expect(store.productsEntities().length).toEqual(2);
      expect(store.productsEntities()).toEqual([
        {
          description: 'Super Nintendo Game',
          id: '1',
          name: 'F-Zero',
          price: 12,
        },
        {
          description: 'GameCube Game',
          id: '80',
          name: 'F-Zero GX',
          price: 55,
        },
      ]);
      expect(store.productsFilter()).toEqual({ search: 'zero', foo: 'bar' });
    });
  }));
});
