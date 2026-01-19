import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { signalStore } from '@ngrx/signals';
import { BehaviorSubject, of } from 'rxjs';

import { withRoute } from './with-route';

describe('withRoute', () => {
  function init() {
    const Store = signalStore(
      withRoute(({ params, data }) => {
        return {
          test: params['test'],
          foo: params['foo'],
          bar: params['bar'] === 'true',
          data: data as { x: number },
        };
      }),
    );
    TestBed.configureTestingModule({
      providers: [
        Store,
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useFactory: () => ({
            params: of({
              test: 'test2',
              foo: 'foo2',
              bar: 'true',
            }),
            data: of({ x: 1 }),
          }),
        },
      ],
    });
    return { store: TestBed.inject(Store) };
  }

  it('should created computed of params and data', () => {
    const { store } = init();
    expect(store.test()).toBe('test2');
    expect(store.foo()).toBe('foo2');
    expect(store.bar()).toBe(true);
    expect(store.data()).toEqual({ x: 1 });
  });

  describe('child route params', () => {
    @Component({ template: '', standalone: true })
    class ParentComponent {}

    @Component({ template: '', standalone: true })
    class ChildComponent {}

    it('should extract params from child routes when store is provided at parent level', async () => {
      const Store = signalStore(
        withRoute(({ params, data }) => ({
          parentParam: params['parentParam'],
          childParam: params['childParam'],
        })),
      );

      TestBed.configureTestingModule({
        providers: [
          Store,
          provideRouter([
            {
              path: ':parentParam',
              component: ParentComponent,
              children: [
                {
                  path: ':childParam',
                  component: ChildComponent,
                },
              ],
            },
          ]),
        ],
      });

      const router = TestBed.inject(Router);
      const store = TestBed.inject(Store);

      await router.navigate(['/parent123', 'child456']);

      expect(store.parentParam()).toBe('parent123');
      expect(store.childParam()).toBe('child456');
    });

    it('should give precedence to deeper child route params over parent params with same name', async () => {
      const Store = signalStore(
        withRoute(({ params, data }) => ({
          id: params['id'],
        })),
      );

      TestBed.configureTestingModule({
        providers: [
          Store,
          provideRouter([
            {
              path: ':id',
              component: ParentComponent,
              children: [
                {
                  path: ':id',
                  component: ChildComponent,
                },
              ],
            },
          ]),
        ],
      });

      const router = TestBed.inject(Router);
      const store = TestBed.inject(Store);

      await router.navigate(['/parent-id', 'child-id']);

      // Child route param should take precedence
      expect(store.id()).toBe('child-id');
    });

    it('should extract params from multiple nested child routes', async () => {
      @Component({ template: '', standalone: true })
      class GrandChildComponent {}

      const Store = signalStore(
        withRoute(({ params, data }) => ({
          level1: params['level1'],
          level2: params['level2'],
          level3: params['level3'],
        })),
      );

      TestBed.configureTestingModule({
        providers: [
          Store,
          provideRouter([
            {
              path: ':level1',
              component: ParentComponent,
              children: [
                {
                  path: ':level2',
                  component: ChildComponent,
                  children: [
                    {
                      path: ':level3',
                      component: GrandChildComponent,
                    },
                  ],
                },
              ],
            },
          ]),
        ],
      });

      const router = TestBed.inject(Router);
      const store = TestBed.inject(Store);

      await router.navigate(['/first', 'second', 'third']);

      expect(store.level1()).toBe('first');
      expect(store.level2()).toBe('second');
      expect(store.level3()).toBe('third');
    });
  });

  describe('queryParams', () => {
    it('should create computed of queryParams', () => {
      const Store = signalStore(
        withRoute(({ queryParams }) => ({
          search: queryParams['search'],
          page: queryParams['page'],
        })),
      );

      TestBed.configureTestingModule({
        providers: [
          Store,
          provideRouter([]),
          {
            provide: ActivatedRoute,
            useFactory: () => ({
              params: of({}),
              data: of({}),
              queryParams: of({
                search: 'test-search',
                page: '5',
              }),
            }),
          },
        ],
      });

      const store = TestBed.inject(Store);
      expect(store.search()).toBe('test-search');
      expect(store.page()).toBe('5');
    });

    it('should work with both params and queryParams', () => {
      const Store = signalStore(
        withRoute(({ params, queryParams }) => ({
          id: params['id'],
          search: queryParams['search'],
          sort: queryParams['sort'],
        })),
      );

      TestBed.configureTestingModule({
        providers: [
          Store,
          provideRouter([]),
          {
            provide: ActivatedRoute,
            useFactory: () => ({
              params: of({ id: 'product-123' }),
              data: of({}),
              queryParams: of({
                search: 'query',
                sort: 'name',
              }),
            }),
          },
        ],
      });

      const store = TestBed.inject(Store);
      expect(store.id()).toBe('product-123');
      expect(store.search()).toBe('query');
      expect(store.sort()).toBe('name');
    });

    it('should update when queryParams change', () => {
      const queryParams$ = new BehaviorSubject({ filter: 'active' });

      const Store = signalStore(
        withRoute(({ queryParams }) => ({
          filter: queryParams['filter'],
        })),
      );

      TestBed.configureTestingModule({
        providers: [
          Store,
          provideRouter([]),
          {
            provide: ActivatedRoute,
            useFactory: () => ({
              params: of({}),
              data: of({}),
              queryParams: queryParams$,
            }),
          },
        ],
      });

      const store = TestBed.inject(Store);
      expect(store.filter()).toBe('active');

      queryParams$.next({ filter: 'inactive' });
      expect(store.filter()).toBe('inactive');
    });

    it('should work with child routes and queryParams', async () => {
      @Component({ template: '' })
      class ParentComponent {}

      @Component({ template: '' })
      class ChildComponent {}

      const Store = signalStore(
        withRoute(({ params, queryParams }) => ({
          parentId: params['parentId'],
          childId: params['childId'],
          tab: queryParams['tab'],
        })),
      );

      TestBed.configureTestingModule({
        providers: [
          Store,
          provideRouter([
            {
              path: ':parentId',
              component: ParentComponent,
              children: [
                {
                  path: ':childId',
                  component: ChildComponent,
                },
              ],
            },
          ]),
        ],
      });

      const router = TestBed.inject(Router);
      const store = TestBed.inject(Store);

      await router.navigate(['/parent-1', 'child-2'], {
        queryParams: { tab: 'details' },
      });

      expect(store.parentId()).toBe('parent-1');
      expect(store.childId()).toBe('child-2');
      expect(store.tab()).toBe('details');
    });
  });
});
