import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import {
  withCallStatus,
  withEntitiesSingleSelection,
  withSyncToWebStorage,
} from '@ngrx-traits/signals';
import { patchState, signalStore, type, withState } from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';

import { mockProducts } from '../test.mocks';
import { Product } from '../test.model';

describe('withSyncToWebStorage', () => {
  const entity = type<Product>();
  it('should save and load to local storage', () => {
    TestBed.runInInjectionContext(() => {
      const Store = signalStore(
        { protectedState: false },
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
        { protectedState: false },
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

  it('should save and load to local session using filtered state and onRestore be called', () => {
    const onRestore = vi.fn();
    TestBed.runInInjectionContext(() => {
      const Store = signalStore(
        { protectedState: false },
        withEntities({ entity }),
        withCallStatus(),
        withSyncToWebStorage({
          key: 'test',
          type: 'session',
          restoreOnInit: false,
          saveStateChangesAfterMs: 0,
          filterState: (state) => ({
            ids: state.ids,
            entityMap: state.entityMap,
          }),
          onRestore,
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
      expect(store.isLoading()).toBe(true); // it keeps the current value because it was filtered
      expect(onRestore).toHaveBeenCalled();
    });
  });

  it('should save after milliseconds set in saveStateChangesAfterMs if is greater than 0 ', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const Store = signalStore(
        { protectedState: false },
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
        { protectedState: false },
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

  it('should restore and save state from store on init if there is more than one withSyncToWebStorage ', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      // we store split in two keys
      window.localStorage.setItem(
        'test',
        `{"entityMap":{"0":{"name":"Super Mario World","id":"0","description":"Super Nintendo Game","price":10},"1":{"name":"F-Zero","id":"1","description":"Super Nintendo Game","price":12}},"ids":["0","1"],"callStatus":"loaded"}`,
      );
      window.localStorage.setItem('test2', `{"idSelected":"1"}`);
      const Store = signalStore(
        { protectedState: false },
        withEntities({ entity }),
        withEntitiesSingleSelection({ entity }),
        withCallStatus(),
        withSyncToWebStorage({
          key: 'test',
          type: 'local',
          restoreOnInit: true,
          saveStateChangesAfterMs: 0,
          filterState: ({ ids, entityMap, callStatus }) => ({
            ids,
            entityMap,
            callStatus,
          }),
        }),
        withSyncToWebStorage({
          key: 'test2',
          type: 'local',
          restoreOnInit: true,
          saveStateChangesAfterMs: 0,
          filterState: ({ idSelected }) => ({ idSelected }),
        }),
      );
      const store = new Store();
      TestBed.flushEffects();
      tick();
      expect(store.entities().length).toEqual(2);
      expect(store.isLoaded()).toBe(true);
      expect(store.entitySelected()?.id).toEqual('1');
      store.selectEntity({ id: '0' });
      store.saveToStorage();
      tick();
      expect(getFromStorage('test2')).toEqual({ idSelected: '0' });
    });
  }));

  describe('expires', () => {
    it('should not load from local storage if cache is expired', fakeAsync(() => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {
        /* Empty */
      });
      consoleWarn.mockClear();
      TestBed.runInInjectionContext(() => {
        window.localStorage.setItem(
          'test',
          `{"entityMap":{"0":{"name":"Super Mario World","id":"0","description":"Super Nintendo Game","price":10},"1":{"name":"F-Zero","id":"1","description":"Super Nintendo Game","price":12}},"ids":["0","1"],"callStatus":"loaded"}`,
        );
        window.localStorage.setItem(
          'test-date',
          new Date(new Date().getTime() - 10000).toISOString(),
        );
        const Store = signalStore(
          { protectedState: false },
          withEntities({ entity }),
          withCallStatus(),
          withSyncToWebStorage({
            key: 'test',
            type: 'local',
            restoreOnInit: true,
            expires: 5000,
            saveStateChangesAfterMs: 0,
          }),
        );
        const store = new Store();
        TestBed.flushEffects();
        tick();
        expect(store.entities().length).toEqual(0);
        expect(store.isLoaded()).toBe(false);
        expect(consoleWarn).toHaveBeenCalledWith(
          'test local web storage expired',
        );
      });
    }));
    it('should  load from local storage if cache is not expired', fakeAsync(() => {
      TestBed.runInInjectionContext(() => {
        window.localStorage.setItem(
          'test',
          `{"entityMap":{"0":{"name":"Super Mario World","id":"0","description":"Super Nintendo Game","price":10},"1":{"name":"F-Zero","id":"1","description":"Super Nintendo Game","price":12}},"ids":["0","1"],"callStatus":"loaded"}`,
        );
        window.localStorage.setItem(
          'test-date',
          new Date(new Date().getTime() - 10000).toISOString(),
        );
        const Store = signalStore(
          { protectedState: false },
          withEntities({ entity }),
          withCallStatus(),
          withSyncToWebStorage({
            key: 'test',
            type: 'local',
            restoreOnInit: true,
            expires: 15000,
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

    it('should not load from session storage if cache is expired', fakeAsync(() => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {
        /* Empty */
      });
      consoleWarn.mockClear();
      TestBed.runInInjectionContext(() => {
        window.sessionStorage.setItem(
          'test',
          `{"entityMap":{"0":{"name":"Super Mario World","id":"0","description":"Super Nintendo Game","price":10},"1":{"name":"F-Zero","id":"1","description":"Super Nintendo Game","price":12}},"ids":["0","1"],"callStatus":"loaded"}`,
        );
        window.sessionStorage.setItem(
          'test-date',
          new Date(new Date().getTime() - 10000).toISOString(),
        );
        const Store = signalStore(
          { protectedState: false },
          withEntities({ entity }),
          withCallStatus(),
          withSyncToWebStorage({
            key: 'test',
            type: 'session',
            restoreOnInit: true,
            expires: 5000,
            saveStateChangesAfterMs: 0,
          }),
        );
        const store = new Store();
        TestBed.tick();
        tick();
        expect(store.entities().length).toEqual(0);
        expect(store.isLoaded()).toBe(false);
        expect(consoleWarn).toHaveBeenCalledWith(
          'test session web storage expired',
        );
      });
    }));
    it('should  load from session storage if cache is not expired', fakeAsync(() => {
      TestBed.runInInjectionContext(() => {
        window.sessionStorage.setItem(
          'test',
          `{"entityMap":{"0":{"name":"Super Mario World","id":"0","description":"Super Nintendo Game","price":10},"1":{"name":"F-Zero","id":"1","description":"Super Nintendo Game","price":12}},"ids":["0","1"],"callStatus":"loaded"}`,
        );
        window.sessionStorage.setItem(
          'test-date',
          new Date(new Date().getTime() - 10000).toISOString(),
        );
        const Store = signalStore(
          { protectedState: false },
          withEntities({ entity }),
          withCallStatus(),
          withSyncToWebStorage({
            key: 'test',
            type: 'session',
            restoreOnInit: true,
            expires: 15000,
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

    it('should save and load to local storage using expires', () => {
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          { protectedState: false },
          withEntities({ entity }),
          withCallStatus(),
          withSyncToWebStorage({
            key: 'test',
            type: 'local',
            expires: 1000,
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
  });

  describe('valueMapper', () => {
    it('should save and load to local storage using valueMapper', () => {
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          { protectedState: false },
          withState({
            userProfile: {
              userName: '',
              email: '',
              preferences: { theme: 'light', notifications: true },
              tempData: null as string | null,
            },
          }),
          withSyncToWebStorage({
            key: 'test',
            type: 'local',
            restoreOnInit: false,
            saveStateChangesAfterMs: 0,
            // Only save userName and email from userProfile
            valueMapper: (store) => ({
              stateToStorageValue: () => ({
                userName: store.userProfile().userName,
                email: store.userProfile().email,
              }),
              storageValueToState: (savedData) => {
                patchState(store, {
                  userProfile: {
                    ...store.userProfile(),
                    userName: savedData.userName,
                    email: savedData.email,
                  },
                });
              },
            }),
          }),
        );
        const store = new Store();
        store.clearFromStore();
        TestBed.flushEffects();

        // Set initial state
        patchState(store, {
          userProfile: {
            userName: 'John Doe',
            email: 'john@example.com',
            preferences: { theme: 'dark', notifications: false },
            tempData: 'should not be saved',
          },
        });
        store.saveToStorage();

        // Verify only userName and email were saved
        const savedData = getFromStorage('test');
        expect(savedData).toEqual({
          userName: 'John Doe',
          email: 'john@example.com',
        });
        expect(savedData.preferences).toBeUndefined();
        expect(savedData.tempData).toBeUndefined();

        // Clear userName and email, change other fields
        patchState(store, {
          userProfile: {
            userName: '',
            email: '',
            preferences: { theme: 'light', notifications: true },
            tempData: 'different data',
          },
        });
        expect(store.userProfile().userName).toBe('');
        expect(store.userProfile().email).toBe('');

        // Restore from storage
        store.loadFromStorage();
        expect(store.userProfile().userName).toBe('John Doe');
        expect(store.userProfile().email).toBe('john@example.com');
        // Verify preferences and tempData were not restored
        expect(store.userProfile().preferences).toEqual({
          theme: 'light',
          notifications: true,
        });
        expect(store.userProfile().tempData).toBe('different data');
      });
    });

    it('should save and load to session storage using valueMapper', () => {
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          { protectedState: false },
          withState({
            userProfile: {
              userName: '',
              email: '',
              preferences: { theme: 'light', notifications: true },
              tempData: null as string | null,
            },
          }),
          withSyncToWebStorage({
            key: 'test',
            type: 'session',
            restoreOnInit: false,
            saveStateChangesAfterMs: 0,
            valueMapper: (store) => ({
              stateToStorageValue: () => ({
                userName: store.userProfile().userName,
                email: store.userProfile().email,
              }),
              storageValueToState: (savedData) => {
                patchState(store, {
                  userProfile: {
                    ...store.userProfile(),
                    userName: savedData.userName,
                    email: savedData.email,
                  },
                });
              },
            }),
          }),
        );
        const store = new Store();
        store.clearFromStore();
        TestBed.flushEffects();

        patchState(store, {
          userProfile: {
            userName: 'Jane Smith',
            email: 'jane@example.com',
            preferences: { theme: 'dark', notifications: false },
            tempData: 'session data',
          },
        });
        store.saveToStorage();

        // Verify saved to session storage
        const savedData = JSON.parse(
          window.sessionStorage.getItem('test') || '{}',
        );
        expect(savedData).toEqual({
          userName: 'Jane Smith',
          email: 'jane@example.com',
        });

        // Clear and reload
        patchState(store, {
          userProfile: {
            userName: '',
            email: '',
            preferences: { theme: 'light', notifications: true },
            tempData: null,
          },
        });
        store.loadFromStorage();
        expect(store.userProfile().userName).toBe('Jane Smith');
        expect(store.userProfile().email).toBe('jane@example.com');
      });
    });

    it('should call onRestore after valueMapper transforms state', () => {
      const onRestore = vi.fn();
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          { protectedState: false },
          withState({
            userProfile: {
              userName: '',
              email: '',
              preferences: { theme: 'light', notifications: true },
              tempData: null as string | null,
            },
          }),
          withSyncToWebStorage({
            key: 'test',
            type: 'local',
            restoreOnInit: false,
            saveStateChangesAfterMs: 0,
            onRestore,
            valueMapper: (store) => ({
              stateToStorageValue: () => ({
                userName: store.userProfile().userName,
                email: store.userProfile().email,
              }),
              storageValueToState: (savedData) => {
                patchState(store, {
                  userProfile: {
                    ...store.userProfile(),
                    userName: savedData.userName,
                    email: savedData.email,
                  },
                });
              },
            }),
          }),
        );
        const store = new Store();
        store.clearFromStore();
        TestBed.flushEffects();

        patchState(store, {
          userProfile: {
            userName: 'Test User',
            email: 'test@example.com',
            preferences: { theme: 'dark', notifications: true },
            tempData: 'test',
          },
        });
        store.saveToStorage();

        patchState(store, {
          userProfile: {
            userName: '',
            email: '',
            preferences: { theme: 'light', notifications: false },
            tempData: null,
          },
        });
        store.loadFromStorage();

        expect(onRestore).toHaveBeenCalled();
        expect(store.userProfile().userName).toBe('Test User');
        expect(store.userProfile().email).toBe('test@example.com');
      });
    });

    it('should auto-save with valueMapper after state changes', fakeAsync(() => {
      TestBed.runInInjectionContext(() => {
        const Store = signalStore(
          { protectedState: false },
          withState({
            userProfile: {
              userName: '',
              email: '',
              preferences: { theme: 'light', notifications: true },
              tempData: null as string | null,
            },
          }),
          withSyncToWebStorage({
            key: 'test',
            type: 'local',
            restoreOnInit: false,
            saveStateChangesAfterMs: 1000,
            valueMapper: (store) => ({
              stateToStorageValue: () => ({
                userName: store.userProfile().userName,
                email: store.userProfile().email,
              }),
              storageValueToState: (savedData) => {
                patchState(store, {
                  userProfile: {
                    ...store.userProfile(),
                    userName: savedData.userName,
                    email: savedData.email,
                  },
                });
              },
            }),
          }),
        );
        const store = new Store();
        store.clearFromStore();
        TestBed.flushEffects();

        patchState(store, {
          userProfile: {
            userName: 'Auto Save',
            email: 'autosave@example.com',
            preferences: { theme: 'dark', notifications: false },
            tempData: 'temp',
          },
        });

        // Should not be saved yet
        let state = getFromStorage('test');
        expect(state).toBe(undefined);

        // Wait for auto-save
        tick(1500);
        state = getFromStorage('test');
        expect(state).toEqual({
          userName: 'Auto Save',
          email: 'autosave@example.com',
        });
        expect(state.preferences).toBeUndefined();
        expect(state.tempData).toBeUndefined();
      });
    }));
  });
});
function getFromStorage(key: string) {
  const data = window.localStorage.getItem(key);
  return data ? JSON.parse(data) : undefined;
}
