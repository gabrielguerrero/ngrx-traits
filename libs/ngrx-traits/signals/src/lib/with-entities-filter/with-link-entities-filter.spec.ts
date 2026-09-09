import { EventEmitter, signal } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { patchState, signalStore, type, withMethods } from '@ngrx/signals';
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

      linked.set({ ...before });
      linked.set({ ...before });
      tick(400);
      // structurally equal to the filter, so neither set is pushed and the
      // filter keeps the reference it started with
      expect(store.entitiesFilter()).toBe(before);
    });
  }));

  it('does not debounce the filter write, so it lands synchronously', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      const linked = store.linkEntitiesFilter();

      linked.set({ search: 'zero' });
      // no tick: a debounced write would still be in flight here
      expect(store.entitiesFilter()).toEqual({ search: 'zero' });
    });
  }));

  // regression: while a debounced write was in flight the store still held the
  // old filter, so a write back to it was dropped as a no-op and the pending
  // one won — the user's edit silently undone. Writing synchronously rules
  // this out, and is why there is no debounce option.
  it('applies a filter set back to the committed value', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      const linked = store.linkEntitiesFilter();

      linked.set({ search: 'zero' });
      linked.set({ search: '' });
      tick(400);
      expect(store.entitiesFilter()).toEqual({ search: '' });
    });
  }));

  // readFrom writes straight to the store, so nothing is ever in flight for
  // writeTo to echo when the value arrives late
  it('does not echo the readFrom value out', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      const emitted: { search: string }[] = [];
      const emitter = new EventEmitter<{ search: string }>();
      emitter.subscribe((value) => emitted.push(value));
      store.linkEntitiesFilter({
        readFrom: signal({ search: 'from-input' }),
        writeTo: emitter,
      });
      TestBed.tick();
      tick(400);
      TestBed.tick();

      expect(store.entitiesFilter()).toEqual({ search: 'from-input' });
      expect(emitted).toEqual([]);
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
        storeEditsWhen: (filter) => valid() && filter.search !== 'bad',
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

  it('generates no _set setter, filterEntities already covers that write', () => {
    const StoreNoSetter = signalStore(
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
      // inside the store is where a private setter would be visible
      withMethods((store) => {
        // @ts-expect-error withLinkEntities* pass noSetter, so it is not generated
        const setter = store._setEntitiesFilter;
        return { hasSetter: () => setter !== undefined };
      }),
    );
    TestBed.runInInjectionContext(() => {
      expect(new StoreNoSetter().hasSetter()).toBe(false);
    });
  });

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
