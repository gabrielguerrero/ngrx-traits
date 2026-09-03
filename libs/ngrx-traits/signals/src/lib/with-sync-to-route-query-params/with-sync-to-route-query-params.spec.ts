import {
  computed,
  createEnvironmentInjector,
  EnvironmentInjector,
} from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { patchState, signalStore, withState } from '@ngrx/signals';
import { of, Subject } from 'rxjs';

import {
  getQueryMapperForState,
  withSyncToRouteQueryParams,
} from '@ngrx-traits/signals';

describe('withSyncToRouteQueryParams', () => {
  function init({ debounce }: { debounce?: number } = {}) {
    const Store = signalStore(
      { protectedState: false },
      withState({
        test: 'test',
        foo: 'foo',
        bar: false,
      }),
      withSyncToRouteQueryParams({
        mappers: [
          {
            queryParamsToState: (query, store) => {
              patchState(store, {
                test: query.test,
                foo: query.foo,
                bar: query.bar === 'true',
              });
            },
            stateToQueryParams: (store) =>
              computed(() => ({
                test: store.test(),
                foo: store.foo(),
                bar: store.bar().toString(),
              })),
          },
        ],
        defaultDebounce: debounce,
      }),
    );
    TestBed.configureTestingModule({
      providers: [
        Store,
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useFactory: () => ({
            queryParams: of({
              test: 'test2',
              foo: 'foo2',
              bar: 'true',
            }),
          }),
        },
      ],
    });
    return { store: TestBed.inject(Store) };
  }

  it('url query params should be synced with store', () => {
    const { store } = init();
    expect(store.test()).toBe('test2');
    expect(store.foo()).toBe('foo2');
    expect(store.bar()).toBe(true);
  });

  it('store should be synced with url query params', fakeAsync(() => {
    const { store } = init();

    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');

    patchState(store, {
      test: 'test3',
      foo: 'foo3',
      bar: false,
    });
    TestBed.tick();
    tick(400);
    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: { test: 'test3', foo: 'foo3', bar: 'false' },
      queryParamsHandling: 'merge',
      // the initial push replaces the history entry instead of adding one
      replaceUrl: true,
    });
  }));

  it('should not restore state from query params on init  if restoreOnInit is false', () => {
    const Store = signalStore(
      { protectedState: false },
      withState({
        test: 'test',
        foo: 'foo',
        bar: false,
      }),
      withSyncToRouteQueryParams({
        mappers: [
          {
            queryParamsToState: (query, store) => {
              patchState(store, {
                test: query.test,
                foo: query.foo,
                bar: query.bar === 'true',
              });
            },
            stateToQueryParams: (store) =>
              computed(() => ({
                test: store.test(),
                foo: store.foo(),
                bar: store.bar().toString(),
              })),
          },
        ],
        restoreOnInit: false,
      }),
    );
    TestBed.configureTestingModule({
      providers: [
        Store,
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useFactory: () => ({
            queryParams: of({
              test: 'test2',
              foo: 'foo2',
              bar: 'true',
            }),
          }),
        },
      ],
    });
    const store = TestBed.inject(Store);
    expect(store.test()).toBe('test');
    expect(store.foo()).toBe('foo');
    expect(store.bar()).toBe(false);
    store.loadFromQueryParams();
    expect(store.test()).toBe('test2');
    expect(store.foo()).toBe('foo2');
    expect(store.bar()).toBe(true);
  });

  it('should unsubscribe from queryParams when store is destroyed', () => {
    const queryParams$ = new Subject<Record<string, string>>();
    const queryParamsToStateSpy = vi.fn(
      (query: Record<string, string>, store: any) => {
        patchState(store, {
          test: query['test'],
          foo: query['foo'],
          bar: query['bar'] === 'true',
        });
      },
    );
    const Store = signalStore(
      { protectedState: false },
      withState({
        test: 'test',
        foo: 'foo',
        bar: false,
      }),
      withSyncToRouteQueryParams({
        mappers: [
          {
            queryParamsToState: queryParamsToStateSpy,
            stateToQueryParams: (store: any) =>
              computed(() => ({
                test: store.test(),
                foo: store.foo(),
                bar: store.bar().toString(),
              })),
          },
        ],
        restoreOnInit: false,
      }),
    );
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useFactory: () => ({
            queryParams: queryParams$,
          }),
        },
      ],
    });

    // Create a child EnvironmentInjector so we can destroy it without breaking TestBed
    const parentInjector = TestBed.inject(EnvironmentInjector);
    const childInjector = createEnvironmentInjector([Store], parentInjector);
    const store = childInjector.get(Store);

    // Call loadFromQueryParams — sets up subscription on the Subject (no emission yet)
    store.loadFromQueryParams();

    // Destroy the child injector (simulates navigating away from the route)
    childInjector.destroy();

    // Emit after destruction — should NOT call the mapper or throw NG0205
    expect(() => {
      queryParams$.next({ test: 'c', foo: 'd', bar: 'false' });
    }).not.toThrow();
    expect(queryParamsToStateSpy).not.toHaveBeenCalled();
  });

  it('should not share the last pushed query params between store instances', fakeAsync(() => {
    // the store definition is created once, so both instances go through the
    // same withSyncToRouteQueryParams call, which is what used to leak
    const Store = signalStore(
      { protectedState: false },
      withState({
        test: 'test',
        foo: 'foo',
        bar: false,
      }),
      withSyncToRouteQueryParams({
        mappers: [
          {
            queryParamsToState: (query, store) => {
              patchState(store, {
                test: query.test,
                foo: query.foo,
                bar: query.bar === 'true',
              });
            },
            stateToQueryParams: (store) =>
              computed(() => ({
                test: store.test(),
                foo: store.foo(),
                bar: store.bar().toString(),
              })),
          },
        ],
      }),
    );
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useFactory: () => ({
            queryParams: of({
              test: 'test2',
              foo: 'foo2',
              bar: 'true',
            }),
          }),
        },
      ],
    });
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const parentInjector = TestBed.inject(EnvironmentInjector);

    // first instance restores from the url and then pushes back to it
    const injector1 = createEnvironmentInjector([Store], parentInjector);
    const store1 = injector1.get(Store);
    expect(store1.test()).toBe('test2');
    TestBed.tick();
    tick(400);
    expect(router.navigate).toHaveBeenCalled();

    // second instance must still restore from the url
    const injector2 = createEnvironmentInjector([Store], parentInjector);
    const store2 = injector2.get(Store);
    expect(store2.test()).toBe('test2');
    expect(store2.foo()).toBe('foo2');
    expect(store2.bar()).toBe(true);
  }));

  it('should ignore query params emitted after pushing params with undefined values', fakeAsync(() => {
    const queryParams$ = new Subject<Record<string, string | undefined>>();
    const queryParamsToStateSpy = vi.fn(
      (query: Record<string, string | undefined>, store: any) => {
        patchState(store, { test: query['test'], foo: query['foo'] });
      },
    );
    const Store = signalStore(
      { protectedState: false },
      withState({
        test: 'test' as string | undefined,
        foo: 'foo',
      }),
      withSyncToRouteQueryParams({
        mappers: [
          {
            queryParamsToState: queryParamsToStateSpy,
            stateToQueryParams: (store: any) =>
              computed(() => ({
                test: store.test(),
                foo: store.foo(),
              })),
          },
        ],
      }),
    );
    TestBed.configureTestingModule({
      providers: [
        Store,
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useFactory: () => ({ queryParams: queryParams$ }),
        },
      ],
    });
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const store = TestBed.inject(Store);

    // undefined params get dropped from the url, so they must not be stored
    // as part of the last pushed params
    patchState(store, { test: undefined });
    TestBed.tick();
    tick(400);
    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: { test: undefined, foo: 'foo' },
      queryParamsHandling: 'merge',
      // the initial push replaces the history entry instead of adding one
      replaceUrl: true,
    });

    // the url now only has foo, which is what we just pushed, so the store
    // should not be patched again
    queryParams$.next({ foo: 'foo' });
    expect(queryParamsToStateSpy).not.toHaveBeenCalled();
  }));

  it('store should be synced with url query params with custom debounce', fakeAsync(() => {
    const { store } = init({ debounce: 1000 });

    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');

    patchState(store, {
      test: 'test3',
      foo: 'foo3',
      bar: false,
    });
    TestBed.tick();
    tick(1100);
    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: { test: 'test3', foo: 'foo3', bar: 'false' },
      queryParamsHandling: 'merge',
      // the initial push replaces the history entry instead of adding one
      replaceUrl: true,
    });
  }));

  it('should not add history entries when initialising multiple sync features', fakeAsync(() => {
    // each feature pushes its own initial state, so without replacing the
    // current history entry the user would need one back navigation per
    // feature just to leave the page
    const Store = signalStore(
      { protectedState: false },
      withState({ aFilter: 'a1', bFilter: 'b1' }),
      withSyncToRouteQueryParams({
        mappers: [
          {
            queryParamsToState: () => {},
            stateToQueryParams: (store: any) =>
              computed(() => ({ 'a-filter': store.aFilter() })),
          },
        ],
      }),
      withSyncToRouteQueryParams({
        mappers: [
          {
            queryParamsToState: () => {},
            stateToQueryParams: (store: any) =>
              computed(() => ({ 'b-filter': store.bFilter() })),
          },
        ],
      }),
    );
    TestBed.configureTestingModule({
      providers: [
        Store,
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useFactory: () => ({
            queryParams: of({}),
            snapshot: { queryParams: {} },
          }),
        },
      ],
    });
    const router = TestBed.inject(Router);
    const navigateSpy = vi
      .spyOn(router, 'navigate')
      .mockResolvedValue(true) as any;
    const store = TestBed.inject(Store) as any;

    TestBed.tick();
    tick(400);
    // both features pushed, and neither added a history entry
    expect(navigateSpy).toHaveBeenCalledTimes(2);
    expect(
      navigateSpy.mock.calls.every((call: any) => call[1].replaceUrl === true),
    ).toBe(true);

    // a later user driven change must still be reachable with the back button
    navigateSpy.mockClear();
    patchState(store, { aFilter: 'a2' });
    TestBed.tick();
    tick(400);
    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy.mock.calls[0][1].replaceUrl).toBeUndefined();

    tick(1000);
  }));
});

describe('getQueryMapperForState', () => {
  const from = new Date('2026-01-02T03:04:05.000Z');
  // built from local parts, the same way the mapper reads them back
  const day = new Date(2026, 2, 4);
  const at = new Date(1970, 0, 1, 9, 30);

  function init(queryParams: Record<string, string> = {}) {
    const Store = signalStore(
      { protectedState: false },
      withState({
        search: 'initial',
        page: 0,
        active: false,
        from,
        day,
        at,
        filter: { color: 'red', size: 10 } as { color: string; size: number },
        optional: undefined as string | undefined,
      }),
      withSyncToRouteQueryParams({
        mappers: [
          getQueryMapperForState({
            search: 'string',
            page: 'number',
            active: 'boolean',
            from: 'date-time',
            day: 'date',
            at: 'time',
            filter: 'json',
            optional: 'string',
          }),
        ],
      }),
    );
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        Store,
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useFactory: () => ({
            queryParams: of(queryParams),
            snapshot: { queryParams },
          }),
        },
      ],
    });
    return { store: TestBed.inject(Store) };
  }

  it('should restore state props from query params using the declared types', () => {
    const { store } = init({
      search: 'shoes',
      page: '2',
      active: 'true',
      from: '2026-05-06T07:08:09.000Z',
      filter: JSON.stringify({ color: 'blue', size: 42 }),
    });
    expect(store.search()).toBe('shoes');
    expect(store.page()).toBe(2);
    expect(store.active()).toBe(true);
    expect(store.from()).toEqual(new Date('2026-05-06T07:08:09.000Z'));
    expect(store.filter()).toEqual({ color: 'blue', size: 42 });
  });

  it('should restore json looking values as strings when declared as string', () => {
    expect(init({ search: '123' }).store.search()).toBe('123');
    expect(init({ search: 'true' }).store.search()).toBe('true');
    expect(init({ optional: 'not json' }).store.optional()).toBe('not json');
  });

  it('should keep the store value for params missing from the url', () => {
    const { store } = init({ page: '5' });
    expect(store.page()).toBe(5);
    expect(store.search()).toBe('initial');
    expect(store.filter()).toEqual({ color: 'red', size: 10 });
  });

  it('should skip params that do not match their declared type', () => {
    const { store } = init({
      page: 'not a number',
      active: 'yes',
      from: 'not a date',
      day: '2026-13-45',
      at: '25:99',
      filter: '{ broken json',
    });
    expect(store.page()).toBe(0);
    expect(store.active()).toBe(false);
    expect(store.from()).toEqual(from);
    expect(store.day()).toEqual(day);
    expect(store.at()).toEqual(at);
    expect(store.filter()).toEqual({ color: 'red', size: 10 });
  });

  it('should restore a date param as local midnight, not shifted by the timezone', () => {
    const { store } = init({ day: '2026-08-11' });
    const restored = store.day();
    expect(restored.getFullYear()).toBe(2026);
    expect(restored.getMonth()).toBe(7);
    expect(restored.getDate()).toBe(11);
    expect(restored.getHours()).toBe(0);
  });

  it('should reject a date that does not exist', () => {
    // Date would roll 2026-02-31 over into march
    expect(init({ day: '2026-02-31' }).store.day()).toEqual(day);
    expect(init({ day: '11-08-2026' }).store.day()).toEqual(day);
  });

  it('should restore a time param onto the epoch date', () => {
    expect(init({ at: '14:45' }).store.at()).toEqual(
      new Date(1970, 0, 1, 14, 45),
    );
    expect(init({ at: '14:45:30' }).store.at()).toEqual(
      new Date(1970, 0, 1, 14, 45, 30),
    );
  });

  it('should write each date type in its own format', fakeAsync(() => {
    const { store } = init();
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    patchState(store, {
      day: new Date(2026, 7, 11, 23, 30),
      at: new Date(2026, 7, 11, 9, 5, 7),
      from: new Date('2026-05-06T07:08:09.000Z'),
    });
    TestBed.tick();
    tick(400);
    const queryParams = navigate.mock.calls[0][1]?.queryParams as any;
    // the local day, a late hour must not push it to the 12th
    expect(queryParams.day).toBe('2026-08-11');
    expect(queryParams.at).toBe('09:05:07');
    expect(queryParams.from).toBe('2026-05-06T07:08:09.000Z');
    tick(1000);
  }));

  it('should leave the seconds out of a time on the minute', fakeAsync(() => {
    const { store } = init();
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    patchState(store, { at: new Date(2026, 7, 11, 9, 5) });
    TestBed.tick();
    tick(400);
    expect((navigate.mock.calls[0][1]?.queryParams as any).at).toBe('09:05');
    tick(1000);
  }));

  it('should sync state props back to the query params', fakeAsync(() => {
    const { store } = init();
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    patchState(store, {
      search: 'boots',
      page: 3,
      active: true,
      from: new Date('2026-05-06T07:08:09.000Z'),
      filter: { color: 'green', size: 1 },
    });
    TestBed.tick();
    tick(400);

    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: {
        // only json props are stringified, the rest stay readable
        search: 'boots',
        page: '3',
        active: 'true',
        from: '2026-05-06T07:08:09.000Z',
        day: '2026-03-04',
        at: '09:30',
        filter: JSON.stringify({ color: 'green', size: 1 }),
        // undefined props are removed from the url
        optional: undefined,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
    tick(1000);
  }));

  it('should remove a param from the url when its prop is set to null', fakeAsync(() => {
    const { store } = init({ search: 'shoes' });
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    patchState(store, { search: null as any });
    TestBed.tick();
    tick(400);
    expect((navigate.mock.calls[0][1]?.queryParams as any).search).toBe(
      undefined,
    );
    tick(1000);
  }));
});

describe('getQueryMapperForState with nested props', () => {
  const day = new Date(2026, 2, 4);

  function init(queryParams: Record<string, string> = {}) {
    const Store = signalStore(
      { protectedState: false },
      withState({
        filter: {
          color: 'red',
          size: 10,
          from: day,
          nested: { deep: 'initial' },
        },
        optional: undefined as { a: string } | undefined,
      }),
      withSyncToRouteQueryParams({
        mappers: [
          getQueryMapperForState({
            filter: {
              color: 'string',
              from: 'date',
              nested: { deep: 'string' },
            },
            optional: { a: 'string' },
          }),
        ],
      }),
    );
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        Store,
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useFactory: () => ({
            queryParams: of(queryParams),
            snapshot: { queryParams },
          }),
        },
      ],
    });
    return { store: TestBed.inject(Store) };
  }

  it('should restore nested props from their dotted params', () => {
    const { store } = init({
      'filter.color': 'blue',
      'filter.from': '2026-05-06',
      'filter.nested.deep': 'restored',
    });
    expect(store.filter()).toEqual({
      color: 'blue',
      // a nested date comes back a Date, JSON.parse would give a string
      from: new Date(2026, 4, 6),
      // size is not declared, so it keeps the value the store had
      size: 10,
      nested: { deep: 'restored' },
    });
  });

  it('should keep the undeclared and missing nested fields untouched', () => {
    const { store } = init({ 'filter.color': 'blue' });
    expect(store.filter()).toEqual({
      color: 'blue',
      size: 10,
      from: day,
      nested: { deep: 'initial' },
    });
  });

  it('should skip a nested param that does not match its declared type', () => {
    const { store } = init({ 'filter.from': 'not a date' });
    expect(store.filter().from).toEqual(day);
  });

  it('should build the object when the prop holds nothing yet', () => {
    const { store } = init({ 'optional.a': 'built' });
    expect(store.optional()).toEqual({ a: 'built' });
  });

  it('should write one param per leaf, named with the path to it', fakeAsync(() => {
    const { store } = init();
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    patchState(store, {
      filter: {
        color: 'green',
        size: 42,
        from: new Date(2026, 4, 6),
        nested: { deep: 'written' },
      },
    });
    TestBed.tick();
    tick(400);

    expect(navigate.mock.calls[0][1]?.queryParams).toEqual({
      'filter.color': 'green',
      'filter.from': '2026-05-06',
      'filter.nested.deep': 'written',
      // size is not declared, so it never reaches the url
      'optional.a': undefined,
    });
    tick(1000);
  }));

  it('should remove the params of a prop that holds nothing', fakeAsync(() => {
    const { store } = init();
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    patchState(store, { filter: undefined as any });
    TestBed.tick();
    tick(400);

    const params = navigate.mock.calls[0][1]?.queryParams as any;
    expect(params['filter.color']).toBe(undefined);
    expect(params['filter.nested.deep']).toBe(undefined);
    tick(1000);
  }));
});

describe('getQueryMapperForState prop checking', () => {
  // these only have to compile, the @ts-expect-error comments are the
  // assertions, tsc fails the build when one of them stops erroring
  it('should reject props and types that do not fit the state', () => {
    signalStore(
      withState({ search: '', page: 0, filter: { color: 'red', size: 1 } }),
      withSyncToRouteQueryParams({
        mappers: [
          getQueryMapperForState({
            search: 'string',
            // @ts-expect-error not a prop of the state
            pge: 'number',
          }),
          getQueryMapperForState({
            // @ts-expect-error page holds a number, not a string
            page: 'string',
          }),
          getQueryMapperForState({
            // @ts-expect-error color is not a field of filter
            filter: { colour: 'string' },
          }),
          getQueryMapperForState({
            // @ts-expect-error size holds a number, not a boolean
            filter: { size: 'boolean' },
          }),
          // the ones that do fit still compile
          getQueryMapperForState({ filter: 'json' }),
          getQueryMapperForState({ filter: { color: 'string' } }),
        ],
      }),
    );
    expect(true).toBe(true);
  });
});

describe('getQueryMapperForState with array props', () => {
  function init(queryParams: Record<string, string> = {}) {
    const Store = signalStore(
      { protectedState: false },
      withState({
        tags: ['a', 'b'] as string[],
        ids: [1, 2] as number[],
        mixed: [{ a: 1 }] as { a: number }[],
        filter: { sizes: [10] as number[] },
      }),
      withSyncToRouteQueryParams({
        mappers: [
          getQueryMapperForState({
            tags: 'string-array',
            ids: 'number-array',
            mixed: 'json',
            filter: { sizes: 'number-array' },
          }),
        ],
      }),
    );
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        Store,
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useFactory: () => ({
            queryParams: of(queryParams),
            snapshot: { queryParams },
          }),
        },
      ],
    });
    return { store: TestBed.inject(Store) };
  }

  it('should restore arrays from a comma separated param', () => {
    const { store } = init({
      tags: 'shoes,boots,hats',
      ids: '3,4,5',
      'filter.sizes': '10,20',
    });
    expect(store.tags()).toEqual(['shoes', 'boots', 'hats']);
    expect(store.ids()).toEqual([3, 4, 5]);
    expect(store.filter()).toEqual({ sizes: [10, 20] });
  });

  it('should restore a single value as an array of one', () => {
    const { store } = init({ tags: 'shoes', ids: '3' });
    expect(store.tags()).toEqual(['shoes']);
    expect(store.ids()).toEqual([3]);
  });

  it('should restore an empty param as an empty array', () => {
    const { store } = init({ tags: '', ids: '' });
    expect(store.tags()).toEqual([]);
    expect(store.ids()).toEqual([]);
  });

  it('should skip a number array with an element that is not a number', () => {
    expect(init({ ids: '1,x,3' }).store.ids()).toEqual([1, 2]);
    // an empty element would read as 0
    expect(init({ ids: '1,,3' }).store.ids()).toEqual([1, 2]);
    expect(init({ ids: '1,2,' }).store.ids()).toEqual([1, 2]);
  });

  it('should write arrays as a comma separated list', fakeAsync(() => {
    const { store } = init();
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    patchState(store, {
      tags: ['shoes', 'boots'],
      ids: [3, 4],
      mixed: [{ a: 2 }],
      filter: { sizes: [] },
    });
    TestBed.tick();
    tick(400);

    expect(navigate.mock.calls[0][1]?.queryParams).toEqual({
      tags: 'shoes,boots',
      ids: '3,4',
      // an array of anything else still goes through JSON.stringify
      mixed: JSON.stringify([{ a: 2 }]),
      // an empty array keeps the param, so it does not read back as missing
      'filter.sizes': '',
    });
    tick(1000);
  }));

  it('should skip a repeated param instead of failing the whole restore', () => {
    // the router hands a repeated param over as an array, which used to throw
    // inside the mapper and take every mapper after it down with it
    const { store } = init({
      tags: ['shoes', 'boots'] as unknown as string,
      ids: '3,4',
    });
    // the prop keeps the value it started with, nothing is guessed from it
    expect(store.tags()).toEqual(['a', 'b']);
    // and the params after the repeated one are still restored
    expect(store.ids()).toEqual([3, 4]);
  });

  it('should warn when a string array value carries the separator', fakeAsync(() => {
    const { store } = init();
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    patchState(store, { tags: ['shoes,boots'] });
    TestBed.tick();
    tick(400);

    expect(warn).toHaveBeenCalledWith(expect.stringContaining("'tags'"));
    // the value is still written, it just does not survive the round trip
    expect((navigate.mock.calls[0][1]?.queryParams as any).tags).toBe(
      'shoes,boots',
    );
    warn.mockRestore();
    tick(1000);
  }));

  it('should not warn for a number array or for values without a comma', fakeAsync(() => {
    const { store } = init();
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    patchState(store, { tags: ['shoes', 'boots'], ids: [1, 2] });
    TestBed.tick();
    tick(400);

    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
    tick(1000);
  }));

  it('should reject an array type that does not fit the array', () => {
    signalStore(
      withState({ tags: ['a'] as string[], ids: [1] as number[] }),
      withSyncToRouteQueryParams({
        mappers: [
          getQueryMapperForState({
            // @ts-expect-error tags holds strings, not numbers
            tags: 'number-array',
          }),
          getQueryMapperForState({
            // @ts-expect-error ids holds numbers, not strings
            ids: 'string-array',
          }),
          getQueryMapperForState({
            // @ts-expect-error an array cannot be described field by field
            tags: { 0: 'string' },
          }),
          // json is still allowed for both
          getQueryMapperForState({ tags: 'json', ids: 'json' }),
        ],
      }),
    );
    expect(true).toBe(true);
  });
});
