import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form as signalForm } from '@angular/forms/signals';
import {
  patchState,
  signalStore,
  type,
  watchState,
  withMethods,
} from '@ngrx/signals';
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

  it('generates linkIdSelected that selects on set and deselects on null', () => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      const linked = store.linkIdSelected();

      expect(linked()).toBeNull();

      linked.set(mockProducts[4].id);
      expect(store.idSelected()).toEqual(mockProducts[4].id);
      expect(store.entitySelected()).toEqual(mockProducts[4]);
      expect(linked()).toEqual(mockProducts[4].id);

      linked.set(null);
      expect(store.idSelected()).toBeUndefined();
      expect(store.entitySelected()).toBeUndefined();
      expect(linked()).toBeNull();
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

      expect(linked()).toBeNull();

      linked.set(mockProducts[4].id);
      expect(store.productsIdSelected()).toEqual(mockProducts[4].id);
      expect(store.productsEntitySelected()).toEqual(mockProducts[4]);

      store.deselectProductsEntity();
      expect(linked()).toBeNull();
    });
  });

  it('syncs an external signal with the selected id both ways', () => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      const external = signal<string | number | null>(mockProducts[4].id);
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
      expect(external()).toBeNull();
    });
  });
  it('deselects on undefined too, and reads back null', () => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      const linked = store.linkIdSelected();

      linked.set(mockProducts[4].id);
      // typed to null only, but undefined from an untyped caller still deselects
      (linked as WritableSignal<string | number | null | undefined>).set(
        undefined,
      );
      expect(store.idSelected()).toBeUndefined();
      expect(linked()).toBeNull();
    });
  });

  it('treats null and undefined as the same, so no redundant deselect', () => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      const linked = store.linkIdSelected();
      // watchState runs on every patch, even one with the same values
      let patches = 0;
      watchState(store, () => patches++);
      patches = 0;

      // typed to null only, but undefined from an untyped caller still deselects
      (linked as WritableSignal<string | number | null | undefined>).set(
        undefined,
      );
      linked.set(null);
      expect(patches).toBe(0);
    });
  });

  it('links an undefined-typed signal without a map', () => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      const external = signal<string | number | undefined>(undefined);
      const linked = store.linkIdSelected({ readFrom: external });

      external.set(mockProducts[4].id);
      TestBed.tick();
      expect(store.idSelected()).toEqual(mockProducts[4].id);

      external.set(undefined);
      TestBed.tick();
      expect(store.idSelected()).toBeUndefined();
      expect(linked()).toBeNull();
    });
  });

  it('writes null to the external signal with initialValueFrom store and no selection', () => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      const external = signal<string | number | null>(mockProducts[4].id);
      store.linkIdSelected({ syncWith: external, initialValueFrom: 'store' });

      expect(external()).toBeNull();
      expect(store.idSelected()).toBeUndefined();
    });
  });

  it('syncs an undefined-typed signal through writeMap, as it only emits null', () => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      const external = signal<string | number | undefined>(undefined);
      // @ts-expect-error writeMap is required, the link emits null
      store.linkIdSelected({ syncWith: external });
      store.linkIdSelected({
        syncWith: external,
        writeMap: (id) => id ?? undefined,
      });

      store.selectEntity({ id: mockProducts[4].id });
      TestBed.tick();
      expect(external()).toEqual(mockProducts[4].id);

      store.deselectEntity();
      TestBed.tick();
      expect(external()).toBeUndefined();
    });
  });

  it('pushes null to writeTo on deselect', () => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      const external = signal<string | number | null>(null);
      store.linkIdSelected({ writeTo: external });

      store.selectEntity({ id: mockProducts[4].id });
      TestBed.tick();
      expect(external()).toEqual(mockProducts[4].id);

      store.deselectEntity();
      TestBed.tick();
      expect(external()).toBeNull();
    });
  });

  it('works as a Signal Forms field, with null when nothing is selected', () => {
    TestBed.runInInjectionContext(() => {
      const store = new Store();
      patchState(store, setAllEntities(mockProducts));
      const idForm = signalForm(store.linkIdSelected());

      expect(idForm().value()).toBeNull();

      idForm().value.set(mockProducts[4].id);
      expect(store.idSelected()).toEqual(mockProducts[4].id);

      store.deselectEntity();
      expect(idForm().value()).toBeNull();
    });
  });

  it('generates no _set setter, selectEntity/deselectEntity already covers that write', () => {
    const StoreNoSetter = signalStore(
      { protectedState: false },
      withEntities({ entity }),
      withEntitiesSingleSelection({ entity }),
      withLinkEntitiesSingleSelection({ entity }),
      // inside the store is where a private setter would be visible
      withMethods((store) => {
        // @ts-expect-error withLinkEntities* pass noSetter, so it is not generated
        const setter = store._setIdSelected;
        return { hasSetter: () => setter !== undefined };
      }),
    );
    TestBed.runInInjectionContext(() => {
      expect(new StoreNoSetter().hasSetter()).toBe(false);
    });
  });
});
