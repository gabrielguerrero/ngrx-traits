import { signal } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { patchState, signalStore, type } from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';

import { withEntitiesLocalFilter, withLinkEntitiesFilter } from '../index';
import { mockProducts } from '../test.mocks';
import { Product } from '../test.model';

describe('withLinkEntitiesFilter', () => {
  const entity = type<Product>();

  const Store = signalStore(
    { protectedState: false },
    withEntities({ entity }),
    withEntitiesLocalFilter({
      entity,
      defaultFilter: { search: '' },
      filterFn: (entity, filter) =>
        !filter?.search ||
        entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
    }),
    withLinkEntitiesFilter({ entity }),
  );

  it('generates linkEntitiesFilter that reads the filter and filters on set', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      const linked = store.linkEntitiesFilter();

      expect(linked()).toEqual({ search: '' });

      linked.set({ search: 'zero' });
      tick(400);
      expect(store.entitiesFilter()).toEqual({ search: 'zero' });
      expect(store.entities().length).toEqual(2);
      expect(linked()).toEqual({ search: 'zero' });
    });
  }));

  it('skips filtering when the value is structurally equal to the filter', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      const linked = store.linkEntitiesFilter();
      const before = store.entitiesFilter();

      var test = { ...before };
      linked.set(test); // first set will always update
      linked.set({ ...before });
      tick(400);
      // update skipped, so the filter keeps the same reference
      expect(store.entitiesFilter()).toBe(test);
    });
  }));

  it('passes debounce config to filterEntities', fakeAsync(() => {
    const Store = signalStore(
      { protectedState: false },
      withEntities({ entity }),
      withEntitiesLocalFilter({
        entity,
        defaultFilter: { search: '' },
        filterFn: (entity, filter) =>
          !filter?.search ||
          entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
      }),
      withLinkEntitiesFilter({ entity, debounce: 1000 }),
    );
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      const linked = store.linkEntitiesFilter();

      linked.set({ search: 'zero' });
      tick(400);
      expect(store.entitiesFilter()).toEqual({ search: '' });
      tick(700);
      expect(store.entitiesFilter()).toEqual({ search: 'zero' });
    });
  }));

  it('generates link[Collection]EntitiesFilter with a collection', fakeAsync(() => {
    const collection = 'products';
    const Store = signalStore(
      { protectedState: false },
      withEntities({ entity, collection }),
      withEntitiesLocalFilter({
        entity,
        collection,
        defaultFilter: { search: '' },
        filterFn: (entity, filter) =>
          !filter?.search ||
          entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
      }),
      withLinkEntitiesFilter({ entity, collection }),
    );
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts, { collection }));
      const linked = store.linkProductsEntitiesFilter();

      linked.set({ search: 'zero' });
      tick(400);
      expect(store.productsEntitiesFilter()).toEqual({ search: 'zero' });
      expect(store.productsEntities().length).toEqual(2);
    });
  }));

  it('accepts the options as the only argument', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      const valid = signal(false);
      const linked = store.linkEntitiesFilter({
        updateWhen: (filter) => valid() && filter.search !== 'bad',
      });

      linked.set({ search: 'zero' });
      TestBed.tick();
      tick(400);
      expect(store.entitiesFilter()).toEqual({ search: '' });

      valid.set(true);
      TestBed.tick();
      tick(400);
      expect(store.entitiesFilter()).toEqual({ search: 'zero' });
      expect(store.entities().length).toEqual(2);
    });
  }));

  it('syncs an external signal with the filter both ways', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      const external = signal({ search: 'zero' });
      store.linkEntitiesFilter({ syncWith: external });

      // external wins initially
      tick(400);
      expect(store.entitiesFilter()).toEqual({ search: 'zero' });
      expect(store.entities().length).toEqual(2);

      // external -> store
      external.set({ search: 'gx' });
      TestBed.tick();
      tick(400);
      expect(store.entitiesFilter()).toEqual({ search: 'gx' });

      // store -> external
      store.filterEntities({ filter: { search: 'super' }, debounce: 0 });
      tick(400);
      TestBed.tick();
      expect(external()).toEqual({ search: 'super' });
    });
  }));
});
