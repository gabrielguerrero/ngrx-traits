import { patchState, signalStore, type } from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';

import { withEntitiesSingleSelection } from '../index';
import { mockProducts } from '../test.mocks';
import { Product } from '../test.model';

describe('withEntitiesSingleSelection', () => {
  const entity = type<Product>();

  describe('without collection', () => {
    const Store = signalStore(
      withEntities({ entity }),
      withEntitiesSingleSelection({ entity }),
    );
    it('selectEntity should select the entity', () => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      store.selectEntity({ id: mockProducts[4].id });
      expect(store.entitySelected()).toEqual(mockProducts[4]);
    });

    it('deselectEntity should deselect the entity', () => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      store.selectEntity({ id: mockProducts[4].id });
      store.deselectEntity({ id: mockProducts[4].id });
      expect(store.entitySelected()).toEqual(undefined);
    });

    it('toggleEntity should toggle selection of the entity', () => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      store.toggleEntity({ id: mockProducts[4].id });
      expect(store.entitySelected()).toEqual(mockProducts[4]);
      store.toggleEntity({ id: mockProducts[4].id });
      expect(store.entitySelected()).toEqual(undefined);
    });
  });

  describe('with collection', () => {
    const collection = 'products';
    const Store = signalStore(
      withEntities({ entity, collection }),
      withEntitiesSingleSelection({ entity, collection }),
    );
    it('selectEntity should select the entity', () => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts, { collection }));
      store.selectProductsEntity({ id: mockProducts[4].id });
      expect(store.productsEntitySelected()).toEqual(mockProducts[4]);
    });

    it('deselectEntity should deselect the entity', () => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts, { collection }));
      store.selectProductsEntity({ id: mockProducts[4].id });
      store.deselectProductsEntity({ id: mockProducts[4].id });
      expect(store.productsEntitySelected()).toEqual(undefined);
    });

    it('toggleEntity should toggle selection of the entity', () => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts, { collection }));
      store.toggleProductsEntity({ id: mockProducts[4].id });
      expect(store.productsEntitySelected()).toEqual(mockProducts[4]);
      store.toggleProductsEntity({ id: mockProducts[4].id });
      expect(store.productsEntitySelected()).toEqual(undefined);
    });
  });
});
