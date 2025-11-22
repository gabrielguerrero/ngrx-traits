import { computed } from '@angular/core';
import {
  patchState,
  signalStoreFeature,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';

import { CallStatus } from './with-all-call-status.model';

/**
 * Adds methods to the store to track the status of all calls in the store
 * @example
 * export const ProductsLocalStore = signalStore(
 *   withAllCallStatus(), // <-- add this line
 *   withEntities({ entity, collection }),
 *   withCallStatus({ collection, initialValue: 'loading' }),
 *   withEntitiesLoadingCall({
 *     collection,
 *     fetchEntities: () => {
 *       return inject(ProductService)
 *         .getProducts()
 *         .pipe(map((d) => d.resultList));
 *     },
 *   }),
 *   withCalls(() => ({
 *     loadProductDetail: callConfig({
 *       call: ({ id }: { id: string }) =>
 *         inject(ProductService).getProductDetail(id),
 *       resultProp: 'productDetail',
 *     }),
 *     checkout: () => inject(OrderService).checkout(),
 *   })),
 * );
 * // generates the following methods
 *  store.isAnyCallLoading() // Signal<boolean>
 *  store.callsErrors // () => Signals<unknown[]>
 */
export function withAllCallStatus() {
  return signalStoreFeature(
    withState({
      _allCallStatus: [] as CallStatus[],
    }),
    withComputed(({ _allCallStatus }) => ({
      isAnyCallLoading: computed(() =>
        _allCallStatus().some((callStatus) => callStatus.loading()),
      ),
      callsErrors: computed(() =>
        _allCallStatus()
          .map((callStatus) => callStatus.error?.())
          .filter(Boolean),
      ),
    })),
    withMethods(({ _allCallStatus, ...store }) => ({
      _registerCallStatus: (callStatus: CallStatus) => {
        patchState(store, {
          _allCallStatus: [..._allCallStatus(), callStatus],
        });
      },
    })),
  );
}
