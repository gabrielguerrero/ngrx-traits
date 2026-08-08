import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { patchState, signalStore, type } from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';

import {
  withEntitiesMultiSelection,
  withLinkEntitiesMultiSelection,
} from '../index';
import { mockProducts } from '../test.mocks';
import { Product } from '../test.model';

describe('withLinkEntitiesMultiSelection', () => {
  const entity = type<Product>();

  const Store = signalStore(
    { protectedState: false },
    withEntities({ entity }),
    withEntitiesMultiSelection({ entity }),
    withLinkEntitiesMultiSelection({ entity }),
  );

  it('generates linkIdsSelected that replaces the selection on set and clears on empty', () => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      const linked = store.linkIdsSelected();

      expect(linked()).toEqual([]);

      linked.set([mockProducts[4].id, mockProducts[8].id]);
      expect(store.idsSelected()).toEqual(['4', '8']);
      expect(store.entitiesSelected()).toEqual([
        mockProducts[4],
        mockProducts[8],
      ]);

      // replaces previous selection
      linked.set([mockProducts[1].id]);
      expect(store.idsSelected()).toEqual(['1']);

      // empty array clears the selection
      linked.set([]);
      expect(store.idsSelected()).toEqual([]);
      expect(store.entitiesSelected()).toEqual([]);
    });
  });

  it('generates link[Collection]IdsSelected with a collection', () => {
    const collection = 'products';
    const Store = signalStore(
      { protectedState: false },
      withEntities({ entity, collection }),
      withEntitiesMultiSelection({ entity, collection }),
      withLinkEntitiesMultiSelection({ entity, collection }),
    );
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts, { collection }));
      const linked = store.linkProductsIdsSelected();

      linked.set([mockProducts[4].id, mockProducts[8].id]);
      expect(store.productsIdsSelected()).toEqual(['4', '8']);
      expect(store.productsEntitiesSelected()).toEqual([
        mockProducts[4],
        mockProducts[8],
      ]);
    });
  });

  it('ignores writes with the same ids in a different order', () => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      const linked = store.linkIdsSelected();

      store.selectEntities({ ids: ['4', '8'] });
      const mapBefore = store.idsSelectedMap();

      linked.set(['8', '4']);
      // update skipped, so the selection map keeps the same reference
      expect(store.idsSelectedMap()).toBe(mapBefore);
    });
  });

  it('syncs an external signal with the selected ids both ways', () => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      const external = signal<(string | number)[]>(['8', '4']);
      store.linkIdsSelected({ syncWith: external });
      TestBed.tick();

      // external wins initially; the selection map normalizes the order,
      // but the order-insensitive equal keeps the external order untouched
      expect(store.idsSelected()).toEqual(['4', '8']);
      expect(external()).toEqual(['8', '4']);

      // external -> store
      external.set(['1']);
      TestBed.tick();
      expect(store.idsSelected()).toEqual(['1']);

      // store -> external
      store.selectEntities({ ids: ['2'] });
      TestBed.tick();
      expect(external()).toEqual(['1', '2']);
    });
  });
});
