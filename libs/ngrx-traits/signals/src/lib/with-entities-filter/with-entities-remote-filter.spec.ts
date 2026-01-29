import {
  discardPeriodicTasks,
  fakeAsync,
  flush,
  TestBed,
  tick,
} from '@angular/core/testing';
import { patchState, signalStore, type, withState } from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';
import { of, Subject } from 'rxjs';

import {
  withCallStatus,
  withEntitiesLoadingCall,
  withEntitiesMultiSelection,
  withEntitiesRemoteFilter,
  withEntitiesRemotePagination,
  withEntitiesSingleSelection,
} from '../index';
import { mockProducts } from '../test.mocks';
import { Product } from '../test.model';

describe('withEntitiesRemoteFilter', () => {
  const entity = type<Product>();
  const collection = 'product';
  const Store = signalStore(
    { protectedState: false },
    withEntities({
      entity,
    }),
    withCallStatus({ initialValue: 'loading' }),
    withEntitiesRemoteFilter({
      entity,
      defaultFilter: { search: '', foo: 'bar' },
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

  it('should filter entities and store filter', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      TestBed.tick();
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
      expect(store.entitiesFilter()).toEqual({ search: 'zero', foo: 'bar2' });
      expect(store.entitiesFilter.search()).toEqual('zero');
    });
  }));

  it('should filter without params should reapply filter', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      TestBed.tick();
      store.filterEntities({
        filter: { search: 'zero', foo: 'bar2' },
      });
      expect(store.entities().length).toEqual(mockProducts.length);
      tick(400);
      patchState(store, setAllEntities(mockProducts));
      expect(store.entities().length).toEqual(mockProducts.length);
      store.filterEntities();
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
      expect(store.entitiesFilter()).toEqual({ search: 'zero', foo: 'bar2' });
      expect(store.entitiesFilter.search()).toEqual('zero');
    });
  }));

  it('should allow to set default filter from previous state', fakeAsync(() => {
    const Store = signalStore(
      withEntities({
        entity,
      }),
      withCallStatus({ initialValue: 'loading' }),
      withState({ myDefault: { search: '', foo: 'bar' } }),
      withEntitiesRemoteFilter(({ myDefault }) => ({
        entity,
        defaultFilter: myDefault(),
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
      TestBed.tick();
      store.filterEntities({
        filter: { search: 'zero', foo: 'bar2' },
      });
      expect(store.entities().length).toEqual(mockProducts.length);
      tick(400);
      expect(store.entities().length).toEqual(2);
      expect(store.entitiesFilter()).toEqual({ search: 'zero', foo: 'bar2' });
    });
  }));

  it('should not filter entities is skipLoadingCall is true but should store filter', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      TestBed.tick();
      store.filterEntities({
        filter: { search: 'zero', foo: 'bar2' },
        skipLoadingCall: true,
      });
      expect(store.entities().length).toEqual(mockProducts.length);
      tick(400);
      expect(store.entitiesFilter()).toEqual({ search: 'zero', foo: 'bar2' });
      expect(store.entities().length).toEqual(mockProducts.length);
      // now we manually trigger the loading call and should filter
      store.setLoading();
      tick(400);
      expect(store.entities().length).toEqual(2);
      expect(store.entities()).toEqual([
        {
          description: 'Super Nintendo Game',
          categoryId: 'snes',
          id: '1',
          name: 'F-Zero',
          price: 12,
        },
        {
          description: 'GameCube Game',
          categoryId: 'gamecube',
          id: '80',
          name: 'F-Zero GX',
          price: 55,
        },
      ]);
    });
  }));

  it('should filter entities after provide debounce', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      TestBed.tick();
      store.filterEntities({
        filter: { search: 'zero', foo: 'bar2' },
        debounce: 1000,
      });
      expect(store.entities().length).toEqual(mockProducts.length);
      tick(1100);
      expect(store.entities().length).toEqual(2);
    });
  }));

  it('should filter entities after provide debounce', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const Store = signalStore(
        withEntities({
          entity,
        }),
        withCallStatus({ initialValue: 'loading' }),
        withEntitiesRemoteFilter({
          entity,
          defaultFilter: { search: '', foo: 'bar' },
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
      TestBed.tick();
      store.filterEntities({
        filter: { search: 'zero', foo: 'bar2' },
      });
      expect(store.entities().length).toEqual(mockProducts.length);
      tick(1100);
      expect(store.entities().length).toEqual(2);
    });
  }));

  it('should filter entities immediately when forceLoad is true', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      TestBed.tick();
      store.filterEntities({
        filter: { search: 'zero', foo: 'bar2' },
        forceLoad: true,
      });
      tick();
      expect(store.entities().length).toEqual(2);
    });
  }));

  it('should merge new filter with previous if patch true is set ', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      TestBed.tick();
      store.filterEntities({
        filter: { search: 'zero' },
        patch: true,
      });
      expect(store.entities().length).toEqual(mockProducts.length);
      tick(400);
      expect(store.entities().length).toEqual(2);
      expect(store.entitiesFilter()).toEqual({ search: 'zero', foo: 'bar' });
    });
  }));

  it(' should resetPage to and selection when filter is executed', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const Store = signalStore(
        withEntities({
          entity,
        }),
        withCallStatus({ initialValue: 'loading' }),
        withEntitiesRemotePagination({ entity }),
        withEntitiesSingleSelection({ entity }),
        withEntitiesMultiSelection({ entity }),
        withEntitiesRemoteFilter({
          entity,
          defaultFilter: { search: '', foo: 'bar' },
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
            return Promise.resolve({ entities: result, total: result.length });
          },
        }),
      );
      const store = new Store();
      TestBed.tick();
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
        withEntitiesRemoteFilter({
          entity,
          collection,
          defaultFilter: { search: '', foo: 'bar' },
        }),
        withEntitiesLoadingCall({
          collection,
          fetchEntities: ({ productEntitiesFilter }) => {
            let result = [...mockProducts];
            if (productEntitiesFilter()?.search) {
              result = mockProducts.filter((entity) =>
                productEntitiesFilter()?.search
                  ? entity.name
                      .toLowerCase()
                      .includes(productEntitiesFilter()?.search.toLowerCase())
                  : false,
              );
            }
            return of({ entities: result, total: result.length });
          },
        }),
      );
      const store = new Store();
      TestBed.tick();
      store.loadProductEntitiesPage({ pageIndex: 3 });
      tick(400);
      expect(store.productEntitiesCurrentPage().pageIndex).toEqual(3);

      store.filterProductEntities({
        filter: { search: 'zero' },
        patch: true,
      });
      tick(400);
      expect(store.productEntities().length).toEqual(2);
      expect(store.productEntities()).toEqual([
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
      expect(store.productEntitiesFilter()).toEqual({
        search: 'zero',
        foo: 'bar',
      });
      expect(store.productEntitiesFilter.search()).toEqual('zero');
    });
  }));

  it('should pass through second filter call when skipLoadingCall is true on first', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const apiResponse$ = new Subject<Partial<Product[]>>();
      let response: Product[] = [];
      const Store = signalStore(
        { protectedState: false },
        withEntities({
          entity,
        }),
        withCallStatus({ initialValue: 'init' }),
        withEntitiesRemoteFilter({
          entity,
          defaultFilter: { search: 'test', foo: 'bar' },
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
            response = result;
            return apiResponse$;
          },
        }),
      );
      const store = new Store();
      TestBed.tick();

      console.log('first');
      // First call should pass should not call backend because of skipLoadingCall
      store.filterEntities({
        filter: { search: 'zero', foo: 'bar' },
        skipLoadingCall: true, // this will store the value but not call the backend, and should not count for distinctUntilChange
      });
      tick(400);
      expect(store.isLoading()).toEqual(false);
      tick(400);
      expect(store.entities().length).toEqual(0);

      console.log('second');
      // Second call with same filter should be pass through because previous call did not count for distinctUntilChange
      store.filterEntities({
        filter: { search: 'zero', foo: 'bar' },
      });
      tick(400);
      expect(store.isLoading()).toEqual(true);
      apiResponse$.next(response);
      tick(400);
      expect(store.entities().length).toEqual(2);
      expect(store.isLoaded()).toEqual(true);

      console.log('thrid');
      // Third call with same filter should be filtered out
      store.filterEntities({
        filter: { search: 'zero', foo: 'bar' },
      });
      tick(400);
      expect(store.isLoading()).toEqual(false);
      tick(400);
      // Entities should remain the same (call was filtered out)
      expect(store.entities().length).toEqual(2);

      console.log('fourth');
      // Next call should passthrough because filter changed
      store.filterEntities({
        filter: { search: 'mario', foo: 'snes' },
      });
      tick(400);
      expect(store.isLoading()).toEqual(true);
      apiResponse$.next(response);
      tick(400);
      expect(store.entities().length).toEqual(23);
    });
  }));
});
