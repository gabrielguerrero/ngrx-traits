import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { cache } from './cache.service';
import { Actions } from '@ngrx/effects';
import { provideMockActions } from '@ngrx/effects/testing';
import { TestBed } from '@angular/core/testing';
import * as CacheActions from './cache.actions';
import * as CacheSelectors from './cache.selectors';
import { cacheReducer, initialState } from './cache.reducer';
import { of } from 'rxjs';

describe('CacheService', () => {
  let actions$: Actions;
  function init() {
    TestBed.configureTestingModule({
      providers: [
        provideMockActions(() => actions$),
        provideMockStore({ initialState: {} }),
      ],
    });
    const store = TestBed.inject(MockStore);
    jest.spyOn(store, 'dispatch');
    return {
      store,
    };
  }

  it('should return cached value if key is cached', async () => {
    const { store } = init();
    const key = ['test', { a: 1, b: '2' }];
    const cacheAction = CacheActions.cache({
      key,
      value: [{ a: 1, b: '2' }],
      date: 123123123,
    });
    const result = cacheReducer(initialState, cacheAction);
    store.overrideSelector(CacheSelectors.cacheStateSelector, result);

    const value = await cache({
      store,
      key,
      source: of([{ a: 2, b: '3' }]),
    }).toPromise();

    expect(value).toEqual([{ a: 1, b: '2' }]);
    expect(store.dispatch).toHaveBeenCalledWith(
      CacheActions.hitCache({
        key,
      })
    );
  });

  it('should return source value and cache if key is not cached', async () => {
    const { store } = init();
    const key = ['test', { a: 1, b: '2' }];

    store.overrideSelector(CacheSelectors.cacheStateSelector, initialState);

    const value = await cache({
      store,
      key,
      source: of([{ a: 2, b: '3' }]),
    }).toPromise();

    expect(value).toEqual([{ a: 2, b: '3' }]);
    expect(store.dispatch).toHaveBeenCalledWith(
      CacheActions.cache({
        key,
        date: expect.anything(),
        value: [{ a: 2, b: '3' }],
      })
    );
  });

  it('should return source value and cache if key is expired', async () => {
    const { store } = init();
    const key = ['test', { a: 1, b: '2' }];
    const cacheAction = CacheActions.cache({
      key,
      value: [{ a: 1, b: '2' }],
      date: Date.now() - 1000 * 60 * 10,
    });
    const result = cacheReducer(initialState, cacheAction);
    store.overrideSelector(CacheSelectors.cacheStateSelector, result);

    const value = await cache({
      store,
      key,
      source: of([{ a: 2, b: '3' }]),
      expires: 1000 * 60 * 5,
    }).toPromise();

    expect(value).toEqual([{ a: 2, b: '3' }]);
    expect(store.dispatch).toHaveBeenCalledWith(
      CacheActions.cache({
        key,
        date: expect.anything(),
        value: [{ a: 2, b: '3' }],
      })
    );
  });

  it('should return source value and cache if key is invalidated', async () => {
    const { store } = init();
    const key = ['test', { a: 1, b: '2' }];
    const cacheAction = CacheActions.cache({
      key,
      value: [{ a: 1, b: '2' }],
      date: Date.now() - 1000 * 60 * 10,
    });
    let result = cacheReducer(initialState, cacheAction);
    const invalidate = CacheActions.invalidateCache({
      key: ['test', { a: 1, b: '2' }],
    });
    result = cacheReducer(result, invalidate);
    store.overrideSelector(CacheSelectors.cacheStateSelector, result);

    const value = await cache({
      store,
      key,
      source: of([{ a: 2, b: '3' }]),
    }).toPromise();

    expect(value).toEqual([{ a: 2, b: '3' }]);
    expect(store.dispatch).toHaveBeenCalledWith(
      CacheActions.cache({
        key,
        date: expect.anything(),
        value: [{ a: 2, b: '3' }],
      })
    );
  });
});
