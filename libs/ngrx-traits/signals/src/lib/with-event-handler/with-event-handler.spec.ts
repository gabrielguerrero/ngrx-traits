import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

import { broadcast, onEvent, withEventHandler } from './with-event-handler';
import { createEvent, props } from './with-event-handler.util';

describe('withEventHandler', () => {
  it('check multiple event handlers get called when an event is broadcast', () => {
    const increment = createEvent('[Counter] Increment');
    const decrement = createEvent('[Counter] Decrement');
    const add = createEvent('[Counter] Add', props<{ value: number }>());
    const Store = signalStore(
      withState({ count: 0 }),
      withEventHandler((state) => [
        onEvent(increment, () => {
          patchState(state, { count: state.count() + 1 });
        }),
        onEvent(decrement, () => {
          patchState(state, { count: state.count() - 1 });
        }),
      ]),
      withMethods((state) => {
        return {
          // this test we can send events to things defined after this method
          add5: () => broadcast(state, add({ value: 5 })),
        };
      }),
      withEventHandler((state) => [
        onEvent(add, ({ value }) => {
          patchState(state, { count: state.count() + value });
        }),
      ]),
      withMethods((state) => {
        return {
          increment: () => broadcast(state, increment()),
          decrement: () => broadcast(state, decrement()),
        };
      }),
    );
    const store = new Store();
    expect(store.count()).toBe(0);
    store.increment();
    expect(store.count()).toBe(1);
    store.decrement();
    expect(store.count()).toBe(0);
    store.add5();
    expect(store.count()).toBe(5);
  });
});
