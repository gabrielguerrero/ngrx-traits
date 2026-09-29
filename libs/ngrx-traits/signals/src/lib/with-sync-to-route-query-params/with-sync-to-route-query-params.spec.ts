import { ViewportScroller } from '@angular/common';
import {
  ApplicationRef,
  Component,
  computed,
  createEnvironmentInjector,
  EnvironmentInjector,
  inject,
} from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  withInMemoryScrolling,
} from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { patchState, signalStore, withState } from '@ngrx/signals';
import { map, of, Subject, timer } from 'rxjs';
import { MockInstance } from 'vitest';

import {
  getQueryMapperForState,
  parseQueryId,
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
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    patchState(store, {
      test: 'test3',
      foo: 'foo3',
      bar: false,
    });
    TestBed.tick();
    tick(400);
    expect(router.navigate).toHaveBeenCalledWith([], {
      queryParams: { test: 'test3', foo: 'foo3', bar: 'false' },
      queryParamsHandling: 'merge',
      preserveFragment: true,
      scroll: 'manual',
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

  it('store should be synced with url query params with custom debounce', fakeAsync(() => {
    const { store } = init({ debounce: 1000 });

    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    patchState(store, {
      test: 'test3',
      foo: 'foo3',
      bar: false,
    });
    TestBed.tick();
    tick(1100);
    expect(router.navigate).toHaveBeenCalledWith([], {
      queryParams: { test: 'test3', foo: 'foo3', bar: 'false' },
      queryParamsHandling: 'merge',
      preserveFragment: true,
      scroll: 'manual',
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

describe('withSyncToRouteQueryParams with several stores on the same page', () => {
  @Component({ template: '' })
  class PageComponent {}

  type FormStoreOptions = {
    debounce?: number;
    // leaves the param out of the url while the value is the default one
    omitDefault?: boolean;
  };

  function createFormStore(
    param: string,
    { debounce, omitDefault }: FormStoreOptions = {},
  ) {
    return signalStore(
      { protectedState: false },
      withState({ value: 'v0' }),
      withSyncToRouteQueryParams({
        mappers: [
          {
            queryParamsToState: (query, store) => {
              if (query[param] !== undefined) {
                patchState(store, { value: query[param] });
              }
            },
            stateToQueryParams: (store) =>
              computed(() =>
                omitDefault && store.value() === 'v0'
                  ? {}
                  : { [param]: store.value() },
              ),
          },
        ],
        defaultDebounce: debounce,
      }),
    );
  }

  // the router navigates with native promises, which fakeAsync cannot flush,
  // so these tests use vitest fake timers and await each advance
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  async function advance(ms: number) {
    TestBed.tick();
    await vi.advanceTimersByTimeAsync(ms);
  }

  async function init({
    form1Options,
    form2Options,
    initialUrl = '/',
    settle = true,
  }: {
    form1Options?: FormStoreOptions;
    form2Options?: FormStoreOptions;
    initialUrl?: string;
    // wait for the initial pushes of both stores to complete
    settle?: boolean;
  } = {}) {
    const Form1Store = createFormStore('form1', form1Options);
    const Form2Store = createFormStore('form2', form2Options);
    TestBed.configureTestingModule({
      providers: [
        Form1Store,
        Form2Store,
        provideRouter([
          {
            path: '',
            component: PageComponent,
            // a slow resolver keeps each navigation in flight for a while, so
            // a push from one store can start while the other's is running
            runGuardsAndResolvers: 'always',
            resolve: { slow: () => timer(50).pipe(map(() => true)) },
            canActivate: [
              (route: ActivatedRouteSnapshot) => {
                const router = inject(Router);
                // corrects an invalid value in place
                if (route.queryParams['form1'] === 'bad') {
                  return router.createUrlTree(['/'], {
                    queryParams: { ...route.queryParams, form1: 'fixed' },
                  });
                }
                // sends the user to another page, after a while so pushes
                // can land meanwhile
                if (route.queryParams['form1'] === 'logout') {
                  return timer(100).pipe(
                    map(() => router.createUrlTree(['/other'])),
                  );
                }
                // rejects the value by sending the user back to the url they
                // are on, after a while so a loop of pushes would show up as
                // many navigations instead of hanging the test
                if (route.queryParams['form1'] === 'rejected') {
                  const current = router.parseUrl(router.url);
                  return timer(10).pipe(map(() => current));
                }
                return true;
              },
            ],
          },
          { path: 'other', component: PageComponent },
          {
            path: 'slow',
            component: PageComponent,
            resolve: { slow: () => timer(200).pipe(map(() => true)) },
          },
          {
            path: 'guarded',
            component: PageComponent,
            canActivate: [() => false],
          },
        ]),
      ],
    });
    const router = TestBed.inject(Router);
    const navigated = router.navigateByUrl(initialUrl);
    await vi.advanceTimersByTimeAsync(100);
    expect(await navigated).toBe(true);
    const form1 = TestBed.inject(Form1Store);
    const form2 = TestBed.inject(Form2Store);
    if (settle) await advance(1000);
    return { router, form1, form2 };
  }

  it('should keep both stores changes when they push at the same time', async () => {
    const { router, form1, form2 } = await init();

    patchState(form1, { value: 'v1' });
    patchState(form2, { value: 'v1' });
    await advance(1000);

    expect(router.parseUrl(router.url).queryParams).toEqual({
      form1: 'v1',
      form2: 'v1',
    });
    expect(form1.value()).toBe('v1');
    expect(form2.value()).toBe('v1');
  });

  it('should not reset a pending change when another store pushes first', async () => {
    const { router, form1, form2 } = await init({
      form1Options: { debounce: 300 },
      form2Options: { debounce: 50 },
    });

    patchState(form1, { value: 'v1' });
    patchState(form2, { value: 'v1' });
    // form2 pushes and its navigation completes while form1 is still debouncing
    await advance(150);
    expect(form1.value()).toBe('v1');

    await advance(1000);
    expect(router.parseUrl(router.url).queryParams).toEqual({
      form1: 'v1',
      form2: 'v1',
    });
    expect(form1.value()).toBe('v1');
    expect(form2.value()).toBe('v1');
  });

  it('should drop a push cancelled by another navigation', async () => {
    const { router, form1, form2 } = await init();

    patchState(form1, { value: 'v1' });
    // form1 push starts and waits on the slow resolver
    await advance(310);
    // the user navigates away before it completes, cancelling it
    const navigated = router.navigateByUrl('/other');
    await advance(0);
    expect(await navigated).toBe(true);

    // a later push must not bring back the cancelled form1 param
    patchState(form2, { value: 'v1' });
    await advance(1000);
    expect(router.parseUrl(router.url).queryParams).toEqual({ form2: 'v1' });
  });

  it('should restore a param the store left out of its last push', async () => {
    const { router, form1 } = await init({
      form1Options: { omitDefault: true },
    });
    expect(router.parseUrl(router.url).queryParams).toEqual({ form2: 'v0' });

    const navigated = router.navigateByUrl('/?form1=foo&form2=v0');
    await advance(100);
    expect(await navigated).toBe(true);
    expect(form1.value()).toBe('foo');
  });

  it('should keep the url fragment', async () => {
    const { router, form1 } = await init({ initialUrl: '/#frag' });

    patchState(form1, { value: 'v1' });
    await advance(1000);

    expect(router.url).toBe('/?form1=v1&form2=v0#frag');
  });

  // navigates to the url with router scrolling enabled, runs the test, then
  // removes the bootstrapped root
  async function withScrolling(
    initialUrl: string,
    test: (setup: {
      router: Router;
      form: InstanceType<ReturnType<typeof createFormStore>>;
      scrollToAnchor: MockInstance<ViewportScroller['scrollToAnchor']>;
      scrollToPosition: MockInstance<ViewportScroller['scrollToPosition']>;
    }) => Promise<void>,
  ) {
    const FormStore = createFormStore('form1');
    @Component({ selector: 'scroll-root', template: '' })
    class RootComponent {}
    TestBed.configureTestingModule({
      providers: [
        FormStore,
        provideRouter(
          [{ path: '', component: PageComponent }],
          withInMemoryScrolling({
            anchorScrolling: 'enabled',
            scrollPositionRestoration: 'enabled',
          }),
        ),
      ],
    });
    const viewportScroller = TestBed.inject(ViewportScroller);
    const scrollToAnchor = vi
      .spyOn(viewportScroller, 'scrollToAnchor')
      .mockImplementation(() => undefined);
    const scrollToPosition = vi
      .spyOn(viewportScroller, 'scrollToPosition')
      .mockImplementation(() => undefined);
    // the router starts scrolling when the app bootstraps
    const rootElement = document.createElement('scroll-root');
    document.body.appendChild(rootElement);
    try {
      TestBed.inject(ApplicationRef).bootstrap(RootComponent);
      const router = TestBed.inject(Router);
      const navigated = router.navigateByUrl(initialUrl);
      await advance(100);
      expect(await navigated).toBe(true);
      const form = TestBed.inject(FormStore);
      await test({ router, form, scrollToAnchor, scrollToPosition });
    } finally {
      rootElement.remove();
    }
  }

  it('should not scroll the page when it pushes', async () => {
    await withScrolling(
      '/#frag',
      async ({ router, form, scrollToAnchor, scrollToPosition }) => {
        // a navigation from elsewhere does scroll
        expect(scrollToAnchor).toHaveBeenCalledWith('frag');
        scrollToAnchor.mockClear();
        scrollToPosition.mockClear();

        await advance(1000);
        patchState(form, { value: 'v1' });
        await advance(1000);

        expect(router.url).toBe('/?form1=v1#frag');
        expect(scrollToAnchor).not.toHaveBeenCalled();
        expect(scrollToPosition).not.toHaveBeenCalled();
      },
    );
  });

  it('should not scroll the page to the top when it pushes', async () => {
    await withScrolling(
      '/',
      async ({ router, form, scrollToAnchor, scrollToPosition }) => {
        // a navigation from elsewhere does scroll
        expect(scrollToPosition).toHaveBeenCalledWith([0, 0]);
        scrollToAnchor.mockClear();
        scrollToPosition.mockClear();

        await advance(1000);
        patchState(form, { value: 'v1' });
        await advance(1000);

        expect(router.url).toBe('/?form1=v1');
        expect(scrollToAnchor).not.toHaveBeenCalled();
        expect(scrollToPosition).not.toHaveBeenCalled();
      },
    );
  });

  it('should keep child routes, matrix params and auxiliary outlets', async () => {
    const FormStore = createFormStore('x');
    TestBed.configureTestingModule({
      providers: [
        FormStore,
        provideRouter([
          {
            path: 'p',
            loadChildren: () => [{ path: 'c', component: PageComponent }],
          },
          { path: 'aux', component: PageComponent, outlet: 'side' },
        ]),
      ],
    });
    const router = TestBed.inject(Router);
    const navigated = router.navigateByUrl('/p;m=1/c;n=2(side:aux)?y=1#frag');
    await advance(0);
    expect(await navigated).toBe(true);
    const form = TestBed.inject(FormStore);
    await advance(1000);

    patchState(form, { value: 'v1' });
    await advance(1000);

    expect(router.url).toBe('/p;m=1/c;n=2(side:aux)?y=1&x=v1#frag');
  });

  it('should keep a pending change when a destroyed store params stay in the url', async () => {
    const { router, form1, form2 } = await init({
      form2Options: { debounce: 50 },
    });
    // a store on part of the page, like a tab, pushes its params and is
    // destroyed while the page stays
    const Form3Store = createFormStore('form3');
    const form3Injector = createEnvironmentInjector(
      [Form3Store],
      TestBed.inject(EnvironmentInjector),
    );
    form3Injector.get(Form3Store);
    await advance(1000);
    form3Injector.destroy();

    patchState(form1, { value: 'user' });
    patchState(form2, { value: 'v1' });
    // form2 pushes and its navigation completes while form1 is still debouncing
    await advance(150);
    expect(form1.value()).toBe('user');

    await advance(1000);
    expect(router.parseUrl(router.url).queryParams).toEqual({
      form1: 'user',
      form2: 'v1',
      form3: 'v0',
    });
  });

  it('should keep a change made after a url change before the store first push', async () => {
    const { router, form1, form2 } = await init({
      initialUrl: '/?form1=u',
      form2Options: { debounce: 20 },
      settle: false,
    });
    await advance(100);
    const navigated = router.navigateByUrl('/?form1=w&form2=v0');
    await advance(100);
    expect(await navigated).toBe(true);

    patchState(form1, { value: 'user' });
    patchState(form2, { value: 'v1' });
    // form2 push completes while form1 is still debouncing its first push
    await advance(100);
    expect(form1.value()).toBe('user');
  });

  it('should keep a change made before the store first push', async () => {
    const { router, form1, form2 } = await init({
      initialUrl: '/?form1=u',
      form2Options: { debounce: 20 },
      settle: false,
    });
    expect(form1.value()).toBe('u');

    patchState(form1, { value: 'user' });
    // form2 initial push completes while form1 is still debouncing its first
    await advance(100);
    expect(form1.value()).toBe('user');

    await advance(1000);
    expect(router.parseUrl(router.url).queryParams).toEqual({
      form1: 'user',
      form2: 'v0',
    });
    expect(form2.value()).toBe('v0');
  });

  it('should only replace the history entry when every merged push asked to', async () => {
    const { router, form1, form2 } = await init({
      form1Options: { debounce: 10 },
      form2Options: { debounce: 0 },
    });
    const navigateSpy = vi.spyOn(router, 'navigate');

    // form2 navigates first, while it runs a user change on form1 and the
    // initial push of a store created meanwhile wait for their turn
    patchState(form2, { value: 'v1' });
    patchState(form1, { value: 'v1' });
    const Form3Store = createFormStore('form3', { debounce: 10 });
    TestBed.runInInjectionContext(() => new Form3Store());
    await advance(1000);

    expect(router.parseUrl(router.url).queryParams).toEqual({
      form1: 'v1',
      form2: 'v1',
      form3: 'v0',
    });
    expect(navigateSpy).toHaveBeenCalledTimes(2);
    const mergedExtras = navigateSpy.mock.calls[1][1];
    expect(mergedExtras?.queryParams).toEqual({ form1: 'v1', form3: 'v0' });
    // the user change keeps its own history entry
    expect(mergedExtras?.replaceUrl).toBeUndefined();
  });

  it('should keep every push when pushes land while navigations run', async () => {
    const { router, form1, form2 } = await init({
      form1Options: { debounce: 300 },
      form2Options: { debounce: 310 },
    });
    const Form3Store = createFormStore('form3', { debounce: 320 });
    const form3 = TestBed.runInInjectionContext(() => new Form3Store());
    await advance(1000);

    patchState(form1, { value: 'v1' });
    patchState(form2, { value: 'v1' });
    patchState(form3, { value: 'v1' });
    await advance(1000);

    expect(router.parseUrl(router.url).queryParams).toEqual({
      form1: 'v1',
      form2: 'v1',
      form3: 'v1',
    });
  });

  it('should not restore the store from its own push', async () => {
    const { router, form1 } = await init();
    const restoreSpy = vi.fn();
    const Store = signalStore(
      { protectedState: false },
      withState({ test: 'test' as string | undefined, foo: 'foo' }),
      withSyncToRouteQueryParams({
        mappers: [
          {
            queryParamsToState: restoreSpy,
            stateToQueryParams: (store) =>
              computed(() => ({ test: store.test(), foo: store.foo() })),
          },
        ],
      }),
    );
    const store = TestBed.runInInjectionContext(() => new Store());
    await advance(1000);
    restoreSpy.mockClear();

    patchState(store, { test: undefined, foo: 'foo2' });
    patchState(form1, { value: 'v1' });
    await advance(1000);

    expect(router.parseUrl(router.url).queryParams).toEqual({
      form1: 'v1',
      form2: 'v0',
      foo: 'foo2',
    });
    // neither its own push nor the one of another store is restored
    expect(restoreSpy).not.toHaveBeenCalled();
  });

  it('should restore a store created while a push navigates', async () => {
    const { router, form1 } = await init({ initialUrl: '/?form3=foo' });

    patchState(form1, { value: 'v1' });
    // form1 push starts and waits on the slow resolver
    await advance(310);
    const Form3Store = createFormStore('form3');
    const form3 = TestBed.runInInjectionContext(() => new Form3Store());
    expect(form3.value()).toBe('foo');

    await advance(1000);
    expect(router.parseUrl(router.url).queryParams).toEqual({
      form1: 'v1',
      form2: 'v0',
      form3: 'foo',
    });
  });

  it('should not navigate when the url already holds the pushed values', async () => {
    const { router } = await init({
      initialUrl: '/?page=5&active=true&ids=1&ids=2',
    });
    const navigateSpy = vi.spyOn(router, 'navigate');
    const Store = signalStore(
      { protectedState: false },
      withState({ page: 5, active: true, ids: [1, 2], selected: null }),
      withSyncToRouteQueryParams({
        mappers: [
          {
            queryParamsToState: () => {},
            stateToQueryParams: (store) =>
              computed(() => ({
                page: store.page(),
                active: store.active(),
                ids: store.ids(),
                selected: store.selected(),
              })),
          },
        ],
      }),
    );
    TestBed.runInInjectionContext(() => new Store());
    await advance(1000);

    // the url holds everything as strings and has no null param, which is
    // still what the store pushed
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should restore a key a destroyed store used to push when it is created again', async () => {
    const { router } = await init();
    const Form3Store = createFormStore('form3', { omitDefault: true });
    const firstInjector = createEnvironmentInjector(
      [Form3Store],
      TestBed.inject(EnvironmentInjector),
    );
    patchState(firstInjector.get(Form3Store), { value: 'foo' });
    await advance(1000);
    firstInjector.destroy();

    let navigated = router.navigateByUrl('/');
    await advance(100);
    expect(await navigated).toBe(true);
    const secondInjector = createEnvironmentInjector(
      [Form3Store],
      TestBed.inject(EnvironmentInjector),
    );
    const form3 = secondInjector.get(Form3Store);
    await advance(1000);

    navigated = router.navigateByUrl('/?form3=bar');
    await advance(100);
    expect(await navigated).toBe(true);
    expect(form3.value()).toBe('bar');
  });

  it('should restore a url change made before the store first push', async () => {
    const { router, form1 } = await init({
      initialUrl: '/?form1=u',
      form2Options: { debounce: 20 },
      settle: false,
    });
    expect(form1.value()).toBe('u');

    // form2 initial push completes, then the url changes again before form1
    // pushes for the first time
    await advance(100);
    const navigated = router.navigateByUrl('/?form1=w&form2=v0');
    await advance(100);
    expect(await navigated).toBe(true);
    expect(form1.value()).toBe('w');
  });

  it('should not cancel a navigation from elsewhere with pushes waiting for their turn', async () => {
    const { router, form1, form2 } = await init({
      form1Options: { debounce: 0 },
      form2Options: { debounce: 10 },
    });

    patchState(form1, { value: 'v1' });
    patchState(form2, { value: 'v1' });
    // form1 navigates, form2 waits for its turn, then the user navigates away
    // cancelling form1, whose end must not flush form2 over the navigation
    await advance(20);
    const navigated = router.navigateByUrl('/other');
    await advance(1000);
    expect(await navigated).toBe(true);

    expect(router.url).toBe('/other');
  });

  it('should not cancel a navigation from elsewhere when a store pushes', async () => {
    const { router, form1 } = await init({ form1Options: { debounce: 50 } });

    // the user goes to a slow page and a store pushes before it completes
    const navigated = router.navigateByUrl('/slow');
    patchState(form1, { value: 'v1' });
    await advance(1000);

    expect(await navigated).toBe(true);
    expect(router.url).toBe('/slow');
  });

  it('should restore the store when a guard corrects its push', async () => {
    const { router, form1 } = await init();

    patchState(form1, { value: 'bad' });
    await advance(1000);

    expect(router.parseUrl(router.url).queryParams).toEqual({
      form1: 'fixed',
      form2: 'v0',
    });
    expect(form1.value()).toBe('fixed');
  });

  it('should stay on the page a guard redirects a push to', async () => {
    const { router, form1, form2 } = await init({
      form2Options: { debounce: 350 },
    });

    patchState(form1, { value: 'logout' });
    patchState(form2, { value: 'v1' });
    // form1 navigates, form2 pushes while its guard runs, then the guard
    // sends the user to another page. The redirect keeps form1 navigation
    // running, so form2 must be dropped when the redirect starts
    await advance(1000);

    expect(router.url).toBe('/other');
  });

  it('should not push a store of the page a guard redirects away from', async () => {
    const Form1Store = createFormStore('form1', { debounce: 0 });
    const Form2Store = createFormStore('form2', { debounce: 150 });
    @Component({
      selector: 'form-page',
      template: '',
      providers: [Form2Store],
    })
    class FormPageComponent {
      form2 = inject(Form2Store);
    }
    TestBed.configureTestingModule({
      providers: [
        Form1Store,
        provideRouter([
          {
            path: 'page',
            component: FormPageComponent,
            runGuardsAndResolvers: 'always',
            canActivate: [
              (route: ActivatedRouteSnapshot) => {
                const router = inject(Router);
                return route.queryParams['form1'] === 'logout'
                  ? timer(100).pipe(map(() => router.createUrlTree(['/other'])))
                  : true;
              },
            ],
          },
          {
            path: 'other',
            component: PageComponent,
            resolve: { slow: () => timer(300).pipe(map(() => true)) },
          },
        ]),
      ],
    });
    const router = TestBed.inject(Router);
    const form1 = TestBed.inject(Form1Store);
    const harness = await RouterTestingHarness.create();
    const navigated = harness.navigateByUrl('/page', FormPageComponent);
    await advance(100);
    const { form2 } = await navigated;
    await advance(1000);
    expect(router.parseUrl(router.url).queryParams).toEqual({
      form1: 'v0',
      form2: 'v0',
    });

    patchState(form1, { value: 'logout' });
    patchState(form2, { value: 'v1' });
    // form1 navigates, its guard redirects to /other, and form2 pushes while
    // the redirect waits on the slow resolver
    await advance(1000);

    expect(router.url).toBe('/other');
  });

  it('should not loop when a guard redirects a push to the current url', async () => {
    const { router, form1 } = await init();
    const navigateSpy = vi.spyOn(router, 'navigate');

    patchState(form1, { value: 'rejected' });
    await advance(1000);

    // the push is given up, the store keeps the value until its next change
    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(router.parseUrl(router.url).queryParams).toEqual({
      form1: 'v0',
      form2: 'v0',
    });
    expect(form1.value()).toBe('rejected');

    patchState(form1, { value: 'v1' });
    await advance(1000);
    expect(router.parseUrl(router.url).queryParams).toEqual({
      form1: 'v1',
      form2: 'v0',
    });
  });

  it('should keep syncing after a navigation to the current url cancels a push', async () => {
    const { router, form1, form2 } = await init();

    patchState(form1, { value: 'v1' });
    // form1 push starts and waits on the slow resolver
    await advance(310);
    // a link to the page the user is on is skipped by the router, but still
    // cancels the push navigation, whose push is lost
    const navigated = router.navigateByUrl(router.url);
    await advance(1000);
    expect(await navigated).toBe(false);
    expect(router.parseUrl(router.url).queryParams).toEqual({
      form1: 'v0',
      form2: 'v0',
    });

    // a later push of another store still reaches the url
    patchState(form2, { value: 'v1' });
    await advance(1000);
    expect(router.parseUrl(router.url).queryParams).toEqual({
      form1: 'v0',
      form2: 'v1',
    });
    expect(form1.value()).toBe('v1');
  });

  it('should restore the stores from a url change made while a push navigates', async () => {
    const { router, form1, form2 } = await init({
      form1Options: { debounce: 0 },
      form2Options: { debounce: 10 },
    });

    patchState(form1, { value: 'v1' });
    patchState(form2, { value: 'v1' });
    // form1 navigates, form2 waits for its turn, then the url changes
    await advance(20);
    const navigated = router.navigateByUrl('/?form1=w1&form2=w2');
    await advance(1000);
    expect(await navigated).toBe(true);

    expect(router.parseUrl(router.url).queryParams).toEqual({
      form1: 'w1',
      form2: 'w2',
    });
    expect(form1.value()).toBe('w1');
    expect(form2.value()).toBe('w2');
  });

  it('should keep syncing after a navigation throws', async () => {
    const { router, form1 } = await init();
    vi.spyOn(router, 'navigate').mockImplementationOnce(() => {
      throw new Error('navigate failed');
    });
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    patchState(form1, { value: 'v1' });
    await advance(1000);
    expect(consoleError).toHaveBeenCalled();

    patchState(form1, { value: 'v2' });
    await advance(1000);
    expect(router.parseUrl(router.url).queryParams).toEqual({
      form1: 'v2',
      form2: 'v0',
    });
  });
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
      preserveFragment: true,
      scroll: 'manual',
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

  afterEach(() => {
    vi.useRealTimers();
  });

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

  it('should remove the params of a prop that holds nothing', async () => {
    // the router navigates with native promises, which fakeAsync cannot flush
    vi.useFakeTimers();
    const queryParams = {
      'filter.color': 'blue',
      'filter.nested.deep': 'restored',
    };
    const { store } = init(queryParams);
    const router = TestBed.inject(Router);
    // the url holds the params, otherwise removing them is skipped as the url
    // already lacks them
    const navigated = router.navigate([], { queryParams });
    await vi.advanceTimersByTimeAsync(0);
    expect(await navigated).toBe(true);
    const navigate = vi.spyOn(router, 'navigate');

    patchState(store, { filter: undefined as any });
    TestBed.tick();
    await vi.advanceTimersByTimeAsync(400);

    const params = navigate.mock.calls[0][1]?.queryParams as any;
    expect(params['filter.color']).toBe(undefined);
    expect(params['filter.nested.deep']).toBe(undefined);
    expect(router.parseUrl(router.url).queryParams).toEqual({});
  });
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

describe('parseQueryId', () => {
  it('keeps the id as a string by default', () => {
    expect(parseQueryId('2')).toBe('2');
    expect(parseQueryId('2', 'string')).toBe('2');
  });

  it('parses finite numbers, ignoring anything else', () => {
    expect(parseQueryId('2', 'number')).toBe(2);
    expect(parseQueryId('0', 'number')).toBe(0);
    expect(parseQueryId('-1', 'number')).toBe(-1);
    expect(parseQueryId(' 3 ', 'number')).toBe(3);
    expect(parseQueryId(' ', 'number')).toBeUndefined();
    expect(parseQueryId('', 'number')).toBeUndefined();
    expect(parseQueryId('abc', 'number')).toBeUndefined();
    expect(parseQueryId('Infinity', 'number')).toBeUndefined();
  });

  it('uses a parse function', () => {
    expect(parseQueryId('a-2', (id) => Number(id.slice(2)))).toBe(2);
    expect(parseQueryId('x', () => undefined)).toBeUndefined();
  });
});
