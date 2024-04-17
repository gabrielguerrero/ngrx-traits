import { withEntitiesMultiSelection } from '@ngrx-traits/signals';
import { patchState, signalStore, type } from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';

import { mockProducts } from '../test.mocks';
import { Product } from '../test.model';

describe('withEntitiesMultiSelection', () => {
  const entity = type<Product>();

  describe('without collection', () => {
    const Store = signalStore(
      withEntities({ entity }),
      withEntitiesMultiSelection({ entity }),
    );
    it('selectEntities should select the entity', () => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      store.selectEntities({ ids: [mockProducts[4].id, mockProducts[8].id] });
      expect(store.entitiesSelected()).toEqual([
        mockProducts[4],
        mockProducts[8],
      ]);
    });

    it('deselectEntities should deselect the entity', () => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      store.selectEntities({ ids: [mockProducts[4].id, mockProducts[8].id] });
      store.deselectEntities({ ids: [mockProducts[4].id, mockProducts[8].id] });
      expect(store.entitiesSelected()).toEqual([]);
    });

    it('toggleSelectEntities should toggle selection of the entity', () => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      store.toggleSelectEntities({ id: mockProducts[4].id });
      expect(store.entitiesSelected()).toEqual([mockProducts[4]]);
      store.toggleSelectEntities({ id: mockProducts[4].id });
      expect(store.entitiesSelected()).toEqual([]);
    });

    it('toggleSelectAllEntities should toggle selection of the entity', () => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      store.toggleSelectAllEntities();
      expect(store.entitiesSelected().length).toEqual(mockProducts.length);
      store.toggleSelectAllEntities();
      expect(store.entitiesSelected()).toEqual([]);
    });

    it('isAllEntitiesSelected should toggle selection of the entity', () => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      store.toggleSelectAllEntities();
      expect(store.isAllEntitiesSelected()).toEqual('all');
      store.toggleSelectAllEntities();
      expect(store.isAllEntitiesSelected()).toEqual('none');
      store.toggleSelectEntities({ ids: mockProducts.map((p) => p.id) });
      expect(store.isAllEntitiesSelected()).toEqual('all');
      store.toggleSelectEntities({ id: mockProducts[4].id });
      expect(store.isAllEntitiesSelected()).toEqual('some');
    });
  });

  describe('with collection', () => {
    const collection = 'products';
    const Store = signalStore(
      withEntities({ entity, collection }),
      withEntitiesMultiSelection({ entity, collection }),
    );
    it('select[Collection]Entities should select the entity', () => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts, { collection }));
      store.selectProductsEntities({
        ids: [mockProducts[4].id, mockProducts[8].id],
      });
      expect(store.productsSelectedEntities()).toEqual([
        mockProducts[4],
        mockProducts[8],
      ]);
    });

    it('deselect[Collection]Entities should deselect the entity', () => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts, { collection }));
      store.selectProductsEntities({
        ids: [mockProducts[4].id, mockProducts[8].id],
      });
      store.deselectProductsEntities({
        ids: [mockProducts[4].id, mockProducts[8].id],
      });
      expect(store.productsSelectedEntities()).toEqual([]);
    });

    it('toggle[Collection]Entities should toggle selection of the entity', () => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts, { collection }));
      store.toggleSelectProductsEntities({ id: mockProducts[4].id });
      expect(store.productsSelectedEntities()).toEqual([mockProducts[4]]);
      store.toggleSelectProductsEntities({ id: mockProducts[4].id });
      expect(store.productsSelectedEntities()).toEqual([]);
    });

    it('isAll[Collection]Selected should toggle selection of the entity', () => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts, { collection }));
      store.toggleSelectAllProductsEntities();
      expect(store.isAllProductsSelected()).toEqual('all');
      store.toggleSelectAllProductsEntities();
      expect(store.isAllProductsSelected()).toEqual('none');
      store.toggleSelectProductsEntities({
        ids: mockProducts.map((p) => p.id),
      });
      expect(store.isAllProductsSelected()).toEqual('all');
      store.toggleSelectProductsEntities({ id: mockProducts[4].id });
      expect(store.isAllProductsSelected()).toEqual('some');
    });
  });
});
