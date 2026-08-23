import { signalStore, type } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import { of } from 'rxjs';

import {
  withCallStatus,
  withEntitiesCalls,
  withEntitiesHybridFilter,
  withEntitiesLoadingCall,
  withEntitiesLocalFilter,
  withEntitiesLocalPagination,
  withEntitiesLocalSort,
  withEntitiesMultiSelection,
  withEntitiesRemoteFilter,
  withEntitiesRemotePagination,
  withEntitiesRemoteScrollPagination,
  withEntitiesRemoteSort,
  withEntitiesSingleSelection,
  withEntitiesSyncToRouteQueryParams,
  withLinkEntitiesFilter,
  withLinkEntitiesMultiSelection,
  withLinkEntitiesSingleSelection,
  withLinkEntitiesSort,
} from './index';
import { Product } from './test.model';
import { withFeatureFactory } from './with-feature-factory/with-feature-factory';

/**
 * These are type only tests, each @ts-expect-error checks the feature reports
 * the missing feature it depends on, the message is in the comment above it.
 */
describe('feature requirements', () => {
  const entity = type<Product>();
  const collection = 'product';

  it('features that require withEntities should report it as missing', () => {
    signalStore(
      // withEntitiesLocalFilter requires withEntities({ entity, collection: 'product' })
      // @ts-expect-error
      withEntitiesLocalFilter({
        entity,
        collection,
        filterFn: (e, f: { search: string }) => e.name.includes(f.search),
        defaultFilter: { search: '' },
      }),
    );
    // withEntitiesLocalPagination requires withEntities({ entity })
    // @ts-expect-error
    signalStore(withEntitiesLocalPagination({ entity, pageSize: 10 }));
    // withEntitiesSingleSelection requires withEntities({ entity })
    // @ts-expect-error
    signalStore(withEntitiesSingleSelection({ entity }));
    // withEntitiesMultiSelection requires withEntities({ entity })
    // @ts-expect-error
    signalStore(withEntitiesMultiSelection({ entity }));
    signalStore(
      // withEntitiesLocalSort requires withEntities({ entity })
      // @ts-expect-error
      withEntitiesLocalSort({
        entity,
        defaultSort: { field: 'name', direction: 'asc' },
      }),
    );
    signalStore(
      // withEntitiesCalls requires withEntities({ entity })
      // @ts-expect-error
      withEntitiesCalls({
        entity,
        calls: () => ({
          loadDetail: ({ entity: e }: { entity: Product }) => of(e),
        }),
      }),
    );
  });

  it('features that require withCallStatus should report it as missing', () => {
    // withEntitiesRemoteFilter requires withCallStatus()
    // @ts-expect-error
    signalStore(
      withEntities({ entity }),
      withEntitiesRemoteFilter({ entity, defaultFilter: { search: '' } }),
    );
    // withEntitiesHybridFilter requires withCallStatus()
    // @ts-expect-error
    signalStore(
      withEntities({ entity }),
      withEntitiesHybridFilter({
        entity,
        defaultFilter: { search: '' },
        isRemoteFilter: (previous, current) =>
          previous.search !== current.search,
        filterFn: (e, f) => e.name.includes(f.search),
      }),
    );
    // withEntitiesRemoteSort requires withCallStatus()
    // @ts-expect-error
    signalStore(
      withEntities({ entity }),
      withEntitiesRemoteSort({
        entity,
        defaultSort: { field: 'name', direction: 'asc' },
      }),
    );
    // withEntitiesRemotePagination requires withCallStatus()
    // @ts-expect-error
    signalStore(
      withEntities({ entity }),
      withEntitiesRemotePagination({ entity, pageSize: 10 }),
    );
    // withEntitiesRemoteScrollPagination requires withCallStatus()
    // @ts-expect-error
    signalStore(
      withEntities({ entity }),
      withEntitiesRemoteScrollPagination({ entity, pageSize: 10 }),
    );
    // withEntitiesLoadingCall requires withCallStatus()
    // @ts-expect-error
    signalStore(
      withEntities({ entity }),
      withEntitiesLoadingCall({ fetchEntities: () => of([] as Product[]) }),
    );
    // withEntitiesSyncToRouteQueryParams requires withCallStatus()
    // @ts-expect-error
    signalStore(
      withEntities({ entity }),
      withEntitiesSyncToRouteQueryParams({ entity }),
    );
  });

  it('withLinkEntities* should report the feature they link to as missing', () => {
    // withLinkEntitiesFilter requires withEntitiesLocalFilter, withEntitiesRemoteFilter or withEntitiesHybridFilter({ entity })
    // @ts-expect-error
    signalStore(withEntities({ entity }), withLinkEntitiesFilter({ entity }));
    // withLinkEntitiesSort requires withEntitiesLocalSort or withEntitiesRemoteSort({ entity })
    // @ts-expect-error
    signalStore(withEntities({ entity }), withLinkEntitiesSort({ entity }));
    // withLinkEntitiesSingleSelection requires withEntitiesSingleSelection({ entity })
    // @ts-expect-error
    signalStore(
      withEntities({ entity }),
      withLinkEntitiesSingleSelection({ entity }),
    );
    // withLinkEntitiesMultiSelection requires withEntitiesMultiSelection({ entity })
    // @ts-expect-error
    signalStore(
      withEntities({ entity }),
      withLinkEntitiesMultiSelection({ entity }),
    );
  });

  it('features used inside withFeatureFactory should not report anything', () => {
    const Store = signalStore(
      withEntities({ entity, collection }),
      withCallStatus({ collection }),
      withFeatureFactory((store) =>
        withEntitiesLocalPagination({
          entity,
          collection,
          pageSize: store.productIds().length,
        }),
      ),
      withFeatureFactory(() =>
        withEntitiesLoadingCall({
          collection,
          fetchEntities: () => of([] as Product[]),
        }),
      ),
    );
    expect(Store).toBeDefined();
  });

  it('remote features should report withEntities as missing too', () => {
    // withEntitiesRemoteFilter requires withEntities({ entity })
    // @ts-expect-error
    signalStore(
      withCallStatus(),
      withEntitiesRemoteFilter({ entity, defaultFilter: { search: '' } }),
    );
    // withEntitiesRemotePagination requires withEntities({ entity })
    // @ts-expect-error
    signalStore(
      withCallStatus(),
      withEntitiesRemotePagination({ entity, pageSize: 10 }),
    );
    // withEntitiesSyncToRouteQueryParams requires withEntities({ entity })
    // @ts-expect-error
    signalStore(
      withCallStatus(),
      withEntitiesSyncToRouteQueryParams({ entity }),
    );
  });

  it('should not report anything when the required features are present', () => {
    const Store = signalStore(
      withEntities({ entity, collection }),
      withCallStatus({ collection }),
      withEntitiesRemoteFilter({
        entity,
        collection,
        defaultFilter: { search: '' },
      }),
      withEntitiesRemoteSort({
        entity,
        collection,
        defaultSort: { field: 'name', direction: 'asc' },
      }),
      withEntitiesRemotePagination({ entity, collection, pageSize: 10 }),
      withEntitiesCalls({
        entity,
        collection,
        calls: () => ({
          loadDetail: ({ entity: e }: { entity: Product }) => of(e),
        }),
      }),
      withEntitiesSingleSelection({ entity, collection }),
      withEntitiesMultiSelection({ entity, collection }),
      withLinkEntitiesFilter({ entity, collection }),
      withLinkEntitiesSort({ entity, collection }),
      withLinkEntitiesSingleSelection({ entity, collection }),
      withLinkEntitiesMultiSelection({ entity, collection }),
      withEntitiesLoadingCall({
        collection,
        fetchEntities: () => of({ entities: [] as Product[], total: 0 }),
      }),
    );
    expect(Store).toBeDefined();
  });
});
