import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { patchState, signalStore, type, withState } from '@ngrx/signals';
import {
  entityConfig,
  setAllEntities,
  withEntities,
} from '@ngrx/signals/entities';

import {
  Sort,
  withCallStatus,
  withEntitiesLocalFilter,
  withEntitiesLocalSort,
} from '../index';
import { mockProducts as mockProductsOld } from '../test.mocks';
import { Product } from '../test.model';
import { sortData } from './with-entities-local-sort.util';

type ProductWithReleaseDate = Product & { releaseDate: Date };

function addYears(date: Date, years: number) {
  const newDate = new Date(date);
  newDate.setFullYear(newDate.getFullYear() + years);
  return newDate;
}
const today = new Date('2018/06/28');
const mockProducts = mockProductsOld.map(
  (p, index) =>
    ({
      ...p,
      releaseDate: addYears(today, index - 2),
    }) as ProductWithReleaseDate,
);

describe('withEntitiesLocalSort', () => {
  const entity = type<ProductWithReleaseDate>();
  it('should sort entities and store sort', () => {
    const Store = signalStore(
      { protectedState: false },
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
    type ProductCustom = Omit<ProductWithReleaseDate, 'id'> & {
      productId: string;
    };
    const config = entityConfig({
      entity: type<ProductCustom>(),
      selectId: (e) => e.productId,
    });
    const mockProductsCustom = mockProducts.map(({ id, ...p }) => ({
      ...p,
      productId: id,
    }));
    const Store = signalStore(
      { protectedState: false },
      withEntities(config),
      withEntitiesLocalSort({
        ...config,
        defaultSort: { field: 'name', direction: 'asc' },
      }),
    );
    const store = new Store();
    patchState(store, setAllEntities(mockProductsCustom, config));
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
      { protectedState: false },
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
    type ProductCustom = Omit<ProductWithReleaseDate, 'id'> & {
      productId: string;
    };
    const config = entityConfig({
      entity: type<ProductCustom>(),
      collection: 'products',
      selectId: (e) => e.productId,
    });
    const mockProductsCustom = mockProducts.map(({ id, ...p }) => ({
      ...p,
      productId: id,
    }));
    const Store = signalStore(
      { protectedState: false },
      withEntities(config),
      withEntitiesLocalSort({
        ...config,
        defaultSort: { field: 'name', direction: 'asc' },
      }),
    );
    const store = new Store();
    patchState(store, setAllEntities(mockProductsCustom, config));
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
        { protectedState: false },
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

  it('should set default sort using config factory', () => {
    TestBed.runInInjectionContext(() => {
      const Store = signalStore(
        { protectedState: false },
        withState({
          myDefault: { field: 'name', direction: 'asc' } as Sort<Product>,
        }),
        withEntities({
          entity,
        }),
        withCallStatus(),
        withEntitiesLocalSort(({ myDefault }) => ({
          entity,
          defaultSort: myDefault(),
        })),
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

  it('should sort using previous sort if sortEntities is called without sort param', () => {
    TestBed.runInInjectionContext(() => {
      const Store = signalStore(
        { protectedState: false },
        withState({
          myDefault: { field: 'id', direction: 'asc' } as Sort<Product>,
        }),
        withEntities({
          entity,
        }),
        withCallStatus(),
        withEntitiesLocalSort(({ myDefault }) => ({
          entity,
          defaultSort: myDefault(),
        })),
      );
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      store.setLoaded();
      TestBed.flushEffects();
      expect(store.entitiesSort()).toEqual({ field: 'id', direction: 'asc' });
      expect(
        store
          .entities()
          .map((e) => e.id)
          .slice(0, 5),
      ).toEqual(mockProducts.map((p) => p.id).slice(0, 5));

      store.sortEntities(); // sort again should keep previous sort

      expect(store.entitiesSort()).toEqual({ field: 'id', direction: 'asc' });
      expect(
        store
          .entities()
          .map((e) => e.id)
          .slice(0, 5),
      ).toEqual(mockProducts.map((p) => p.id).slice(0, 5));

      store.sortEntities({ sort: { field: 'name', direction: 'asc' } });

      expect(store.entitiesSort()).toEqual({ field: 'name', direction: 'asc' });

      store.sortEntities(); // sort again should keep previous sort

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
        { protectedState: false },
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
        { protectedState: false },
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
          releaseDate: expect.any(Date),
        },
        {
          name: "Yoshi's Cookie",
          id: '20',
          description: 'Super Nintendo Game',
          price: 50,
          releaseDate: expect.any(Date),
        },
        {
          name: "Yoshi's Safari",
          id: '15',
          description: 'Super Nintendo Game',
          price: 40,
          releaseDate: expect.any(Date),
        },
      ]);
    });
  }));

  it('store with default sort entities and default filter should render correctly', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const Store = signalStore(
        { protectedState: false },
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
          releaseDate: expect.any(Date),
        },
        {
          name: "Yoshi's Cookie",
          id: '20',
          description: 'Super Nintendo Game',
          price: 50,
          releaseDate: expect.any(Date),
        },
        {
          name: "Yoshi's Safari",
          id: '15',
          description: 'Super Nintendo Game',
          price: 40,
          releaseDate: expect.any(Date),
        },
      ]);
    });
  }));

  it('should sort entities by release date', () => {
    const Store = signalStore(
      { protectedState: false },
      withEntities({
        entity,
      }),
      withEntitiesLocalSort({
        entity,
        defaultSort: { field: 'releaseDate', direction: 'desc' },
      }),
    );
    const store = new Store();
    patchState(store, setAllEntities(mockProducts));
    expect(store.entitiesSort()).toEqual({
      field: 'releaseDate',
      direction: 'desc',
    });
    // check default sort
    store.sortEntities();
    expect(
      store
        .entities()
        .map((e) => e.releaseDate.toDateString())
        .slice(0, 5),
    ).toEqual([
      'Fri Jun 28 2137',
      'Thu Jun 28 2136',
      'Tue Jun 28 2135',
      'Mon Jun 28 2134',
      'Sun Jun 28 2133',
    ]);
    // sort by price
    store.sortEntities({
      sort: { field: 'releaseDate', direction: 'asc' },
    });
    expect(
      store
        .entities()
        .map((e) => e.releaseDate.toDateString())
        .slice(0, 5),
    ).toEqual([
      'Tue Jun 28 2016',
      'Wed Jun 28 2017',
      'Thu Jun 28 2018',
      'Fri Jun 28 2019',
      'Sun Jun 28 2020',
    ]);
    expect(store.entities().length).toEqual(mockProducts.length);
    expect(store.entitiesSort()).toEqual({
      field: 'releaseDate',
      direction: 'asc',
    });
  });

  it('should sort entities by using custom sort function', () => {
    const Store = signalStore(
      { protectedState: false },
      withEntities({
        entity,
      }),
      withEntitiesLocalSort({
        entity,
        defaultSort: { field: 'sortBySecondWordInName', direction: 'desc' },
        sortFunction: (entities, sort) => {
          if (sort.field === 'sortBySecondWordInName') {
            return entities.sort((a, b) => {
              const [aFirst, aSecond] = a.name.split(' ');
              const [bFirst, bSecond] = b.name.split(' ');
              return (
                (aSecond || aFirst).localeCompare(bSecond || bFirst) *
                (sort.direction === 'asc' ? 1 : -1)
              );
            });
          }
          return sortData(entities, sort);
        },
      }),
    );
    const store = new Store();
    patchState(store, setAllEntities(mockProducts));
    expect(store.entitiesSort()).toEqual({
      field: 'sortBySecondWordInName',
      direction: 'desc',
    });
    // check default sort
    store.sortEntities();
    expect(
      store
        .entities()
        .map((e) => e.name)
        .slice(0, 5),
    ).toEqual([
      'Pokémon XD: Gale of Darkness',
      'Wario World',
      "Wario's Woods",
      'Battalion Wars',
      'Uniracers',
    ]);
    // sort by price
    store.sortEntities({
      sort: { field: 'sortBySecondWordInName', direction: 'asc' },
    });
    expect(
      store
        .entities()
        .map((e) => e.name)
        .slice(0, 5),
    ).toEqual([
      'Mario & Wario',
      'Tetris & Dr. Mario',
      'Tetris 2',
      'Pikmin 2',
      'Kirby Air Ride',
    ]);
    expect(store.entities().length).toEqual(mockProducts.length);
    expect(store.entitiesSort()).toEqual({
      field: 'sortBySecondWordInName',
      direction: 'asc',
    });
  });
});
