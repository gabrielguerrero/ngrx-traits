import { fakeAsync, flush, tick } from '@angular/core/testing';
import { lastValueFrom, of } from 'rxjs';

import { CacheStore } from './cache-store';
import { getCacheData, hashKey, setCacheValue } from './cache.utils';
import { cacheCall, cacheRxCall } from './global-cache';

describe('CacheService', () => {
  it('should return cached value if key is cached using Observable call', async () => {
    const cacheStore = new CacheStore({ clearExpiredEvery: 0 });

    const key = ['test', { a: 1, b: '2' }];
    let date = Date.now();
    setCacheValue(cacheStore.cacheState, hashKey(key), {
      value: [{ a: 1, b: '2' }],
      date,
      invalid: false,
    });

    const value = await lastValueFrom(
      cacheRxCall({
        key,
        call: of([{ a: 2, b: '3', c: '4' }]), // result should not be returned because value is cached,
        cacheStore,
      }),
    );

    let cachedValue = getCacheData(cacheStore.cacheState, hashKey(key));
    expect(cachedValue?.invalid).toEqual(false);
    expect(cachedValue?.hitCount).toEqual(2);
    expect(cachedValue?.date).toEqual(date);
    expect(cachedValue?.value).toEqual([{ a: 1, b: '2' }]);

    expect(value).toEqual([{ a: 1, b: '2' }]);
  });

  it('should return cached value if key is cached using cache using promises', async () => {
    const cacheStore = new CacheStore({ clearExpiredEvery: 0 });

    const key = ['test', { a: 1, b: '2' }];
    let date = Date.now();
    setCacheValue(cacheStore.cacheState, hashKey(key), {
      value: [{ a: 1, b: '2' }],
      date,
      invalid: false,
    });

    const value = await cacheCall({
      key,
      call: () => Promise.resolve([{ a: 2, b: '3', c: '4' }]), // result should not be returned because value is cached,
      cacheStore,
    });

    let cachedValue = getCacheData(cacheStore.cacheState, hashKey(key));
    expect(cachedValue?.invalid).toEqual(false);
    expect(cachedValue?.hitCount).toEqual(2);
    expect(cachedValue?.date).toEqual(date);
    expect(cachedValue?.value).toEqual([{ a: 1, b: '2' }]);

    expect(value).toEqual([{ a: 1, b: '2' }]);
  });

  it('should return cached value if key is cached', async () => {
    const cacheStore = new CacheStore({ clearExpiredEvery: 0 });

    const key = ['test', { a: 1, b: '2' }];
    let date = Date.now();
    setCacheValue(cacheStore.cacheState, hashKey(key), {
      value: [{ a: 1, b: '2' }],
      date,
      invalid: false,
    });

    const value = await cacheCall({
      key,
      call: () => Promise.resolve([{ a: 2, b: '3', c: '4' }]), // result should not be returned because value is cached
      cacheStore,
    });

    let cachedValue = getCacheData(cacheStore.cacheState, hashKey(key));
    expect(cachedValue?.invalid).toEqual(false);
    // expect(cachedValue?.hitCount).toEqual(2);
    expect(cachedValue?.date).toEqual(date);
    expect(cachedValue?.value).toEqual([{ a: 1, b: '2' }]);

    expect(value).toEqual([{ a: 1, b: '2' }]);
  });

  it('should return result value and cache if key is not cached', async () => {
    const cacheStore = new CacheStore({ clearExpiredEvery: 0 });
    const key = ['test', { a: 1, b: '2' }];

    const value = await cacheCall({
      key,
      call: () => Promise.resolve([{ a: 2, b: '3' }]),
      cacheStore,
    });
    expect(value).toEqual([{ a: 2, b: '3' }]);
    let cachedValue = getCacheData(cacheStore.cacheState, hashKey(key));
    expect(cachedValue?.invalid).toEqual(false);
    expect(cachedValue?.hitCount).toEqual(1);
    expect(cachedValue?.date).toBeGreaterThan(0);
    expect(cachedValue?.value).toEqual([{ a: 2, b: '3' }]);
  });

  it('should return result value and cache if key is expired', async () => {
    const cacheStore = new CacheStore({ clearExpiredEvery: 0 });
    const key = ['test', { a: 1, b: '2' }];
    let date = Date.now() - 1000 * 60 * 10;
    setCacheValue(cacheStore.cacheState, hashKey(key), {
      value: [{ a: 1, b: '2' }],
      date,
      invalid: false,
    });

    const value = await cacheCall({
      key,
      call: () => Promise.resolve([{ a: 2, b: '3', c: 4 }]),
      expires: 1000 * 60 * 5,
      cacheStore,
    });
    expect(value).toEqual([{ a: 2, b: '3', c: 4 }]);
    let cachedValue = getCacheData(cacheStore.cacheState, hashKey(key));
    expect(cachedValue?.invalid).toEqual(false);
    expect(cachedValue?.hitCount).toEqual(2);
    expect(cachedValue?.date).toBeGreaterThan(Date.now() - 2000); // check has a new resent date
    expect(cachedValue?.value).toEqual([{ a: 2, b: '3', c: 4 }]);
    expect(cachedValue?.value).toEqual([{ a: 2, b: '3', c: 4 }]);
  });

  it('should return result value and cache if key is invalidated', async () => {
    const cacheStore = new CacheStore({ clearExpiredEvery: 0 });
    const key = ['test', { a: 1, b: '2' }];
    let date = Date.now();
    setCacheValue(cacheStore.cacheState, hashKey(key), {
      value: [{ a: 1, b: '2', c: 4 }],
      date,
      invalid: false,
    });

    cacheStore.invalidate({ key });

    {
      let cachedValue = getCacheData(cacheStore.cacheState, hashKey(key));
      expect(cachedValue?.invalid).toEqual(true);
      expect(cachedValue?.hitCount).toEqual(1);
      expect(cachedValue?.date).toBeGreaterThan(0);
      expect(cachedValue?.value).toEqual([{ a: 1, b: '2', c: 4 }]);
    }

    const value = await cacheCall({
      key,
      call: () => Promise.resolve([{ a: 2, b: '3' }]),
      cacheStore,
    });
    expect(value).toEqual([{ a: 2, b: '3' }]);
    {
      let cachedValue = getCacheData(cacheStore.cacheState, hashKey(key));
      expect(cachedValue?.invalid).toEqual(false);
      expect(cachedValue?.hitCount).toEqual(2);
      expect(cachedValue?.date).toBeGreaterThan(0);
      expect(cachedValue?.value).toEqual([{ a: 2, b: '3' }]);
    }
  });

  it('should remove old cache entries when using maxCacheSize', async () => {
    const cacheStore = new CacheStore({ clearExpiredEvery: 0 });
    const key1 = ['test', { a: 1, b: '2' }];
    const key2 = ['test', { a: 3, b: '4' }];
    const key3 = ['test', { a: 5, b: '6' }];

    setCacheValue(
      cacheStore.cacheState,
      hashKey(key1),
      {
        value: 1,
        date: Date.now() - 10,
        invalid: false,
      },
      2,
    );
    setCacheValue(
      cacheStore.cacheState,
      hashKey(key2),
      {
        value: 2,
        date: Date.now() - 5,
        invalid: false,
      },
      2,
    );

    const result3 = await cacheCall({
      key: key3,
      call: () => Promise.resolve(3),
      maxCacheSize: 2,
      cacheStore,
    });
    expect(result3).toEqual(3);
    expect(getCacheData(cacheStore.cacheState, hashKey(key3))).toBeDefined();
    expect(getCacheData(cacheStore.cacheState, hashKey(key1))).toBeUndefined();
    expect(getCacheData(cacheStore.cacheState, hashKey(key2))).toBeDefined();
    expect(getCacheData(cacheStore.cacheState, hashKey(key3))).toBeDefined();
  });

  it('should skip cached value if skip is true', async () => {
    const cacheStore = new CacheStore({ clearExpiredEvery: 0 });

    const key = ['test', { a: 1, b: '2' }];
    let date = Date.now();
    setCacheValue(cacheStore.cacheState, hashKey(key), {
      value: [{ a: 1, b: '2' }],
      date,
      invalid: false,
    });

    const value = await cacheCall({
      key,
      call: () => Promise.resolve([{ a: 2, b: '3', c: '4' }]), // result should  be returned because cache is skipped
      skip: true,
      cacheStore,
    });

    let cachedValue = getCacheData(cacheStore.cacheState, hashKey(key));
    expect(cachedValue?.invalid).toEqual(false);
    expect(cachedValue?.hitCount).toEqual(2);
    expect(cachedValue?.date).toBeGreaterThan(0);
    expect(cachedValue?.value).toEqual([{ a: 2, b: '3', c: '4' }]);

    expect(value).toEqual([{ a: 2, b: '3', c: '4' }]);
  });

  it('should skip cached value if setSkipCacheForAllCalls is true', async () => {
    const cacheStore = new CacheStore({ clearExpiredEvery: 0 });

    const key = ['test', { a: 1, b: '2' }];
    let date = Date.now();
    setCacheValue(cacheStore.cacheState, hashKey(key), {
      value: [{ a: 1, b: '2' }],
      date,
      invalid: false,
    });
    cacheStore.setSkipCacheForAllCalls(true);
    const value = await cacheCall({
      key,
      call: () => Promise.resolve([{ a: 2, b: '3', c: '4' }]), // result should  be returned because cache is skipped
      cacheStore,
    });

    let cachedValue = getCacheData(cacheStore.cacheState, hashKey(key));
    expect(cachedValue?.invalid).toEqual(false);
    expect(cachedValue?.hitCount).toEqual(2);
    expect(cachedValue?.date).toBeGreaterThan(0);
    expect(cachedValue?.value).toEqual([{ a: 2, b: '3', c: '4' }]);

    expect(value).toEqual([{ a: 2, b: '3', c: '4' }]);
  });

  it('should clear the store when clear is called', () => {
    const cacheStore = new CacheStore({ clearExpiredEvery: 0 });
    const key1 = ['test1', { a: 1, b: '2' }];
    const key2 = ['test2', { a: 3, b: '4' }];
    const key3 = ['test3', { a: 5, b: '6' }];

    setCacheValue(
      cacheStore.cacheState,
      hashKey(key1),
      {
        value: 1,
        date: Date.now() - 10,
        invalid: false,
      },
      2,
    );

    setCacheValue(
      cacheStore.cacheState,
      hashKey(key2),
      {
        value: 2,
        date: Date.now() - 5,
        invalid: false,
      },
      2,
    );

    setCacheValue(
      cacheStore.cacheState,
      hashKey(key3),
      {
        value: 3,
        date: Date.now() - 5,
        invalid: false,
      },
      2,
    );

    cacheStore.clear();

    expect(getCacheData(cacheStore.cacheState, hashKey(key1))).toBeUndefined();
    expect(getCacheData(cacheStore.cacheState, hashKey(key2))).toBeUndefined();
    expect(getCacheData(cacheStore.cacheState, hashKey(key3))).toBeUndefined();
  });

  it('should call deleteExpiredOrInvalidCache if clearExpiredEvery is greater than 0', fakeAsync(() => {
    const cacheStore = new CacheStore({ clearExpiredEvery: 200 });
    const key1 = ['test1', { a: 1, b: '2' }];
    const key2 = ['test2', { a: 3, b: '4' }];
    const key3 = ['test3', { a: 5, b: '6' }];

    setCacheValue(
      cacheStore.cacheState,
      hashKey(key1),
      {
        value: 1,
        date: Date.now() - 10,
        invalid: false,
      },
      2,
      300,
    );

    setCacheValue(
      cacheStore.cacheState,
      hashKey(key2),
      {
        value: 2,
        date: Date.now() - 5,
        invalid: false,
      },
      2,
      300,
    );

    setCacheValue(
      cacheStore.cacheState,
      hashKey(key3),
      {
        value: 3,
        date: Date.now() - 1,
        invalid: false,
      },
      2,
    );

    tick(1000);

    expect(getCacheData(cacheStore.cacheState, hashKey(key1))).toBeUndefined();
    expect(getCacheData(cacheStore.cacheState, hashKey(key2))).toBeUndefined();
    expect(getCacheData(cacheStore.cacheState, hashKey(key3))).toBeDefined();
    cacheStore.ngOnDestroy();
  }));

  it('should be able to read a cache value using store', () => {
    const cacheStore = new CacheStore({ clearExpiredEvery: 0 });
    const key = ['test', { a: 1, b: '2' }];
    const value = [{ a: 1, b: '2' }];
    const date = Date.now();

    setCacheValue(cacheStore.cacheState, hashKey(key), {
      value,
      date,
      invalid: false,
    });

    const cachedValue = cacheStore.get({ key });
    expect(cachedValue?.value).toEqual(value);
    expect(cachedValue?.date).toEqual(date);
    expect(cachedValue?.invalid).toEqual(false);
  });

  it('should be able to set a cache value using store', () => {
    const cacheStore = new CacheStore({ clearExpiredEvery: 0 });
    const key = ['test', { a: 1, b: '2' }];
    const value = [{ a: 1, b: '2' }];

    cacheStore.set({
      key,
      value,
    });

    const cachedValue = getCacheData(cacheStore.cacheState, hashKey(key));
    expect(cachedValue?.value).toEqual(value);
    expect(cachedValue?.invalid).toEqual(false);
  });

  it('should be able to delete a cache value using store', () => {
    const cacheStore = new CacheStore({ clearExpiredEvery: 0 });
    const key = ['test', { a: 1, b: '2' }];
    const value = [{ a: 1, b: '2' }];
    const date = Date.now();

    setCacheValue(cacheStore.cacheState, hashKey(key), {
      value,
      date,
      invalid: false,
    });

    cacheStore.delete({ key });
    const cachedValue = getCacheData(cacheStore.cacheState, hashKey(key));
    expect(cachedValue).toBeUndefined();
  });

  it('should be able to invalidate a cache value using store', () => {
    const cacheStore = new CacheStore({ clearExpiredEvery: 0 });
    const key = ['test', { a: 1, b: '2' }];
    const value = [{ a: 1, b: '2' }];
    const date = Date.now();

    setCacheValue(cacheStore.cacheState, hashKey(key), {
      value,
      date,
      invalid: false,
    });

    cacheStore.invalidate({ key });
    const cachedValue = getCacheData(cacheStore.cacheState, hashKey(key));
    expect(cachedValue?.invalid).toEqual(true);
  });
});
