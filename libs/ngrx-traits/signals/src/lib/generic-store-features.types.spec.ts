import { signalStore, signalStoreFeature, type } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import { Observable, of } from 'rxjs';

import { withCallStatus } from './with-call-status/with-call-status';
import { CallStatus } from './with-call-status/with-call-status.model';
import { withEntitiesCalls } from './with-entities-calls/with-entities-calls';
import { withEntitiesHybridFilter } from './with-entities-filter/with-entities-hybrid-filter';
import { withEntitiesLocalFilter } from './with-entities-filter/with-entities-local-filter';
import { withEntitiesRemoteFilter } from './with-entities-filter/with-entities-remote-filter';
import { withLinkEntitiesFilter } from './with-entities-filter/with-link-entities-filter';
import { withEntitiesLoadingCall } from './with-entities-loading-call/with-entities-loading-call';
import { withEntitiesLocalPagination } from './with-entities-pagination/with-entities-local-pagination';
import { withEntitiesRemotePagination } from './with-entities-pagination/with-entities-remote-pagination';
import { withEntitiesRemoteScrollPagination } from './with-entities-pagination/with-entities-remote-scroll-pagination';
import { withEntitiesMultiSelection } from './with-entities-selection/with-entities-multi-selection';
import { withEntitiesSingleSelection } from './with-entities-selection/with-entities-single-selection';
import { withLinkEntitiesMultiSelection } from './with-entities-selection/with-link-entities-multi-selection';
import { withLinkEntitiesSingleSelection } from './with-entities-selection/with-link-entities-single-selection';
import { withEntitiesLocalSort } from './with-entities-sort/with-entities-local-sort';
import { Sort } from './with-entities-sort/with-entities-local-sort.model';
import { withEntitiesRemoteSort } from './with-entities-sort/with-entities-remote-sort';
import { withLinkEntitiesSort } from './with-entities-sort/with-link-entities-sort';
import { withLogger } from './with-logger/with-logger';
import { withEntitiesSyncToRouteQueryParams } from './with-sync-to-route-query-params/with-entities-sync-to-route-query-params';

// compile time only, enforced by `nx typecheck`, which runs tsc over the
// specs: the suites are skipped so their bodies never run, the test below is
// there so vitest does not report an empty file.
describe('generic store features types', () => {
  it('should be checked by tsc', () => {
    expect(true).toBe(true);
  });
});

// custom store features with generic Entity and Collection params (issue #92),
// they must use the two args form withX(entityConfig, options) of each feature

type Product = { id: string; name: string };
type Base = { id: string | number; name: string };

// the case from issue #92
export function withEntityMethods<
  Entity extends { id: string | number },
  Collection extends string,
>(
  entity: Entity,
  collection: Collection,
  fetchEntities: () => Observable<{ entities: Entity[]; total: number }>,
) {
  return signalStoreFeature(
    withEntities({ entity, collection }),
    withCallStatus({ initialValue: 'loading', collection }),
    withEntitiesLocalPagination({ entity, collection }, { pageSize: 10 }),
    withEntitiesLoadingCall({ entity, collection }, { fetchEntities }),
    withLogger(collection),
  );
}

// local filter, local sort, local pagination, single selection, entities calls
// and the link features
export function withGenericLocal<
  Entity extends Base,
  Collection extends string,
>(entity: Entity, collection: Collection) {
  return signalStoreFeature(
    withEntities({ entity, collection }),
    withEntitiesLocalFilter(
      { entity, collection },
      {
        defaultFilter: { search: '' },
        filterFn: (e, f) => e.name.includes(f.search),
      },
    ),
    withEntitiesLocalSort(
      { entity, collection },
      { defaultSort: { field: 'name', direction: 'asc' } },
    ),
    withEntitiesLocalPagination({ entity, collection }, { pageSize: 10 }),
    withEntitiesSingleSelection({ entity, collection }, {}),
    withEntitiesCalls({ entity, collection }, () => ({
      rename: (e: Entity) => of(e),
    })),
    withLinkEntitiesFilter({ entity, collection }),
    withLinkEntitiesSort({ entity, collection }),
    withLinkEntitiesSingleSelection({ entity, collection }),
  );
}

// remote filter, remote sort, remote pagination, multi selection, loading
// call, sync to route and the link features
export function withGenericRemote<
  Entity extends Base,
  Collection extends string,
>(entity: Entity, collection: Collection) {
  return signalStoreFeature(
    withEntities({ entity, collection }),
    withCallStatus({ initialValue: 'loading', collection }),
    withEntitiesRemoteFilter(
      { entity, collection },
      { defaultFilter: { search: '' } },
    ),
    withEntitiesRemoteSort(
      { entity, collection },
      { defaultSort: { field: 'name', direction: 'asc' } },
    ),
    withEntitiesRemotePagination({ entity, collection }, { pageSize: 10 }),
    withEntitiesMultiSelection({ entity, collection }, {}),
    withEntitiesLoadingCall({ entity, collection }, () => ({
      fetchEntities: () => of({ entities: [] as Entity[], total: 0 }),
    })),
    withEntitiesSyncToRouteQueryParams({ entity, collection }, {}),
    withLinkEntitiesFilter({ entity, collection }),
    withLinkEntitiesMultiSelection({ entity, collection }),
  );
}

// hybrid filter, scroll pagination, loading call returning a promise
export function withGenericScroll<
  Entity extends Base,
  Collection extends string,
>(entity: Entity, collection: Collection) {
  return signalStoreFeature(
    withEntities({ entity, collection }),
    withCallStatus({ initialValue: 'loading', collection }),
    withEntitiesHybridFilter(
      { entity, collection },
      {
        defaultFilter: { search: '', page: 0 },
        filterFn: (e, f) => e.name.includes(f.search),
        isRemoteFilter: (p, c) => p.page !== c.page,
      },
    ),
    withEntitiesRemoteScrollPagination({ entity, collection }, {}),
    withEntitiesLoadingCall({ entity, collection }, () => ({
      fetchEntities: () =>
        Promise.resolve({ entities: [] as Entity[], hasMore: false }),
      onSuccess: (result) => void result.hasMore,
    })),
  );
}

// only the entity config, the options arg is optional in these features
export function withGenericNoOptions<
  Entity extends Base,
  Collection extends string,
>(entity: Entity, collection: Collection) {
  return signalStoreFeature(
    withEntities({ entity, collection }),
    withCallStatus({ initialValue: 'loading', collection }),
    withEntitiesLocalPagination({ entity, collection }),
    withEntitiesSingleSelection({ entity, collection }),
    withEntitiesMultiSelection({ entity, collection }),
    withEntitiesSyncToRouteQueryParams({ entity, collection }),
  );
}
export function withGenericRemotePaginationNoOptions<
  Entity extends Base,
  Collection extends string,
>(entity: Entity, collection: Collection) {
  return signalStoreFeature(
    withEntities({ entity, collection }),
    withCallStatus({ initialValue: 'loading', collection }),
    withEntitiesRemotePagination({ entity, collection }),
  );
}
export function withGenericScrollPaginationNoOptions<
  Entity extends Base,
  Collection extends string,
>(entity: Entity, collection: Collection) {
  return signalStoreFeature(
    withEntities({ entity, collection }),
    withCallStatus({ initialValue: 'loading', collection }),
    withEntitiesRemoteScrollPagination({ entity, collection }),
  );
}

// generic entity, literal collection
export function withLiteralCollection<Entity extends Base>(entity: Entity) {
  return signalStoreFeature(
    withEntities({ entity, collection: 'item' }),
    withCallStatus({ initialValue: 'loading', collection: 'item' }),
    withEntitiesRemoteFilter(
      { entity, collection: 'item' },
      { defaultFilter: { search: '' } },
    ),
    withEntitiesRemotePagination({ entity, collection: 'item' }, {}),
    withEntitiesMultiSelection({ entity, collection: 'item' }, {}),
    withEntitiesLoadingCall({ entity, collection: 'item' }, () => ({
      fetchEntities: () => of({ entities: [] as Entity[], total: 0 }),
    })),
    withLinkEntitiesFilter({ entity, collection: 'item' }),
    withLinkEntitiesMultiSelection({ entity, collection: 'item' }),
  );
}

// generic entity, no collection
export function withNoCollection<Entity extends Base>(entity: Entity) {
  return signalStoreFeature(
    withEntities({ entity }),
    withCallStatus({ initialValue: 'loading' }),
    withEntitiesRemoteFilter({ entity }, { defaultFilter: { search: '' } }),
    withEntitiesRemoteSort(
      { entity },
      { defaultSort: { field: 'name', direction: 'asc' } },
    ),
    withEntitiesRemotePagination({ entity }, { pageSize: 10 }),
    withEntitiesSingleSelection({ entity }, {}),
    withEntitiesLoadingCall({ entity }, () => ({
      fetchEntities: () => of({ entities: [] as Entity[], total: 0 }),
    })),
    withEntitiesSyncToRouteQueryParams({ entity }, {}),
  );
}
export function withNoCollectionLinks<Entity extends Base>(entity: Entity) {
  return signalStoreFeature(
    withNoCollection(entity),
    withLinkEntitiesFilter({ entity }),
    withLinkEntitiesSort({ entity }),
    withLinkEntitiesSingleSelection({ entity }),
  );
}

describe.skip('generic store features', () => {
  const product = type<Product>();

  it('should generate the members of the issue #92 feature', () => {
    const Store = signalStore(
      withEntityMethods(product, 'product', () =>
        of({ entities: [] as Product[], total: 0 }),
      ),
    );
    const store = new Store();
    expectTypeOf(store.productEntities()).toEqualTypeOf<Product[]>();
    expectTypeOf(store.productEntitiesCallStatus()).toEqualTypeOf<CallStatus>();
    expectTypeOf(store.isProductEntitiesLoading()).toEqualTypeOf<boolean>();
    expectTypeOf(store.productEntitiesCurrentPage().entities).toEqualTypeOf<
      Product[]
    >();
    expectTypeOf(store.productEntitiesResource().value()).toEqualTypeOf<
      Product[]
    >();
    store.loadProductEntitiesPage({ pageIndex: 1 });
    store.setProductEntitiesLoading();
  });

  it('should generate the members of a generic local chain', () => {
    const store = new (signalStore(withGenericLocal(product, 'product')))();
    expectTypeOf(store.productEntitiesFilter()).toEqualTypeOf<{
      search: string;
    }>();
    expectTypeOf(
      store.isProductEntitiesFilterChanged(),
    ).toEqualTypeOf<boolean>();
    store.filterProductEntities({ filter: { search: 'a' } });
    store.resetProductEntitiesFilter();
    expectTypeOf(store.productEntitiesSort()).toEqualTypeOf<Sort<Product>>();
    store.sortProductEntities({ sort: { field: 'name', direction: 'desc' } });
    expectTypeOf(store.productEntitiesCurrentPage().entities).toEqualTypeOf<
      Product[]
    >();
    expectTypeOf(store.productIdSelected()).toEqualTypeOf<string | undefined>();
    expectTypeOf(store.productEntitySelected()).toEqualTypeOf<
      Product | undefined
    >();
    store.selectProductEntity({ id: '1' });
    // @ts-expect-error selection ids are typed from the entity
    store.selectProductEntity({ id: 1 });
    expectTypeOf(store.isAnyRenameLoading()).toEqualTypeOf<boolean>();
    expectTypeOf(store.isRenameLoading('1')).toEqualTypeOf<boolean>();
    store.rename({ id: '1', name: 'a' });
    expectTypeOf(store.linkProductEntitiesFilter()()).toEqualTypeOf<{
      search: string;
    }>();
    expectTypeOf(store.linkProductEntitiesSort()()).toEqualTypeOf<
      Sort<Product>
    >();
    expectTypeOf(store.linkProductIdSelected()()).toEqualTypeOf<
      string | null
    >();
  });

  it('should generate the members of a generic remote chain', () => {
    const store = new (signalStore(withGenericRemote(product, 'product')))();
    expectTypeOf(store.productEntitiesFilter()).toEqualTypeOf<{
      search: string;
    }>();
    expectTypeOf(store.productEntitiesSort()).toEqualTypeOf<Sort<Product>>();
    expectTypeOf(store.productEntitiesCurrentPage().entities).toEqualTypeOf<
      Product[]
    >();
    expectTypeOf(
      store.productEntitiesPagedRequest().size,
    ).toEqualTypeOf<number>();
    store.setProductEntitiesPagedResult({ entities: [], total: 0 });
    expectTypeOf(store.productIdsSelected()).toEqualTypeOf<string[]>();
    expectTypeOf(store.productEntitiesSelected()).toEqualTypeOf<Product[]>();
    store.selectProductEntities({ ids: ['1'] });
    // @ts-expect-error selection ids are typed from the entity
    store.selectProductEntities({ ids: [1] });
    expectTypeOf(store.productEntitiesResource().value()).toEqualTypeOf<
      Product[]
    >();
    store.loadFromQueryParams();
    expectTypeOf(store.linkProductEntitiesFilter()()).toEqualTypeOf<{
      search: string;
    }>();
    expectTypeOf(store.linkProductIdsSelected()()).toEqualTypeOf<string[]>();
  });

  it('should generate the members of a generic scroll chain', () => {
    const store = new (signalStore(withGenericScroll(product, 'product')))();
    expectTypeOf(store.productEntitiesFilter()).toEqualTypeOf<{
      search: string;
      page: number;
    }>();
    expectTypeOf(store.productEntitiesCurrentPage().entities).toEqualTypeOf<
      Product[]
    >();
    store.loadMoreProductEntities();
    store.setProductEntitiesPagedResult({ entities: [], hasMore: false });
  });

  it('should accept the entity config without options', () => {
    const store = new (signalStore(withGenericNoOptions(product, 'product')))();
    expectTypeOf(store.productEntitiesCurrentPage().entities).toEqualTypeOf<
      Product[]
    >();
    expectTypeOf(store.productIdSelected()).toEqualTypeOf<string | undefined>();
    expectTypeOf(store.productIdsSelected()).toEqualTypeOf<string[]>();
    store.loadFromQueryParams();
    const remote = new (signalStore(
      withGenericRemotePaginationNoOptions(product, 'product'),
    ))();
    expectTypeOf(
      remote.productEntitiesPagedRequest().size,
    ).toEqualTypeOf<number>();
    const scroll = new (signalStore(
      withGenericScrollPaginationNoOptions(product, 'product'),
    ))();
    scroll.loadMoreProductEntities();
  });

  it('should generate the members of a generic entity with a literal collection', () => {
    const store = new (signalStore(withLiteralCollection(product)))();
    expectTypeOf(store.itemEntitiesCurrentPage().entities).toEqualTypeOf<
      Product[]
    >();
    expectTypeOf(store.itemEntitiesResource().value()).toEqualTypeOf<
      Product[]
    >();
    expectTypeOf(store.linkItemEntitiesFilter()()).toEqualTypeOf<{
      search: string;
    }>();
    expectTypeOf(store.linkItemIdsSelected()()).toEqualTypeOf<string[]>();
  });

  it('should generate the members of a generic entity without a collection', () => {
    const store = new (signalStore(withNoCollectionLinks(product)))();
    expectTypeOf(store.entitiesCurrentPage().entities).toEqualTypeOf<
      Product[]
    >();
    expectTypeOf(store.entitySelected()).toEqualTypeOf<Product | undefined>();
    expectTypeOf(store.entitiesResource().value()).toEqualTypeOf<Product[]>();
    expectTypeOf(store.linkEntitiesFilter()()).toEqualTypeOf<{
      search: string;
    }>();
    expectTypeOf(store.linkEntitiesSort()()).toEqualTypeOf<Sort<Product>>();
    expectTypeOf(store.linkIdSelected()()).toEqualTypeOf<string | null>();
  });

  it('should still resolve the one arg form in a concrete store', () => {
    const config = { entity: product, collection: 'product' as const };
    const store = new (signalStore(
      withEntities(config),
      withEntitiesLocalPagination({ ...config, pageSize: 5 }),
      withEntitiesSingleSelection(() => ({ ...config, clearOnFilter: false })),
      withEntitiesMultiSelection(config),
    ))();
    expectTypeOf(store.productEntitiesCurrentPage().entities).toEqualTypeOf<
      Product[]
    >();
    expectTypeOf(store.productIdSelected()).toEqualTypeOf<string | undefined>();
    expectTypeOf(store.productIdsSelected()).toEqualTypeOf<string[]>();
  });
});

describe.skip('generic store features missing dependencies', () => {
  const entity = type<Product>();
  const collection = 'product';
  const config = { entity, collection } as const;

  // the directives only assert there is an error on that line, that it is the
  // readable Missing store feature: ... message was checked manually

  it('should report the missing feature with a literal collection', () => {
    // @ts-expect-error requires withEntities
    signalStore(withEntitiesLocalPagination({ entity, collection }, {}));
    // @ts-expect-error requires withEntities
    signalStore(withEntitiesLocalPagination({ entity, collection }));
    signalStore(
      // @ts-expect-error requires withEntities
      withEntitiesLocalPagination({ entity, collection, pageSize: 5 }),
    );
    signalStore(
      // @ts-expect-error requires withEntities
      withEntitiesLocalPagination(() => ({ ...config, pageSize: 5 })),
    );
    // @ts-expect-error requires withEntities
    signalStore(withEntitiesLocalPagination(config));
    signalStore(
      // @ts-expect-error requires withEntities
      withEntitiesSingleSelection({ entity, collection }, {}),
    );
    signalStore(
      // @ts-expect-error requires withEntities
      withEntitiesMultiSelection({ entity, collection, clearOnFilter: false }),
    );
    signalStore(
      // @ts-expect-error requires withEntities
      withEntitiesLocalSort(
        { entity, collection },
        { defaultSort: { field: 'name', direction: 'asc' } },
      ),
    );
    signalStore(
      // @ts-expect-error requires withEntities
      withEntitiesCalls({ entity, collection }, () => ({
        rename: (e: Product) => of(e),
      })),
    );
    // @ts-expect-error requires withCallStatus
    signalStore(
      withEntities({ entity, collection }),
      withEntitiesRemotePagination({ entity, collection }, {}),
    );
    // @ts-expect-error requires withCallStatus
    signalStore(
      withEntities({ entity, collection }),
      withEntitiesLoadingCall({ entity, collection }, () => ({
        fetchEntities: () => of([] as Product[]),
      })),
    );
    // @ts-expect-error requires withCallStatus
    signalStore(
      withEntities({ entity, collection }),
      withEntitiesSyncToRouteQueryParams({ entity, collection }),
    );
    // @ts-expect-error requires a filter feature
    signalStore(withLinkEntitiesFilter({ entity, collection }));
    // @ts-expect-error requires a sort feature
    signalStore(withLinkEntitiesSort({ entity, collection }));
    // @ts-expect-error requires withEntitiesSingleSelection
    signalStore(withLinkEntitiesSingleSelection({ entity, collection }));
    // @ts-expect-error requires withEntitiesMultiSelection
    signalStore(withLinkEntitiesMultiSelection({ entity, collection }));
  });

  it('should report the missing feature without a collection', () => {
    // @ts-expect-error requires withEntities
    signalStore(withEntitiesLocalPagination({ entity }, {}));
    // @ts-expect-error requires withEntities
    signalStore(withEntitiesLocalPagination({ entity }));
    // @ts-expect-error requires withEntities
    signalStore(withEntitiesLocalPagination({ entity, pageSize: 5 }));
    // @ts-expect-error requires withEntities
    signalStore(withEntitiesSingleSelection({ entity }, {}));
    // @ts-expect-error requires withEntities
    signalStore(withEntitiesMultiSelection({ entity }));
    signalStore(
      // @ts-expect-error requires withEntities
      withEntitiesLocalFilter(
        { entity },
        { defaultFilter: { search: '' }, filterFn: () => true },
      ),
    );
    // @ts-expect-error requires withCallStatus
    signalStore(
      withEntities({ entity }),
      withEntitiesRemoteSort(
        { entity },
        { defaultSort: { field: 'name', direction: 'asc' } },
      ),
    );
    // @ts-expect-error requires a filter feature
    signalStore(withLinkEntitiesFilter({ entity }));
    // @ts-expect-error requires a sort feature
    signalStore(withLinkEntitiesSort());
    // @ts-expect-error requires withEntitiesSingleSelection
    signalStore(withLinkEntitiesSingleSelection({ entity }));
    // @ts-expect-error requires withEntitiesMultiSelection
    signalStore(withLinkEntitiesMultiSelection({ entity }));
  });
});

// known limitations

// the one arg form, with the options in the entity config, is not supported
// in a generic feature, it still uses the Collection extends '' conditionals
export function withGenericOneArg<
  Entity extends Base,
  Collection extends string,
>(entity: Entity, collection: Collection) {
  // @ts-expect-error one arg form in a generic feature
  return signalStoreFeature(
    withEntities({ entity, collection }),
    withCallStatus({ initialValue: 'loading', collection }),
    withEntitiesLocalPagination({ entity, collection, pageSize: 10 }),
  );
}

// a missing feature inside a generic feature is reported with typescript's
// default missing properties error instead of the readable message
export function withGenericMissingEntities<
  Entity extends Base,
  Collection extends string,
>(entity: Entity, collection: Collection) {
  return signalStoreFeature(
    // @ts-expect-error requires withEntities
    withEntitiesLocalPagination({ entity, collection }, { pageSize: 10 }),
  );
}

// a generic collection can not check the fetchEntities result against the
// pagination feature, remote pagination needs { entities, total }
export function withGenericWrongResult<
  Entity extends Base,
  Collection extends string,
>(entity: Entity, collection: Collection) {
  return signalStoreFeature(
    withEntities({ entity, collection }),
    withCallStatus({ initialValue: 'loading', collection }),
    withEntitiesRemotePagination({ entity, collection }, {}),
    withEntitiesLoadingCall({ entity, collection }, () => ({
      fetchEntities: () => of([] as Entity[]),
    })),
  );
}

// with a literal collection it is checked, the error is reported as No
// overload matches this call on the withEntitiesLoadingCall line, not on the
// store, the directive is right above it so it fails otherwise, the literal
// overload error in it has the readable explanation (checked manually)
export const LiteralWrongResult = signalStore(
  withEntities({ entity: type<Product>(), collection: 'product' }),
  withCallStatus({ initialValue: 'loading', collection: 'product' }),
  withEntitiesRemotePagination({
    entity: type<Product>(),
    collection: 'product',
  }),
  // @ts-expect-error the store has an entities pagination feature, fetchEntities must return the result setProductEntitiesPagedResult accepts
  withEntitiesLoadingCall(
    { entity: type<Product>(), collection: 'product' },
    {
      fetchEntities: () => of({ entities: [] as Product[] }),
    },
  ),
);

// also with a generic entity and a literal collection
export function withLiteralCollectionWrongResult<Entity extends Base>(
  entity: Entity,
) {
  return signalStoreFeature(
    withEntities({ entity, collection: 'item' }),
    withCallStatus({ initialValue: 'loading', collection: 'item' }),
    withEntitiesRemotePagination({ entity, collection: 'item' }, {}),
    // @ts-expect-error the store has an entities pagination feature, fetchEntities must return the result setItemEntitiesPagedResult accepts
    withEntitiesLoadingCall(
      { entity, collection: 'item' },
      {
        fetchEntities: () => of([] as Entity[]),
      },
    ),
  );
}
