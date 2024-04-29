import { effect } from '@angular/core';
import {
  getState,
  SignalStoreFeature,
  signalStoreFeature,
  withHooks,
} from '@ngrx/signals';
import type {
  EmptyFeatureResult,
  SignalStoreFeatureResult,
} from '@ngrx/signals/src/signal-store-models';

/**
 * Log the state of the store on every change
 * @param name - The name of the store to log
 * @param filterState - filter the state before logging
 */
export function withLogger<Input extends SignalStoreFeatureResult>({
  name,
  filterState,
}: {
  name: string;
  filterState?: (state: Input['state']) => Partial<Input['state']>;
}): SignalStoreFeature<Input, EmptyFeatureResult> {
  return signalStoreFeature(
    withHooks({
      onInit(store) {
        effect(() => {
          const state = filterState
            ? filterState(getState(store))
            : getState(store);
          console.log(`${name} state changed`, state);
        });
      },
    }),
  );
}
