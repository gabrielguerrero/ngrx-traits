import { patchState, signalStore, type, withState } from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';

import { withEntitiesSingleSelection } from '../index';
import { mockProducts } from '../test.mocks';
import { Product } from '../test.model';

describe('withEntitiesSingleSelection', () => {
  const entity = type<Product>();

  describe('without collection', () => {
    const Store = signalStore(
      { protectedState: false },
      withEntities({ entity }),
      withEntitiesSingleSelection({ entity }),
    );

    it('selectEntity should select the entity', () => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      store.selectEntity({ id: mockProducts[4].id });
      expect(store.entitySelected()).toEqual(mockProducts[4]);
    });

    it('defaultSelectedId should select the entity', () => {
      const Store = signalStore(
        { protectedState: false },
        withState({ myDefault: { id: mockProducts[4].id } }),
        withEntities({ entity }),
        withEntitiesSingleSelection(({ myDefault }) => ({
          entity,
          defaultSelectedId: myDefault().id,
        })),
      );
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      expect(store.entitySelected()).toEqual(mockProducts[4]);
    });

    it('deselectEntity should deselect the entity', () => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      store.selectEntity({ id: mockProducts[4].id });
      store.deselectEntity();
      expect(store.entitySelected()).toEqual(undefined);
    });

    it('toggleEntity should toggle selection of the entity', () => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      store.toggleSelectEntity({ id: mockProducts[4].id });
      expect(store.entitySelected()).toEqual(mockProducts[4]);
      store.toggleSelectEntity({ id: mockProducts[4].id });
      expect(store.entitySelected()).toEqual(undefined);
    });
  });

  describe('with collection', () => {
    const collection = 'products';
    const Store = signalStore(
      { protectedState: false },
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
      store.deselectProductsEntity();
      expect(store.productsEntitySelected()).toEqual(undefined);
    });

    it('toggleEntity should toggle selection of the entity', () => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts, { collection }));
      store.toggleSelectProductsEntity({ id: mockProducts[4].id });
      expect(store.productsEntitySelected()).toEqual(mockProducts[4]);
      store.toggleSelectProductsEntity({ id: mockProducts[4].id });
      expect(store.productsEntitySelected()).toEqual(undefined);
    });
  });
});
