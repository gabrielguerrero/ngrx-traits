import { ListRange } from '@angular/cdk/collections';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { signalStore, type } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import { BehaviorSubject, of } from 'rxjs';

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

  it(' should append entities when using load more and using a result with entities and total', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const Store = signalStore(
        withEntities({ entity }),
        withCallStatus(),
        withEntitiesRemoteScrollPagination({
          entity,
          pageSize: 10,
          pagesToCache: 1,
        }),
        withEntitiesLoadingCall({
          fetchEntities: ({ entitiesPagedRequest }) => {
            let result = [...mockProducts.slice(0, 25)];
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
      // check the first load
      expect(store.entities().length).toEqual(10);
      expect(store.entities()).toEqual(mockProducts.slice(0, 10));
      expect(store.pagination().hasMore).toEqual(true);
      expect(store.pagination().pageSize).toEqual(10);

      store.loadMoreEntities();
      tick();
      // check the second load
      expect(store.entities().length).toEqual(20);
      expect(store.entities()).toEqual(mockProducts.slice(0, 20));
      expect(store.pagination().hasMore).toEqual(true);
      store.loadMoreEntities();
      tick();
      expect(store.entities().length).toEqual(25);
      expect(store.entities()).toEqual(mockProducts.slice(0, 25));
      expect(store.pagination().hasMore).toEqual(false);
    });
  }));

  it('should append entities when using load more and using a result with entities and hasMore', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const pageSize = 10;
      const Store = signalStore(
        withEntities({ entity }),
        withCallStatus(),
        withEntitiesRemoteScrollPagination({
          entity,
          pageSize,
          pagesToCache: 1,
        }),
        withEntitiesLoadingCall({
          fetchEntities: ({ entitiesPagedRequest }) => {
            let result = [...mockProducts.slice(0, 25)];
            const options = {
              skip: entitiesPagedRequest()?.startIndex,
              take: entitiesPagedRequest()?.size,
            };
            if (options?.skip || options?.take) {
              const skip = +(options?.skip ?? 0);
              const take = +(options?.take ?? 0);
              result = result.slice(skip, skip + take);
            }
            return of({
              entities: result,
              hasMore: result.length == pageSize,
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
      expect(store.pagination().hasMore).toEqual(true);
      expect(store.pagination().pageSize).toEqual(10);

      store.loadMoreEntities();
      tick();
      // check the second load
      expect(store.entities().length).toEqual(20);
      expect(store.entities()).toEqual(mockProducts.slice(0, 20));
      expect(store.pagination().hasMore).toEqual(true);
      store.loadMoreEntities();
      tick();
      expect(store.entities().length).toEqual(25);
      expect(store.entities()).toEqual(mockProducts.slice(0, 25));
      expect(store.pagination().hasMore).toEqual(false);
    });
  }));

  it('should append entities when using load more and using a result with just entities ', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const pageSize = 10;
      const Store = signalStore(
        withEntities({ entity }),
        withCallStatus(),
        withEntitiesRemoteScrollPagination({
          entity,
          pageSize,
          pagesToCache: 1,
        }),
        withEntitiesLoadingCall({
          fetchEntities: ({ entitiesPagedRequest }) => {
            let result = [...mockProducts.slice(0, 25)];
            const options = {
              skip: entitiesPagedRequest()?.startIndex,
              take: entitiesPagedRequest()?.size,
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
      expect(store.pagination().hasMore).toEqual(true);
      expect(store.pagination().pageSize).toEqual(10);

      store.loadMoreEntities();
      tick();
      // check the second load
      expect(store.entities().length).toEqual(20);
      expect(store.entities()).toEqual(mockProducts.slice(0, 20));
      expect(store.pagination().hasMore).toEqual(true);
      store.loadMoreEntities();
      tick();
      expect(store.entities().length).toEqual(25);
      expect(store.entities()).toEqual(mockProducts.slice(0, 25));
      expect(store.pagination().hasMore).toEqual(false);
    });
  }));

  it('with collection should append entities when using load more ', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const collection = 'products';
      const Store = signalStore(
        withEntities({ entity, collection }),
        withCallStatus({ collection }),
        withEntitiesRemoteScrollPagination({
          entity,
          collection,
          pageSize: 10,
          pagesToCache: 1,
        }),
        withEntitiesLoadingCall({
          collection,
          fetchEntities: ({ productsPagedRequest }) => {
            let result = [...mockProducts.slice(0, 25)];
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
      // check the first load
      expect(store.productsEntities().length).toEqual(10);
      expect(store.productsEntities()).toEqual(mockProducts.slice(0, 10));
      expect(store.productsPagination().hasMore).toEqual(true);
      expect(store.productsPagination().pageSize).toEqual(10);

      store.loadMoreProducts();
      tick();
      // check the second load
      expect(store.productsEntities().length).toEqual(20);
      expect(store.productsEntities()).toEqual(mockProducts.slice(0, 20));
      expect(store.productsPagination().hasMore).toEqual(true);
      store.loadMoreProducts();
      tick();
      expect(store.productsEntities().length).toEqual(25);
      expect(store.productsEntities()).toEqual(mockProducts.slice(0, 25));
      expect(store.productsPagination().hasMore).toEqual(false);
    });
  }));

  it('using next and previous entitiesCurrentPage should split entities in the correct pages', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const Store = signalStore(
        withEntities({ entity }),
        withCallStatus(),
        withEntitiesRemoteScrollPagination({
          entity,
          pageSize: 10,
          pagesToCache: 3,
        }),
        withEntitiesLoadingCall({
          fetchEntities: ({ entitiesPagedRequest }) => {
            let result = [...mockProducts.slice(0, 35)];
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
      // check the first page
      expect(store.entities().length).toEqual(30);
      expect(store.entitiesCurrentPage().entities.length).toEqual(10);
      expect(store.entitiesCurrentPage().entities).toEqual(
        mockProducts.slice(0, 10),
      );
      expect(store.entitiesCurrentPage().pageIndex).toEqual(0);
      expect(store.entitiesCurrentPage().pageSize).toEqual(10);
      expect(store.entitiesCurrentPage().hasPrevious).toEqual(false);
      expect(store.entitiesCurrentPage().hasNext).toEqual(true);

      store.loadEntitiesNextPage();
      tick();
      // check the second page
      expect(store.entities().length).toEqual(30); // same as before because its cached
      expect(store.entitiesCurrentPage().entities.length).toEqual(10);
      expect(store.entitiesCurrentPage().entities).toEqual(
        mockProducts.slice(10, 20),
      );
      expect(store.entitiesCurrentPage().pageIndex).toEqual(1);
      expect(store.entitiesCurrentPage().pageSize).toEqual(10);
      expect(store.entitiesCurrentPage().hasPrevious).toEqual(true);
      expect(store.entitiesCurrentPage().hasNext).toEqual(true);

      store.loadEntitiesNextPage();
      tick();

      // check the third page
      expect(store.entities().length).toEqual(35); // increased because it loads more
      expect(store.entitiesCurrentPage().entities.length).toEqual(10);
      expect(store.entitiesCurrentPage().entities).toEqual(
        mockProducts.slice(20, 30),
      );
      expect(store.entitiesCurrentPage().pageIndex).toEqual(2);
      expect(store.entitiesCurrentPage().pageSize).toEqual(10);
      expect(store.entitiesCurrentPage().hasPrevious).toEqual(true);
      expect(store.entitiesCurrentPage().hasNext).toEqual(true);

      store.loadEntitiesNextPage();
      tick();

      // check the 4th and last page
      expect(store.entities().length).toEqual(35); // same as before
      expect(store.entitiesCurrentPage().entities.length).toEqual(5);
      expect(store.entitiesCurrentPage().entities).toEqual(
        mockProducts.slice(30, 35),
      );
      expect(store.entitiesCurrentPage().pageIndex).toEqual(3);
      expect(store.entitiesCurrentPage().pageSize).toEqual(10);
      expect(store.entitiesCurrentPage().hasPrevious).toEqual(true);
      expect(store.entitiesCurrentPage().hasNext).toEqual(false);

      // check going previous page
      store.loadEntitiesPreviousPage();
      tick();

      // check the third page again
      expect(store.entitiesCurrentPage().entities.length).toEqual(10);
      expect(store.entitiesCurrentPage().entities).toEqual(
        mockProducts.slice(20, 30),
      );
      expect(store.entitiesCurrentPage().pageIndex).toEqual(2);
      expect(store.entitiesCurrentPage().pageSize).toEqual(10);
      expect(store.entitiesCurrentPage().hasPrevious).toEqual(true);
      expect(store.entitiesCurrentPage().hasNext).toEqual(true);

      // check going first page
      store.loadEntitiesFirstPage();
      tick();
      // check the first page
      expect(store.entitiesCurrentPage().entities.length).toEqual(10);
      expect(store.entitiesCurrentPage().entities).toEqual(
        mockProducts.slice(0, 10),
      );
      expect(store.entitiesCurrentPage().pageIndex).toEqual(0);
      expect(store.entitiesCurrentPage().pageSize).toEqual(10);
      expect(store.entitiesCurrentPage().hasPrevious).toEqual(false);
      expect(store.entitiesCurrentPage().hasNext).toEqual(true);
    });
  }));

  it('should reset cache when filter is executed', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const Store = signalStore(
        withEntities({
          entity,
        }),
        withCallStatus({ initialValue: 'loading' }),
        withEntitiesRemoteScrollPagination({
          entity,
          pageSize: 10,
          pagesToCache: 3,
        }),
        withEntitiesRemoteFilter({
          entity,
          defaultFilter: { search: '', foo: 'bar' },
        }),
        withEntitiesLoadingCall({
          fetchEntities: ({ entitiesFilter, entitiesPagedRequest }) => {
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
              skip: entitiesPagedRequest()?.startIndex,
              take: entitiesPagedRequest()?.size,
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

  it('should reset cache when sort is executed', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const Store = signalStore(
        withEntities({
          entity,
        }),
        withCallStatus({ initialValue: 'loading' }),
        withEntitiesRemoteScrollPagination({
          entity,
          pageSize: 10,
          pagesToCache: 3,
        }),
        withEntitiesRemoteSort({
          entity,
          defaultSort: { field: 'id', direction: 'asc' },
        }),
        withEntitiesLoadingCall({
          fetchEntities: ({ entitiesSort, entitiesPagedRequest }) => {
            let result = [...mockProducts];
            const total = result.length;

            if (entitiesSort()?.field) {
              result = sortData(result, {
                field: entitiesSort()?.field as any,
                direction: entitiesSort().direction,
              });
            }
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
          withEntitiesRemoteScrollPagination({
            entity,
            pageSize: 10,
            pagesToCache: 4,
          }),
          withEntitiesLoadingCall({
            fetchEntities: ({ entitiesPagedRequest }) => {
              let result = [...mockProducts.slice(0, 110)];
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
        const dataSource = getInfiniteScrollDataSource({ store });
        const collectionViewer = new BehaviorSubject<ListRange>({
          start: 0,
          end: 10,
        });

        expect(store.entities()).toEqual([]);
        store.setLoading();
        tick(400);
        const list$ = dataSource.connect({ viewChange: collectionViewer });
        let entities: Product[] = [];
        list$.subscribe((data) => {
          entities = data;
        });

        // check the first load
        expect(entities.length).toEqual(40);
        expect(entities).toEqual(mockProducts.slice(0, 40));

        // check a view that should not trigger a load
        collectionViewer.next({ start: 10, end: 20 });
        tick(400);
        // same as before because nothing extra was loaded
        expect(entities.length).toEqual(40);

        collectionViewer.next({ start: 20, end: 30 });
        tick(400);
        // check the second load
        expect(entities.length).toEqual(80);
        expect(entities).toEqual(mockProducts.slice(0, 80));

        collectionViewer.next({ start: 40, end: 50 });
        tick(400);
        expect(entities.length).toEqual(80);

        collectionViewer.next({ start: 50, end: 60 });
        tick(400);
        expect(entities.length).toEqual(80);

        collectionViewer.next({ start: 60, end: 70 });
        tick(400);
        expect(entities.length).toEqual(110);

        collectionViewer.next({ start: 100, end: 110 });
        tick(400);
        expect(entities.length).toEqual(110);
        expect(entities).toEqual(mockProducts.slice(0, 110));
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
            pageSize: 10,
            pagesToCache: 1,
          }),
          withEntitiesLoadingCall({
            collection,
            fetchEntities: ({ productsPagedRequest }) => {
              let result = [...mockProducts.slice(0, 25)];
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
        tick(400);
        const list$ = dataSource.connect({ viewChange: collectionViewer });
        let entities: Product[] = [];
        list$.subscribe((data) => {
          entities = data;
        });

        // check the first load
        expect(entities.length).toEqual(10);
        expect(entities).toEqual(mockProducts.slice(0, 10));

        collectionViewer.next({ start: 10, end: 20 });
        tick(400);
        // check the second load
        expect(entities.length).toEqual(20);
        expect(entities).toEqual(mockProducts.slice(0, 20));

        collectionViewer.next({ start: 20, end: 30 });
        tick(400);
        expect(entities.length).toEqual(25);
        expect(entities).toEqual(mockProducts.slice(0, 25));
      });
    }));
  });
});
