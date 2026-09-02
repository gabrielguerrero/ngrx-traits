import { toFilterStateFn } from './util';

describe('toFilterStateFn', () => {
  const state = { a: 1, b: 2, c: 3 };

  it('should return undefined when no filterState is provided', () => {
    expect(toFilterStateFn(undefined)).toBeUndefined();
  });

  it('should return the function as is when filterState is a function', () => {
    const fn = (s: typeof state) => ({ a: s.a });
    expect(toFilterStateFn<typeof state>(fn)).toBe(fn);
  });

  it('should pick only the listed props when filterState is an array', () => {
    const filter = toFilterStateFn<typeof state>(['a', 'c'])!;
    expect(filter(state)).toEqual({ a: 1, c: 3 });
    // keeps the order of the array so the stored value is stable
    expect(Object.keys(filter(state))).toEqual(['a', 'c']);
  });

  it('should ignore an empty array and warn in dev mode', () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {
      /* Empty */
    });
    expect(toFilterStateFn<typeof state>([])).toBeUndefined();
    expect(consoleWarn).toHaveBeenCalled();
    consoleWarn.mockRestore();
  });
});
