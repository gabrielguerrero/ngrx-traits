import { computed } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  patchState,
  signalStore,
  withComputed,
  withState,
} from '@ngrx/signals';

import { withLogger } from './with-logger';

describe('withLogger', () => {
  it('should log in the console state and computed signals', () => {
    const Store = signalStore(
      { providedIn: 'root', protectedState: false },
      withState(() => ({ prop1: 1, prop2: 2 })),
      withComputed(({ prop1, prop2 }) => ({
        prop3: computed(() => prop1() + prop2()),
      })),
      withLogger({ name: 'Store' }),
    );

    const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => {
      /* Empty */
    });
    const store = TestBed.inject(Store);
    TestBed.flushEffects();
    expect(consoleLog).toBeCalledWith('Store store changed: ', {
      prop1: 1,
      prop2: 2,
      prop3: 3,
    });
    patchState(store, { prop1: 2 });
    TestBed.flushEffects();
    expect(consoleLog).toBeCalledWith('Store store changed: ', {
      prop1: 2,
      prop2: 2,
      prop3: 4,
    });
  });

  it('should filter props in array', () => {
    const Store = signalStore(
      { providedIn: 'root', protectedState: false },
      withState(() => ({ prop1: 1, prop2: 2 })),
      withComputed(({ prop1, prop2 }) => ({
        prop3: computed(() => prop1() + prop2()),
      })),
      withLogger({
        name: 'Store',
        filter: ['prop1', 'prop2'],
      }),
    );

    const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => {
      /* Empty */
    });
    const store = TestBed.inject(Store);
    TestBed.flushEffects();
    expect(consoleLog).toBeCalledWith('Store store changed: ', {
      prop1: 1,
      prop2: 2,
    });
    patchState(store, { prop1: 2 });
    TestBed.flushEffects();
    expect(consoleLog).toBeCalledWith('Store store changed: ', {
      prop1: 2,
      prop2: 2,
    });
  });

  it('should filter props in function returning object ', () => {
    const Store = signalStore(
      { providedIn: 'root', protectedState: false },
      withState(() => ({ prop1: 1, prop2: 2 })),
      withComputed(({ prop1, prop2 }) => ({
        prop3: computed(() => prop1() + prop2()),
      })),
      withLogger({
        name: 'Store',
        filter: ({ prop1, prop2 }) => ({ prop1: prop1(), prop2: prop2() }),
      }),
    );

    const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => {
      /* Empty */
    });
    const store = TestBed.inject(Store);
    TestBed.flushEffects();
    expect(consoleLog).toBeCalledWith('Store store changed: ', {
      prop1: 1,
      prop2: 2,
    });
    patchState(store, { prop1: 2 });
    TestBed.flushEffects();
    expect(consoleLog).toBeCalledWith('Store store changed: ', {
      prop1: 2,
      prop2: 2,
    });
  });

  it('should filter props in function returning object with signal props ', () => {
    const Store = signalStore(
      { providedIn: 'root', protectedState: false },
      withState(() => ({ prop1: 1, prop2: 2 })),
      withComputed(({ prop1, prop2 }) => ({
        prop3: computed(() => prop1() + prop2()),
      })),
      withLogger({
        name: 'Store',
        filter: ({ prop1, prop2 }) => ({ prop1: prop1, prop2: prop2 }),
      }),
    );

    const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => {
      /* Empty */
    });
    const store = TestBed.inject(Store);
    TestBed.flushEffects();
    expect(consoleLog).toBeCalledWith('Store store changed: ', {
      prop1: 1,
      prop2: 2,
    });
    patchState(store, { prop1: 2 });
    TestBed.flushEffects();
    expect(consoleLog).toBeCalledWith('Store store changed: ', {
      prop1: 2,
      prop2: 2,
    });
  });

  it('should show diff if showDiff s true', () => {
    const Store = signalStore(
      { providedIn: 'root', protectedState: false },
      withState(() => ({ prop1: 1, prop2: 2 })),
      withComputed(({ prop1, prop2 }) => ({
        prop3: computed(() => prop1() + prop2()),
      })),
      withLogger({
        name: 'Store',
        filter: ['prop3'],
        showDiff: true,
      }),
    );
    jest.resetAllMocks();
    const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => {
      /* Empty */
    });
    const store = TestBed.inject(Store);
    TestBed.flushEffects();
    expect(consoleLog).toBeCalledWith('Store store changed: ', { prop3: 3 });
    patchState(store, { prop1: 2 });
    jest.resetAllMocks();
    TestBed.flushEffects();
    expect(consoleLog).toBeCalledWith('Store store changed: ', { prop3: 4 });
    expect(consoleLog).toBeCalledWith('Store store changes diff :');
    expect(consoleLog).toBeCalledWith(
      '%c- prop3: 3\n' + '%c+ prop3: 4',
      'color: red',
      'color: green',
    );
  });
});
