import { isPlatformBrowser } from '@angular/common';
import { effect, inject, PLATFORM_ID } from '@angular/core';
import {
  getState,
  patchState,
  signalStoreFeature,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';

/**
 * Sync the state of the store to the web storage
 * @param key - the key to use in the web storage
 * @param type - 'session' or 'local' storage
 * @param saveStateChangesAfterMs - save the state to the storage after this many milliseconds, 0 to disable
 * @param restoreOnInit - restore the state from the storage on init
 *
 * @example
 * const store = signalStore(
 *  // following are not required, just an example it can have anything
 *  withEntities({ entity, collection }),
 *  withCallStatus({ prop: collection, initialValue: 'loading' }),
 *
 *  withSyncToWebStorage({
 *      key: 'my-key',
 *      type: 'session',
 *      restoreOnInit: true,
 *      saveStateChangesAfterMs: 300,
 *  }),
 *  );
 *  // generates the following methods
 *  store.saveToStorage();
 *  store.loadFromStorage();
 */
export const withSyncToWebStorage = ({
  key,
  type,
  saveStateChangesAfterMs,
  restoreOnInit,
}: {
  key: string;
  type: 'session' | 'local';
  restoreOnInit: boolean;
  saveStateChangesAfterMs: number;
}) =>
  signalStoreFeature(
    withState({}),
    withMethods((store) => {
      const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
      return {
        saveToStorage() {
          if (type === 'local')
            window.localStorage.setItem(key, JSON.stringify(getState(store)));
          else
            window.sessionStorage.setItem(key, JSON.stringify(getState(store)));
        },
        loadFromStorage(): boolean {
          if (!isBrowser) {
            return false;
          }
          let stateJson =
            type === 'local'
              ? window.localStorage.getItem(key)
              : window.sessionStorage.getItem(key);
          if (!stateJson) {
            return false;
          }
          patchState(store, JSON.parse(stateJson));
          return true;
        },
      };
    }),
    withHooks(({ loadFromStorage, saveToStorage, ...store }) => ({
      onInit() {
        console.log('init');
        if (restoreOnInit) loadFromStorage();

        if (saveStateChangesAfterMs) {
          effect(() => {
            getState(store); // we call this just so this effect is triggered when the state changes
            const timeout = setTimeout(() => {
              saveToStorage();
            }, saveStateChangesAfterMs);
            return () => {
              clearTimeout(timeout);
            };
          });
        }
      },
    })),
  );
