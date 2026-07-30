import {
  computed,
  createEnvironmentInjector,
  EnvironmentInjector,
} from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { withSyncToRouteQueryParams } from '@ngrx-traits/signals';
import { patchState, signalStore, withState } from '@ngrx/signals';
import { of, Subject } from 'rxjs';

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
