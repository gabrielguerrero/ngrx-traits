import { cacheReducer, initialState } from './cache.reducer';
import * as CacheActions from './cache.actions';
import { getCacheValue, hashKey } from './cache.models';

describe('Cache Reducer', () => {
  it('cache action should save value in store ', () => {
    const key = ['test', { a: 1, b: '2' }];
    const action = CacheActions.cache({
      key,
      value: [{ a: 1, b: '2' }],
      date: 123123123,
    });
    const result = cacheReducer(initialState, action);

    expect(getCacheValue(hashKey(key), result)).toEqual({
      date: 123123123,
      invalid: false,
      hitCount: 1,
      value: [
        {
          a: 1,
          b: '2',
        },
      ],
    });
  });

  it('invalidate cache action should invalidate the cache ', () => {
    const key = ['test', { a: 1, b: '2' }];
    const cache = CacheActions.cache({
      key,
      value: [{ a: 1, b: '2' }],
      date: 123123123,
    });
    let result = cacheReducer(initialState, cache);

    const invalidate = CacheActions.invalidateCache({
      key,
    });
    result = cacheReducer(result, invalidate);

    expect(getCacheValue(hashKey(key), result)).toEqual({
      value: [{ a: 1, b: '2' }],
      date: 123123123,
      invalid: true,
      hitCount: 1,
    });
  });

  it('invalidate parent cache invalidate children caches ', () => {
    const key = ['test', 'list', { a: 1, b: '2' }];
    const key2 = ['test', 'list', { a: 2, b: '3' }];
    const cache = CacheActions.cache({
      key,
      value: [{ a: 1, b: '2' }],
      date: 123123123,
    });
    let result = cacheReducer(initialState, cache);
    const cache2 = CacheActions.cache({
      key: key2,
      value: [{ a: 2, b: '3' }],
      date: 343434343,
    });
    result = cacheReducer(result, cache2);

    const deleteCache = CacheActions.invalidateCache({
      key: ['test'],
    });
    result = cacheReducer(result, deleteCache);

    expect(getCacheValue(hashKey(key), result)).toEqual({
      value: [{ a: 1, b: '2' }],
      date: 123123123,
      invalid: true,
      hitCount: 1,
    });
    expect(getCacheValue(hashKey(key2), result)).toEqual({
      value: [{ a: 2, b: '3' }],
      date: 343434343,
      invalid: true,
      hitCount: 1,
    });
  });

  it('delete cache action should delete the cache ', () => {
    const key = ['test', { a: 1, b: '2' }];
    const cache = CacheActions.cache({
      key,
      value: [{ a: 1, b: '2' }],
      date: 123123123,
    });
    let result = cacheReducer(initialState, cache);

    const deleteCache = CacheActions.deleteCache({
      key,
    });
    result = cacheReducer(result, deleteCache);

    expect(getCacheValue(hashKey(key), result)).toBeUndefined();
  });

  it('delete parent cache deletes children caches ', () => {
    const key = ['test', 'list', { a: 1, b: '2' }];
    const key2 = ['test', 'list', { a: 2, b: '3' }];
    const cache = CacheActions.cache({
      key,
      value: [{ a: 1, b: '2' }],
      date: 123123123,
    });
    let result = cacheReducer(initialState, cache);
    const cache2 = CacheActions.cache({
      key: key2,
      value: [{ a: 1, b: '2' }],
      date: 343434343,
    });
    result = cacheReducer(result, cache2);

    const deleteCache = CacheActions.deleteCache({
      key: ['test'],
    });
    result = cacheReducer(result, deleteCache);

    expect(getCacheValue(hashKey(key), result)).toBeUndefined();
    expect(getCacheValue(hashKey(key2), result)).toBeUndefined();
  });

  it('cache should increase hit count if already exist ', () => {
    const key = ['test', { a: 1, b: '2' }];
    const cache = CacheActions.cache({
      key,
      value: [{ a: 1, b: '2' }],
      date: 123123123,
    });
    let result = cacheReducer(initialState, cache);

    const cache2 = CacheActions.cache({
      key,
      value: [{ a: 2, b: '3' }],
      date: 23213123,
    });
    result = cacheReducer(result, cache2);

    expect(getCacheValue(hashKey(key), result)).toEqual({
      value: [{ a: 2, b: '3' }],
      date: 23213123,
      invalid: false,
      hitCount: 2,
    });
  });
  it('hitCache should increase hit count ', () => {
    const key = ['test', { a: 1, b: '2' }];
    const cache = CacheActions.cache({
      key,
      value: [{ a: 1, b: '2' }],
      date: 123123123,
    });
    let result = cacheReducer(initialState, cache);

    const hitCache = CacheActions.hitCache({
      key,
    });
    result = cacheReducer(result, hitCache);

    expect(getCacheValue(hashKey(key), result)).toEqual({
      value: [{ a: 1, b: '2' }],
      date: 123123123,
      invalid: false,
      hitCount: 2,
    });
  });

  it('cache action with maxCacheSize should delete less hit cache ', () => {
    const key = ['test', { a: 0, b: '2' }];
    const cache = CacheActions.cache({
      key,
      value: [{ a: 1, b: '2' }],
      date: 123123123,
      maxCacheSize: 5,
    });
    let result = cacheReducer(initialState, cache);

    // add one hit count the previous cache and create 4 more caches so we are at maximum capacity
    // and counts are 2,1,1,1,1
    for (let i = 0; i < 5; i++) {
      const key = ['test', { a: i, b: '2' }];
      const cache = CacheActions.cache({
        key,
        value: [{ a: i, b: '2' }],
        date: 123123123 + i,
        maxCacheSize: 5,
      });
      result = cacheReducer(result, cache);
    }
    // add one hit count to first 4 so count will be 3,2,2,2,1
    // but the
    for (let i = 0; i < 4; i++) {
      const key = ['test', { a: i, b: '2' }];
      const cache = CacheActions.cache({
        key,
        value: [{ a: i, b: '2' }],
        date: 123123123 + i,
        maxCacheSize: 5,
      });
      result = cacheReducer(result, cache);
    }
    // we add a new one to trigger the delete of the one with lest count
    // new count before delete 3,2,2,2,1,1
    // the newest cache will stay because is the newest, but the other cache with hitCount 1 will be deleted
    {
      const key = ['test', { a: 5, b: '2' }];
      const cache = CacheActions.cache({
        key,
        value: [{ a: 5, b: '2' }],
        date: 123123123 + 5,
        maxCacheSize: 5,
      });
      result = cacheReducer(result, cache);
    }

    // all keys should be present expect ['test', { a: 4, b: '2' }]
    for (let i = 0; i < 4; i++) {
      expect(
        getCacheValue(hashKey(['test', { a: i, b: '2' }]), result)
      ).toBeDefined();
    }
    expect(
      getCacheValue(hashKey(['test', { a: 4, b: '2' }]), result)
    ).toBeUndefined();
    expect(
      getCacheValue(hashKey(['test', { a: 5, b: '2' }]), result)
    ).toBeDefined();
  });

  it('cache action with no maxCacheSize no keys should be deleted', () => {
    const key = ['test', { a: 0, b: '2' }];
    const cache = CacheActions.cache({
      key,
      value: [{ a: 1, b: '2' }],
      date: 123123123,
    });
    let result = cacheReducer(initialState, cache);

    // add 6 more cache
    for (let i = 1; i < 7; i++) {
      const key = ['test', { a: i, b: '2' }];
      const cache = CacheActions.cache({
        key,
        value: [{ a: i, b: '2' }],
        date: 123123123 + i,
      });
      result = cacheReducer(result, cache);
    }

    for (let i = 0; i < 7; i++) {
      expect(
        getCacheValue(hashKey(['test', { a: i, b: '2' }]), result)
      ).toBeDefined();
    }
  });

  it('cache action with maxCacheSize should delete oldest cache if all have the same hitCount', () => {
    const key = ['test', { a: 0, b: '2' }];
    const cache = CacheActions.cache({
      key,
      value: [{ a: 1, b: '2' }],
      date: 123123123,
      maxCacheSize: 5,
    });
    let result = cacheReducer(initialState, cache);

    // add 5 more cache, all the cache will have the same hit count of 1 so the first one added should be deleted
    for (let i = 1; i < 6; i++) {
      const key = ['test', { a: i, b: '2' }];
      const cache = CacheActions.cache({
        key,
        value: [{ a: i, b: '2' }],
        date: 123123123 + i,
        maxCacheSize: 5,
      });
      result = cacheReducer(result, cache);
    }

    // all keys should be present expect ['test', { a: 4, b: '2' }]
    for (let i = 1; i < 6; i++) {
      expect(
        getCacheValue(hashKey(['test', { a: i, b: '2' }]), result)
      ).toBeDefined();
    }
    expect(
      getCacheValue(hashKey(['test', { a: 0, b: '2' }]), result)
    ).toBeUndefined();
  });

  it('cache action with maxCacheSize should delete oldest cache if all have the same hitCount and ignore invalidated', () => {
    const key = ['test', { a: 0, b: '2' }];
    const cache = CacheActions.cache({
      key,
      value: [{ a: 0, b: '2' }],
      date: 123123123,
      maxCacheSize: 5,
    });
    let result = cacheReducer(initialState, cache);

    // add 4 more cache, to fill the cache all with hit count 1
    for (let i = 1; i < 5; i++) {
      const key = ['test', { a: i, b: '2' }];
      const cache = CacheActions.cache({
        key,
        value: [{ a: i, b: '2' }],
        date: 123123123 + i,
        maxCacheSize: 5,
      });
      result = cacheReducer(result, cache);
    }

    // we will now invalidate last cache added
    const invalidate = CacheActions.invalidateCache({
      key: ['test', { a: 4, b: '2' }],
    });
    result = cacheReducer(result, invalidate);

    // adding one more will normally delete oldest but because there is one invalid that will be deleted instead
    {
      const cache = CacheActions.cache({
        key: ['test', { a: 5, b: '2' }],
        value: [{ a: 5, b: '2' }],
        date: 123123123 + 6,
        maxCacheSize: 5,
      });
      result = cacheReducer(result, cache);
    }

    // all keys should be present expect ['test', { a: 4, b: '2' }]
    for (let i = 0; i < 4; i++) {
      expect(
        getCacheValue(hashKey(['test', { a: i, b: '2' }]), result)
      ).toBeDefined();
    }
    expect(
      getCacheValue(hashKey(['test', { a: 4, b: '2' }]), result)
    ).toBeUndefined();
    expect(
      getCacheValue(hashKey(['test', { a: 5, b: '2' }]), result)
    ).toBeDefined();
  });
});
