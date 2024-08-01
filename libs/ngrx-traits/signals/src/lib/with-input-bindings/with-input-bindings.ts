import { computed, Signal } from '@angular/core';
import {
  patchState,
  signalStoreFeature,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap } from 'rxjs';

type RecordSignals<T extends object> = {
  [K in keyof T]: Signal<T[K]>;
};

/**
 * @experimental
 * Binds component inputs to the store, so that the store is updated with the latest values of the inputs.
 * @param inputs
 *
 * @example
 *
 * const Store = signalStore(
 *    withInputBindings({
 *       pageIndex: 0,
 *       length: 0,
 *       pageSize: 10,
 *       pageSizeOptions: [5, 10, 20],
 *     }),
 *    //... other features that use foo and bar
 *  );
 *  // generates the signals
 *    store.pageIndex(); // 0
 *    store.length(); // 0
 *    store.pageSize(); // 10
 *    store.pageSizeOptions(); // [5, 10, 20]
 *
 *    generates the method
 *    store.bindInputs({ pageIndex: Signal<number>, length: Signal<number>, pageSize: Signal<number>, pageSizeOptions: Signal<number[]> });
 *
 *  // use in a component
 *    class PaginatorComponent {
 *     readonly pageIndex = input.required<number>;
 *     readonly length = input.required<number>;
 *     readonly pageSize = input.required<number>;
 *     readonly pageSizeOptions = input.required<number[]>;
 *     readonly store = inject(Store);
 *     constructor() {
 *       this.store.bindInputs({
 *         pageIndex: this.pageIndex,
 *         length: this.length,
 *         pageSize: this.pageSize,
 *         pageSizeOptions: this.pageSizeOptions,
 *       });
 *       // if the inputs have the same name and type as the store,
 *       // you can use bindInputs like
 *       // this.store.bindInputs(this);
 *     }
 *   }
 *
 */
export function withInputBindings<
  Object extends object,
  Inputs extends RecordSignals<Object> = RecordSignals<Object>,
>(inputs: Object) {
  return signalStoreFeature(
    withState(inputs),
    withMethods((store) => ({
      bindInputs: (inputs: Inputs) => {
        const combined = computed((): Object => {
          return Object.entries(inputs).reduce((acc, [key, s]) => {
            acc[key] = (s as Signal<unknown>)();
            return acc;
          }, {} as any);
        });
        return rxMethod<Object>(
          pipe(
            tap((values) => {
              console.log('values', values);
              patchState(store, { ...values });
            }),
          ),
        )(combined);
      },
    })),
  );
}
