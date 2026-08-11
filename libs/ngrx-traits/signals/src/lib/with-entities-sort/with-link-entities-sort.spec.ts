import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { patchState, signalStore, type, withMethods } from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';

import { withEntitiesLocalSort, withLinkEntitiesSort } from '../index';
import { Sort } from '../index';
import { mockProducts } from '../test.mocks';
import { Product } from '../test.model';

describe('withLinkEntitiesSort', () => {
  const entity = type<Product>();

  const Store = signalStore(
    { protectedState: false },
    withEntities({ entity }),
    withEntitiesLocalSort({
      entity,
      defaultSort: { field: 'name', direction: 'asc' },
    }),
    withLinkEntitiesSort({ entity }),
  );

  it('generates linkEntitiesSort that reads the sort and sorts on set', () => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      const linked = store.linkEntitiesSort();

      expect(linked()).toEqual({ field: 'name', direction: 'asc' });

      linked.set({ field: 'price', direction: 'desc' });
      expect(store.entitiesSort()).toEqual({
        field: 'price',
        direction: 'desc',
      });
      const prices = store.entities().map((e) => e.price);
      expect(prices).toEqual([...prices].sort((a, b) => b - a));
    });
  });

  it('skips sorting when the value is structurally equal to the sort', () => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      const linked = store.linkEntitiesSort();
      const before = store.entitiesSort();

      linked.set({ ...before });
      // update skipped, so the sort keeps the same reference
      expect(store.entitiesSort()).toBe(before);
    });
  });

  it('generates link[Collection]EntitiesSort with a collection', () => {
    const collection = 'products';
    const Store = signalStore(
      { protectedState: false },
      withEntities({ entity, collection }),
      withEntitiesLocalSort({
        entity,
        collection,
        defaultSort: { field: 'name', direction: 'asc' },
      }),
      withLinkEntitiesSort({ entity, collection }),
    );
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts, { collection }));
      const linked = store.linkProductsEntitiesSort();

      linked.set({ field: 'price', direction: 'desc' });
      expect(store.productsEntitiesSort()).toEqual({
        field: 'price',
        direction: 'desc',
      });
    });
  });

  it('syncs an external signal with the sort both ways', () => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      const external = signal<Sort<Product>>({
        field: 'price',
        direction: 'asc',
      });
      store.linkEntitiesSort({ syncWith: external });

      // external wins initially
      expect(store.entitiesSort()).toEqual({
        field: 'price',
        direction: 'asc',
      });

      // external -> store
      external.set({ field: 'price', direction: 'desc' });
      TestBed.tick();
      expect(store.entitiesSort()).toEqual({
        field: 'price',
        direction: 'desc',
      });

      // store -> external
      store.sortEntities({ sort: { field: 'name', direction: 'asc' } });
      TestBed.tick();
      expect(external()).toEqual({ field: 'name', direction: 'asc' });
    });
  });
  it('generates no _set setter, sortEntities already covers that write', () => {
    const StoreNoSetter = signalStore(
      { protectedState: false },
      withEntities({ entity }),
      withEntitiesLocalSort({
        entity,
        defaultSort: { field: 'name', direction: 'asc' },
      }),
      withLinkEntitiesSort({ entity }),
      // inside the store is where a private setter would be visible
      withMethods((store) => {
        // @ts-expect-error withLinkEntities* pass noSetter, so it is not generated
        const setter = store._setEntitiesSort;
        return { hasSetter: () => setter !== undefined };
      }),
    );
    TestBed.runInInjectionContext(() => {
      expect(new StoreNoSetter().hasSetter()).toBe(false);
    });
  });
});
