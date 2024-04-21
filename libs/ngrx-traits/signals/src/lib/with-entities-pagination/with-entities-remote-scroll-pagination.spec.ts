import { ListRange } from '@angular/cdk/collections';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { signalStore, type } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import { BehaviorSubject, lastValueFrom, of } from 'rxjs';

import {
  getInfiniteScrollDataSource,
  withCallStatus,
  withEntitiesLoadingCall,
  withEntitiesRemoteFilter,
  withEntitiesRemoteScrollPagination,
  withEntitiesRemoteSort,
} from '../index';
import { mockProducts } from '../test.mocks';
import { Product } from '../test.model';
import { sortData } from '../with-entities-sort/with-entities-local-sort.util';

describe('withEntitiesRemoteScrollPagination', () => {
  const entity = type<Product>();

  it('entitiesCurrentPage should split entities in the correct pages using a result with entities and total', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const Store = signalStore(
        withEntities({ entity }),
        withCallStatus(),
        withEntitiesRemoteScrollPagination({ entity, bufferSize: 10 }),
        withEntitiesLoadingCall({
          fetchEntities: ({ entitiesRequest }) => {
            let result = [...mockProducts.slice(0, 25)];
            const total = result.length;
            const options = {
              skip: entitiesRequest()?.startIndex,
              take: entitiesRequest()?.size,
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
      // check the first load
      expect(store.entities().length).toEqual(10);
      expect(store.entities()).toEqual(mockProducts.slice(0, 10));
      expect(store.entitiesScrollCache().hasMore).toEqual(true);
      expect(store.entitiesScrollCache().bufferSize).toEqual(10);

      store.loadMoreEntities();
      tick();
      // check the second load
      expect(store.entities().length).toEqual(20);
      expect(store.entities()).toEqual(mockProducts.slice(0, 20));
      expect(store.entitiesScrollCache().hasMore).toEqual(true);
      store.loadMoreEntities();
      tick();
      expect(store.entities().length).toEqual(25);
      expect(store.entities()).toEqual(mockProducts.slice(0, 25));
      expect(store.entitiesScrollCache().hasMore).toEqual(false);
    });
  }));

  it('entitiesCurrentPage should split entities in the correct pages using a result with entities and hasMore', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const bufferSize = 10;
      const Store = signalStore(
        withEntities({ entity }),
        withCallStatus(),
        withEntitiesRemoteScrollPagination({ entity, bufferSize }),
        withEntitiesLoadingCall({
          fetchEntities: ({ entitiesRequest }) => {
            let result = [...mockProducts.slice(0, 25)];
            const total = result.length;
            const options = {
              skip: entitiesRequest()?.startIndex,
              take: entitiesRequest()?.size,
            };
            if (options?.skip || options?.take) {
              const skip = +(options?.skip ?? 0);
              const take = +(options?.take ?? 0);
              result = result.slice(skip, skip + take);
            }
            return of({
              entities: result,
              hasMore: result.length == bufferSize,
            });
          },
        }),
      );

      const store = new Store();
      TestBed.flushEffects();
      expect(store.entities()).toEqual([]);
      store.setLoading();
      tick();
      // check the first load
      expect(store.entities().length).toEqual(10);
      expect(store.entities()).toEqual(mockProducts.slice(0, 10));
      expect(store.entitiesScrollCache().hasMore).toEqual(true);
      expect(store.entitiesScrollCache().bufferSize).toEqual(10);

      store.loadMoreEntities();
      tick();
      // check the second load
      expect(store.entities().length).toEqual(20);
      expect(store.entities()).toEqual(mockProducts.slice(0, 20));
      expect(store.entitiesScrollCache().hasMore).toEqual(true);
      store.loadMoreEntities();
      tick();
      expect(store.entities().length).toEqual(25);
      expect(store.entities()).toEqual(mockProducts.slice(0, 25));
      expect(store.entitiesScrollCache().hasMore).toEqual(false);
    });
  }));

  it('entitiesCurrentPage should split entities in the correct pages using a result with just entities ', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const bufferSize = 10;
      const Store = signalStore(
        withEntities({ entity }),
        withCallStatus(),
        withEntitiesRemoteScrollPagination({ entity, bufferSize }),
        withEntitiesLoadingCall({
          fetchEntities: ({ entitiesRequest }) => {
            let result = [...mockProducts.slice(0, 25)];
            const options = {
              skip: entitiesRequest()?.startIndex,
              take: entitiesRequest()?.size,
            };
            if (options?.skip || options?.take) {
              const skip = +(options?.skip ?? 0);
              const take = +(options?.take ?? 0);
              result = result.slice(skip, skip + take);
            }
            return of({
              entities: result,
            });
          },
        }),
      );

      const store = new Store();
      TestBed.flushEffects();
      expect(store.entities()).toEqual([]);
      store.setLoading();
      tick();
      // check the first load
      expect(store.entities().length).toEqual(10);
      expect(store.entities()).toEqual(mockProducts.slice(0, 10));
      expect(store.entitiesScrollCache().hasMore).toEqual(true);
      expect(store.entitiesScrollCache().bufferSize).toEqual(10);

      store.loadMoreEntities();
      tick();
      // check the second load
      expect(store.entities().length).toEqual(20);
      expect(store.entities()).toEqual(mockProducts.slice(0, 20));
      expect(store.entitiesScrollCache().hasMore).toEqual(true);
      store.loadMoreEntities();
      tick();
      expect(store.entities().length).toEqual(25);
      expect(store.entities()).toEqual(mockProducts.slice(0, 25));
      expect(store.entitiesScrollCache().hasMore).toEqual(false);
    });
  }));

  it('with collection entitiesCurrentPage should split entities in the correct pages', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const collection = 'products';
      const Store = signalStore(
        withEntities({ entity, collection }),
        withCallStatus({ collection }),
        withEntitiesRemoteScrollPagination({
          entity,
          collection,
          bufferSize: 10,
        }),
        withEntitiesLoadingCall({
          collection,
          fetchEntities: ({ productsRequest }) => {
            let result = [...mockProducts.slice(0, 25)];
            const total = result.length;
            const options = {
              skip: productsRequest()?.startIndex,
              take: productsRequest()?.size,
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
      // check the first load
      expect(store.productsEntities().length).toEqual(10);
      expect(store.productsEntities()).toEqual(mockProducts.slice(0, 10));
      expect(store.productsScrollCache().hasMore).toEqual(true);
      expect(store.productsScrollCache().bufferSize).toEqual(10);

      store.loadMoreProducts();
      tick();
      // check the second load
      expect(store.productsEntities().length).toEqual(20);
      expect(store.productsEntities()).toEqual(mockProducts.slice(0, 20));
      expect(store.productsScrollCache().hasMore).toEqual(true);
      store.loadMoreProducts();
      tick();
      expect(store.productsEntities().length).toEqual(25);
      expect(store.productsEntities()).toEqual(mockProducts.slice(0, 25));
      expect(store.productsScrollCache().hasMore).toEqual(false);
    });
  }));

  it(' should reset cache when filter is executed', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const Store = signalStore(
        withEntities({
          entity,
        }),
        withCallStatus({ initialValue: 'loading' }),
        withEntitiesRemoteScrollPagination({ entity, bufferSize: 30 }),
        withEntitiesRemoteFilter({
          entity,
          defaultFilter: { search: '', foo: 'bar' },
        }),
        withEntitiesLoadingCall({
          fetchEntities: ({ entitiesFilter, entitiesRequest }) => {
            let result = [...mockProducts];
            const total = result.length;
            if (entitiesFilter()?.search)
              result = mockProducts.filter((entity) =>
                entitiesFilter()?.search
                  ? entity.name
                      .toLowerCase()
                      .includes(entitiesFilter()?.search.toLowerCase())
                  : false,
              );
            const options = {
              skip: entitiesRequest()?.startIndex,
              take: entitiesRequest()?.size,
            };
            if (options?.skip || options?.take) {
              const skip = +(options?.skip ?? 0);
              const take = +(options?.take ?? 0);
              result = result.slice(skip, skip + take);
            }
            return of({ entities: result, total });
            return Promise.resolve({ entities: result, total: result.length });
          },
        }),
      );
      const store = new Store();
      TestBed.flushEffects();
      // first fill cache
      tick();
      expect(store.entities().length).toEqual(30);
      store.loadMoreEntities();
      tick();
      expect(store.entities().length).toEqual(60);
      expect(store.entities()).toEqual(mockProducts.slice(0, 60));

      store.filterEntities({
        filter: { search: 'zero' },
        patch: true,
      });
      tick(400);
      expect(store.entities().length).toEqual(2);
    });
  }));

  it(' should reset cache when sort is executed', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const Store = signalStore(
        withEntities({
          entity,
        }),
        withCallStatus({ initialValue: 'loading' }),
        withEntitiesRemoteScrollPagination({ entity, bufferSize: 30 }),
        withEntitiesRemoteSort({
          entity,
          defaultSort: { field: 'id', direction: 'asc' },
        }),
        withEntitiesLoadingCall({
          fetchEntities: ({ entitiesSort, entitiesRequest }) => {
            let result = [...mockProducts];
            const total = result.length;

            if (entitiesSort()?.field) {
              result = sortData(result, {
                field: entitiesSort()?.field as any,
                direction: entitiesSort().direction,
              });
            }
            const options = {
              skip: entitiesRequest()?.startIndex,
              take: entitiesRequest()?.size,
            };
            if (options?.skip || options?.take) {
              const skip = +(options?.skip ?? 0);
              const take = +(options?.take ?? 0);
              result = result.slice(skip, skip + take);
            }
            return of({ entities: result, total });
            return Promise.resolve({ entities: result, total: result.length });
          },
        }),
      );
      const store = new Store();
      TestBed.flushEffects();
      // first fill cache
      tick();
      expect(store.entities().length).toEqual(30);
      store.loadMoreEntities();
      tick();
      expect(store.entities().length).toEqual(60);
      expect(store.entities()).toEqual(mockProducts.slice(0, 60));

      store.sortEntities({
        sort: {
          field: 'name',
          direction: 'desc',
        },
      });
      tick(400);
      expect(store.entities().length).toEqual(30);
    });
  }));

  describe('getInfiniteScrollDataSource', () => {
    it('dataSource result should return all results while iterated', fakeAsync(() => {
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          withEntities({ entity }),
          withCallStatus(),
          withEntitiesRemoteScrollPagination({ entity, bufferSize: 10 }),
          withEntitiesLoadingCall({
            fetchEntities: ({ entitiesRequest }) => {
              let result = [...mockProducts.slice(0, 25)];
              const total = result.length;
              const options = {
                skip: entitiesRequest()?.startIndex,
                take: entitiesRequest()?.size,
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
        const dataSource = getInfiniteScrollDataSource({ store });
        const collectionViewer = new BehaviorSubject<ListRange>({
          start: 0,
          end: 10,
        });

        expect(store.entities()).toEqual([]);
        store.setLoading();
        tick();
        const list$ = dataSource.connect({ viewChange: collectionViewer });
        let entities: Product[] = [];
        list$.subscribe((data) => {
          entities = data;
        });

        // check the first load
        expect(entities.length).toEqual(10);
        expect(entities).toEqual(mockProducts.slice(0, 10));

        collectionViewer.next({ start: 10, end: 20 });
        tick();
        // check the second load
        expect(entities.length).toEqual(20);
        expect(entities).toEqual(mockProducts.slice(0, 20));

        collectionViewer.next({ start: 20, end: 30 });
        tick();
        expect(entities.length).toEqual(25);
        expect(entities).toEqual(mockProducts.slice(0, 25));
      });
    }));

    it('with collection dataSource result should return all results while iterated', fakeAsync(() => {
      TestBed.runInInjectionContext(() => {
        const collection = 'products';
        const Store = signalStore(
          withEntities({ entity, collection }),
          withCallStatus({ collection }),
          withEntitiesRemoteScrollPagination({
            entity,
            collection,
            bufferSize: 10,
          }),
          withEntitiesLoadingCall({
            collection,
            fetchEntities: ({ productsRequest }) => {
              let result = [...mockProducts.slice(0, 25)];
              const total = result.length;
              const options = {
                skip: productsRequest()?.startIndex,
                take: productsRequest()?.size,
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
        const dataSource = getInfiniteScrollDataSource({
          store,
          collection,
          entity,
        });
        const collectionViewer = new BehaviorSubject<ListRange>({
          start: 0,
          end: 10,
        });

        expect(store.productsEntities()).toEqual([]);
        store.setProductsLoading();
        tick();
        const list$ = dataSource.connect({ viewChange: collectionViewer });
        let entities: Product[] = [];
        list$.subscribe((data) => {
          entities = data;
        });

        // check the first load
        expect(entities.length).toEqual(10);
        expect(entities).toEqual(mockProducts.slice(0, 10));

        collectionViewer.next({ start: 10, end: 20 });
        tick();
        // check the second load
        expect(entities.length).toEqual(20);
        expect(entities).toEqual(mockProducts.slice(0, 20));

        collectionViewer.next({ start: 20, end: 30 });
        tick();
        expect(entities.length).toEqual(25);
        expect(entities).toEqual(mockProducts.slice(0, 25));
      });
    }));
  });
});
