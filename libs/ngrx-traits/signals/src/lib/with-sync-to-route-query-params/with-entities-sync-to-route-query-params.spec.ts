import { Type } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, Params, provideRouter, Router } from '@angular/router';
import {
  withCallStatus,
  withEntitiesLoadingCall,
  withEntitiesLocalFilter,
  withEntitiesLocalPagination,
  withEntitiesLocalSort,
  withEntitiesRemoteFilter,
  withEntitiesRemotePagination,
  withEntitiesRemoteSort,
  withEntitiesSingleSelection,
  withEntitiesSyncToRouteQueryParams,
} from '@ngrx-traits/signals';
import { signalStore, signalStoreFeature, type } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import { map, of, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { mockProducts } from '../test.mocks';
import { Product } from '../test.model';
import { sortData } from '../with-entities-sort/with-entities-local-sort.util';

describe('withEntitiesSyncToRouteQueryParams', () => {
  const entity = type<Product>();
  const collection = 'products';

  const remoteStoreFeature = ({ load }: { load?: Subject<boolean> } = {}) => {
    return signalStoreFeature(
      signalStoreFeature(
        withEntities({ entity }),
        withCallStatus(),
        withEntitiesRemotePagination({ entity, pageSize: 10 }),
        withEntitiesRemoteSort({
          entity,
          defaultSort: { field: 'name', direction: 'asc' },
        }),
        withEntitiesRemoteFilter({
          entity,
          defaultFilter: { search: '', foo: 'bar' },
        }),
      ),
      withEntitiesSingleSelection({ entity }),
      withEntitiesLoadingCall({
        fetchEntities: ({
          entitiesFilter,
          entitiesPagedRequest,
          entitiesSort,
        }) => {
          let result = [...mockProducts.slice(0, 40)];
          const total = result.length;
          const options = {
            skip: entitiesPagedRequest()?.startIndex,
            take: entitiesPagedRequest()?.size,
          };
          if (entitiesFilter()?.search) {
            result = mockProducts.filter((entity) =>
              entitiesFilter()?.search
                ? entity.name
                    .toLowerCase()
                    .includes(entitiesFilter()?.search.toLowerCase())
                : false,
            );
          }
          if (entitiesSort()?.field) {
            result = sortData(result, {
              field: entitiesSort()?.field as any,
              direction: entitiesSort().direction,
            });
          }
          if (options?.skip || options?.take) {
            const skip = +(options?.skip ?? 0);
            const take = +(options?.take ?? 0);
            result = result.slice(skip, skip + take);
          }
          const response = { entities: result, total };
          return load
            ? load.pipe(
                filter(Boolean),
                map(() => response),
              )
            : of(response);
        },
      }),
    );
  };

  const localStoreFeature = ({ load }: { load?: Subject<boolean> } = {}) => {
    return signalStoreFeature(
      signalStoreFeature(
        withEntities({ entity }),
        withCallStatus({ initialValue: 'loading' }),
        withEntitiesLocalPagination({ entity, pageSize: 10 }),
        withEntitiesLocalSort({
          entity,
          defaultSort: { field: 'name', direction: 'asc' },
        }),
        withEntitiesLocalFilter({
          entity,
          defaultFilter: { search: '', foo: 'bar' },
          filterFn: (entity, filter) =>
            !filter?.search ||
            entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
        }),
      ),
      withEntitiesSingleSelection({ entity }),
      withEntitiesLoadingCall({
        fetchEntities: ({}) => {
          let result = [...mockProducts.slice(0, 40)];
          const total = result.length;
          const response = { entities: result, total };
          return load
            ? load.pipe(
                filter(Boolean),
                map(() => response),
              )
            : of(response);
        },
      }),
    );
  };

  const localCollectionStoreFeature = ({
    load,
  }: { load?: Subject<boolean> } = {}) => {
    return signalStoreFeature(
      signalStoreFeature(
        withEntities({ entity, collection }),
        withCallStatus({ initialValue: 'loading', collection }),
        withEntitiesLocalPagination({ entity, collection, pageSize: 10 }),
        withEntitiesLocalSort({
          entity,
          collection,
          defaultSort: { field: 'name', direction: 'asc' },
        }),
        withEntitiesLocalFilter({
          entity,
          collection,
          defaultFilter: { search: '', foo: 'bar' },
          filterFn: (entity, filter) =>
            !filter?.search ||
            entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
        }),
      ),
      withEntitiesSingleSelection({ entity, collection }),
      withEntitiesLoadingCall({
        collection,
        fetchEntities: ({}) => {
          let result = [...mockProducts.slice(0, 40)];
          const total = result.length;
          const response = { entities: result, total };
          return load
            ? load.pipe(
                filter(Boolean),
                map(() => response),
              )
            : of(response);
        },
      }),
    );
  };

  const localCollectionStoreFeature2 = ({
    load,
  }: { load?: Subject<boolean> } = {}) => {
    const collection = 'orders';
    return signalStoreFeature(
      signalStoreFeature(
        withEntities({ entity, collection }),
        withCallStatus({ initialValue: 'loading', collection }),
        withEntitiesLocalPagination({ entity, collection, pageSize: 10 }),
        withEntitiesLocalSort({
          entity,
          collection,
          defaultSort: { field: 'name', direction: 'asc' },
        }),
        withEntitiesLocalFilter({
          entity,
          collection,
          defaultFilter: { search: '', foo: 'bar' },
          filterFn: (entity, filter) =>
            !filter?.search ||
            entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
        }),
      ),
      withEntitiesSingleSelection({ entity, collection }),
      withEntitiesLoadingCall({
        collection,
        fetchEntities: ({}) => {
          let result = [...mockProducts.slice(0, 40)];
          const total = result.length;
          const response = { entities: result, total };
          return load
            ? load.pipe(
                filter(Boolean),
                map(() => response),
              )
            : of(response);
        },
      }),
    );
  };

  function init<S extends Type<any>>({
    queryParams,
    Store,
  }: {
    Store: S;
    queryParams?: Record<string, any>;
  }) {
    TestBed.configureTestingModule({
      providers: [
        Store,
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useFactory: () => ({
            queryParams: of(queryParams ?? {}),
          }),
        },
      ],
    });
    const router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate');
    return { store: TestBed.inject(Store) as InstanceType<S>, router };
  }

  describe('filter entities', () => {
    it('filter url query params  should update store', () => {
      const Store = signalStore(
        localStoreFeature(),
        withEntitiesSyncToRouteQueryParams({ entity }),
      );
      const { store } = init({
        Store,
        queryParams: { filter: JSON.stringify({ search: 'foo', foo: 'bar' }) },
      });
      expect(store.entitiesFilter()).toEqual({ search: 'foo', foo: 'bar' });
    });

    it('changes on entities filter should update url query params', fakeAsync(() => {
      const Store = signalStore(
        localStoreFeature(),
        withEntitiesSyncToRouteQueryParams({ entity }),
      );
      const { store, router } = init({
        Store,
        queryParams: { filter: JSON.stringify({ search: 'foo', foo: 'bar' }) },
      });
      store.filterEntities({
        filter: { search: 'foo3', foo: 'bar4' },
        forceLoad: true,
      });
      tick(400);
      expect(router.navigate).toBeCalledWith([], {
        relativeTo: expect.anything(),
        queryParams: expect.objectContaining({
          filter: JSON.stringify({ search: 'foo3', foo: 'bar4' }),
        }),
        queryParamsHandling: 'merge',
      });
    }));

    it('filter store and url when there is no sort or pagination', fakeAsync(() => {
      const Store = signalStore(
        withEntities({ entity }),
        withCallStatus({ initialValue: 'loading' }),
        withEntitiesLocalFilter({
          entity,
          defaultFilter: { search: '', foo: 'bar' },
          filterFn: (entity, filter) =>
            !filter?.search ||
            entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
        }),
        withEntitiesLoadingCall({
          fetchEntities: ({}) => {
            let result = [...mockProducts.slice(0, 40)];
            const total = result.length;
            const response = { entities: result, total };
            return of(response);
          },
        }),
        withEntitiesSyncToRouteQueryParams({ entity }),
      );
      const { store, router } = init({
        Store,
        queryParams: { filter: JSON.stringify({ search: 'foo', foo: 'bar' }) },
      });
      expect(store.entitiesFilter()).toEqual({ search: 'foo', foo: 'bar' });

      store.filterEntities({
        filter: { search: 'foo3', foo: 'bar4' },
        forceLoad: true,
      });
      tick(400);
      expect(router.navigate).toBeCalledWith([], {
        relativeTo: expect.anything(),
        queryParams: expect.objectContaining({
          filter: JSON.stringify({ search: 'foo3', foo: 'bar4' }),
        }),
        queryParamsHandling: 'merge',
      });
    }));

    it('filter url query params  should update store, with custom filterMapper', () => {
      const Store = signalStore(
        localStoreFeature(),
        withEntitiesSyncToRouteQueryParams({
          entity,
          filterMapper: {
            filterToQueryParams: (filter: { search: string; foo: string }) =>
              filter,
            queryParamsToFilter: (queryParams: Params) => ({
              search: queryParams['search'] as string,
              foo: queryParams['foo'] as string,
            }),
          },
        }),
      );
      const { store } = init({
        Store,
        queryParams: { search: 'foo', foo: 'bar' },
      });
      expect(store.entitiesFilter()).toEqual({ search: 'foo', foo: 'bar' });
    });

    it('changes on entities filter should update url query params, with custom filterMapper', fakeAsync(() => {
      const Store = signalStore(
        localStoreFeature(),
        withEntitiesSyncToRouteQueryParams({
          entity,
          filterMapper: {
            filterToQueryParams: (filter: { search: string; foo: string }) =>
              filter,
            queryParamsToFilter: (queryParams: Params) => ({
              search: queryParams['search'] as string,
              foo: queryParams['foo'] as string,
            }),
          },
        }),
      );

      const { store, router } = init({
        Store,
        queryParams: { filter: JSON.stringify({ search: 'foo', foo: 'bar' }) },
      });
      store.filterEntities({
        filter: { search: 'foo3', foo: 'bar4' },
        forceLoad: true,
      });
      tick(400);
      expect(router.navigate).toBeCalledWith([], {
        relativeTo: expect.anything(),
        queryParams: expect.objectContaining({
          search: 'foo3',
          foo: 'bar4',
        }),
        queryParamsHandling: 'merge',
      });
    }));
  });

  describe('sort entities', () => {
    it('url query params sort should update store', () => {
      const Store = signalStore(
        localStoreFeature(),
        withEntitiesSyncToRouteQueryParams({ entity }),
      );
      const { store } = init({
        Store,
        queryParams: { sortBy: 'description', sortDirection: 'desc' },
      });
      expect(store.entitiesSort()).toEqual({
        field: 'description',
        direction: 'desc',
      });
    });

    it('changes on entities sort should update url query params', fakeAsync(() => {
      const Store = signalStore(
        localStoreFeature(),
        withEntitiesSyncToRouteQueryParams({ entity }),
      );
      const { store, router } = init({
        Store,
        queryParams: { sortBy: 'description', sortDirection: 'desc' },
      });
      store.sortEntities({
        sort: { field: 'name', direction: 'asc' },
      });
      tick(400);
      expect(router.navigate).toBeCalledWith([], {
        relativeTo: expect.anything(),
        queryParams: expect.objectContaining({
          sortBy: 'name',
          sortDirection: 'asc',
        }),
        queryParamsHandling: 'merge',
      });
    }));

    it('changes on entities sort should store and  url if no filter or pagination present', fakeAsync(() => {
      const Store = signalStore(
        withEntities({ entity }),
        withCallStatus({ initialValue: 'loading' }),
        withEntitiesLocalSort({
          entity,
          defaultSort: { field: 'name', direction: 'asc' },
        }),
        withEntitiesLoadingCall({
          fetchEntities: ({}) => {
            let result = [...mockProducts.slice(0, 40)];
            const total = result.length;
            const response = { entities: result, total };
            return of(response);
          },
        }),
        withEntitiesSyncToRouteQueryParams({ entity }),
      );
      const { store, router } = init({
        Store,
        queryParams: { sortBy: 'description', sortDirection: 'desc' },
      });
      expect(store.entitiesSort()).toEqual({
        field: 'description',
        direction: 'desc',
      });
      store.sortEntities({
        sort: { field: 'name', direction: 'asc' },
      });
      tick(400);
      expect(router.navigate).toBeCalledWith([], {
        relativeTo: expect.anything(),
        queryParams: expect.objectContaining({
          sortBy: 'name',
          sortDirection: 'asc',
        }),
        queryParamsHandling: 'merge',
      });
    }));
  });

  describe('entities single selection', () => {
    it('url query params selectedId should update store', fakeAsync(() => {
      const load = new Subject<boolean>();
      const Store = signalStore(
        localStoreFeature({ load }),
        withEntitiesSyncToRouteQueryParams({ entity }),
      );
      const { store } = init({
        Store,
        queryParams: { selectedId: '2' },
      });
      TestBed.flushEffects();
      load.next(true);
      tick(400);
      expect(store.idSelected()).toEqual('2');
    }));

    it('url query params selectedId with invalid id should set the id as undefined in store', fakeAsync(() => {
      const load = new Subject<boolean>();
      const Store = signalStore(
        localStoreFeature({ load }),
        withEntitiesSyncToRouteQueryParams({ entity }),
      );
      const { store } = init({
        Store,
        queryParams: { selectedId: '2ASDASD' },
      });
      TestBed.flushEffects();
      load.next(true);
      tick(400);
      expect(store.idSelected()).toBeUndefined();
    }));

    it('changes on entities selectedId should update url query params', fakeAsync(() => {
      const load = new Subject<boolean>();
      const Store = signalStore(
        localStoreFeature({ load }),
        withEntitiesSyncToRouteQueryParams({ entity }),
      );
      const { store, router } = init({
        Store,
        queryParams: { selectedId: '2' },
      });
      TestBed.flushEffects();
      load.next(true);
      tick(400);
      store.selectEntity({ id: '3' });
      tick(400);
      expect(router.navigate).toBeCalledWith([], {
        relativeTo: expect.anything(),
        queryParams: expect.objectContaining({
          selectedId: '3',
        }),
        queryParamsHandling: 'merge',
      });
    }));
  });

  describe('entities pagination', () => {
    it('url query params page should update store', fakeAsync(() => {
      const load = new Subject<boolean>();
      const Store = signalStore(
        localStoreFeature({ load }),
        withEntitiesSyncToRouteQueryParams({ entity }),
      );
      const { store } = init({
        Store,
        queryParams: { page: '2' },
      });
      TestBed.flushEffects();
      load.next(true);
      tick(400);
      expect(store.entitiesPagination().currentPage).toEqual(1);
    }));

    it('url query params with invalid page not updated store', fakeAsync(() => {
      const load = new Subject<boolean>();
      const Store = signalStore(
        localStoreFeature({ load }),
        withEntitiesSyncToRouteQueryParams({ entity }),
      );
      const { store } = init({
        Store,
        queryParams: { page: '9999' },
      });
      TestBed.flushEffects();
      load.next(true);
      tick(400);
      expect(store.entitiesPagination().currentPage).toEqual(0);
    }));

    it('changes on entities page should update url query params', fakeAsync(() => {
      const load = new Subject<boolean>();
      const Store = signalStore(
        localStoreFeature({ load }),
        withEntitiesSyncToRouteQueryParams({ entity }),
      );
      const { store, router } = init({
        Store,
        queryParams: { page: '2' },
      });
      TestBed.flushEffects();
      load.next(true);
      tick(400);
      store.loadEntitiesPage({ pageIndex: 2 });
      tick(400);
      expect(router.navigate).toBeCalledWith([], {
        relativeTo: expect.anything(),
        queryParams: expect.objectContaining({
          page: '3',
        }),
        queryParamsHandling: 'merge',
      });
    }));

    it('changes on entities page should sync to store and url when there is no filter or sort', fakeAsync(() => {
      const load = new Subject<boolean>();
      const Store = signalStore(
        withEntities({ entity }),
        withCallStatus({ initialValue: 'loading' }),
        withEntitiesLocalPagination({ entity, pageSize: 10 }),
        withEntitiesLoadingCall({
          fetchEntities: ({}) => {
            let result = [...mockProducts.slice(0, 40)];
            const total = result.length;
            const response = { entities: result, total };
            return load
              ? load.pipe(
                  filter(Boolean),
                  map(() => response),
                )
              : of(response);
          },
        }),
        withEntitiesSyncToRouteQueryParams({ entity }),
      );
      const { store, router } = init({
        Store,
        queryParams: { page: '2' },
      });
      TestBed.flushEffects();
      load.next(true);
      tick(400);
      expect(store.entitiesPagination().currentPage).toEqual(1);

      store.loadEntitiesPage({ pageIndex: 2 });
      tick(400);
      expect(router.navigate).toBeCalledWith([], {
        relativeTo: expect.anything(),
        queryParams: expect.objectContaining({
          page: '3',
        }),
        queryParamsHandling: 'merge',
      });
    }));
  });

  it('multiple url and state changes should sync correctly', fakeAsync(() => {
    // Arrange
    const load = new Subject<boolean>();
    const Store = signalStore(
      localStoreFeature({ load }),
      withEntitiesSyncToRouteQueryParams({ entity }),
    );
    const { store, router } = init({
      Store,
      queryParams: {
        page: '2',
        filter: JSON.stringify({ search: '', foo: 'bar' }),
        sortBy: 'description',
        sortDirection: 'desc',
        selectedId: '2',
      },
    });
    TestBed.flushEffects();
    load.next(true);
    tick(400);
    // Act
    store.filterEntities({
      filter: { search: 'a', foo: 'bar2' },
      forceLoad: true,
    });
    store.sortEntities({ sort: { field: 'name', direction: 'asc' } });
    store.selectEntity({ id: '35' });
    store.loadEntitiesPage({ pageIndex: 2 });
    tick(10000);
    // Assert
    expect(router.navigate).toBeCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: expect.objectContaining({
        page: '3',
        filter: JSON.stringify({ search: 'a', foo: 'bar2' }),
        sortBy: 'name',
        sortDirection: 'asc',
        selectedId: '35',
      }),
      queryParamsHandling: 'merge',
    });
  }));

  it('multiple url and state changes should sync correctly using remote store features', fakeAsync(() => {
    // Arrange
    const load = new Subject<boolean>();
    const Store = signalStore(
      remoteStoreFeature({ load }),
      withEntitiesSyncToRouteQueryParams({ entity }),
    );
    const { store, router } = init({
      Store,
      queryParams: {
        page: '2',
        filter: JSON.stringify({ search: '', foo: 'bar' }),
        sortBy: 'description',
        sortDirection: 'desc',
        selectedId: '2',
      },
    });
    TestBed.flushEffects();
    load.next(true);
    tick(400);
    expect(store.entitiesFilter()).toEqual({ search: '', foo: 'bar' });
    expect(store.entitiesSort()).toEqual({
      field: 'description',
      direction: 'desc',
    });
    expect(store.idSelected()).toEqual('2');
    expect(store.entitiesPagination().currentPage).toEqual(1);

    // Act
    store.filterEntities({
      filter: { search: 'a', foo: 'bar2' },
      forceLoad: true,
    });
    load.next(true);
    tick(400);
    store.sortEntities({ sort: { field: 'name', direction: 'asc' } });
    load.next(true);
    tick(400);
    store.loadEntitiesPage({ pageIndex: 2 });
    load.next(true);
    tick(400);
    store.selectEntity({ id: '35' });
    load.next(true);
    tick(400);
    // Assert
    expect(router.navigate).toBeCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: expect.objectContaining({
        page: '3',
        filter: JSON.stringify({ search: 'a', foo: 'bar2' }),
        sortBy: 'name',
        sortDirection: 'asc',
        selectedId: '35',
      }),
      queryParamsHandling: 'merge',
    });
  }));

  it('prefix should be added to the url query params keys, with custom prefix', fakeAsync(() => {
    // Arrange
    const load = new Subject<boolean>();
    const Store = signalStore(
      localStoreFeature({ load }),
      withEntitiesSyncToRouteQueryParams({ entity, prefix: 'p' }),
    );
    const { store, router } = init({
      Store,
      queryParams: {
        'p-page': '2',
        'p-filter': JSON.stringify({ search: '', foo: 'bar' }),
        'p-sortBy': 'description',
        'p-sortDirection': 'desc',
        'p-selectedId': '2',
      },
    });
    TestBed.flushEffects();
    load.next(true);
    tick(400);
    // Act
    store.filterEntities({
      filter: { search: 'a', foo: 'bar2' },
      forceLoad: true,
    });
    store.sortEntities({ sort: { field: 'name', direction: 'asc' } });
    store.selectEntity({ id: '35' });
    store.loadEntitiesPage({ pageIndex: 2 });
    tick(400);
    // Assert
    expect(router.navigate).toBeCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: expect.objectContaining({
        'p-page': '3',
        'p-filter': JSON.stringify({ search: 'a', foo: 'bar2' }),
        'p-sortBy': 'name',
        'p-sortDirection': 'asc',
        'p-selectedId': '35',
      }),
      queryParamsHandling: 'merge',
    });
  }));

  it('collection should be use as prefix to the url query params keys, if prefix is not provided', fakeAsync(() => {
    // Arrange
    const load = new Subject<boolean>();
    const Store = signalStore(
      localCollectionStoreFeature({ load }),
      withEntitiesSyncToRouteQueryParams({ entity, collection }),
    );
    const { store, router } = init({
      Store,
      queryParams: {
        'products-page': '2',
        'products-filter': JSON.stringify({ search: '', foo: 'bar' }),
        'products-sortBy': 'description',
        'products-sortDirection': 'desc',
        'products-selectedId': '2',
      },
    });
    TestBed.flushEffects();
    load.next(true);
    tick(400);
    expect(store.productsFilter()).toEqual({ search: '', foo: 'bar' });
    expect(store.productsSort()).toEqual({
      field: 'description',
      direction: 'desc',
    });
    expect(store.productsIdSelected()).toEqual('2');
    expect(store.productsPagination().currentPage).toEqual(1);
    // Act
    store.filterProductsEntities({
      filter: { search: 'a', foo: 'bar2' },
      forceLoad: true,
    });
    store.sortProductsEntities({ sort: { field: 'name', direction: 'asc' } });
    store.selectProductsEntity({ id: '35' });
    store.loadProductsPage({ pageIndex: 2 });
    tick(400);
    // Assert
    expect(router.navigate).toBeCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: expect.objectContaining({
        'products-page': '3',
        'products-filter': JSON.stringify({ search: 'a', foo: 'bar2' }),
        'products-sortBy': 'name',
        'products-sortDirection': 'asc',
        'products-selectedId': '35',
      }),
      queryParamsHandling: 'merge',
    });
  }));

  it('prefix false should remove collection prefix', fakeAsync(() => {
    // Arrange
    const load = new Subject<boolean>();
    const Store = signalStore(
      localCollectionStoreFeature({ load }),
      withEntitiesSyncToRouteQueryParams({ entity, collection, prefix: false }),
    );
    const { store, router } = init({
      Store,
      queryParams: {
        page: '2',
        filter: JSON.stringify({ search: '', foo: 'bar' }),
        sortBy: 'description',
        sortDirection: 'desc',
        selectedId: '2',
      },
    });
    TestBed.flushEffects();
    load.next(true);
    tick(400);
    // Act
    store.filterProductsEntities({
      filter: { search: 'a', foo: 'bar2' },
      forceLoad: true,
    });
    store.sortProductsEntities({ sort: { field: 'name', direction: 'asc' } });
    store.selectProductsEntity({ id: '35' });
    store.loadProductsPage({ pageIndex: 2 });
    tick(400);
    // Assert
    expect(router.navigate).toBeCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: expect.objectContaining({
        page: '3',
        filter: JSON.stringify({ search: 'a', foo: 'bar2' }),
        sortBy: 'name',
        sortDirection: 'asc',
        selectedId: '35',
      }),
      queryParamsHandling: 'merge',
    });
  }));

  it('onQueryParamsLoaded should called after query params are set in the store', fakeAsync(() => {
    // Arrange
    const load = new Subject<boolean>();
    const queryLoaded = jest.fn();
    const Store = signalStore(
      localStoreFeature({ load }),
      withEntitiesSyncToRouteQueryParams({
        entity,
        onQueryParamsLoaded: (store) => {
          queryLoaded(store.entitiesFilter(), store.idSelected());
        },
      }),
    );
    // Act
    init({
      Store,
      queryParams: {
        page: '2',
        filter: JSON.stringify({ search: 'a', foo: 'bar' }),
        sortBy: 'description',
        sortDirection: 'desc',
        selectedId: '35',
      },
    });
    TestBed.flushEffects();
    load.next(true);
    tick(400);

    // Assert
    expect(queryLoaded).toBeCalledWith({ search: 'a', foo: 'bar' }, '35');
  }));

  it('multiple collections should be supported', fakeAsync(() => {
    // Arrange
    const load = new Subject<boolean>();
    const load2 = new Subject<boolean>();
    const Store = signalStore(
      localCollectionStoreFeature({ load }),
      withEntitiesSyncToRouteQueryParams({ entity, collection }),
      localCollectionStoreFeature2({ load: load2 }),
      withEntitiesSyncToRouteQueryParams({ entity, collection: 'orders' }),
    );
    const { store, router } = init({
      Store,
      queryParams: {
        'products-page': '2',
        'products-filter': JSON.stringify({ search: '', foo: 'bar' }),
        'products-sortBy': 'description',
        'products-sortDirection': 'desc',
        'products-selectedId': '2',
        'orders-page': '2',
        'orders-filter': JSON.stringify({ search: '', foo: 'bar2' }),
        'orders-sortBy': 'description',
        'orders-sortDirection': 'desc',
        'orders-selectedId': '2',
      },
    });
    TestBed.flushEffects();
    load.next(true);
    load2.next(true);
    tick(400);
    expect(store.productsFilter()).toEqual({ search: '', foo: 'bar' });
    expect(store.productsSort()).toEqual({
      field: 'description',
      direction: 'desc',
    });
    expect(store.productsIdSelected()).toEqual('2');
    expect(store.productsPagination().currentPage).toEqual(1);

    expect(store.ordersFilter()).toEqual({ search: '', foo: 'bar2' });
    expect(store.ordersSort()).toEqual({
      field: 'description',
      direction: 'desc',
    });
    expect(store.ordersIdSelected()).toEqual('2');
    expect(store.ordersPagination().currentPage).toEqual(1);
    // Act
    store.filterProductsEntities({
      filter: { search: 'a', foo: 'bar2' },
      forceLoad: true,
    });
    store.sortProductsEntities({ sort: { field: 'name', direction: 'asc' } });
    store.selectProductsEntity({ id: '35' });
    store.loadProductsPage({ pageIndex: 2 });

    store.filterOrdersEntities({
      filter: { search: 'a', foo: 'bar2' },
      forceLoad: true,
    });
    store.sortOrdersEntities({ sort: { field: 'name', direction: 'asc' } });
    store.selectOrdersEntity({ id: '35' });
    store.loadOrdersPage({ pageIndex: 2 });
    tick(400);
    // Assert
    expect(router.navigate).toBeCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: expect.objectContaining({
        'products-page': '3',
        'products-filter': JSON.stringify({ search: 'a', foo: 'bar2' }),
        'products-sortBy': 'name',
        'products-sortDirection': 'asc',
        'products-selectedId': '35',
      }),
      queryParamsHandling: 'merge',
    });

    expect(router.navigate).toBeCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: expect.objectContaining({
        'orders-page': '3',
        'orders-filter': JSON.stringify({ search: 'a', foo: 'bar2' }),
        'orders-sortBy': 'name',
        'orders-sortDirection': 'asc',
        'orders-selectedId': '35',
      }),
      queryParamsHandling: 'merge',
    });
  }));
});
