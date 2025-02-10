import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { patchState, signalStore, type, withState } from '@ngrx/signals';
import {
  entityConfig,
  setAllEntities,
  withEntities,
} from '@ngrx/signals/entities';
import { of } from 'rxjs';

import {
  withCallStatus,
  withEntitiesHybridFilter,
  withEntitiesLoadingCall,
  withEntitiesLocalPagination,
  withEntitiesMultiSelection,
  withEntitiesRemotePagination,
  withEntitiesSingleSelection,
} from '../index';
import { mockProducts } from '../test.mocks';
import { Product } from '../test.model';

describe('withEntitiesHybridFilter', () => {
  type Filter = { search: string; categoryId: string };
  describe('local filter', () => {
    const entity = type<Product>();
    const collection = 'products';
    const Store = signalStore(
      { protectedState: false },
      withEntities({
        entity,
      }),
      withCallStatus(),
      withEntitiesHybridFilter({
        entity,
        defaultFilter: { search: '', categoryId: 'snes' },
        isRemoteFilter: (previous, current) =>
          previous.categoryId !== current.categoryId,
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
          filter: { search: 'zero', categoryId: 'snes' },
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
            categoryId: 'snes',
          },
          {
            description: 'GameCube Game',
            id: '80',
            name: 'F-Zero GX',
            price: 55,
            categoryId: 'gamecube',
          },
        ]);
        expect(store.entitiesFilter()).toEqual({
          search: 'zero',
          categoryId: 'snes',
        });
        expect(store.entitiesFilter.search()).toEqual('zero');
      });
    }));

    it('should allow to set default filter from previous state', fakeAsync(() => {
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          { protectedState: false },
          withState({ myDefault: { search: '', categoryId: 'snes' } }),
          withEntities({
            entity,
          }),
          withCallStatus(),
          withEntitiesHybridFilter(({ myDefault }) => ({
            entity,
            defaultFilter: myDefault(),
            isRemoteFilter: (previous: Filter, current: Filter) =>
              previous.categoryId !== current.categoryId,
            filterFn: (entity, filter: Filter) =>
              !filter?.search ||
              entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
          })),
        );
        const store = new Store();
        patchState(store, setAllEntities(mockProducts));
        store.filterEntities({
          filter: { search: 'zero', categoryId: 'snes' },
        });
        expect(store.entities().length).toEqual(mockProducts.length);
        tick(400);
        expect(store.entities().length).toEqual(2);
        expect(store.entitiesFilter()).toEqual({
          search: 'zero',
          categoryId: 'snes',
        });
      });
    }));

    it('should filter entities using default when withCallStatus loaded', fakeAsync(() => {
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          { protectedState: false },
          withEntities({
            entity,
          }),
          withCallStatus(),
          withEntitiesHybridFilter({
            entity,
            defaultFilter: { search: 'zero', categoryId: 'bar2' },
            isRemoteFilter: (previous, current) =>
              previous.categoryId !== current.categoryId,
            filterFn: (entity, filter) =>
              !filter?.search ||
              entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
          }),
        );
        const store = new Store();
        patchState(store, setAllEntities(mockProducts));
        store.setLoaded();
        TestBed.flushEffects();
        tick();
        expect(store.entities().length).toEqual(2);
        expect(store.entities()).toEqual([
          {
            description: 'Super Nintendo Game',
            id: '1',
            name: 'F-Zero',
            price: 12,
            categoryId: 'snes',
          },
          {
            description: 'GameCube Game',
            id: '80',
            name: 'F-Zero GX',
            price: 55,
            categoryId: 'gamecube',
          },
        ]);
        expect(store.entitiesFilter()).toEqual({
          search: 'zero',
          categoryId: 'bar2',
        });
      });
    }));

    it('should filter entities after debounce', fakeAsync(() => {
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        patchState(store, setAllEntities(mockProducts));
        store.filterEntities({
          filter: { search: 'zero', categoryId: 'snes' },
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
          { protectedState: false },
          withEntities({
            entity,
          }),
          withCallStatus(),
          withEntitiesHybridFilter({
            entity,
            defaultFilter: { search: 'zero', categoryId: 'bar2' },
            isRemoteFilter: (previous, current) =>
              previous.categoryId !== current.categoryId,
            filterFn: (entity, filter) =>
              !filter?.search ||
              entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
          }),
        );
        const store = new Store();
        patchState(store, setAllEntities(mockProducts));
        store.setLoaded();
        TestBed.flushEffects();
        tick();
        expect(store.entities().length).toEqual(2);
        expect(store.entities()).toEqual([
          {
            description: 'Super Nintendo Game',
            id: '1',
            name: 'F-Zero',
            price: 12,
            categoryId: 'snes',
          },
          {
            description: 'GameCube Game',
            id: '80',
            name: 'F-Zero GX',
            price: 55,
            categoryId: 'gamecube',
          },
        ]);
        expect(store.entitiesFilter()).toEqual({
          search: 'zero',
          categoryId: 'bar2',
        });
      });
    }));
    it('should filter entities after default debounce', fakeAsync(() => {
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          { protectedState: false },
          withEntities({
            entity,
          }),
          withCallStatus(),
          withEntitiesHybridFilter({
            entity,
            defaultFilter: { search: '', categoryId: 'snes' },
            isRemoteFilter: (previous, current) =>
              previous.categoryId !== current.categoryId,
            defaultDebounce: 1000,
            filterFn: (entity, filter) =>
              !filter?.search ||
              entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
          }),
        );
        const store = new Store();
        patchState(store, setAllEntities(mockProducts));
        store.filterEntities({
          filter: { search: 'zero', categoryId: 'snes' },
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
          filter: { search: 'zero', categoryId: 'snes' },
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
          filter: { search: 'zero', categoryId: 'snes' },
          forceLoad: true,
        });
      });
    }));

    it(' should reset page to and selection when filter is executed', fakeAsync(() => {
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          { protectedState: false },
          withEntities({
            entity,
          }),
          withEntitiesLocalPagination({ entity }),
          withEntitiesSingleSelection({ entity }),
          withEntitiesMultiSelection({ entity }),
          withCallStatus(),
          withEntitiesHybridFilter({
            entity,
            defaultFilter: { search: '', categoryId: 'snes' },
            isRemoteFilter: (previous, current) =>
              previous.categoryId !== current.categoryId,
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

    it(' should not reset selection when filter is executed if configured that way', fakeAsync(() => {
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          { protectedState: false },
          withEntities({
            entity,
          }),
          withEntitiesSingleSelection({
            entity,
            clearOnFilter: false,
            clearOnRemoteSort: false,
          }),
          withEntitiesMultiSelection({
            entity,
            clearOnFilter: false,
            clearOnRemoteSort: false,
          }),
          withCallStatus(),
          withEntitiesHybridFilter({
            entity,
            defaultFilter: { search: '', categoryId: 'snes' },
            isRemoteFilter: (previous, current) =>
              previous.categoryId !== current.categoryId,
            filterFn: (entity, filter) =>
              !filter?.search ||
              entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
          }),
        );
        const store = new Store();
        patchState(store, setAllEntities(mockProducts));
        store.selectEntity({ id: mockProducts[0].id });
        store.selectEntities({ ids: [mockProducts[2].id, mockProducts[3].id] });
        expect(store.entitySelected()).toEqual(mockProducts[0]);
        expect(store.entitiesSelected?.()).toEqual([
          mockProducts[2],
          mockProducts[3],
        ]);

        store.filterEntities({
          filter: { search: 'zero' },
          patch: true,
        });
        tick(400);
        // check selection was not reset
        expect(store.entitySelected()).toEqual(mockProducts[0]);
        expect(store.entitiesSelected?.()).toEqual([
          mockProducts[2],
          mockProducts[3],
        ]);
        // check filter
        expect(store.entities().length).toEqual(2);
      });
    }));

    it(' should rename props when collection param is set', fakeAsync(() => {
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          { protectedState: false },
          withEntities({
            entity,
            collection,
          }),
          withCallStatus({ collection }),
          withEntitiesLocalPagination({ entity, collection }),
          withEntitiesHybridFilter({
            entity,
            collection,
            defaultFilter: { search: '', categoryId: 'snes' },
            isRemoteFilter: (previous, current) =>
              previous.categoryId !== current.categoryId,
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
            categoryId: 'snes',
          },
          {
            description: 'GameCube Game',
            id: '80',
            name: 'F-Zero GX',
            price: 55,
            categoryId: 'gamecube',
          },
        ]);
        expect(store.productsFilter()).toEqual({
          search: 'zero',
          categoryId: 'snes',
        });
        expect(store.productsFilter.search()).toEqual('zero');
      });
    }));

    describe('custom ids and filters', () => {
      type ProductCustom = Omit<Product, 'id'> & { productId: string };
      it('should filter entities', fakeAsync(() => {
        const config = entityConfig({
          entity: type<ProductCustom>(),
          selectId: (entity) => entity.productId,
        });
        const Store = signalStore(
          { protectedState: false },
          withEntities(config),
          withCallStatus(),
          withEntitiesHybridFilter({
            ...config,
            defaultFilter: { search: '', categoryId: 'snes' },
            isRemoteFilter: (previous, current) =>
              previous.categoryId !== current.categoryId,
            filterFn: (entity, filter) =>
              !filter?.search ||
              entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
          }),
        );
        const mockProductsCustom = mockProducts.map(({ id, ...p }) => ({
          ...p,
          productId: id,
        }));
        TestBed.runInInjectionContext(() => {
          const store = new Store();
          patchState(store, setAllEntities(mockProductsCustom, config));
          store.filterEntities({
            filter: { search: 'zero', categoryId: 'snes' },
          });
          expect(store.entities().length).toEqual(mockProducts.length);
          tick(400);
          expect(store.entities().length).toEqual(2);
          expect(store.entities()).toEqual([
            {
              description: 'Super Nintendo Game',
              productId: '1',
              name: 'F-Zero',
              price: 12,
              categoryId: 'snes',
            },
            {
              description: 'GameCube Game',
              productId: '80',
              name: 'F-Zero GX',
              price: 55,
              categoryId: 'gamecube',
            },
          ]);
        });
      }));
      it('should filter entities with collection', fakeAsync(() => {
        const config = entityConfig({
          entity: type<ProductCustom>(),
          selectId: (entity) => entity.productId,
          collection: 'products',
        });
        const Store = signalStore(
          { protectedState: false },
          withEntities(config),
          withCallStatus(config),
          withEntitiesHybridFilter({
            ...config,
            defaultFilter: { search: '', categoryId: 'snes' },
            isRemoteFilter: (previous, current) =>
              previous.categoryId !== current.categoryId,
            filterFn: (entity, filter) =>
              !filter?.search ||
              entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
          }),
        );
        const mockProductsCustom = mockProducts.map(({ id, ...p }) => ({
          ...p,
          productId: id,
        }));
        TestBed.runInInjectionContext(() => {
          const store = new Store();
          patchState(store, setAllEntities(mockProductsCustom, config));
          store.filterProductsEntities({
            filter: { search: 'zero', categoryId: 'snes' },
          });
          expect(store.productsEntities().length).toEqual(mockProducts.length);
          tick(400);
          expect(store.productsEntities().length).toEqual(2);
          expect(store.productsEntities()).toEqual([
            {
              description: 'Super Nintendo Game',
              productId: '1',
              name: 'F-Zero',
              price: 12,
              categoryId: 'snes',
            },
            {
              description: 'GameCube Game',
              productId: '80',
              name: 'F-Zero GX',
              price: 55,
              categoryId: 'gamecube',
            },
          ]);
        });
      }));
    });
  });

  describe('remote filter', () => {
    const entity = type<Product>();
    const collection = 'products';
    const Store = signalStore(
      withEntities({
        entity,
      }),
      withCallStatus({ initialValue: 'loading' }),
      withEntitiesHybridFilter({
        entity,
        defaultFilter: { search: '', categoryId: 'snes' },
        isRemoteFilter: (previous, current) =>
          previous.categoryId !== current.categoryId,
        filterFn: (entity, filter) =>
          !filter?.search ||
          entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
      }),
      withEntitiesLoadingCall({
        fetchEntities: ({ entitiesFilter }) => {
          let result = [...mockProducts];
          if (entitiesFilter()?.search) {
            result = mockProducts.filter((entity) =>
              entitiesFilter()?.search
                ? entity.name
                    .toLowerCase()
                    .includes(entitiesFilter()?.search.toLowerCase())
                : false,
            );
          }
          if (entitiesFilter()?.categoryId) {
            result = result.filter(
              (entity) => entity.categoryId === entitiesFilter()?.categoryId,
            );
          }
          return of(result);
        },
      }),
    );

    it('should filter entities and store filter', fakeAsync(() => {
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        TestBed.flushEffects();
        store.filterEntities({
          filter: { search: 'zero', categoryId: 'gamecube' },
        });
        expect(store.entities().length).toEqual(65);
        tick(400);
        expect(store.entities().length).toEqual(1);
        expect(store.entities()).toEqual([
          {
            description: 'GameCube Game',
            id: '80',
            name: 'F-Zero GX',
            price: 55,
            categoryId: 'gamecube',
          },
        ]);
        expect(store.entitiesFilter()).toEqual({
          search: 'zero',
          categoryId: 'gamecube',
        });
      });
    }));
    it('should allow to set default filter from previous state', fakeAsync(() => {
      const Store = signalStore(
        withEntities({
          entity,
        }),
        withCallStatus({ initialValue: 'loading' }),
        withState({ myDefault: { search: '', categoryId: 'snes' } }),
        withEntitiesHybridFilter(({ myDefault }) => ({
          entity,
          defaultFilter: myDefault(),
          isRemoteFilter: (previous: Filter, current: Filter) =>
            previous.categoryId !== current.categoryId,
          filterFn: (entity, filter: Filter) =>
            !filter?.search ||
            entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
        })),
        withEntitiesLoadingCall({
          fetchEntities: ({ entitiesFilter }) => {
            let result = [...mockProducts];
            if (entitiesFilter()?.search) {
              result = mockProducts.filter((entity) =>
                entitiesFilter()?.search
                  ? entity.name
                      .toLowerCase()
                      .includes(entitiesFilter()?.search.toLowerCase())
                  : false,
              );
            }
            return of(result);
          },
        }),
      );

      TestBed.runInInjectionContext(() => {
        const store = new Store();
        TestBed.flushEffects();
        store.filterEntities({
          filter: { search: 'zero', categoryId: 'bar2' },
        });
        expect(store.entities().length).toEqual(mockProducts.length);
        tick(400);
        expect(store.entities().length).toEqual(2);
        expect(store.entitiesFilter()).toEqual({
          search: 'zero',
          categoryId: 'bar2',
        });
      });
    }));

    it('should do filter entities is skipLoadingCall is true but should store filter', fakeAsync(() => {
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        TestBed.flushEffects();
        store.filterEntities({
          filter: { search: '', categoryId: 'gamecube' },
          skipLoadingCall: true,
        });
        expect(store.entities().length).toEqual(65);
        tick(400);
        expect(store.entitiesFilter()).toEqual({
          search: '',
          categoryId: 'gamecube',
        });
        expect(store.entities().length).toEqual(65);
        // now we manually trigger the loading call and should filter
        store.setLoading();
        tick(400);
        expect(store.entities().length).toEqual(57);
        expect(store.entities().slice(0, 2)).toEqual([
          {
            categoryId: 'gamecube',
            description: 'GameCube Game',
            id: '65',
            name: "Luigi's Mansion",
            price: 10,
          },
          {
            description: 'GameCube Game',
            id: '66',
            name: 'Wave Race: Blue Storm',
            price: 13,
            categoryId: 'gamecube',
          },
        ]);
      });
    }));

    it('should filter entities after provide debounce', fakeAsync(() => {
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        TestBed.flushEffects();
        store.filterEntities({
          filter: { search: 'zero', categoryId: 'gamecube' },
          debounce: 1000,
        });
        expect(store.entities().length).toEqual(65);
        tick(1100);
        expect(store.entities().length).toEqual(1);
      });
    }));

    it('should filter entities after provide debounce', fakeAsync(() => {
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          withEntities({
            entity,
          }),
          withCallStatus({ initialValue: 'loading' }),
          withEntitiesHybridFilter({
            entity,
            defaultFilter: { search: '', categoryId: 'snes' },
            isRemoteFilter: (previous, current) =>
              previous.categoryId !== current.categoryId,
            filterFn: (entity, filter) =>
              !filter?.search ||
              entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
            defaultDebounce: 1000,
          }),
          withEntitiesLoadingCall({
            fetchEntities: ({ entitiesFilter }) => {
              let result = [...mockProducts];
              if (entitiesFilter()?.search) {
                result = mockProducts.filter((entity) =>
                  entitiesFilter()?.search
                    ? entity.name
                        .toLowerCase()
                        .includes(entitiesFilter()?.search.toLowerCase())
                    : false,
                );
              }
              return of(result);
            },
          }),
        );
        const store = new Store();
        TestBed.flushEffects();
        store.filterEntities({
          filter: { search: 'zero', categoryId: 'bar2' },
        });
        expect(store.entities().length).toEqual(mockProducts.length);
        tick(1100);
        expect(store.entities().length).toEqual(2);
      });
    }));

    it('should filter entities immediately when forceLoad is true', fakeAsync(() => {
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        TestBed.flushEffects();
        store.filterEntities({
          filter: { search: 'zero', categoryId: 'gamecube' },
          forceLoad: true,
        });
        tick();
        expect(store.entities().length).toEqual(1);
      });
    }));

    it('should merge new filter with previous if patch true is set ', fakeAsync(() => {
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        TestBed.flushEffects();
        store.filterEntities({
          filter: { search: 'zero' },
          patch: true,
        });
        expect(store.entities().length).toEqual(65);
        tick(400);
        expect(store.entities().length).toEqual(1);
        expect(store.entitiesFilter()).toEqual({
          search: 'zero',
          categoryId: 'snes',
        });
      });
    }));

    // TODO: this case should not be allowed
    it(' should resetPage to and selection when filter is executed', fakeAsync(() => {
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          withEntities({
            entity,
          }),
          withCallStatus({ initialValue: 'loading' }),
          withEntitiesLocalPagination({ entity }),
          withEntitiesSingleSelection({ entity }),
          withEntitiesMultiSelection({ entity }),
          withEntitiesHybridFilter({
            entity,
            defaultFilter: { search: '', categoryId: 'snes' },
            isRemoteFilter: (previous, current) =>
              previous.categoryId !== current.categoryId,
            filterFn: (entity, filter) =>
              !filter?.search ||
              entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
          }),
          withEntitiesLoadingCall({
            fetchEntities: ({ entitiesFilter }) => {
              let result = [...mockProducts];
              if (entitiesFilter()?.search)
                result = mockProducts.filter((entity) =>
                  entitiesFilter()?.search
                    ? entity.name
                        .toLowerCase()
                        .includes(entitiesFilter()?.search.toLowerCase())
                    : false,
                );
              return Promise.resolve({
                entities: result,
                total: result.length,
              });
            },
          }),
        );
        const store = new Store();
        TestBed.flushEffects();
        tick(400);
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
          withCallStatus({ collection, initialValue: 'loading' }),
          withEntitiesRemotePagination({ entity, collection }),
          withEntitiesHybridFilter({
            entity,
            collection,
            defaultFilter: { search: '', categoryId: 'snes' },
            isRemoteFilter: (previous, current) =>
              previous.categoryId !== current.categoryId,
            filterFn: (entity, filter) =>
              !filter?.search ||
              entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
          }),
          withEntitiesLoadingCall({
            collection,
            fetchEntities: ({ productsFilter }) => {
              let result = [...mockProducts];
              if (productsFilter()?.search) {
                result = mockProducts.filter((entity) =>
                  productsFilter()?.search
                    ? entity.name
                        .toLowerCase()
                        .includes(productsFilter()?.search.toLowerCase())
                    : false,
                );
              }
              if (productsFilter()?.categoryId) {
                result = result.filter(
                  (entity) =>
                    entity.categoryId === productsFilter()?.categoryId,
                );
              }
              return of({ entities: result, total: result.length });
            },
          }),
        );
        const store = new Store();
        TestBed.flushEffects();
        store.loadProductsPage({ pageIndex: 3 });
        tick(400);
        expect(store.productsCurrentPage().pageIndex).toEqual(3);

        store.filterProductsEntities({
          filter: { search: 'zero', categoryId: 'gamecube' },
          patch: true,
        });
        tick(400);
        expect(store.productsEntities().length).toEqual(1);
        expect(store.productsEntities()).toEqual([
          {
            description: 'GameCube Game',
            id: '80',
            name: 'F-Zero GX',
            price: 55,
            categoryId: 'gamecube',
          },
        ]);
        expect(store.productsFilter()).toEqual({
          search: 'zero',
          categoryId: 'gamecube',
        });
      });
    }));
  });
});
