import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { signalStore, type } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import { of } from 'rxjs';

import {
  withCallStatus,
  withEntitiesLoadingCall,
  withEntitiesRemotePagination,
} from '../index';
import { mockProducts } from '../test.mocks';
import { Product } from '../test.model';

describe('withEntitiesLoadingCall', () => {
  const entity = type<Product>();
  const collection = 'products';

  describe('without collection setLoading should call fetch entities', () => {
    it('should setAllEntities if fetchEntities returns an Entity[] ', fakeAsync(() => {
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          withEntities({
            entity,
          }),
          withCallStatus(),
          withEntitiesLoadingCall({
            fetchEntities: () => {
              let result = [...mockProducts];
              return of(result);
            },
          }),
        );
        const store = new Store();
        TestBed.flushEffects();
        expect(store.entities()).toEqual([]);
        store.setLoading();
        tick();
        expect(store.entities()).toEqual(mockProducts);
      });
    }));

    it('should setAllEntities if fetchEntities returns an a {entities: Entity[]} ', fakeAsync(() => {
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          withEntities({
            entity,
          }),
          withCallStatus(),
          withEntitiesLoadingCall({
            fetchEntities: () => {
              let result = [...mockProducts];
              return of({ entities: result });
            },
          }),
        );
        const store = new Store();
        TestBed.flushEffects();
        expect(store.entities()).toEqual([]);
        store.setLoading();
        tick();
        expect(store.entities()).toEqual(mockProducts);
      });
    }));

    it('should setEntitiesPagedResult if fetchEntities returns an a {entities: Entity[], total: number} ', fakeAsync(() => {
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          withEntities({
            entity,
          }),
          withCallStatus(),
          withEntitiesRemotePagination({
            entity,
            pageSize: 10,
          }),
          withEntitiesLoadingCall({
            fetchEntities: ({ entitiesPagedRequest }) => {
              let result = [...mockProducts];
              const total = result.length;
              const options = {
                skip: entitiesPagedRequest()?.startIndex,
                take: entitiesPagedRequest()?.size,
              };
              if (options?.skip || options?.take) {
                const skip = +(options?.skip ?? 0);
                const take = +(options?.take ?? 0);
                result = result.slice(skip, skip + take);
              }
              return of({ entities: result, total });
            },
          }),
        );
        const store = new Store();
        TestBed.flushEffects();
        expect(store.entities()).toEqual([]);
        store.setLoading();
        tick();
        expect(store.entities()).toEqual(mockProducts.slice(0, 30));
      });
    }));
  });

  describe('with collection set[Collection]Loading should call fetch entities', () => {
    it('should setAllEntities if fetchEntities returns an Entity[] ', fakeAsync(() => {
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          withEntities({
            entity,
            collection,
          }),
          withCallStatus({ collection }),
          withEntitiesLoadingCall({
            collection,
            fetchEntities: () => {
              let result = [...mockProducts];
              return of(result);
            },
          }),
        );
        const store = new Store();
        TestBed.flushEffects();
        expect(store.productsEntities()).toEqual([]);
        store.setProductsLoading();
        tick();
        expect(store.productsEntities()).toEqual(mockProducts);
      });
    }));

    it('should setAllEntities if fetchEntities returns an a {entities: Entity[]} ', fakeAsync(() => {
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          withEntities({
            entity,
            collection,
          }),
          withCallStatus({ collection }),
          withEntitiesLoadingCall({
            collection,
            fetchEntities: () => {
              let result = [...mockProducts];
              return of({ entities: result });
            },
          }),
        );
        const store = new Store();
        TestBed.flushEffects();
        expect(store.productsEntities()).toEqual([]);
        store.setProductsLoading();
        tick();
        expect(store.productsEntities()).toEqual(mockProducts);
      });
    }));

    it('should set[Collection]Result if fetchEntities returns an a {entities: Entity[], total: number} ', fakeAsync(() => {
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          withEntities({
            entity,
            collection,
          }),
          withCallStatus({ collection }),
          withEntitiesRemotePagination({
            entity,
            collection,
            pageSize: 10,
          }),
          withEntitiesLoadingCall({
            collection,
            fetchEntities: ({ productsPagedRequest }) => {
              let result = [...mockProducts];
              const total = result.length;
              const options = {
                skip: productsPagedRequest()?.startIndex,
                take: productsPagedRequest()?.size,
              };
              if (options?.skip || options?.take) {
                const skip = +(options?.skip ?? 0);
                const take = +(options?.take ?? 0);
                result = result.slice(skip, skip + take);
              }
              return of({ entities: result, total });
            },
          }),
        );
        const store = new Store();
        TestBed.flushEffects();
        expect(store.productsEntities()).toEqual([]);
        store.setProductsLoading();
        tick();
        expect(store.productsEntities()).toEqual(mockProducts.slice(0, 30));
      });
    }));
  });
});
