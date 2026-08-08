import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { patchState, signalStore, type } from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';

import {
  withEntitiesSingleSelection,
  withLinkEntitiesSingleSelection,
} from '../index';
import { mockProducts } from '../test.mocks';
import { Product } from '../test.model';

describe('withLinkEntitiesSingleSelection', () => {
  const entity = type<Product>();

  const Store = signalStore(
    { protectedState: false },
    withEntities({ entity }),
    withEntitiesSingleSelection({ entity }),
    withLinkEntitiesSingleSelection({ entity }),
  );

  it('generates linkIdSelected that selects on set and deselects on undefined', () => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      const linked = store.linkIdSelected();

      expect(linked()).toBeUndefined();

      linked.set(mockProducts[4].id);
      expect(store.idSelected()).toEqual(mockProducts[4].id);
      expect(store.entitySelected()).toEqual(mockProducts[4]);
      expect(linked()).toEqual(mockProducts[4].id);

      linked.set(undefined);
      expect(store.idSelected()).toBeUndefined();
      expect(store.entitySelected()).toBeUndefined();
    });
  });

  it('generates link[Collection]IdSelected with a collection', () => {
    const collection = 'products';
    const Store = signalStore(
      { protectedState: false },
      withEntities({ entity, collection }),
      withEntitiesSingleSelection({ entity, collection }),
      withLinkEntitiesSingleSelection({ entity, collection }),
    );
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts, { collection }));
      const linked = store.linkProductsIdSelected();

      linked.set(mockProducts[4].id);
      expect(store.productsIdSelected()).toEqual(mockProducts[4].id);
      expect(store.productsEntitySelected()).toEqual(mockProducts[4]);
    });
  });

  it('syncs an external signal with the selected id both ways', () => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      const external = signal<string | number | undefined>(mockProducts[4].id);
      store.linkIdSelected({ syncWith: external });

      // external wins initially
      expect(store.idSelected()).toEqual(mockProducts[4].id);

      // external -> store
      external.set(mockProducts[8].id);
      TestBed.tick();
      expect(store.idSelected()).toEqual(mockProducts[8].id);

      // store -> external
      store.selectEntity({ id: mockProducts[2].id });
      TestBed.tick();
      expect(external()).toEqual(mockProducts[2].id);

      store.deselectEntity();
      TestBed.tick();
      expect(external()).toBeUndefined();
    });
  });
});
