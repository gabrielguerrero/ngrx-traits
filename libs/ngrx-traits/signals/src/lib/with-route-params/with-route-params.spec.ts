import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { signalStore } from '@ngrx/signals';
import { of } from 'rxjs';

import { withRouteParams } from './with-route-params';

describe('withRouteParams', () => {
  function init() {
    const Store = signalStore(
      withRouteParams((params, data) => {
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
});
