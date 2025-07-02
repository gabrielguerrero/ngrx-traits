import { computed } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { withSyncToRouteQueryParams } from '@ngrx-traits/signals';
import { patchState, signalStore, withState } from '@ngrx/signals';
import { of } from 'rxjs';

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
    jest.spyOn(router, 'navigate');

    patchState(store, {
      test: 'test3',
      foo: 'foo3',
      bar: false,
    });
    TestBed.flushEffects();
    tick(400);
    expect(router.navigate).toBeCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: { test: 'test3', foo: 'foo3', bar: 'false' },
      queryParamsHandling: 'merge',
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

  it('store should be synced with url query params with custom debounce', fakeAsync(() => {
    const { store } = init({ debounce: 1000 });

    const router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate');

    patchState(store, {
      test: 'test3',
      foo: 'foo3',
      bar: false,
    });
    TestBed.flushEffects();
    tick(1100);
    expect(router.navigate).toBeCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: { test: 'test3', foo: 'foo3', bar: 'false' },
      queryParamsHandling: 'merge',
    });
  }));
});
