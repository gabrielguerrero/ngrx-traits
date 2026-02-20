import { Signal, signal } from '@angular/core';
import { TestScheduler } from 'rxjs/testing';

import { debounceFilterPipe, toFilterOptions } from './with-entities-filter.util';

describe('toFilterOptions', () => {
  it('should wrap raw Filter when no filter key exists', () => {
    const defaultFilter = { search: '' };
    const result = toFilterOptions({ search: 'hello' }, defaultFilter);
    expect(result).toEqual({ filter: { search: 'hello' } });
  });

  it('should pass through FilterOptions with filter key', () => {
    const defaultFilter = { search: '' };
    const result = toFilterOptions(
      { filter: { search: 'hello' } },
      defaultFilter,
    );
    expect(result).toEqual({ filter: { search: 'hello' } });
  });

  it('should pass through FilterOptions with debounce', () => {
    const defaultFilter = { search: '' };
    const result = toFilterOptions(
      { filter: { search: 'hello' }, debounce: 300 },
      defaultFilter,
    );
    expect(result).toEqual({ filter: { search: 'hello' }, debounce: 300 });
  });

  it('should pass through FilterOptions with patch', () => {
    const defaultFilter = { search: '', name: '' };
    const result = toFilterOptions(
      { filter: { search: 'hello' }, patch: true },
      defaultFilter,
    );
    expect(result).toEqual({ filter: { search: 'hello' }, patch: true });
  });

  it('should pass through FilterOptions with empty filter in patch mode', () => {
    const defaultFilter = { search: '', name: '' };
    const result = toFilterOptions(
      { filter: {}, patch: true },
      defaultFilter,
    );
    expect(result).toEqual({ filter: {}, patch: true });
  });

  it('should pass through FilterOptions with forceLoad', () => {
    const defaultFilter = { search: '' };
    const result = toFilterOptions(
      { filter: { search: 'hello' }, forceLoad: true },
      defaultFilter,
    );
    expect(result).toEqual({ filter: { search: 'hello' }, forceLoad: true });
  });

  it('should pass through FilterOptions with skipLoadingCall', () => {
    const defaultFilter = { search: '' };
    const result = toFilterOptions(
      { filter: { search: 'hello' }, skipLoadingCall: true },
      defaultFilter,
    );
    expect(result).toEqual({
      filter: { search: 'hello' },
      skipLoadingCall: true,
    });
  });

  it('should wrap raw Filter when filter key has null value', () => {
    const defaultFilter = { filter: '' };
    const result = toFilterOptions({ filter: null } as any, defaultFilter);
    expect(result).toEqual({ filter: { filter: null } });
  });

  it('should wrap raw Filter when filter key has undefined value', () => {
    const defaultFilter = { filter: '' };
    const result = toFilterOptions(
      { filter: undefined } as any,
      defaultFilter,
    );
    expect(result).toEqual({ filter: { filter: undefined } });
  });

  it('should wrap raw Filter when Filter = {filter: string} and value is primitive', () => {
    const defaultFilter = { filter: '' };
    const result = toFilterOptions({ filter: 'hello' } as any, defaultFilter);
    expect(result).toEqual({ filter: { filter: 'hello' } });
  });

  it('should wrap raw Filter when Filter = {filter: number} and value is primitive', () => {
    const defaultFilter = { filter: 0 };
    const result = toFilterOptions({ filter: 42 } as any, defaultFilter);
    expect(result).toEqual({ filter: { filter: 42 } });
  });

  it('should wrap raw Filter when Filter = {filter: {name: string}} and value keys dont match defaultFilter', () => {
    const defaultFilter = { filter: { name: '' } };
    const result = toFilterOptions(
      { filter: { name: 'hello' } },
      defaultFilter,
    );
    expect(result).toEqual({ filter: { filter: { name: 'hello' } } });
  });

  it('should pass through FilterOptions when Filter = {filter: {name: string}} and value keys match defaultFilter', () => {
    const defaultFilter = { filter: { name: '' } };
    const result = toFilterOptions(
      { filter: { filter: { name: 'hello' } } },
      defaultFilter,
    );
    expect(result).toEqual({ filter: { filter: { name: 'hello' } } });
  });

  it('should wrap raw Filter with multiple keys', () => {
    const defaultFilter = { search: '', category: '' };
    const result = toFilterOptions(
      { search: 'text', category: 'books' },
      defaultFilter,
    );
    expect(result).toEqual({
      filter: { search: 'text', category: 'books' },
    });
  });
});

describe('debounceFilterPipe', () => {
  let testScheduler: TestScheduler;
  let mockSignal: Signal<any>;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  it('should debounce emissions by the default debounce time', () => {
    testScheduler.run(({ hot, expectObservable }) => {
      mockSignal = signal({ filter: { search: 'initial' } });

      const source$ = hot('-a-b-c---|', {
        a: { filter: { search: 'a' } },
        b: { filter: { search: 'b' } },
        c: { filter: { search: 'c' } },
      });

      const result$ = source$.pipe(debounceFilterPipe(mockSignal, 2));

      expectObservable(result$).toBe('-------c-|', {
        c: { filter: { search: 'c' } },
      });
    });
  });

  it('should emit immediately and bypass distinctUntilChanged when forceLoad is true', () => {
    testScheduler.run(({ hot, expectObservable }) => {
      mockSignal = signal({ filter: { search: 'initial' } });

      const source$ = hot('-a-b-c|', {
        a: { filter: { search: 'a' } },
        b: { filter: { search: 'b' }, forceLoad: true }, // This should emit immediately
        c: { filter: { search: 'c' } },
      });

      const result$ = source$.pipe(debounceFilterPipe(mockSignal, 100));

      // 'a' is debounced. 'b' emits immediately. 'c' is debounced.
      expectObservable(result$).toBe('---b--(c|)', {
        b: { filter: { search: 'b' }, forceLoad: true },
        c: { filter: { search: 'c' } },
      });
    });
  });

  it('should patch the filter with the signal value when patch is true', () => {
    testScheduler.run(({ hot, expectObservable }) => {
      const mockSignal = signal({
        search: 'initial',
        newProp: '',
      });

      const source$ = hot('-a-b|', {
        a: { filter: { search: 'query1', newProp: '' } },
        b: { filter: { newProp: 'value' }, patch: true } as any,
      });

      const result$ = source$.pipe(debounceFilterPipe(mockSignal, 10));

      expectObservable(result$).toBe('----(b|)', {
        b: {
          filter: { search: 'initial', newProp: 'value' },
          patch: true,
        },
      });
    });
  });

  it('should patch the filter with the signal value when patch is true', () => {
    testScheduler.run(({ hot, expectObservable }) => {
      // Simulate the signal changing over time
      mockSignal = signal({ search: 'initial' });

      const source$ = hot('-a-b|', {
        a: { filter: { search: 'query1' } }, // Not patched
        b: { filter: { newProp: 'value' }, patch: true }, // Should patch
      });

      const result$ = source$.pipe(debounceFilterPipe(mockSignal, 10)); // Short debounce for quick test

      // After 'b' emits, the signal's current value ({ search: 'initial' })
      // should be merged with { newProp: 'value' }
      expectObservable(result$).toBe('----(b|)', {
        b: {
          filter: { search: 'initial', newProp: 'value' },
          patch: true,
        },
      });
    });
  });

  it('should not emit if the filter is identical and forceLoad is false', () => {
    testScheduler.run(({ hot, expectObservable }) => {
      mockSignal = signal({ search: 'initial' });

      const source$ = hot('-a---b----------c---d|', {
        a: { filter: { search: 'test' } },
        b: { filter: { search: 'test' } }, // Identical to 'a', should be distinct
        c: { filter: { search: 'another' } }, // Different, should emit
        d: { filter: { search: 'another' } }, // Identical to 'c', should be distinct
      });

      const result$ = source$.pipe(debounceFilterPipe(mockSignal, 10));

      expectObservable(result$).toBe('---------------a-----(c|)', {
        a: { filter: { search: 'test' } },
        c: { filter: { search: 'another' } },
      });
    });
  });

  it('should emit even if filter is identical when forceLoad is true', () => {
    testScheduler.run(({ hot, expectObservable }) => {
      mockSignal = signal({ search: 'initial' });

      const source$ = hot('-a-b|', {
        a: { filter: { search: 'test' } },
        b: { filter: { search: 'test' }, forceLoad: true },
      });

      const result$ = source$.pipe(debounceFilterPipe(mockSignal, 1));

      expectObservable(result$).toBe('--ab|', {
        a: { filter: { search: 'test' } },
        b: { filter: { search: 'test' }, forceLoad: true },
      });
    });
  });

  it('should use the custom debounce time provided in the payload', () => {
    testScheduler.run(({ hot, expectObservable }) => {
      mockSignal = signal({ search: 'initial' });
      const source$ = hot('-a-b------c|', {
        a: { filter: { id: 1 } },
        b: { filter: { id: 2 }, debounce: 5 },
        c: { filter: { id: 3 } },
      });

      const result$ = source$.pipe(debounceFilterPipe(mockSignal, 2));

      expectObservable(result$).toBe('--------b--(c|)', {
        b: { filter: { id: 2 }, debounce: 5 },
        c: { filter: { id: 3 } },
      });
    });
  });

  it('should only emit the last value after a series of rapid emissions', () => {
    testScheduler.run(({ hot, expectObservable }) => {
      mockSignal = signal({ search: 'initial' });

      const source$ = hot('abcde----|', {
        a: { filter: { val: 1 } },
        b: { filter: { val: 2 } },
        c: { filter: { val: 3 } },
        d: { filter: { val: 4 } },
        e: { filter: { val: 5 } },
      });

      const result$ = source$.pipe(debounceFilterPipe(mockSignal, 2));

      expectObservable(result$).toBe('------e--|', {
        e: { filter: { val: 5 } },
      });
    });
  });

  it('should emit immediately when debounce is 0', () => {
    testScheduler.run(({ hot, expectObservable }) => {
      mockSignal = signal({ filter: { search: 'initial' } });

      const source$ = hot('-a|', {
        a: { filter: { search: 'instant' }, debounce: 0 },
      });

      const result$ = source$.pipe(debounceFilterPipe(mockSignal, 100));

      expectObservable(result$).toBe('-a|', {
        a: { filter: { search: 'instant' }, debounce: 0 },
      });
    });
  });

  it('should emit all values when debounce is 0 and multiple values are synchronous', () => {
    testScheduler.run(({ hot, expectObservable }) => {
      mockSignal = signal({ filter: { search: 'initial' } });

      // 'a' and 'b' are emitted synchronously (at 0ms relative to hot observable start)
      const source$ = hot('(ab)|', {
        a: { filter: { id: 1 }, debounce: 0 },
        b: { filter: { id: 2 }, debounce: 0 },
      });

      const result$ = source$.pipe(debounceFilterPipe(mockSignal, 100));

      // Expected: Both 'a' and 'b' should be emitted immediately after their synchronous emissions.
      expectObservable(result$).toBe('(ab)|', {
        a: { filter: { id: 1 }, debounce: 0 },
        b: { filter: { id: 2 }, debounce: 0 },
      });
    });
  });

  describe('with callStatus signal', () => {
    it('should allow second value to pass through when skipLoadingCall is true', () => {
      testScheduler.run(({ hot, expectObservable }) => {
        mockSignal = signal({ search: 'initial' });

        const source$ = hot('-a------b--d|', {
          a: { filter: { search: 'test' }, skipLoadingCall: true },
          b: { filter: { search: 'test' } }, // same filter should pass because skipLoading skips distinctUntilChange
          c: { filter: { search: 'test' } }, // skip because identical to 'b'
          d: { filter: { search: 'test2' } }, // should pass because is different from  'c'
        });

        const result$ = source$.pipe(debounceFilterPipe(mockSignal, 1));

        // When callStatus is 'init', first value passes through
        // Second value also passes since it's different
        expectObservable(result$).toBe('--a------b--(d|)', {
          a: { filter: { search: 'test' }, skipLoadingCall: true },
          b: { filter: { search: 'test' } },
          d: { filter: { search: 'test2' } },
        });
      });
    });

    it('should work normally when skipLoading is false', () => {
      testScheduler.run(({ hot, expectObservable }) => {
        mockSignal = signal({ search: 'initial' });

        const source$ = hot('-a---b----------c---d|', {
          a: { filter: { search: 'test' } },
          b: { filter: { search: 'test' } }, // Identical to 'a', should be distinct
          c: { filter: { search: 'another' } }, // Different, should emit
          d: { filter: { search: 'another' } }, // Identical to 'c', should be distinct
        });

        const result$ = source$.pipe(debounceFilterPipe(mockSignal, 10));

        expectObservable(result$).toBe('---------------a-----(c|)', {
          a: { filter: { search: 'test' } },
          c: { filter: { search: 'another' } },
        });
      });
    });
  });
});
