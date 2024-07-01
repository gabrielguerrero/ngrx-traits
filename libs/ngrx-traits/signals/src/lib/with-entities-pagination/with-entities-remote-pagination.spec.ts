import { effect, Signal, untracked } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { signalStore, type, withHooks } from '@ngrx/signals';
import { entityConfig, withEntities } from '@ngrx/signals/entities';
import { of } from 'rxjs';

import {
  withCallStatus,
  withEntitiesLoadingCall,
  withEntitiesRemoteFilter,
  withEntitiesRemotePagination,
  withEntitiesRemoteSort,
} from '../index';
import { mockProducts } from '../test.mocks';
import { Product } from '../test.model';
import { sortData } from '../with-entities-sort/with-entities-local-sort.util';

describe('withEntitiesRemotePagination', () => {
  const entity = type<Product>();

  it('entitiesCurrentPage should split entities in the correct pages', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const Store = signalStore(
        withEntities({ entity }),
        withCallStatus(),
        withEntitiesRemotePagination({ entity, pageSize: 10 }),
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
      // check the first page
      expect(store.entitiesCurrentPage().entities.length).toEqual(10);
      expect(store.entitiesCurrentPage().entities).toEqual(
        mockProducts.slice(0, 10),
      );
      expect(store.entitiesCurrentPage().pageIndex).toEqual(0);
      expect(store.entitiesCurrentPage().pageSize).toEqual(10);
      expect(store.entitiesCurrentPage().pagesCount).toEqual(3);
      expect(store.entitiesCurrentPage().total).toEqual(25);
      expect(store.entitiesCurrentPage().hasPrevious).toEqual(false);
      expect(store.entitiesCurrentPage().hasNext).toEqual(true);

      store.loadEntitiesPage({ pageIndex: 1 });
      // check the second page
      expect(store.entitiesCurrentPage().entities.length).toEqual(10);
      expect(store.entitiesCurrentPage().entities).toEqual(
        mockProducts.slice(10, 20),
      );
      expect(store.entitiesCurrentPage().pageIndex).toEqual(1);
      expect(store.entitiesCurrentPage().pageSize).toEqual(10);
      expect(store.entitiesCurrentPage().pagesCount).toEqual(3);
      expect(store.entitiesCurrentPage().total).toEqual(25);
      expect(store.entitiesCurrentPage().hasPrevious).toEqual(true);
      expect(store.entitiesCurrentPage().hasNext).toEqual(true);

      store.loadEntitiesPage({ pageIndex: 2 });

      // check the third page
      expect(store.entitiesCurrentPage().entities.length).toEqual(5);
      expect(store.entitiesCurrentPage().entities).toEqual(
        mockProducts.slice(20, 25),
      );
      expect(store.entitiesCurrentPage().pageIndex).toEqual(2);
      expect(store.entitiesCurrentPage().pageSize).toEqual(10);
      expect(store.entitiesCurrentPage().pagesCount).toEqual(3);
      expect(store.entitiesCurrentPage().total).toEqual(25);
      expect(store.entitiesCurrentPage().hasPrevious).toEqual(true);
      expect(store.entitiesCurrentPage().hasNext).toEqual(false);
    });
  }));

  it('entitiesCurrentPage page size change should split entities in the correct pages', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const Store = signalStore(
        withEntities({ entity }),
        withCallStatus(),
        withEntitiesRemotePagination({ entity, pageSize: 10 }),
        withEntitiesLoadingCall({
          fetchEntities: ({ entitiesPagedRequest }) => {
            let result = [...mockProducts.slice(0, 40)];
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
      expect(store.entitiesCurrentPage().entities.length).toEqual(10);
      expect(store.entitiesCurrentPage().entities).toEqual(
        mockProducts.slice(0, 10),
      );
      expect(store.entitiesCurrentPage().pageIndex).toEqual(0);
      expect(store.entitiesCurrentPage().pageSize).toEqual(10);
      expect(store.entitiesCurrentPage().pagesCount).toEqual(4);
      expect(store.entitiesCurrentPage().total).toEqual(40);
      expect(store.entitiesCurrentPage().hasPrevious).toEqual(false);
      expect(store.entitiesCurrentPage().hasNext).toEqual(true);

      store.loadEntitiesPage({ pageIndex: 1, pageSize: 15 });
      tick();
      // check the first page on the new page size
      expect(store.entitiesCurrentPage().entities.length).toEqual(15);
      expect(store.entitiesCurrentPage().entities).toEqual(
        mockProducts.slice(0, 15),
      );
      expect(store.entitiesCurrentPage().pageIndex).toEqual(0);
      expect(store.entitiesCurrentPage().pageSize).toEqual(15);
      expect(store.entitiesCurrentPage().pagesCount).toEqual(3);
      expect(store.entitiesCurrentPage().total).toEqual(40);
      expect(store.entitiesCurrentPage().hasPrevious).toEqual(false);
      expect(store.entitiesCurrentPage().hasNext).toEqual(true);

      store.loadEntitiesPage({ pageIndex: 1, pageSize: 10 });
      tick();

      // check we can go back to the original page size
      expect(store.entitiesCurrentPage().entities.length).toEqual(10);
      expect(store.entitiesCurrentPage().entities).toEqual(
        mockProducts.slice(0, 10),
      );
      expect(store.entitiesCurrentPage().pageIndex).toEqual(0);
      expect(store.entitiesCurrentPage().pageSize).toEqual(10);
      expect(store.entitiesCurrentPage().pagesCount).toEqual(4);
      expect(store.entitiesCurrentPage().total).toEqual(40);
      expect(store.entitiesCurrentPage().hasPrevious).toEqual(false);
      expect(store.entitiesCurrentPage().hasNext).toEqual(true);

      // switch back to the 15 page size
      store.loadEntitiesPage({ pageIndex: 0, pageSize: 15 });
      tick();
      // check the third page
      store.loadEntitiesPage({ pageIndex: 2 });
      tick();
      expect(store.entitiesCurrentPage().pageIndex).toEqual(2);
      expect(store.entitiesCurrentPage().entities.length).toEqual(10);
      expect(store.entitiesCurrentPage().entities).toEqual(
        mockProducts.slice(30, 40),
      );
      expect(store.entitiesCurrentPage().pageSize).toEqual(15);
      expect(store.entitiesCurrentPage().pagesCount).toEqual(3);
      expect(store.entitiesCurrentPage().total).toEqual(40);
      expect(store.entitiesCurrentPage().hasPrevious).toEqual(true);
      expect(store.entitiesCurrentPage().hasNext).toEqual(false);
    });
  }));

  it('setEntitiesPagedResult should store entities', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const fetchEntitiesSpy = jest.fn();
      const Store = signalStore(
        withEntities({ entity }),
        withCallStatus(),
        withEntitiesRemotePagination({ entity, pageSize: 10 }),
        withHooks(
          ({
            isLoading,
            setLoaded,
            entitiesPagedRequest,
            setEntitiesPagedResult,
          }) => ({
            onInit: () => {
              const fetchEntities = ({
                entitiesPagedRequest,
              }: {
                entitiesPagedRequest: Signal<{
                  startIndex: number;
                  size: number;
                  page: number;
                }>;
              }) => {
                fetchEntitiesSpy(entitiesPagedRequest());
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
              };

              effect(() => {
                if (isLoading()) {
                  untracked(() => {
                    fetchEntities({
                      entitiesPagedRequest,
                    }).subscribe((result) => {
                      setEntitiesPagedResult(result);
                      setLoaded();
                    });
                  });
                }
              });
            },
          }),
        ),
      );

      const store = new Store();
      TestBed.flushEffects();
      expect(store.entities()).toEqual([]);
      store.setLoading();
      jest.spyOn(store, 'setLoading');
      tick();
      // basic check for the first page
      expect(store.entitiesCurrentPage().entities.length).toEqual(10);

      // load a page not in cache
      store.loadEntitiesPage({ pageIndex: 7 });
      tick();
      expect(fetchEntitiesSpy).toHaveBeenCalledWith({
        startIndex: 70,
        size: 30,
        page: 7,
      });
      // check the page

      expect(store.entitiesCurrentPage().entities.length).toEqual(10);
      expect(store.entitiesCurrentPage().entities).toEqual(
        mockProducts.slice(70, 80),
      );
      expect(store.entitiesCurrentPage().pageIndex).toEqual(7);
      expect(store.entitiesCurrentPage().pageSize).toEqual(10);
      expect(store.entitiesCurrentPage().pagesCount).toEqual(13);
      expect(store.entitiesCurrentPage().total).toEqual(mockProducts.length);
      expect(store.entitiesCurrentPage().hasPrevious).toEqual(true);
      expect(store.entitiesCurrentPage().hasNext).toEqual(true);
    });
  }));
  it('setEntitiesPagedResult and custom id should store entities', fakeAsync(() => {
    type ProductCustom = Omit<Product, 'id'> & { productId: string };
    const config = entityConfig({
      entity: type<ProductCustom>(),
      selectId: (entity) => entity.productId,
    });
    const mockProductsCustom = mockProducts.map(({ id, ...p }) => ({
      ...p,
      productId: id,
    }));
    TestBed.runInInjectionContext(() => {
      const fetchEntitiesSpy = jest.fn();
      const Store = signalStore(
        withEntities(config),
        withCallStatus(),
        withEntitiesRemotePagination({ ...config, pageSize: 10 }),
        withHooks(
          ({
            isLoading,
            setLoaded,
            entitiesPagedRequest,
            setEntitiesPagedResult,
          }) => ({
            onInit: () => {
              const fetchEntities = ({
                entitiesPagedRequest,
              }: {
                entitiesPagedRequest: Signal<{
                  startIndex: number;
                  size: number;
                  page: number;
                }>;
              }) => {
                fetchEntitiesSpy(entitiesPagedRequest());
                let result = [...mockProductsCustom];
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
              };

              effect(() => {
                if (isLoading()) {
                  untracked(() => {
                    fetchEntities({
                      entitiesPagedRequest,
                    }).subscribe((result) => {
                      setEntitiesPagedResult(result);
                      setLoaded();
                    });
                  });
                }
              });
            },
          }),
        ),
      );

      const store = new Store();
      TestBed.flushEffects();
      expect(store.entities()).toEqual([]);
      store.setLoading();
      jest.spyOn(store, 'setLoading');
      tick();
      // basic check for the first page
      expect(store.entitiesCurrentPage().entities.length).toEqual(10);

      // load a page not in cache
      store.loadEntitiesPage({ pageIndex: 7 });
      tick();
      expect(fetchEntitiesSpy).toHaveBeenCalledWith({
        startIndex: 70,
        size: 30,
        page: 7,
      });
      // check the page

      expect(store.entitiesCurrentPage().entities.length).toEqual(10);
      expect(store.entitiesCurrentPage().entities).toEqual(
        mockProductsCustom.slice(70, 80),
      );
      expect(store.entitiesCurrentPage().pageIndex).toEqual(7);
      expect(store.entitiesCurrentPage().pageSize).toEqual(10);
      expect(store.entitiesCurrentPage().pagesCount).toEqual(13);
      expect(store.entitiesCurrentPage().total).toEqual(mockProducts.length);
      expect(store.entitiesCurrentPage().hasPrevious).toEqual(true);
      expect(store.entitiesCurrentPage().hasNext).toEqual(true);
    });
  }));

  it('setEntitiesPagedResult with collection should store entities', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const fetchEntitiesSpy = jest.fn();
      const collection = 'products';
      const Store = signalStore(
        withEntities({ entity, collection }),
        withCallStatus({ collection }),
        withEntitiesRemotePagination({ entity, pageSize: 10, collection }),
        withHooks(
          ({
            isProductsLoading,
            setProductsLoaded,
            productsPagedRequest,
            setProductsPagedResult,
          }) => ({
            onInit: () => {
              const fetchEntities = ({
                entitiesPagedRequest,
              }: {
                entitiesPagedRequest: Signal<{
                  startIndex: number;
                  size: number;
                  page: number;
                }>;
              }) => {
                fetchEntitiesSpy(entitiesPagedRequest());
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
              };

              effect(() => {
                if (isProductsLoading()) {
                  untracked(() => {
                    fetchEntities({
                      entitiesPagedRequest: productsPagedRequest,
                    }).subscribe((result) => {
                      setProductsPagedResult(result);
                      setProductsLoaded();
                    });
                  });
                }
              });
            },
          }),
        ),
      );

      const store = new Store();
      TestBed.flushEffects();
      expect(store.productsEntities()).toEqual([]);
      store.setProductsLoading();
      jest.spyOn(store, 'setProductsLoading');
      tick();
      // basic check for the first page
      expect(store.productsCurrentPage().entities.length).toEqual(10);

      // load a page not in cache
      store.loadProductsPage({ pageIndex: 7 });
      tick();
      expect(fetchEntitiesSpy).toHaveBeenCalledWith({
        startIndex: 70,
        size: 30,
        page: 7,
      });
      // check the page

      expect(store.productsCurrentPage().entities.length).toEqual(10);
      expect(store.productsCurrentPage().entities).toEqual(
        mockProducts.slice(70, 80),
      );
      expect(store.productsCurrentPage().pageIndex).toEqual(7);
      expect(store.productsCurrentPage().pageSize).toEqual(10);
      expect(store.productsCurrentPage().pagesCount).toEqual(13);
      expect(store.productsCurrentPage().total).toEqual(mockProducts.length);
      expect(store.productsCurrentPage().hasPrevious).toEqual(true);
      expect(store.productsCurrentPage().hasNext).toEqual(true);
    });
  }));

  it('setEntitiesPagedResult with collection and custom id should store entities', fakeAsync(() => {
    const collection = 'products';
    type ProductCustom = Omit<Product, 'id'> & { productId: string };
    const config = entityConfig({
      entity: type<ProductCustom>(),
      selectId: (entity) => entity.productId,
      collection,
    });
    const mockProductsCustom = mockProducts.map(({ id, ...p }) => ({
      ...p,
      productId: id,
    }));
    TestBed.runInInjectionContext(() => {
      const fetchEntitiesSpy = jest.fn();
      const Store = signalStore(
        withEntities(config),
        withCallStatus(config),
        withEntitiesRemotePagination({ ...config, pageSize: 10 }),
        withHooks(
          ({
            isProductsLoading,
            setProductsLoaded,
            productsPagedRequest,
            setProductsPagedResult,
          }) => ({
            onInit: () => {
              const fetchEntities = ({
                entitiesPagedRequest,
              }: {
                entitiesPagedRequest: Signal<{
                  startIndex: number;
                  size: number;
                  page: number;
                }>;
              }) => {
                fetchEntitiesSpy(entitiesPagedRequest());
                let result = [...mockProductsCustom];
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
              };

              effect(() => {
                if (isProductsLoading()) {
                  untracked(() => {
                    fetchEntities({
                      entitiesPagedRequest: productsPagedRequest,
                    }).subscribe((result) => {
                      setProductsPagedResult(result);
                      setProductsLoaded();
                    });
                  });
                }
              });
            },
          }),
        ),
      );

      const store = new Store();
      TestBed.flushEffects();
      expect(store.productsEntities()).toEqual([]);
      store.setProductsLoading();
      jest.spyOn(store, 'setProductsLoading');
      tick();
      // basic check for the first page
      expect(store.productsCurrentPage().entities.length).toEqual(10);

      // load a page not in cache
      store.loadProductsPage({ pageIndex: 7 });
      tick();
      expect(fetchEntitiesSpy).toHaveBeenCalledWith({
        startIndex: 70,
        size: 30,
        page: 7,
      });
      // check the page

      expect(store.productsCurrentPage().entities.length).toEqual(10);
      expect(store.productsCurrentPage().entities).toEqual(
        mockProductsCustom.slice(70, 80),
      );
      expect(store.productsCurrentPage().pageIndex).toEqual(7);
      expect(store.productsCurrentPage().pageSize).toEqual(10);
      expect(store.productsCurrentPage().pagesCount).toEqual(13);
      expect(store.productsCurrentPage().total).toEqual(
        mockProductsCustom.length,
      );
      expect(store.productsCurrentPage().hasPrevious).toEqual(true);
      expect(store.productsCurrentPage().hasNext).toEqual(true);
    });
  }));

  it('with collection entitiesCurrentPage should split entities in the correct pages', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const collection = 'products';
      const Store = signalStore(
        withEntities({ entity, collection }),
        withCallStatus({ collection }),
        withEntitiesRemotePagination({ entity, collection, pageSize: 10 }),
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

      // check the first page
      expect(store.productsCurrentPage().entities.length).toEqual(10);
      expect(store.productsCurrentPage().entities).toEqual(
        mockProducts.slice(0, 10),
      );
      expect(store.productsCurrentPage().pageIndex).toEqual(0);
      expect(store.productsCurrentPage().pageSize).toEqual(10);
      expect(store.productsCurrentPage().pagesCount).toEqual(3);
      expect(store.productsCurrentPage().total).toEqual(25);
      expect(store.productsCurrentPage().hasPrevious).toEqual(false);
      expect(store.productsCurrentPage().hasNext).toEqual(true);

      store.loadProductsPage({ pageIndex: 1 });
      // check the second page
      expect(store.productsCurrentPage().entities.length).toEqual(10);
      expect(store.productsCurrentPage().entities).toEqual(
        mockProducts.slice(10, 20),
      );
      expect(store.productsCurrentPage().pageIndex).toEqual(1);
      expect(store.productsCurrentPage().pageSize).toEqual(10);
      expect(store.productsCurrentPage().pagesCount).toEqual(3);
      expect(store.productsCurrentPage().total).toEqual(25);
      expect(store.productsCurrentPage().hasPrevious).toEqual(true);
      expect(store.productsCurrentPage().hasNext).toEqual(true);

      store.loadProductsPage({ pageIndex: 2 });

      // check the third page
      expect(store.productsCurrentPage().entities.length).toEqual(5);
      expect(store.productsCurrentPage().entities).toEqual(
        mockProducts.slice(20, 25),
      );
      expect(store.productsCurrentPage().pageIndex).toEqual(2);
      expect(store.productsCurrentPage().pageSize).toEqual(10);
      expect(store.productsCurrentPage().pagesCount).toEqual(3);
      expect(store.productsCurrentPage().total).toEqual(25);
      expect(store.productsCurrentPage().hasPrevious).toEqual(true);
      expect(store.productsCurrentPage().hasNext).toEqual(false);
    });
  }));

  describe('loadEntitiesPage', () => {
    it('test when a requested page is not cache gets loaded', fakeAsync(() => {
      TestBed.runInInjectionContext(() => {
        const fetchEntitiesSpy = jest.fn();
        const Store = signalStore(
          withEntities({ entity }),
          withCallStatus(),
          withEntitiesRemotePagination({ entity, pageSize: 10 }),
          withEntitiesLoadingCall({
            fetchEntities: ({ entitiesPagedRequest }) => {
              fetchEntitiesSpy(entitiesPagedRequest());
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
        jest.spyOn(store, 'setLoading');
        tick();
        // basic check for the first page
        expect(store.entitiesCurrentPage().entities.length).toEqual(10);

        // load a page not in cache
        store.loadEntitiesPage({ pageIndex: 7 });
        tick();
        expect(fetchEntitiesSpy).toHaveBeenCalledWith({
          startIndex: 70,
          size: 30,
          page: 7,
        });
        // check the page

        expect(store.entitiesCurrentPage().entities.length).toEqual(10);
        expect(store.entitiesCurrentPage().entities).toEqual(
          mockProducts.slice(70, 80),
        );
        expect(store.entitiesCurrentPage().pageIndex).toEqual(7);
        expect(store.entitiesCurrentPage().pageSize).toEqual(10);
        expect(store.entitiesCurrentPage().pagesCount).toEqual(13);
        expect(store.entitiesCurrentPage().total).toEqual(mockProducts.length);
        expect(store.entitiesCurrentPage().hasPrevious).toEqual(true);
        expect(store.entitiesCurrentPage().hasNext).toEqual(true);
      });
    }));

    it('test when last page of cache gets loaded more pages are requested', fakeAsync(() => {
      TestBed.runInInjectionContext(() => {
        const fetchEntitiesSpy = jest.fn();
        const Store = signalStore(
          withEntities({ entity }),
          withCallStatus(),
          withEntitiesRemotePagination({
            entity,
            pageSize: 10,
            pagesToCache: 3,
          }),
          withEntitiesLoadingCall({
            fetchEntities: ({ entitiesPagedRequest }) => {
              fetchEntitiesSpy(entitiesPagedRequest());
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
        // basic check the first page
        expect(store.entitiesCurrentPage().entities.length).toEqual(10);
        expect(store.entitiesCurrentPage().pageIndex).toEqual(0);
        // load next cached page
        store.loadEntitiesPage({ pageIndex: 1 });
        tick();
        // basic check the second page
        expect(store.entitiesCurrentPage().entities.length).toEqual(10);
        expect(store.entitiesCurrentPage().pageIndex).toEqual(1);
        // load last page in cache
        store.loadEntitiesPage({ pageIndex: 2 });
        expect(store.entitiesCurrentPage().entities.length).toEqual(10);
        expect(store.entitiesCurrentPage().pageIndex).toEqual(2);
        tick();

        expect(fetchEntitiesSpy).toHaveBeenCalledTimes(2);
        // check preload next pages call
        expect(fetchEntitiesSpy).toHaveBeenCalledWith({
          startIndex: 30,
          size: 30,
          page: 3,
        });

        //load next page
        store.loadEntitiesPage({ pageIndex: 3 });
        tick();
        // only two calls should have been made the initial and the preload next pages
        expect(fetchEntitiesSpy).toHaveBeenCalledTimes(2);
        // check the page
        expect(store.entitiesCurrentPage().pageIndex).toEqual(3);
        expect(store.entitiesCurrentPage().entities.length).toEqual(10);
        expect(store.entitiesCurrentPage().entities).toEqual(
          mockProducts.slice(30, 40),
        );
        expect(store.entitiesCurrentPage().pageSize).toEqual(10);
        expect(store.entitiesCurrentPage().pagesCount).toEqual(13);
        expect(store.entitiesCurrentPage().total).toEqual(mockProducts.length);
        expect(store.entitiesCurrentPage().hasPrevious).toEqual(true);
        expect(store.entitiesCurrentPage().hasNext).toEqual(true);
      });
    }));

    it('test pageCache 1 renders correctly', fakeAsync(() => {
      TestBed.runInInjectionContext(() => {
        const fetchEntitiesSpy = jest.fn();
        const Store = signalStore(
          withEntities({ entity }),
          withCallStatus(),
          withEntitiesRemotePagination({
            entity,
            pageSize: 10,
            pagesToCache: 1,
          }),
          withEntitiesLoadingCall({
            fetchEntities: ({ entitiesPagedRequest }) => {
              fetchEntitiesSpy(entitiesPagedRequest());
              let result = mockProducts.slice(0, 21);
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
        // basic check the first page
        expect(store.entitiesCurrentPage().entities.length).toEqual(10);
        expect(store.entitiesCurrentPage().pageIndex).toEqual(0);
        // load next cached page
        store.loadEntitiesPage({ pageIndex: 1 });
        tick();
        // basic check the second page
        expect(store.entitiesCurrentPage().entities.length).toEqual(10);
        expect(store.entitiesCurrentPage().pageIndex).toEqual(1);
        // load last page in cache
        store.loadEntitiesPage({ pageIndex: 2 });
        tick();
        expect(store.entitiesCurrentPage().entities.length).toEqual(1);
        expect(store.entitiesCurrentPage().pageIndex).toEqual(2);
        tick();

        expect(fetchEntitiesSpy).toHaveBeenCalledTimes(3);
        // check preload next pages call
        expect(fetchEntitiesSpy).toHaveBeenCalledWith({
          startIndex: 20,
          size: 10,
          page: 2,
        });

        // only three calls should have been made the initial and the preload next pages
        expect(fetchEntitiesSpy).toHaveBeenCalledTimes(3);
        expect(store.entitiesCurrentPage().entities).toEqual(
          mockProducts.slice(20, 21),
        );
        expect(store.entitiesCurrentPage().pageSize).toEqual(10);
        expect(store.entitiesCurrentPage().pagesCount).toEqual(3);
        expect(store.entitiesCurrentPage().total).toEqual(21);
        expect(store.entitiesCurrentPage().hasPrevious).toEqual(true);
        expect(store.entitiesCurrentPage().hasNext).toEqual(false);
      });
    }));
  });

  it('should resetPage when filter is executed', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const Store = signalStore(
        withEntities({
          entity,
        }),
        withCallStatus({ initialValue: 'loading' }),
        withEntitiesRemotePagination({ entity }),
        withEntitiesRemoteFilter({
          entity,
          defaultFilter: { search: '', foo: 'bar' },
        }),
        withEntitiesLoadingCall({
          fetchEntities: ({ entitiesFilter, entitiesPagedRequest }) => {
            let result = [...mockProducts];
            if (entitiesFilter()?.search)
              result = mockProducts.filter((entity) =>
                entitiesFilter()?.search
                  ? entity.name
                      .toLowerCase()
                      .includes(entitiesFilter()?.search.toLowerCase())
                  : false,
              );
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
            return Promise.resolve({ entities: result, total });
            return Promise.resolve({ entities: result, total: result.length });
          },
        }),
      );
      const store = new Store();
      TestBed.flushEffects();
      tick(400);
      store.loadEntitiesPage({ pageIndex: 3 });
      expect(store.entitiesCurrentPage().pageIndex).toEqual(3);

      store.filterEntities({
        filter: { search: 'zero' },
        patch: true,
      });
      tick(400);
      // check page reset
      expect(store.entitiesCurrentPage().pageIndex).toEqual(0);
      expect(store.entities().length).toEqual(2);
    });
  }));

  it('should resetPage when sort is executed', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const Store = signalStore(
        withEntities({
          entity,
        }),
        withCallStatus({ initialValue: 'loading' }),
        withEntitiesRemotePagination({ entity }),
        withEntitiesRemoteSort({
          entity,
          defaultSort: { field: 'id', direction: 'asc' },
        }),
        withEntitiesLoadingCall({
          fetchEntities: ({ entitiesSort, entitiesPagedRequest }) => {
            let result = [...mockProducts];
            if (entitiesSort()?.field) {
              result = sortData(result, {
                field: entitiesSort()?.field as any,
                direction: entitiesSort().direction,
              });
            }
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
            return Promise.resolve({ entities: result, total });
          },
        }),
      );
      const store = new Store();
      TestBed.flushEffects();
      tick(400);
      store.loadEntitiesPage({ pageIndex: 3 });
      expect(store.entitiesCurrentPage().pageIndex).toEqual(3);

      store.sortEntities({
        sort: {
          field: 'name',
          direction: 'desc',
        },
      });
      tick(400);
      // check page reset
      expect(store.entitiesCurrentPage().pageIndex).toEqual(0);
      expect(store.entities().length).toEqual(30);
    });
  }));
});
