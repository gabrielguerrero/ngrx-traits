import { isPlatformBrowser } from '@angular/common';
import { effect, inject, isDevMode, PLATFORM_ID } from '@angular/core';
import {
  getState,
  patchState,
  Prettify,
  SignalStoreFeature,
  signalStoreFeature,
  SignalStoreFeatureResult,
  StateSignals,
  type,
  withHooks,
  withMethods,
  WritableStateSource,
} from '@ngrx/signals';

import { combineFunctionsInObject } from '../util';
import { StoreSource } from '../with-feature-factory/with-feature-factory.model';
import { StorageValueMapper } from './with-sync-to-web-storage.util';

/**
 * Sync the state of the store to the web storage
 * @param key - the key to use in the web storage
 * @param type - 'session' or 'local' storage
 * @param saveStateChangesAfterMs - save the state to the storage after this many milliseconds, 0 to disable
 * @param restoreOnInit - restore the state from the storage on init
 * @param filterState - filter the state before saving to the storage (mutually exclusive with valueMapper)
 * @param valueMapper - custom transformation between store state and storage value (mutually exclusive with filterState)
 * @param onRestore - callback after the state is restored from the storage
 * @param expires - storage will not be loaded if is older than this many milliseconds
 *
 * @example
 * // Example 1: Using filterState to save specific state properties
 * const store = signalStore(
 *  withEntities({ entity, collection }),
 *  withCallStatus({ prop: collection, initialValue: 'loading' }),
 *
 *  withSyncToWebStorage({
 *      key: 'my-key',
 *      type: 'session',
 *      restoreOnInit: true,
 *      saveStateChangesAfterMs: 300,
 *      // optionally, filter the state before saving to the storage
 *      filterState: ({ orderItemsEntityMap, orderItemsIds }) => ({
 *       orderItemsEntityMap,
 *       orderItemsIds,
 *     }),
 *  }),
 *  );
 *
 * @example
 * // Example 2: Using valueMapper for custom transformation
 * const store = signalStore(
 *  withState({
 *    userProfile: {
 *      userName: '',
 *      email: '',
 *      preferences: { theme: 'light', notifications: true },
 *      tempData: null,
 *    }
 *  }),
 *
 *  withSyncToWebStorage({
 *      key: 'user-form',
 *      type: 'local',
 *      restoreOnInit: true,
 *      saveStateChangesAfterMs: 500,
 *      // Custom mapper to store only userName and email
 *      valueMapper: (store) => ({
 *        stateToStorageValue: () => ({
 *          userName: store.userProfile().userName,
 *          email: store.userProfile().email,
 *        }),
 *        storageValueToState: (savedData) => {
 *          patchState(store, {
 *            userProfile: {
 *              ...store.userProfile(),
 *              userName: savedData.userName,
 *              email: savedData.email,
 *            }
 *          });
 *        },
 *      }),
 *  }),
 *  );
 *
 *  // generates the following methods
 *  store.saveToStorage();
 *  store.loadFromStorage();
 *  store.clearFromStore();
 *
 */
export function withSyncToWebStorage<Input extends SignalStoreFeatureResult>({
  key,
  type: storageType,
  saveStateChangesAfterMs = 500,
  restoreOnInit = true,
  onRestore,
  expires,
  ...rest
}: {
  key: string;
  type: 'session' | 'local';
  restoreOnInit?: boolean;
  saveStateChangesAfterMs?: number;
  expires?: number;
  onRestore?: (store: StoreSource<Input>) => void;
} & (
  | {
      filterState: (state: Input['state']) => Partial<Input['state']>;
    }
  | { valueMapper: StorageValueMapper<any, StoreSource<Input>> }
  | {}
)): SignalStoreFeature<
  Input,
  {
    state: {};
    props: {};
    methods: {
      saveToStorage: () => void;
      loadFromStorage: () => void;
      clearFromStore: () => void;
    };
  }
> {
  return signalStoreFeature(
    type<Input>(),
    withMethods((store: WritableStateSource<Input['state']>) => {
      const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
      const filterState = (rest as any).filterState;
      const valueMapper = (rest as any).valueMapper?.(store);
      return combineFunctionsInObject(
        {
          saveToStorage() {
            const state = filterState
              ? filterState(getState(store))
              : valueMapper
                ? valueMapper.stateToStorageValue()
                : getState(store);
            if (storageType === 'local') {
              window.localStorage.setItem(key, JSON.stringify(state));
              window.localStorage.setItem(
                key + '-date',
                new Date().toISOString(),
              );
            } else {
              window.sessionStorage.setItem(key, JSON.stringify(state));
              window.sessionStorage.setItem(
                key + '-date',
                new Date().toISOString(),
              );
            }
          },
          loadFromStorage(): boolean {
            if (!isBrowser) {
              return false;
            }
            let stateJson =
              storageType === 'local'
                ? window.localStorage.getItem(key)
                : window.sessionStorage.getItem(key);
            if (!stateJson) {
              return false;
            }
            if (expires) {
              const dateStr =
                storageType === 'local'
                  ? window.localStorage.getItem(key + '-date')
                  : window.sessionStorage.getItem(key + '-date');
              if (dateStr == null) {
                return false;
              }
              const date = new Date(dateStr);
              if (new Date().getTime() - date.getTime() > expires) {
                isDevMode() &&
                  console.warn(`${key} ${storageType} web storage expired`);
                return false;
              }
            }
            if (valueMapper) {
              valueMapper.storageValueToState(JSON.parse(stateJson));
            } else patchState(store, JSON.parse(stateJson));
            onRestore?.(store as StoreSource<Input>);
            return true;
          },
          clearFromStore() {
            if (storageType === 'local') window.localStorage.removeItem(key);
            else window.sessionStorage.removeItem(key);
          },
        },
        store,
      );
    }),
    withHooks(({ loadFromStorage, saveToStorage, ...store }) => ({
      onInit() {
        if (restoreOnInit) loadFromStorage();

        if (saveStateChangesAfterMs) {
          effect(() => {
            getState(store as any); // we call this just so this effect is triggered when the state changes
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
}
