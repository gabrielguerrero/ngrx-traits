import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { signalStore, type, withState } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';

import {
  Sort,
  withCallStatus,
  withEntitiesLoadingCall,
  withEntitiesMultiSelection,
  withEntitiesRemotePagination,
  withEntitiesRemoteSort,
  withEntitiesSingleSelection,
} from '../index';
import { mockProducts } from '../test.mocks';
import { Product } from '../test.model';
import { sortData } from './with-entities-local-sort.util';

describe('withEntitiesRemoteSort', () => {
  const entity = type<Product>();
  it('should sort entities and store sort', fakeAsync(() => {
    const Store = signalStore(
      withEntities({
        entity,
      }),
      withCallStatus({ initialValue: 'loading' }),
      withEntitiesRemoteSort({
        entity,
        defaultSort: { field: 'name', direction: 'asc' },
      }),
      withEntitiesLoadingCall({
        fetchEntities: ({ entitiesSort }) => {
          let result = [...mockProducts];
          if (entitiesSort()?.field) {
            result = sortData(result, {
              field: entitiesSort()?.field as any,
              direction: entitiesSort().direction,
            });
          }

          return Promise.resolve({ entities: result, total: result.length });
        },
      }),
    );
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      TestBed.flushEffects();
      tick();
      // check default sort
      expect(store.entitiesSort()).toEqual({ field: 'name', direction: 'asc' });
      expect(
        store
          .entities()
          .map((e) => e.name)
          .slice(0, 5),
      ).toEqual([
        '1080° Avalanche',
        'Animal Crossing',
        'Arkanoid: Doh it Again',
        'Battalion Wars',
        'BattleClash',
      ]);
      store.sortEntities({
        sort: { field: 'price', direction: 'desc' },
      });
      tick();
      expect(
        store
          .entities()
          .map((e) => e.price)
          .slice(0, 5),
      ).toEqual([178, 175, 172, 169, 166]);
      expect(store.entities().length).toEqual(mockProducts.length);
      expect(store.entitiesSort()).toEqual({
        field: 'price',
        direction: 'desc',
      });
    });
  }));

  it('should not sort entities if skipLoadingCall? is true but should store sort', fakeAsync(() => {
    const Store = signalStore(
      withEntities({
        entity,
      }),
      withCallStatus({ initialValue: 'loading' }),
      withEntitiesRemoteSort({
        entity,
        defaultSort: { field: 'name', direction: 'asc' },
      }),
      withEntitiesLoadingCall({
        fetchEntities: ({ entitiesSort }) => {
          let result = [...mockProducts];
          if (entitiesSort()?.field) {
            result = sortData(result, {
              field: entitiesSort()?.field as any,
              direction: entitiesSort().direction,
            });
          }

          return Promise.resolve({ entities: result, total: result.length });
        },
      }),
    );
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      TestBed.flushEffects();
      tick();
      // check default sort
      expect(store.entitiesSort()).toEqual({ field: 'name', direction: 'asc' });
      const sortedNames = [
        '1080° Avalanche',
        'Animal Crossing',
        'Arkanoid: Doh it Again',
        'Battalion Wars',
        'BattleClash',
      ];
      expect(
        store
          .entities()
          .map((e) => e.name)
          .slice(0, 5),
      ).toEqual(sortedNames);
      store.sortEntities({
        sort: { field: 'price', direction: 'desc' },
        skipLoadingCall: true,
      });
      tick();
      // check entities sort is not changed
      expect(
        store
          .entities()
          .map((e) => e.name)
          .slice(0, 5),
      ).toEqual(sortedNames);
      expect(store.entitiesSort()).toEqual({
        field: 'price',
        direction: 'desc',
      });
      // we now trigger the loading call
      store.setLoading();
      tick();
      expect(
        store
          .entities()
          .map((e) => e.price)
          .slice(0, 5),
      ).toEqual([178, 175, 172, 169, 166]);
      expect(store.entities().length).toEqual(mockProducts.length);
    });
  }));

  it('with collection should sort entities and store sort', fakeAsync(() => {
    const collection = 'products';
    const Store = signalStore(
      withEntities({
        entity,
        collection,
      }),
      withCallStatus({ initialValue: 'loading', collection }),
      withEntitiesRemoteSort({
        entity,
        collection,
        defaultSort: { field: 'name', direction: 'asc' },
      }),
      withEntitiesLoadingCall({
        collection,
        fetchEntities: ({ productsSort }) => {
          let result = [...mockProducts];
          if (productsSort()?.field) {
            result = sortData(result, {
              field: productsSort()?.field as any,
              direction: productsSort().direction,
            });
          }

          return Promise.resolve({ entities: result, total: result.length });
        },
      }),
    );
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      TestBed.flushEffects();
      tick();
      // check default sort
      expect(store.productsSort()).toEqual({ field: 'name', direction: 'asc' });
      expect(
        store
          .productsEntities()
          .map((e) => e.name)
          .slice(0, 5),
      ).toEqual([
        '1080° Avalanche',
        'Animal Crossing',
        'Arkanoid: Doh it Again',
        'Battalion Wars',
        'BattleClash',
      ]);
      store.sortProductsEntities({
        sort: { field: 'price', direction: 'desc' },
      });
      tick();
      expect(
        store
          .productsEntities()
          .map((e) => e.price)
          .slice(0, 5),
      ).toEqual([178, 175, 172, 169, 166]);
      expect(store.productsEntities().length).toEqual(mockProducts.length);
      expect(store.productsSort()).toEqual({
        field: 'price',
        direction: 'desc',
      });
    });
  }));

  it('should set default sort using config factory', fakeAsync(() => {
    const collection = 'products';
    const Store = signalStore(
      withState({
        myDefault: { field: 'name', direction: 'asc' } as Sort<Product>,
      }),
      withEntities({
        entity,
        collection,
      }),
      withCallStatus({ initialValue: 'loading', collection }),
      withEntitiesRemoteSort(({ myDefault }) => ({
        entity,
        collection,
        defaultSort: myDefault(),
      })),
      withEntitiesLoadingCall({
        collection,
        fetchEntities: ({ productsSort }) => {
          let result = [...mockProducts];
          if (productsSort()?.field) {
            result = sortData(result, {
              field: productsSort()?.field as any,
              direction: productsSort().direction,
            });
          }

          return Promise.resolve({ entities: result, total: result.length });
        },
      }),
    );
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      TestBed.flushEffects();
      tick();
      // check default sort
      expect(store.productsSort()).toEqual({ field: 'name', direction: 'asc' });
      expect(
        store
          .productsEntities()
          .map((e) => e.name)
          .slice(0, 5),
      ).toEqual([
        '1080° Avalanche',
        'Animal Crossing',
        'Arkanoid: Doh it Again',
        'Battalion Wars',
        'BattleClash',
      ]);
    });
  }));

  it('should sort using previous sort if sortEntities is called without sort param', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const Store = signalStore(
        withEntities({
          entity,
        }),
        withCallStatus({ initialValue: 'loading' }),
        withEntitiesRemoteSort({
          entity,
          defaultSort: { field: 'id', direction: 'asc' },
        }),
        withEntitiesLoadingCall({
          fetchEntities: ({ entitiesSort }) => {
            let result = [...mockProducts];
            if (entitiesSort()?.field) {
              result = sortData(result, {
                field: entitiesSort()?.field as any,
                direction: entitiesSort().direction,
              });
            }

            return Promise.resolve({ entities: result, total: result.length });
          },
        }),
      );
      const store = new Store();
      TestBed.flushEffects();
      tick();
      expect(store.entitiesSort()).toEqual({ field: 'id', direction: 'asc' });
      expect(
        store
          .entities()
          .map((e) => e.id)
          .slice(0, 5),
      ).toEqual(mockProducts.map((p) => p.id).slice(0, 5));
      tick();
      store.sortEntities(); // sort again should keep previous sort
      tick();
      expect(store.entitiesSort()).toEqual({ field: 'id', direction: 'asc' });
      expect(
        store
          .entities()
          .map((e) => e.id)
          .slice(0, 5),
      ).toEqual(mockProducts.map((p) => p.id).slice(0, 5));

      store.sortEntities({ sort: { field: 'name', direction: 'asc' } });
      tick();
      expect(store.entitiesSort()).toEqual({ field: 'name', direction: 'asc' });

      store.sortEntities(); // sort again should keep previous sort
      tick();
      expect(store.entitiesSort()).toEqual({ field: 'name', direction: 'asc' });

      // check default sort
      expect(
        store
          .entities()
          .map((e) => e.name)
          .slice(0, 5),
      ).toEqual([
        '1080° Avalanche',
        'Animal Crossing',
        'Arkanoid: Doh it Again',
        'Battalion Wars',
        'BattleClash',
      ]);
    });
  }));
  it(' should reset page to and selection when sort is executed', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const Store = signalStore(
        withEntities({
          entity,
        }),
        withCallStatus({ initialValue: 'loading' }),
        withEntitiesRemotePagination({ entity }),
        withEntitiesSingleSelection({ entity }),
        withEntitiesMultiSelection({ entity }),
        withEntitiesRemoteSort({
          entity,
          defaultSort: { field: 'name', direction: 'asc' },
        }),
        withEntitiesLoadingCall({
          fetchEntities: ({ entitiesSort }) => {
            let result = [...mockProducts];
            if (entitiesSort()?.field) {
              result = sortData(result, {
                field: entitiesSort()?.field as any,
                direction: entitiesSort().direction,
              });
            }

            return Promise.resolve({ entities: result, total: result.length });
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

      store.sortEntities({
        sort: { field: 'price', direction: 'desc' },
      });
      tick(400);
      // check selection and page reset
      expect(store.entitySelected()).toEqual(undefined);
      expect(store.entitiesSelected()).toEqual([]);
      expect(store.entitiesCurrentPage().pageIndex).toEqual(0);
      // check filter
      expect(store.entities().length).toEqual(mockProducts.length);
    });
  }));

  it('should not reset  selection when sort is executed if configured that way', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const Store = signalStore(
        withEntities({
          entity,
        }),
        withCallStatus({ initialValue: 'loading' }),
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
        withEntitiesRemoteSort({
          entity,
          defaultSort: { field: 'name', direction: 'asc' },
        }),
        withEntitiesLoadingCall({
          fetchEntities: ({ entitiesSort }) => {
            let result = [...mockProducts];
            if (entitiesSort()?.field) {
              result = sortData(result, {
                field: entitiesSort()?.field as any,
                direction: entitiesSort().direction,
              });
            }

            return Promise.resolve({ entities: result, total: result.length });
          },
        }),
      );
      const store = new Store();
      TestBed.flushEffects();
      tick(400);
      store.selectEntity({ id: mockProducts[0].id });
      store.selectEntities({ ids: [mockProducts[2].id, mockProducts[3].id] });
      expect(store.entitySelected()).toEqual(mockProducts[0]);
      expect(store.entitiesSelected?.()).toEqual([
        mockProducts[2],
        mockProducts[3],
      ]);

      store.sortEntities({
        sort: { field: 'price', direction: 'desc' },
      });
      tick(400);
      // check selection is not reset
      expect(store.entitySelected()).toEqual(mockProducts[0]);
      expect(store.entitiesSelected?.()).toEqual([
        mockProducts[2],
        mockProducts[3],
      ]);
      // check filter
      expect(store.entities().length).toEqual(mockProducts.length);
    });
  }));
});
