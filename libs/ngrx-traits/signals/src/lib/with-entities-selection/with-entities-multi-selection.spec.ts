import { TestBed } from '@angular/core/testing';
import { patchState, signalStore, type, withState } from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';

import { withEntitiesMultiSelection } from '../index';
import { mockProducts } from '../test.mocks';
import { Product } from '../test.model';

describe('withEntitiesMultiSelection', () => {
  const entity = type<Product>();

  describe('without collection', () => {
    const Store = signalStore(
      { protectedState: false },
      withEntities({ entity }),
      withEntitiesMultiSelection({ entity }),
    );
    it('selectEntities should select the entity', () => {
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        patchState(store, setAllEntities(mockProducts));
        store.selectEntities({ ids: [mockProducts[4].id, mockProducts[8].id] });
        expect(store.idsSelected()).toEqual(['4', '8']);
        expect(store.entitiesSelected()).toEqual([
          mockProducts[4],
          mockProducts[8],
        ]);
      });
    });

    it('selectEntities with clearSelectionBeforeSelect should clear selectin and select the entities', () => {
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        patchState(store, setAllEntities(mockProducts));
        store.selectEntities({ ids: [mockProducts[1].id, mockProducts[5].id] });
        store.selectEntities({
          ids: [mockProducts[4].id, mockProducts[8].id],
          clearSelectionBeforeSelect: true,
        });
        expect(store.idsSelected()).toEqual(['4', '8']);
        expect(store.entitiesSelected()).toEqual([
          mockProducts[4],
          mockProducts[8],
        ]);
      });
    });

    it('deselectEntities should deselect the entity', () => {
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        patchState(store, setAllEntities(mockProducts));
        store.selectEntities({ ids: [mockProducts[4].id, mockProducts[8].id] });
        store.deselectEntities({
          ids: [mockProducts[4].id, mockProducts[8].id],
        });
        expect(store.idsSelected()).toEqual([]);
        expect(store.entitiesSelected()).toEqual([]);
      });
    });

    it('toggleSelectEntities should toggle selection of the entity', () => {
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        patchState(store, setAllEntities(mockProducts));
        store.toggleSelectEntities({ id: mockProducts[4].id });
        expect(store.entitiesSelected()).toEqual([mockProducts[4]]);
        expect(store.idsSelected()).toEqual(['4']);
        store.toggleSelectEntities({ id: mockProducts[4].id });
        expect(store.entitiesSelected()).toEqual([]);
        expect(store.idsSelected()).toEqual([]);
      });
    });

    it('toggleSelectAllEntities should toggle selection of the entity', () => {
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        patchState(store, setAllEntities(mockProducts));
        store.toggleSelectAllEntities();
        expect(store.entitiesSelected().length).toEqual(mockProducts.length);
        expect(store.idsSelected().length).toEqual(mockProducts.length);
        store.toggleSelectAllEntities();
        expect(store.entitiesSelected()).toEqual([]);
        expect(store.idsSelected()).toEqual([]);
      });
    });

    it('isAllEntitiesSelected should toggle selection of the entity', () => {
      TestBed.runInInjectionContext(() => {
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

    it('cleanEntitiesSelected should clear selection', () => {
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        patchState(store, setAllEntities(mockProducts));
        store.toggleSelectAllEntities();
        expect(store.isAllEntitiesSelected()).toEqual('all');
        store.clearEntitiesSelection();
        expect(store.isAllEntitiesSelected()).toEqual('none');
        store.toggleSelectEntities({ ids: mockProducts.map((p) => p.id) });
        expect(store.isAllEntitiesSelected()).toEqual('all');
        store.toggleSelectEntities({ id: mockProducts[4].id });
        expect(store.isAllEntitiesSelected()).toEqual('some');
        store.clearEntitiesSelection();
        expect(store.isAllEntitiesSelected()).toEqual('none');
      });
    });
  });

  describe('with collection', () => {
    const collection = 'product';
    const Store = signalStore(
      { protectedState: false },
      withEntities({ entity, collection }),
      withEntitiesMultiSelection({ entity, collection }),
    );
    it('select[Collection]Entities should select the entity', () => {
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        patchState(store, setAllEntities(mockProducts, { collection }));
        store.selectProductEntities({
          ids: [mockProducts[4].id, mockProducts[8].id],
        });
        expect(store.productIdsSelected()).toEqual(['4', '8']);
        expect(store.productEntitiesSelected()).toEqual([
          mockProducts[4],
          mockProducts[8],
        ]);
      });
    });

    it('defaultSelectedIds should select the entity', () => {
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          { protectedState: false },
          withState({ myDefaultIds: [mockProducts[4].id, mockProducts[8].id] }),
          withEntities({ entity, collection }),
          withEntitiesMultiSelection(({ myDefaultIds }) => ({
            entity,
            collection,
            defaultSelectedIds: myDefaultIds(),
          })),
        );
        const store = new Store();
        patchState(store, setAllEntities(mockProducts, { collection }));
        expect(store.productIdsSelected()).toEqual(['4', '8']);
        expect(store.productEntitiesSelected()).toEqual([
          mockProducts[4],
          mockProducts[8],
        ]);
      });
    });

    it('deselect[Collection]Entities should deselect the entity', () => {
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        patchState(store, setAllEntities(mockProducts, { collection }));
        store.selectProductEntities({
          ids: [mockProducts[4].id, mockProducts[8].id],
        });
        store.deselectProductEntities({
          ids: [mockProducts[4].id, mockProducts[8].id],
        });
        expect(store.productEntitiesSelected()).toEqual([]);
        expect(store.productIdsSelected()).toEqual([]);
      });
    });

    it('toggle[Collection]Entities should toggle selection of the entity', () => {
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        patchState(store, setAllEntities(mockProducts, { collection }));
        store.toggleSelectProductEntities({ id: mockProducts[4].id });
        expect(store.productEntitiesSelected()).toEqual([mockProducts[4]]);
        expect(store.productIdsSelected()).toEqual(['4']);
        store.toggleSelectProductEntities({ id: mockProducts[4].id });
        expect(store.productEntitiesSelected()).toEqual([]);
        expect(store.productIdsSelected()).toEqual([]);
      });
    });

    it('isAll[Collection]Selected should toggle selection of the entity', () => {
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        patchState(store, setAllEntities(mockProducts, { collection }));
        store.toggleSelectAllProductEntities();
        expect(store.isAllProductEntitiesSelected()).toEqual('all');
        store.toggleSelectAllProductEntities();
        expect(store.isAllProductEntitiesSelected()).toEqual('none');
        store.toggleSelectProductEntities({
          ids: mockProducts.map((p) => p.id),
        });
        expect(store.isAllProductEntitiesSelected()).toEqual('all');
        store.toggleSelectProductEntities({ id: mockProducts[4].id });
        expect(store.isAllProductEntitiesSelected()).toEqual('some');
      });
    });

    it('clean[Collection]Selected should clear selection', () => {
      TestBed.runInInjectionContext(() => {
        const store = new Store();
        patchState(store, setAllEntities(mockProducts, { collection }));
        store.toggleSelectAllProductEntities();
        expect(store.isAllProductEntitiesSelected()).toEqual('all');
        store.clearProductEntitiesSelection();
        expect(store.isAllProductEntitiesSelected()).toEqual('none');
        store.toggleSelectProductEntities({
          ids: mockProducts.map((p) => p.id),
        });
        expect(store.isAllProductEntitiesSelected()).toEqual('all');
        store.toggleSelectProductEntities({ id: mockProducts[4].id });
        expect(store.isAllProductEntitiesSelected()).toEqual('some');
        store.clearProductEntitiesSelection();
        expect(store.isAllProductEntitiesSelected()).toEqual('none');
      });
    });
  });
});
