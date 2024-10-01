import { effect } from '@angular/core';
import {
  EmptyFeatureResult,
  getState,
  SignalStoreFeature,
  signalStoreFeature,
  SignalStoreFeatureResult,
  type,
  withHooks,
} from '@ngrx/signals';

/**
 * Log the state of the store on every change
 * @param name - The name of the store to log
 * @param filterState - optional filter the state before logging
 */
export function withStateLogger<Input extends SignalStoreFeatureResult>({
  name,
  filterState,
}: {
  name: string;
  filterState?: (state: Input['state']) => Partial<Input['state']>;
}): SignalStoreFeature<Input, EmptyFeatureResult> {
  return signalStoreFeature(
    type<Input>(),
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
