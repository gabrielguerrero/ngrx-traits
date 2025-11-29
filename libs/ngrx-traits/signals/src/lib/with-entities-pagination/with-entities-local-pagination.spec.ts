import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { patchState, signalStore, type, withState } from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';

import {
  withEntitiesLocalFilter,
  withEntitiesLocalPagination,
  withEntitiesLocalSort,
} from '../index';
import { mockProducts } from '../test.mocks';
import { Product } from '../test.model';

describe('withEntitiesLocalPagination', () => {
  const entity = type<Product>();

  it('entitiesCurrentPage should split entities in the correct pages', () => {
    const Store = signalStore(
      { protectedState: false },
      withEntities({ entity }),
      withEntitiesLocalPagination({ entity, pageSize: 10 }),
    );

    const store = new Store();
    patchState(store, setAllEntities(mockProducts.slice(0, 25)));
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

  it('should read pageSize be able to read from state using config factory', () => {
    const Store = signalStore(
      { protectedState: false },
      withState({ myDefault: { pageSize: 20 } }),
      withEntities({ entity }),
      withEntitiesLocalPagination(({ myDefault }) => ({
        entity,
        pageSize: myDefault().pageSize,
      })),
    );

    const store = new Store();
    patchState(store, setAllEntities(mockProducts.slice(0, 45)));
    // check the first page
    expect(store.entitiesCurrentPage().entities.length).toEqual(20);
    expect(store.entitiesCurrentPage().entities).toEqual(
      mockProducts.slice(0, 20),
    );
    expect(store.entitiesCurrentPage().pageIndex).toEqual(0);
    expect(store.entitiesCurrentPage().pageSize).toEqual(20);
    expect(store.entitiesCurrentPage().pagesCount).toEqual(3);
    expect(store.entitiesCurrentPage().total).toEqual(45);
    expect(store.entitiesCurrentPage().hasPrevious).toEqual(false);
    expect(store.entitiesCurrentPage().hasNext).toEqual(true);

    store.loadEntitiesPage({ pageIndex: 1 });
    // check the second page
    expect(store.entitiesCurrentPage().entities.length).toEqual(20);
    expect(store.entitiesCurrentPage().entities).toEqual(
      mockProducts.slice(20, 40),
    );
    expect(store.entitiesCurrentPage().pageIndex).toEqual(1);
    expect(store.entitiesCurrentPage().pageSize).toEqual(20);
    expect(store.entitiesCurrentPage().pagesCount).toEqual(3);
    expect(store.entitiesCurrentPage().total).toEqual(45);
    expect(store.entitiesCurrentPage().hasPrevious).toEqual(true);
    expect(store.entitiesCurrentPage().hasNext).toEqual(true);

    store.loadEntitiesPage({ pageIndex: 2 });

    // check the third page
    expect(store.entitiesCurrentPage().entities.length).toEqual(5);
    expect(store.entitiesCurrentPage().entities).toEqual(
      mockProducts.slice(40, 45),
    );
    expect(store.entitiesCurrentPage().pageIndex).toEqual(2);
    expect(store.entitiesCurrentPage().pageSize).toEqual(20);
    expect(store.entitiesCurrentPage().pagesCount).toEqual(3);
    expect(store.entitiesCurrentPage().total).toEqual(45);
    expect(store.entitiesCurrentPage().hasPrevious).toEqual(true);
    expect(store.entitiesCurrentPage().hasNext).toEqual(false);
  });
  it('entitiesCurrentPage page size change should split entities in the correct pages', () => {
    const Store = signalStore(
      { protectedState: false },
      withEntities({ entity }),
      withEntitiesLocalPagination({ entity, pageSize: 10 }),
    );

    const store = new Store();
    patchState(store, setAllEntities(mockProducts.slice(0, 40)));
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
    // check the second page
    expect(store.entitiesCurrentPage().entities.length).toEqual(15);
    expect(store.entitiesCurrentPage().entities).toEqual(
      mockProducts.slice(15, 30),
    );
    expect(store.entitiesCurrentPage().pageIndex).toEqual(1);
    expect(store.entitiesCurrentPage().pageSize).toEqual(15);
    expect(store.entitiesCurrentPage().pagesCount).toEqual(3);
    expect(store.entitiesCurrentPage().total).toEqual(40);
    expect(store.entitiesCurrentPage().hasPrevious).toEqual(true);
    expect(store.entitiesCurrentPage().hasNext).toEqual(true);

    store.loadEntitiesPage({ pageIndex: 2 });

    // check the third page
    expect(store.entitiesCurrentPage().entities.length).toEqual(10);
    expect(store.entitiesCurrentPage().entities).toEqual(
      mockProducts.slice(30, 40),
    );
    expect(store.entitiesCurrentPage().pageIndex).toEqual(2);
    expect(store.entitiesCurrentPage().pageSize).toEqual(15);
    expect(store.entitiesCurrentPage().pagesCount).toEqual(3);
    expect(store.entitiesCurrentPage().total).toEqual(40);
    expect(store.entitiesCurrentPage().hasPrevious).toEqual(true);
    expect(store.entitiesCurrentPage().hasNext).toEqual(false);
  });

  it('with collection entitiesCurrentPage should split entities in the correct pages', () => {
    const collection = 'product';
    const Store = signalStore(
      { protectedState: false },
      withEntities({ entity, collection }),
      withEntitiesLocalPagination({ entity, collection, pageSize: 10 }),
    );

    const store = new Store();
    patchState(
      store,
      setAllEntities(mockProducts.slice(0, 25), { collection }),
    );
    // check the first page
    expect(store.productEntitiesCurrentPage().entities.length).toEqual(10);
    expect(store.productEntitiesCurrentPage().entities).toEqual(
      mockProducts.slice(0, 10),
    );
    expect(store.productEntitiesCurrentPage().pageIndex).toEqual(0);
    expect(store.productEntitiesCurrentPage().pageSize).toEqual(10);
    expect(store.productEntitiesCurrentPage().pagesCount).toEqual(3);
    expect(store.productEntitiesCurrentPage().total).toEqual(25);
    expect(store.productEntitiesCurrentPage().hasPrevious).toEqual(false);
    expect(store.productEntitiesCurrentPage().hasNext).toEqual(true);

    store.loadProductEntitiesPage({ pageIndex: 1 });
    // check the second page
    expect(store.productEntitiesCurrentPage().entities.length).toEqual(10);
    expect(store.productEntitiesCurrentPage().entities).toEqual(
      mockProducts.slice(10, 20),
    );
    expect(store.productEntitiesCurrentPage().pageIndex).toEqual(1);
    expect(store.productEntitiesCurrentPage().pageSize).toEqual(10);
    expect(store.productEntitiesCurrentPage().pagesCount).toEqual(3);
    expect(store.productEntitiesCurrentPage().total).toEqual(25);
    expect(store.productEntitiesCurrentPage().hasPrevious).toEqual(true);
    expect(store.productEntitiesCurrentPage().hasNext).toEqual(true);

    store.loadProductEntitiesPage({ pageIndex: 2 });

    // check the third page
    expect(store.productEntitiesCurrentPage().entities.length).toEqual(5);
    expect(store.productEntitiesCurrentPage().entities).toEqual(
      mockProducts.slice(20, 25),
    );
    expect(store.productEntitiesCurrentPage().pageIndex).toEqual(2);
    expect(store.productEntitiesCurrentPage().pageSize).toEqual(10);
    expect(store.productEntitiesCurrentPage().pagesCount).toEqual(3);
    expect(store.productEntitiesCurrentPage().total).toEqual(25);
    expect(store.productEntitiesCurrentPage().hasPrevious).toEqual(true);
    expect(store.productEntitiesCurrentPage().hasNext).toEqual(false);
  });

  it('should resetPage when filter is executed', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const Store = signalStore(
        { protectedState: false },
        withEntities({
          entity,
        }),
        withEntitiesLocalPagination({ entity }),
        withEntitiesLocalFilter({
          entity,
          defaultFilter: { search: '', foo: 'bar' },
          filterFn: (entity, filter) =>
            !filter?.search ||
            entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
        }),
      );
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      store.loadEntitiesPage({ pageIndex: 3 });
      expect(store.entitiesCurrentPage().pageIndex).toEqual(3);

      store.filterEntities({
        filter: { search: 'zero' },
        patch: true,
      });
      tick(400);
      expect(store.entitiesCurrentPage().pageIndex).toEqual(0);
      // check filter
      expect(store.entities().length).toEqual(2);
    });
  }));

  it('should resetPage when sort is executed', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const Store = signalStore(
        { protectedState: false },
        withEntities({
          entity,
        }),
        withEntitiesLocalPagination({ entity }),
        withEntitiesLocalSort({
          entity,
          defaultSort: { field: 'id', direction: 'asc' },
        }),
      );
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      store.loadEntitiesPage({ pageIndex: 3 });
      expect(store.entitiesCurrentPage().pageIndex).toEqual(3);

      store.sortEntities({
        sort: {
          field: 'name',
          direction: 'desc',
        },
      });
      tick(400);
      expect(store.entitiesCurrentPage().pageIndex).toEqual(0);
    });
  }));

  it('should check deepsignals', () => {
    const Store = signalStore(
      { protectedState: false },
      withEntities({ entity }),
      withEntitiesLocalPagination({ entity, pageSize: 10 }),
    );

    const store = new Store();
    patchState(store, setAllEntities(mockProducts.slice(0, 25)));

    // Check deep signals
    expect(store.entitiesCurrentPage.entities().length).toEqual(10);
    expect(store.entitiesCurrentPage.entities()).toEqual(
      mockProducts.slice(0, 10),
    );
    expect(store.entitiesCurrentPage.pageIndex()).toEqual(0);
    expect(store.entitiesCurrentPage.pageSize()).toEqual(10);
    expect(store.entitiesCurrentPage.pagesCount()).toEqual(3);
    expect(store.entitiesCurrentPage.total()).toEqual(25);
    expect(store.entitiesCurrentPage.hasPrevious()).toEqual(false);
    expect(store.entitiesCurrentPage.hasNext()).toEqual(true);

    store.loadEntitiesPage({ pageIndex: 1 });

    expect(store.entitiesCurrentPage.entities().length).toEqual(10);
    expect(store.entitiesCurrentPage.entities()).toEqual(
      mockProducts.slice(10, 20),
    );
    expect(store.entitiesCurrentPage.pageIndex()).toEqual(1);
    expect(store.entitiesCurrentPage.pageSize()).toEqual(10);
    expect(store.entitiesCurrentPage.pagesCount()).toEqual(3);
    expect(store.entitiesCurrentPage.total()).toEqual(25);
    expect(store.entitiesCurrentPage.hasPrevious()).toEqual(true);
    expect(store.entitiesCurrentPage.hasNext()).toEqual(true);
  });
});
