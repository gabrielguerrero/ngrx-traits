import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { patchState, signalStore, type } from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';

import {
  withCallStatus,
  withEntitiesLocalFilter,
  withEntitiesLocalSort,
} from '../index';
import { mockProducts } from '../test.mocks';
import { Product } from '../test.model';

describe('withEntitiesLocalSort', () => {
  const entity = type<Product>();
  it('should sort entities and store sort', () => {
    const Store = signalStore(
      withEntities({
        entity,
      }),
      withEntitiesLocalSort({
        entity,
        defaultSort: { field: 'name', direction: 'asc' },
      }),
    );
    const store = new Store();
    patchState(store, setAllEntities(mockProducts));
    expect(store.entitiesSort()).toEqual({ field: 'name', direction: 'asc' });
    // check default sort
    store.sortEntities();
    expect(
      store
        .entities()
        .map((e) => e.name)
        .slice(0, 5),
    ).toEqual([
      '1080° Avalanche',
      'Animal Crossing',
      'Arkanoid: Doh it Again',
      'Battalion Wars',
      'BattleClash',
    ]);
    // sort by price
    store.sortEntities({
      sort: { field: 'price', direction: 'desc' },
    });
    expect(
      store
        .entities()
        .map((e) => e.price)
        .slice(0, 5),
    ).toEqual([178, 175, 172, 169, 166]);
    expect(store.entities().length).toEqual(mockProducts.length);
    expect(store.entitiesSort()).toEqual({
      field: 'price',
      direction: 'desc',
    });
  });

  it('should sort entities with custom id', () => {
    type ProductCustom = Omit<Product, 'id'> & { productId: string };
    const entityConfig = {
      entity: type<ProductCustom>(),
      idKey: 'productId',
    } as const;
    const mockProductsCustom = mockProducts.map(({ id, ...p }) => ({
      ...p,
      productId: id,
    }));
    const Store = signalStore(
      withEntities(entityConfig),
      withEntitiesLocalSort({
        ...entityConfig,
        defaultSort: { field: 'name', direction: 'asc' },
      }),
    );
    const store = new Store();
    patchState(store, setAllEntities(mockProductsCustom, entityConfig));
    expect(store.entitiesSort()).toEqual({ field: 'name', direction: 'asc' });
    // check default sort
    store.sortEntities();
    expect(
      store
        .entities()
        .map((e) => e.name)
        .slice(0, 5),
    ).toEqual([
      '1080° Avalanche',
      'Animal Crossing',
      'Arkanoid: Doh it Again',
      'Battalion Wars',
      'BattleClash',
    ]);
    // sort by price
    store.sortEntities({
      sort: { field: 'price', direction: 'desc' },
    });
    expect(
      store
        .entities()
        .map((e) => e.price)
        .slice(0, 5),
    ).toEqual([178, 175, 172, 169, 166]);
    expect(store.entities().length).toEqual(mockProducts.length);
    expect(store.entitiesSort()).toEqual({
      field: 'price',
      direction: 'desc',
    });
  });

  it('with collection should sort entities and store sort', () => {
    const collection = 'products';
    const Store = signalStore(
      withEntities({
        entity,
        collection,
      }),
      withEntitiesLocalSort({
        entity,
        collection,
        defaultSort: { field: 'name', direction: 'asc' },
      }),
    );
    const store = new Store();
    patchState(store, setAllEntities(mockProducts, { collection }));
    expect(store.productsSort()).toEqual({ field: 'name', direction: 'asc' });
    // check default sort
    store.sortProductsEntities();
    expect(
      store
        .productsEntities()
        .map((e) => e.name)
        .slice(0, 5),
    ).toEqual([
      '1080° Avalanche',
      'Animal Crossing',
      'Arkanoid: Doh it Again',
      'Battalion Wars',
      'BattleClash',
    ]);
    // sort by price
    store.sortProductsEntities({
      sort: { field: 'price', direction: 'desc' },
    });
    expect(
      store
        .productsEntities()
        .map((e) => e.price)
        .slice(0, 5),
    ).toEqual([178, 175, 172, 169, 166]);
    expect(store.productsEntities().length).toEqual(mockProducts.length);
    expect(store.productsSort()).toEqual({
      field: 'price',
      direction: 'desc',
    });
  });

  it('with collection should sort entities with custom id and store sort', () => {
    const collection = 'products';
    type ProductCustom = Omit<Product, 'id'> & { productId: string };
    const entityConfig = {
      entity: type<ProductCustom>(),
      collection,
      idKey: 'productId',
    } as const;
    const mockProductsCustom = mockProducts.map(({ id, ...p }) => ({
      ...p,
      productId: id,
    }));
    const Store = signalStore(
      withEntities(entityConfig),
      withEntitiesLocalSort({
        ...entityConfig,
        defaultSort: { field: 'name', direction: 'asc' },
      }),
    );
    const store = new Store();
    patchState(store, setAllEntities(mockProductsCustom, entityConfig));
    expect(store.productsSort()).toEqual({ field: 'name', direction: 'asc' });
    // check default sort
    store.sortProductsEntities();
    expect(
      store
        .productsEntities()
        .map((e) => e.name)
        .slice(0, 5),
    ).toEqual([
      '1080° Avalanche',
      'Animal Crossing',
      'Arkanoid: Doh it Again',
      'Battalion Wars',
      'BattleClash',
    ]);
    // sort by price
    store.sortProductsEntities({
      sort: { field: 'price', direction: 'desc' },
    });
    expect(
      store
        .productsEntities()
        .map((e) => e.price)
        .slice(0, 5),
    ).toEqual([178, 175, 172, 169, 166]);
    expect(store.productsEntities().length).toEqual(mockProductsCustom.length);
    expect(store.productsSort()).toEqual({
      field: 'price',
      direction: 'desc',
    });
  });

  it('should sort entities using default when withCallStatus loaded', () => {
    TestBed.runInInjectionContext(() => {
      const Store = signalStore(
        withEntities({
          entity,
        }),
        withCallStatus(),
        withEntitiesLocalSort({
          entity,
          defaultSort: { field: 'name', direction: 'asc' },
        }),
      );
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      store.setLoaded();
      TestBed.flushEffects();
      expect(store.entitiesSort()).toEqual({ field: 'name', direction: 'asc' });
      // check default sort
      expect(
        store
          .entities()
          .map((e) => e.name)
          .slice(0, 5),
      ).toEqual([
        '1080° Avalanche',
        'Animal Crossing',
        'Arkanoid: Doh it Again',
        'Battalion Wars',
        'BattleClash',
      ]);
    });
  });

  it('with collection should sort entities using default when withCallStatus loaded', () => {
    TestBed.runInInjectionContext(() => {
      const collection = 'products';
      const Store = signalStore(
        withEntities({
          entity,
          collection,
        }),
        withCallStatus({ collection }),
        withEntitiesLocalSort({
          entity,
          collection,
          defaultSort: { field: 'name', direction: 'asc' },
        }),
      );
      const store = new Store();
      patchState(store, setAllEntities(mockProducts, { collection }));
      store.setProductsLoaded();
      TestBed.flushEffects();
      expect(store.productsSort()).toEqual({ field: 'name', direction: 'asc' });
      // check default sort
      expect(
        store
          .productsEntities()
          .map((e) => e.name)
          .slice(0, 5),
      ).toEqual([
        '1080° Avalanche',
        'Animal Crossing',
        'Arkanoid: Doh it Again',
        'Battalion Wars',
        'BattleClash',
      ]);
    });
  });

  it('should sort entities after filter', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const Store = signalStore(
        withEntities({
          entity,
        }),
        withCallStatus(),
        withEntitiesLocalFilter({
          entity,
          defaultFilter: { search: '' },
          filterFn: (entity, filter) =>
            !filter?.search ||
            entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
        }),
        withEntitiesLocalSort({
          entity,
          defaultSort: { field: 'name', direction: 'asc' },
        }),
      );
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      store.setLoaded();
      TestBed.flushEffects();
      expect(store.entitiesSort()).toEqual({ field: 'name', direction: 'asc' });
      // check default sort
      expect(
        store
          .entities()
          .map((e) => e.name)
          .slice(0, 5),
      ).toEqual([
        '1080° Avalanche',
        'Animal Crossing',
        'Arkanoid: Doh it Again',
        'Battalion Wars',
        'BattleClash',
      ]);

      store.filterEntities({
        filter: { search: 'Yoshi' },
      });
      tick(400);
      expect(store.entities()).toEqual([
        {
          name: "Super Mario World 2: Yoshi's Island",
          id: '39',
          description: 'Super Nintendo Game',
          price: 88,
        },
        {
          name: "Yoshi's Cookie",
          id: '20',
          description: 'Super Nintendo Game',
          price: 50,
        },
        {
          name: "Yoshi's Safari",
          id: '15',
          description: 'Super Nintendo Game',
          price: 40,
        },
      ]);
    });
  }));

  it('store with default sort entities and default filter should render correctly', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const Store = signalStore(
        withEntities({
          entity,
        }),
        withCallStatus(),
        withEntitiesLocalFilter({
          entity,
          defaultFilter: { search: 'Yoshi' },
          filterFn: (entity, filter) =>
            !filter?.search ||
            entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
        }),
        withEntitiesLocalSort({
          entity,
          defaultSort: { field: 'name', direction: 'asc' },
        }),
      );
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      store.setLoaded();
      TestBed.flushEffects();
      expect(store.entitiesSort()).toEqual({ field: 'name', direction: 'asc' });
      // check default sort
      tick(400);
      expect(store.entities()).toEqual([
        {
          name: "Super Mario World 2: Yoshi's Island",
          id: '39',
          description: 'Super Nintendo Game',
          price: 88,
        },
        {
          name: "Yoshi's Cookie",
          id: '20',
          description: 'Super Nintendo Game',
          price: 50,
        },
        {
          name: "Yoshi's Safari",
          id: '15',
          description: 'Super Nintendo Game',
          price: 40,
        },
      ]);
    });
  }));
});
