import { patchState, signalStore, type } from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';

import { withEntitiesLocalSort } from '../index';
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
});
