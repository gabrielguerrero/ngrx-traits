import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { patchState, signalStore, type } from '@ngrx/signals';
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
    const collection = 'products';
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
});
