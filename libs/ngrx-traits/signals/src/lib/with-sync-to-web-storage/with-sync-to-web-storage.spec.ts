import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { withCallStatus, withSyncToWebStorage } from '@ngrx-traits/signals';
import { patchState, signalStore, type } from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';

import { mockProducts } from '../test.mocks';
import { Product } from '../test.model';

describe('withSyncToWebStorage', () => {
  const entity = type<Product>();
  it('should save and load to local storage', () => {
    TestBed.runInInjectionContext(() => {
      const Store = signalStore(
        withEntities({ entity }),
        withCallStatus(),
        withSyncToWebStorage({
          key: 'test',
          type: 'local',
          restoreOnInit: false,
          saveStateChangesAfterMs: 0,
        }),
      );
      const store = new Store();
      store.clearFromStore();
      TestBed.flushEffects();
      store.setLoaded();
      patchState(store, setAllEntities(mockProducts));
      store.saveToStorage();

      store.setLoading();
      patchState(store, setAllEntities(mockProducts.slice(0, 30)));

      store.loadFromStorage();
      expect(store.entities()).toEqual(mockProducts);
      expect(store.isLoaded()).toBe(true);
    });
  });

  it('should save and load to local session', () => {
    TestBed.runInInjectionContext(() => {
      const Store = signalStore(
        withEntities({ entity }),
        withCallStatus(),
        withSyncToWebStorage({
          key: 'test',
          type: 'session',
          restoreOnInit: false,
          saveStateChangesAfterMs: 0,
        }),
      );
      const store = new Store();
      store.clearFromStore();
      TestBed.flushEffects();
      store.setLoaded();
      patchState(store, setAllEntities(mockProducts));
      store.saveToStorage();

      store.setLoading();
      patchState(store, setAllEntities(mockProducts.slice(0, 30)));

      store.loadFromStorage();
      expect(store.entities()).toEqual(mockProducts);
      expect(store.isLoaded()).toBe(true);
    });
  });

  it('should save after milliseconds set in saveStateChangesAfterMs if is greater than 0 ', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const Store = signalStore(
        withEntities({ entity }),
        withCallStatus(),
        withSyncToWebStorage({
          key: 'test',
          type: 'local',
          restoreOnInit: false,
          saveStateChangesAfterMs: 1000,
        }),
      );
      const store = new Store();
      store.clearFromStore();
      TestBed.flushEffects();
      store.setLoaded();
      patchState(store, setAllEntities(mockProducts));
      let state = getFromStorage('test');
      expect(state).toBe(undefined);
      tick(1500);
      state = getFromStorage('test');
      expect(state.ids.length).toEqual(mockProducts.length);
      expect(state.callStatus).toEqual('loaded');
    });
  }));

  it('should restore state from store on init if restoreOnInit: true ', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      window.localStorage.setItem(
        'test',
        `{"entityMap":{"0":{"name":"Super Mario World","id":"0","description":"Super Nintendo Game","price":10},"1":{"name":"F-Zero","id":"1","description":"Super Nintendo Game","price":12}},"ids":["0","1"],"callStatus":"loaded"}`,
      );
      const Store = signalStore(
        withEntities({ entity }),
        withCallStatus(),
        withSyncToWebStorage({
          key: 'test',
          type: 'local',
          restoreOnInit: true,
          saveStateChangesAfterMs: 0,
        }),
      );
      const store = new Store();
      TestBed.flushEffects();
      tick();
      expect(store.entities().length).toEqual(2);
      expect(store.isLoaded()).toBe(true);
    });
  }));
});
function getFromStorage(key: string) {
  const data = window.localStorage.getItem(key);
  return data ? JSON.parse(data) : undefined;
}
