import { isPlatformBrowser } from '@angular/common';
import {
  effect,
  inject,
  makeStateKey,
  PLATFORM_ID,
  TransferState,
} from '@angular/core';
import {
  getState,
  patchState,
  SignalStoreFeature,
  signalStoreFeature,
  SignalStoreFeatureResult,
  type,
  withHooks,
  WritableStateSource,
} from '@ngrx/signals';

import { toFilterStateFn } from '../util';
import { StoreSource } from '../with-feature-factory/with-feature-factory.model';
import { TransferValueMapper } from './with-server-state-transfer.util';

/**
 * Sync the state of the store using Angular's TransferState API for SSR
 * @param key - the key to use in the TransferState
 * @param filterState - filter the state before saving to TransferState, either an array of state keys or a function (mutually exclusive with valueMapper)
 * @param valueMapper - custom transformation between store state and transfer value (mutually exclusive with filterState)
 * @param onRestore - callback after the state is restored from TransferState
 *
 * @example
 * // Example 1: Using filterState to transfer specific state properties
 * const store = signalStore(
 *  withEntities({ entity, collection }),
 *  withCallStatus({ prop: collection, initialValue: 'loading' }),
 *
 *  withServerStateTransfer({
 *      key: 'my-state',
 *      // optionally, filter the state before transferring
 *      // with an array of state keys
 *      filterState: ['orderItemsEntityMap', 'orderItemsIds'],
 *      // or with a function
 *      // filterState: ({ orderItemsEntityMap, orderItemsIds }) => ({
 *      //  orderItemsEntityMap,
 *      //  orderItemsIds,
 *      // }),
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
 *  withServerStateTransfer({
 *      key: 'user-profile',
 *      // Custom mapper to transfer only userName and email
 *      valueMapper: (store) => ({
 *        stateToTransferValue: () => ({
 *          userName: store.userProfile().userName,
 *          email: store.userProfile().email,
 *        }),
 *        transferValueToState: (savedData) => {
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
 */
export function withServerStateTransfer<
  Input extends SignalStoreFeatureResult,
>({
  key,
  onRestore,
  ...rest
}: {
  key: string;
  onRestore?: (store: StoreSource<Input>) => void;
} & (
  | {
      filterState:
        | ((state: Input['state']) => Partial<Input['state']>)
        | readonly (keyof Input['state'])[];
      valueMapper?: never;
    }
  | {
      valueMapper: TransferValueMapper<any, StoreSource<Input>>;
      filterState?: never;
    }
  | { filterState?: never; valueMapper?: never }
)): SignalStoreFeature<Input, { state: {}; props: {}; methods: {} }> {
  const filterState = toFilterStateFn<Input['state']>(
    (rest as any).filterState,
  );
  return signalStoreFeature(
    type<Input>(),
    withHooks((store: WritableStateSource<Input['state']>) => {
      const transferState = inject(TransferState);
      const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
      const valueMapper = (rest as any).valueMapper?.(store);
      const stateKey = makeStateKey<any>(key);

      return {
        onInit() {
          if (isBrowser) {
            // Client side: restore state from TransferState
            const transferredState = transferState.get(stateKey, null);
            if (transferredState) {
              if (valueMapper) {
                valueMapper.transferValueToState(transferredState);
              } else {
                patchState(store, transferredState);
              }
              onRestore?.(store as StoreSource<Input>);
              // Clean up TransferState after restoration
              transferState.remove(stateKey);
            }
          } else {
            // Server side: save state changes to TransferState
            effect(() => {
              const state = filterState
                ? filterState(getState(store))
                : valueMapper
                  ? valueMapper.stateToTransferValue()
                  : getState(store);
              transferState.set(stateKey, state);
            });
          }
        },
      };
    }),
  );
}
