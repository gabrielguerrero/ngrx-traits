import {
  createEnvironmentInjector,
  EnvironmentInjector,
  Type,
} from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, Params, provideRouter, Router } from '@angular/router';
import {
  getFilterQueryMapper,
  withCallStatus,
  withEntitiesLoadingCall,
  withEntitiesLocalFilter,
  withEntitiesLocalPagination,
  withEntitiesLocalSort,
  withEntitiesMultiSelection,
  withEntitiesRemoteFilter,
  withEntitiesRemotePagination,
  withEntitiesRemoteSort,
  withEntitiesSingleSelection,
  withEntitiesSyncToRouteQueryParams,
} from '@ngrx-traits/signals';
import { signalStore, signalStoreFeature, type } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import { BehaviorSubject, map, of, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { mockProducts } from '../test.mocks';
import { Product } from '../test.model';
import { sortData } from '../with-entities-sort/with-entities-local-sort.util';

describe('withEntitiesSyncToRouteQueryParams', () => {
  const entity = type<Product>();
  const collection = 'product';

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

  const defaultFrom = new Date(2026, 0, 2);
  type NestedFilter = { search: string; range: { from: Date; to: string } };

  const nestedFilterStoreFeature = () => {
    return signalStoreFeature(
      withEntities({ entity }),
      withCallStatus({ initialValue: 'loaded' }),
      withEntitiesLocalFilter({
        entity,
        defaultFilter: {
          search: '',
          range: { from: defaultFrom, to: 'end' },
        } as NestedFilter,
        filterFn: (e, filter) =>
          !filter?.search ||
          e?.name.toLowerCase().includes(filter.search.toLowerCase()),
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
    const collection = 'order';
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
    vi.spyOn(router, 'navigate');
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
      expect(router.navigate).toHaveBeenCalledWith([], {
        relativeTo: expect.anything(),
        queryParams: expect.objectContaining({
          filter: JSON.stringify({ search: 'foo3', foo: 'bar4' }),
        }),
        queryParamsHandling: 'merge',
        // the initial push replaces the history entry instead of adding one
        replaceUrl: true,
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
      expect(router.navigate).toHaveBeenCalledWith([], {
        relativeTo: expect.anything(),
        queryParams: expect.objectContaining({
          filter: JSON.stringify({ search: 'foo3', foo: 'bar4' }),
        }),
        queryParamsHandling: 'merge',
        // the initial push replaces the history entry instead of adding one
        replaceUrl: true,
      });
    }));

    it('filter url query params should update store, with a generated filterMapper', () => {
      const Store = signalStore(
        localStoreFeature(),
        withEntitiesSyncToRouteQueryParams({
          entity,
          filterMapper: getFilterQueryMapper<{ search: string; foo: string }>({
            search: 'string',
            foo: 'string',
          }),
        }),
      );
      const { store } = init({
        Store,
        queryParams: { search: 'foo', foo: 'bar' },
      });
      expect(store.entitiesFilter()).toEqual({ search: 'foo', foo: 'bar' });
    });

    it('should leave the filter alone when the url carries none of its fields, with a generated filterMapper', () => {
      const Store = signalStore(
        localStoreFeature(),
        withEntitiesSyncToRouteQueryParams({
          entity,
          filterMapper: getFilterQueryMapper<{ search: string; foo: string }>({
            search: 'string',
            foo: 'string',
          }),
        }),
      );
      const { store } = init({ Store, queryParams: {} });
      expect(store.entitiesFilter()).toEqual({ search: '', foo: 'bar' });
    });

    it('should keep filter fields the generated filterMapper does not declare', () => {
      const Store = signalStore(
        localStoreFeature(),
        withEntitiesSyncToRouteQueryParams({
          entity,
          // foo is deliberately left out of the url
          filterMapper: getFilterQueryMapper<{ search: string; foo: string }>({
            search: 'string',
          }),
        }),
      );
      const { store } = init({ Store, queryParams: { search: 'foo' } });
      // foo keeps its default instead of being wiped by the partial filter
      expect(store.entitiesFilter()).toEqual({ search: 'foo', foo: 'bar' });
    });

    it('should restore a declared filter field to its default when its param is not in the url', () => {
      const Store = signalStore(
        localStoreFeature(),
        withEntitiesSyncToRouteQueryParams({
          entity,
          filterMapper: getFilterQueryMapper<{ search: string; foo: string }>({
            search: 'string',
            foo: 'string',
          }),
        }),
      );
      const { store } = init({ Store, queryParams: { search: 'foo' } });
      // foo is declared but not in the url, so it falls back to the value it
      // has in defaultFilter instead of being handed to filterFn as undefined
      expect(store.entitiesFilter()).toEqual({ search: 'foo', foo: 'bar' });
    });

    it('should restore the declared fields to their defaults on a bare url', () => {
      const Store = signalStore(
        localStoreFeature(),
        withEntitiesSyncToRouteQueryParams({
          entity,
          filterMapper: getFilterQueryMapper<{ search: string; foo: string }>({
            search: 'string',
            foo: 'string',
          }),
        }),
      );
      const { store } = init({ Store, queryParams: {} });
      expect(store.entitiesFilter()).toEqual({ search: '', foo: 'bar' });
    });

    it('should not hand a declared field to filterFn as undefined', () => {
      // a filterFn written against the filter shape used to throw inside the
      // filter rxMethod when a declared param was missing, which killed the
      // subscription and turned every later filterEntities call into a no op
      const Store = signalStore(
        withEntities({ entity }),
        withCallStatus({ initialValue: 'loaded' }),
        withEntitiesLocalFilter({
          entity,
          defaultFilter: { search: '', category: 'all' },
          filterFn: (e, filter) =>
            filter.category.toLowerCase() === 'all' &&
            e.name.toLowerCase().includes(filter.search.toLowerCase()),
        }),
        withEntitiesSyncToRouteQueryParams({
          entity,
          filterMapper: getFilterQueryMapper<{
            search: string;
            category: string;
          }>({ search: 'string' }),
        }),
      );
      const { store } = init({ Store, queryParams: { search: 'a' } });
      expect(() => store.entities()).not.toThrow();
      expect(store.entitiesFilter()).toEqual({ search: 'a', category: 'all' });
    });

    it('should spread a nested filter field over one param per leaf', () => {
      const Store = signalStore(
        nestedFilterStoreFeature(),
        withEntitiesSyncToRouteQueryParams({
          entity,
          filterMapper: getFilterQueryMapper<NestedFilter>({
            search: 'string',
            range: { from: 'date' },
          }),
        }),
      );
      const { store } = init({
        Store,
        queryParams: { search: 'foo', 'range.from': '2026-05-06' },
      });
      expect(store.entitiesFilter()).toEqual({
        search: 'foo',
        // a nested date comes back a Date, and to, which is not declared,
        // keeps the value it has in defaultFilter
        range: { from: new Date(2026, 4, 6), to: 'end' },
      });
    });

    it('should restore a declared nested field to its default when its param is not in the url', () => {
      const Store = signalStore(
        nestedFilterStoreFeature(),
        withEntitiesSyncToRouteQueryParams({
          entity,
          filterMapper: getFilterQueryMapper<NestedFilter>({
            search: 'string',
            range: { from: 'date' },
          }),
        }),
      );
      const { store } = init({ Store, queryParams: { search: 'foo' } });
      expect(store.entitiesFilter()).toEqual({
        search: 'foo',
        range: { from: defaultFrom, to: 'end' },
      });
    });

    function initWithQueryParams<S extends Type<any>>({
      Store,
      queryParams,
    }: {
      Store: S;
      queryParams: Subject<Record<string, any>>;
    }) {
      TestBed.configureTestingModule({
        providers: [
          Store,
          provideRouter([]),
          {
            provide: ActivatedRoute,
            useFactory: () => ({ queryParams }),
          },
        ],
      });
      const router = TestBed.inject(Router);
      vi.spyOn(router, 'navigate').mockResolvedValue(true);
      return { store: TestBed.inject(Store) as InstanceType<S> };
    }

    it('should keep an undeclared nested field the user changed, not only on the first load', fakeAsync(() => {
      const Store = signalStore(
        nestedFilterStoreFeature(),
        withEntitiesSyncToRouteQueryParams({
          entity,
          // to is deliberately left out, only from is synced
          filterMapper: getFilterQueryMapper<NestedFilter>({
            search: 'string',
            range: { from: 'date' },
          }),
        }),
      );
      const queryParams = new Subject<Record<string, any>>();
      const { store } = initWithQueryParams({ Store, queryParams });
      queryParams.next({});
      tick(400);

      store.filterEntities({
        filter: { search: '', range: { from: defaultFrom, to: 'MINE' } },
        forceLoad: true,
      });
      tick(400);
      expect(store.entitiesFilter().range.to).toBe('MINE');

      // a later emission, a back navigation or another feature pushing a param
      queryParams.next({ search: 'foo' });
      tick(400);

      expect(store.entitiesFilter()).toEqual({
        search: 'foo',
        // the field the mapper does not declare keeps what the user set, it
        // used to be reset to the value it has in defaultFilter
        range: { from: defaultFrom, to: 'MINE' },
      });
    }));

    it('should keep an undeclared nested field when the default filter has no value for it', fakeAsync(() => {
      type OptionalRangeFilter = {
        search: string;
        range?: { from: Date; to: string };
      };
      const Store = signalStore(
        withEntities({ entity }),
        withCallStatus({ initialValue: 'loaded' }),
        withEntitiesLocalFilter({
          entity,
          defaultFilter: { search: '' } as OptionalRangeFilter,
          filterFn: (e, filter) =>
            !filter?.search ||
            e?.name.toLowerCase().includes(filter.search.toLowerCase()),
        }),
        withEntitiesSyncToRouteQueryParams({
          entity,
          filterMapper: getFilterQueryMapper<OptionalRangeFilter>({
            search: 'string',
            range: { from: 'date' },
          }),
        }),
      );
      const queryParams = new Subject<Record<string, any>>();
      const { store } = initWithQueryParams({ Store, queryParams });
      queryParams.next({});
      tick(400);

      store.filterEntities({
        filter: { search: '', range: { from: defaultFrom, to: 'MINE' } },
        forceLoad: true,
      });
      tick(400);

      queryParams.next({ search: 'foo' });
      tick(400);

      // the whole range used to be replaced by { from: undefined }
      expect(store.entitiesFilter()).toEqual({
        search: 'foo',
        range: { from: defaultFrom, to: 'MINE' },
      });
    }));

    it('changes on a nested filter field should update url query params', fakeAsync(() => {
      const Store = signalStore(
        nestedFilterStoreFeature(),
        withEntitiesSyncToRouteQueryParams({
          entity,
          filterMapper: getFilterQueryMapper<NestedFilter>({
            search: 'string',
            range: { from: 'date' },
          }),
        }),
      );
      const { store, router } = init({ Store, queryParams: {} });
      store.filterEntities({
        filter: {
          search: 'foo3',
          range: { from: new Date(2026, 4, 6), to: 'end' },
        },
        forceLoad: true,
      });
      tick(400);
      expect(router.navigate).toHaveBeenCalledWith([], {
        relativeTo: expect.anything(),
        queryParams: expect.objectContaining({
          search: 'foo3',
          'range.from': '2026-05-06',
        }),
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }));

    it('changes on entities filter should update url query params, with a generated filterMapper', fakeAsync(() => {
      const Store = signalStore(
        localStoreFeature(),
        withEntitiesSyncToRouteQueryParams({
          entity,
          filterMapper: getFilterQueryMapper<{ search: string; foo: string }>({
            search: 'string',
            foo: 'string',
          }),
        }),
      );
      const { store, router } = init({ Store, queryParams: {} });
      store.filterEntities({
        filter: { search: 'foo3', foo: 'bar4' },
        forceLoad: true,
      });
      tick(400);
      expect(router.navigate).toHaveBeenCalledWith([], {
        relativeTo: expect.anything(),
        queryParams: expect.objectContaining({
          // one param per field instead of a single json blob
          search: 'foo3',
          foo: 'bar4',
        }),
        queryParamsHandling: 'merge',
        replaceUrl: true,
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
      expect(router.navigate).toHaveBeenCalledWith([], {
        relativeTo: expect.anything(),
        queryParams: expect.objectContaining({
          search: 'foo3',
          foo: 'bar4',
        }),
        queryParamsHandling: 'merge',
        // the initial push replaces the history entry instead of adding one
        replaceUrl: true,
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
      expect(router.navigate).toHaveBeenCalledWith([], {
        relativeTo: expect.anything(),
        queryParams: expect.objectContaining({
          sortBy: 'name',
          sortDirection: 'asc',
        }),
        queryParamsHandling: 'merge',
        // the initial push replaces the history entry instead of adding one
        replaceUrl: true,
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
      expect(router.navigate).toHaveBeenCalledWith([], {
        relativeTo: expect.anything(),
        queryParams: expect.objectContaining({
          sortBy: 'name',
          sortDirection: 'asc',
        }),
        queryParamsHandling: 'merge',
        // the initial push replaces the history entry instead of adding one
        replaceUrl: true,
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
      tick();
      load.next(true);
      tick(400);
      expect(store.idSelected()).toEqual('2');
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
      tick();
      load.next(true);
      tick(400);
      store.selectEntity({ id: '3' });
      tick(400);
      expect(router.navigate).toHaveBeenCalledWith([], {
        relativeTo: expect.anything(),
        queryParams: expect.objectContaining({
          selectedId: '3',
        }),
        queryParamsHandling: 'merge',
      });
    }));
  });

  describe('entities multi selection', () => {
    const multiSelectionStoreFeature = ({
      load,
    }: { load?: Subject<boolean> } = {}) => {
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
        withEntitiesMultiSelection({ entity }),
        withEntitiesLoadingCall({
          fetchEntities: ({}) => {
            const result = [...mockProducts.slice(0, 40)];
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

    it('url query params selectedIds should update store', fakeAsync(() => {
      const load = new Subject<boolean>();
      const Store = signalStore(
        multiSelectionStoreFeature({ load }),
        withEntitiesSyncToRouteQueryParams({
          entity,
          syncSingleSelection: false,
          syncMultiSelection: true,
        }),
      );
      const { store } = init({
        Store,
        queryParams: { selectedIds: '2,3' },
      });
      tick();
      load.next(true);
      tick(400);
      expect(store.idsSelected()).toEqual(['2', '3']);
    }));

    it('changes on idsSelected should update url query params', fakeAsync(() => {
      const load = new Subject<boolean>();
      const Store = signalStore(
        multiSelectionStoreFeature({ load }),
        withEntitiesSyncToRouteQueryParams({
          entity,
          syncSingleSelection: false,
          syncMultiSelection: true,
        }),
      );
      const { store, router } = init({
        Store,
        queryParams: {},
      });
      tick();
      load.next(true);
      tick(400);
      store.selectEntities({ ids: ['3', '5'] });
      tick(400);
      expect(router.navigate).toHaveBeenCalledWith([], {
        relativeTo: expect.anything(),
        queryParams: expect.objectContaining({
          selectedIds: '3,5',
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
        queryParams: { page: '2', pageSize: '5' },
      });
      tick();
      load.next(true);
      tick(400);
      expect(store.entitiesPagination().currentPage).toEqual(1);
      expect(store.entitiesPagination().pageSize).toEqual(5);
    }));

    it('url query params pageSize should update store pageSize', fakeAsync(() => {
      const load = new Subject<boolean>();
      const Store = signalStore(
        localStoreFeature({ load }),
        withEntitiesSyncToRouteQueryParams({ entity }),
      );
      const { store } = init({
        Store,
        queryParams: { page: '1', pageSize: '20' },
      });
      tick();
      load.next(true);
      tick(400);
      expect(store.entitiesPagination().pageSize).toEqual(20);
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
      tick();
      load.next(true);
      tick(400);
      store.loadEntitiesPage({ pageIndex: 2 });
      tick(400);
      expect(router.navigate).toHaveBeenCalledWith([], {
        relativeTo: expect.anything(),
        queryParams: expect.objectContaining({
          page: '3',
          pageSize: '10',
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
      tick();
      load.next(true);
      tick(400);
      expect(store.entitiesPagination().currentPage).toEqual(1);

      store.loadEntitiesPage({ pageIndex: 2 });
      tick(400);
      expect(router.navigate).toHaveBeenCalledWith([], {
        relativeTo: expect.anything(),
        queryParams: expect.objectContaining({
          page: '3',
          pageSize: '10',
        }),
        queryParamsHandling: 'merge',
      });
    }));
  });

  it('multiple url and state changes should sync correctly', async () => {
    // Arrange
    const load = new BehaviorSubject<boolean>(false);
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
    load.next(true);
    // wait for initial load + URL restore (selection/pagination mappers
    // re-apply after loading completes, so user actions must come after)
    await expect.poll(() => store.idSelected()).toBe('2');
    await expect.poll(() => store.entitiesPagination().currentPage).toBe(1);
    // Act
    store.filterEntities({
      filter: { search: 'a', foo: 'bar2' },
      forceLoad: true,
    });
    store.sortEntities({ sort: { field: 'name', direction: 'asc' } });
    store.selectEntity({ id: '35' });
    store.loadEntitiesPage({ pageIndex: 2 });
    load.next(true);
    // Assert
    await expect
      .poll(
        () => (router.navigate as any).mock.calls.at(-1)?.[1]?.queryParams,
        { timeout: 2000 },
      )
      .toEqual(
        expect.objectContaining({
          page: '3',
          pageSize: '10',
          filter: JSON.stringify({ search: 'a', foo: 'bar2' }),
          sortBy: 'name',
          sortDirection: 'asc',
          selectedId: '35',
        }),
      );
  });

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
        selectedId: '12',
      },
    });
    tick();
    load.next(true);
    tick(400);
    expect(store.isLoaded()).toBe(true);
    expect(store.entitiesFilter()).toEqual({ search: '', foo: 'bar' });
    expect(store.entitiesSort()).toEqual({
      field: 'description',
      direction: 'desc',
    });
    expect(store.idSelected()).toEqual('12');
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
    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: expect.objectContaining({
        page: '3',
        pageSize: '10',
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
    tick();
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
    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: expect.objectContaining({
        'p-page': '3',
        'p-pageSize': '10',
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
        'product-page': '2',
        'product-filter': JSON.stringify({ search: '', foo: 'bar' }),
        'product-sortBy': 'description',
        'product-sortDirection': 'desc',
        'product-selectedId': '2',
      },
    });
    tick();
    load.next(true);
    tick(400);
    expect(store.productEntitiesFilter()).toEqual({ search: '', foo: 'bar' });
    expect(store.productEntitiesSort()).toEqual({
      field: 'description',
      direction: 'desc',
    });
    expect(store.productIdSelected()).toEqual('2');
    expect(store.productEntitiesPagination().currentPage).toEqual(1);
    // Act
    store.filterProductEntities({
      filter: { search: 'a', foo: 'bar2' },
      forceLoad: true,
    });
    store.sortProductEntities({ sort: { field: 'name', direction: 'asc' } });
    store.selectProductEntity({ id: '35' });
    store.loadProductEntitiesPage({ pageIndex: 2 });
    tick(400);
    // Assert
    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: expect.objectContaining({
        'product-page': '3',
        'product-pageSize': '10',
        'product-filter': JSON.stringify({ search: 'a', foo: 'bar2' }),
        'product-sortBy': 'name',
        'product-sortDirection': 'asc',
        'product-selectedId': '35',
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
    tick();
    load.next(true);
    tick(400);
    // Act
    store.filterProductEntities({
      filter: { search: 'a', foo: 'bar2' },
      forceLoad: true,
    });
    store.sortProductEntities({ sort: { field: 'name', direction: 'asc' } });
    store.selectProductEntity({ id: '35' });
    store.loadProductEntitiesPage({ pageIndex: 2 });
    tick(400);
    // Assert
    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: expect.objectContaining({
        page: '3',
        pageSize: '10',
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
    const queryLoaded = vi.fn();
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
    tick();
    load.next(true);
    tick(400);

    // Assert
    expect(queryLoaded).toHaveBeenCalledWith({ search: 'a', foo: 'bar' }, '35');
  }));

  it('multiple collections should be supported', fakeAsync(() => {
    // Arrange
    const load = new Subject<boolean>();
    const load2 = new Subject<boolean>();
    const Store = signalStore(
      localCollectionStoreFeature({ load }),
      withEntitiesSyncToRouteQueryParams({ entity, collection }),
      localCollectionStoreFeature2({ load: load2 }),
      withEntitiesSyncToRouteQueryParams({ entity, collection: 'order' }),
    );
    const { store, router } = init({
      Store,
      queryParams: {
        'product-page': '2',
        'product-filter': JSON.stringify({ search: '', foo: 'bar' }),
        'product-sortBy': 'description',
        'product-sortDirection': 'desc',
        'product-selectedId': '2',
        'order-page': '2',
        'order-filter': JSON.stringify({ search: '', foo: 'bar2' }),
        'order-sortBy': 'description',
        'order-sortDirection': 'desc',
        'order-selectedId': '2',
      },
    });
    tick();
    load.next(true);
    load2.next(true);
    tick(400);
    expect(store.productEntitiesFilter()).toEqual({ search: '', foo: 'bar' });
    expect(store.productEntitiesSort()).toEqual({
      field: 'description',
      direction: 'desc',
    });
    expect(store.productIdSelected()).toEqual('2');
    expect(store.productEntitiesPagination().currentPage).toEqual(1);

    expect(store.orderEntitiesFilter()).toEqual({ search: '', foo: 'bar2' });
    expect(store.orderEntitiesSort()).toEqual({
      field: 'description',
      direction: 'desc',
    });
    expect(store.orderIdSelected()).toEqual('2');
    expect(store.orderEntitiesPagination().currentPage).toEqual(1);
    // Act
    store.filterProductEntities({
      filter: { search: 'a', foo: 'bar2' },
      forceLoad: true,
    });
    store.sortProductEntities({ sort: { field: 'name', direction: 'asc' } });
    store.selectProductEntity({ id: '35' });
    store.loadProductEntitiesPage({ pageIndex: 2 });

    store.filterOrderEntities({
      filter: { search: 'a', foo: 'bar2' },
      forceLoad: true,
    });
    store.sortOrderEntities({ sort: { field: 'name', direction: 'asc' } });
    store.selectOrderEntity({ id: '35' });
    store.loadOrderEntitiesPage({ pageIndex: 2 });
    tick(400);
    // Assert
    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: expect.objectContaining({
        'product-page': '3',
        'product-pageSize': '10',
        'product-filter': JSON.stringify({ search: 'a', foo: 'bar2' }),
        'product-sortBy': 'name',
        'product-sortDirection': 'asc',
        'product-selectedId': '35',
      }),
      queryParamsHandling: 'merge',
    });

    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: expect.objectContaining({
        'order-page': '3',
        'order-pageSize': '10',
        'order-filter': JSON.stringify({ search: 'a', foo: 'bar2' }),
        'order-sortBy': 'name',
        'order-sortDirection': 'asc',
        'order-selectedId': '35',
      }),
      queryParamsHandling: 'merge',
    });
  }));

  it('should not restore state from query params on init  if restoreOnInit is false', () => {
    const Store = signalStore(
      localStoreFeature(),
      withEntitiesSyncToRouteQueryParams({ entity, restoreOnInit: false }),
    );
    const { store } = init({
      Store,
      queryParams: {
        filter: JSON.stringify({ search: 'foo', foo: 'bar' }),
        sortBy: 'description',
        sortDirection: 'desc',
      },
    });
    expect(store.entitiesFilter()).not.toEqual({ search: 'foo', foo: 'bar' });

    expect(store.entitiesSort()).not.toEqual({
      field: 'description',
      direction: 'desc',
    });
    store.loadFromQueryParams();
    expect(store.entitiesFilter()).toEqual({ search: 'foo', foo: 'bar' });

    expect(store.entitiesSort()).toEqual({
      field: 'description',
      direction: 'desc',
    });
  });

  describe('skipLoadingCall parameter', () => {
    it('should pass skipLoadingCall to filterEntities when loading from query params', fakeAsync(() => {
      const fetchEntitiesSpy = vi.fn(() =>
        of({ entities: mockProducts.slice(0, 10), total: 10 }),
      );
      const Store = signalStore(
        withEntities({ entity }),
        withCallStatus(),
        withEntitiesRemoteFilter({
          entity,
          defaultFilter: { search: '', foo: 'bar' },
        }),
        withEntitiesLoadingCall({
          fetchEntities: fetchEntitiesSpy,
        }),
        withEntitiesSyncToRouteQueryParams({ entity, skipLoadingCall: true }),
      );
      init({
        Store,
        queryParams: { filter: JSON.stringify({ search: 'test', foo: 'bar' }) },
      });
      tick();
      tick(400);
      // With skipLoadingCall: true, the fetchEntities should not be called
      expect(fetchEntitiesSpy).not.toHaveBeenCalled();
    }));

    it('should pass skipLoadingCall to sortEntities when loading from query params', fakeAsync(() => {
      const fetchEntitiesSpy = vi.fn(() =>
        of({ entities: mockProducts.slice(0, 10), total: 10 }),
      );
      const Store = signalStore(
        withEntities({ entity }),
        withCallStatus(),
        withEntitiesRemoteSort({
          entity,
          defaultSort: { field: 'name', direction: 'asc' },
        }),
        withEntitiesLoadingCall({
          fetchEntities: fetchEntitiesSpy,
        }),
        withEntitiesSyncToRouteQueryParams({ entity, skipLoadingCall: true }),
      );
      init({
        Store,
        queryParams: { sortBy: 'description', sortDirection: 'desc' },
      });
      tick();
      tick(400);
      // With skipLoadingCall: true, the fetchEntities should not be called
      expect(fetchEntitiesSpy).not.toHaveBeenCalled();
    }));

    it('should pass skipLoadingCall to loadEntitiesPage when loading from query params', fakeAsync(() => {
      const load = new Subject<boolean>();
      const fetchEntitiesSpy = vi.fn(() =>
        load.pipe(
          filter(Boolean),
          map(() => ({ entities: mockProducts.slice(0, 10), total: 40 })),
        ),
      );
      const Store = signalStore(
        withEntities({ entity }),
        withCallStatus({ initialValue: 'loading' }),
        withEntitiesRemotePagination({ entity, pageSize: 10 }),
        withEntitiesLoadingCall({
          fetchEntities: fetchEntitiesSpy,
        }),
        withEntitiesSyncToRouteQueryParams({ entity, skipLoadingCall: true }),
      );
      init({
        Store,
        queryParams: { page: '2' },
      });
      tick();
      load.next(true);
      tick(400);
      // With skipLoadingCall: true, the fetchEntities should only be called once (initial load)
      expect(fetchEntitiesSpy).toHaveBeenCalledTimes(1);
    }));

    it('skipLoadingCall should only apply on the first load, subsequent URL changes (back-nav) should trigger loading', fakeAsync(() => {
      const fetchEntitiesSpy = vi.fn(() =>
        of({ entities: mockProducts.slice(0, 10), total: 10 }),
      );
      const Store = signalStore(
        withEntities({ entity }),
        withCallStatus(),
        withEntitiesRemoteFilter({
          entity,
          defaultFilter: { search: '', foo: 'bar' },
        }),
        withEntitiesLoadingCall({ fetchEntities: fetchEntitiesSpy }),
        withEntitiesSyncToRouteQueryParams({ entity, skipLoadingCall: true }),
      );
      const queryParams$ = new BehaviorSubject<Params>({
        filter: JSON.stringify({ search: 'first', foo: 'bar' }),
      });
      TestBed.configureTestingModule({
        providers: [
          Store,
          provideRouter([]),
          {
            provide: ActivatedRoute,
            useFactory: () => ({ queryParams: queryParams$ }),
          },
        ],
      });
      TestBed.inject(Store);
      tick();
      tick(500);
      // first load honours skipLoadingCall: true → no fetch
      expect(fetchEntitiesSpy).not.toHaveBeenCalled();

      // simulate browser back/forward navigation with a new URL
      queryParams$.next({
        filter: JSON.stringify({ search: 'second', foo: 'bar' }),
      });
      tick(1000);
      // subsequent URL changes must not skip the loading call
      expect(fetchEntitiesSpy).toHaveBeenCalled();
    }));

    it('should call fetchEntities when skipLoadingCall is false (default)', fakeAsync(() => {
      const load = new Subject<boolean>();
      const fetchEntitiesSpy = vi.fn(() =>
        load.pipe(
          filter(Boolean),
          map(() => ({ entities: mockProducts.slice(0, 10), total: 10 })),
        ),
      );
      const Store = signalStore(
        withEntities({ entity }),
        withCallStatus(),
        withEntitiesRemoteFilter({
          entity,
          defaultFilter: { search: '', foo: 'bar' },
        }),
        withEntitiesLoadingCall({
          fetchEntities: fetchEntitiesSpy,
        }),
        withEntitiesSyncToRouteQueryParams({ entity, skipLoadingCall: false }),
      );
      init({
        Store,
        queryParams: { filter: JSON.stringify({ search: 'test', foo: 'bar' }) },
      });
      tick();
      load.next(true);
      tick(400);
      // With skipLoadingCall: false, the fetchEntities should be called
      expect(fetchEntitiesSpy).toHaveBeenCalled();
    }));

    it('should honour skipLoadingCall on every store instance', fakeAsync(() => {
      // the mappers are built once per store definition, so a firstLoad flag
      // kept in their closure would leak from one instance to the next and
      // silently ignore skipLoadingCall from the second instance onwards
      const fetchEntitiesSpy = vi.fn(() =>
        of({ entities: mockProducts.slice(0, 10), total: 10 }),
      );
      const Store = signalStore(
        withEntities({ entity }),
        withCallStatus(),
        withEntitiesRemoteFilter({
          entity,
          defaultFilter: { search: '', foo: 'bar' },
        }),
        withEntitiesLoadingCall({ fetchEntities: fetchEntitiesSpy }),
        withEntitiesSyncToRouteQueryParams({ entity, skipLoadingCall: true }),
      );
      TestBed.configureTestingModule({
        providers: [
          provideRouter([]),
          {
            provide: ActivatedRoute,
            useFactory: () => ({
              queryParams: of({
                filter: JSON.stringify({ search: 'test', foo: 'bar' }),
              }),
            }),
          },
        ],
      });
      const router = TestBed.inject(Router);
      vi.spyOn(router, 'navigate').mockResolvedValue(true);
      const parentInjector = TestBed.inject(EnvironmentInjector);

      // each instance is its own first load, so none of them should fetch
      for (const instance of [1, 2, 3]) {
        const injector = createEnvironmentInjector([Store], parentInjector);
        const store = injector.get(Store) as any;
        tick();
        tick(400);
        expect(store.entitiesFilter()).toEqual({
          search: 'test',
          foo: 'bar',
        });
        expect(
          fetchEntitiesSpy,
          `fetchEntities should not be called for instance ${instance}`,
        ).not.toHaveBeenCalled();
      }
    }));
  });
});
