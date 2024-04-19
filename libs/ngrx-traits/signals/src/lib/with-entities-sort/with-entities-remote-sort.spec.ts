import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { signalStore, type } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';

import {
  withCallStatus,
  withEntitiesLoadingCall,
  withEntitiesRemotePagination,
  withEntitiesRemoteSort,
} from '../index';
import { mockProducts } from '../test.mocks';
import { Product } from '../test.model';
import { sortData } from './with-entities-sort.utils';

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
  // TODO check sort event gets fired
});
