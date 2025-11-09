import { Provider } from '@angular/core';
import { from, isObservable, lastValueFrom, Observable, of, tap } from 'rxjs';

import { CacheStore } from './cache-store';
import { CacheKey } from './cache.model';
import {
  getCacheEntry,
  hashKey,
  increaseCacheHitCount,
  isCacheValid,
  setCacheValue,
} from './cache.utils';

let globalCache = new CacheStore({ clearExpiredEvery: 10 * 60 * 1000 });

export function setGlobalCache(cache: CacheStore) {
  globalCache.ngOnDestroy();
  globalCache = cache;
}

export function getGlobalCache() {
  return globalCache;
}

/**
 * Return the cached results of the key if available, otherwise return the value of source and cache it
 * @param options
 */
export function cacheCall<T>({
  key,
  call,
  expires,
  maxCacheSize,
  skip,
  cacheStore,
}: {
  key: CacheKey;
  call: () => Promise<T>;
  expires?: number;
  maxCacheSize?: number;
  skip?: boolean;
  cacheStore?: CacheStore;
}): Promise<T> {
  const cs = cacheStore ?? getGlobalCache();
  const exp = expires ?? Infinity;
  const keys = hashKey(key);
  const cache = getCacheEntry(cs.cacheState, keys);
  const isValid =
    cache && !skip && !cs.skipAllCache && isCacheValid(cache, exp);
  if (isValid) {
    increaseCacheHitCount(cs.cacheState, keys);
    return Promise.resolve(cache.value);
  } else {
    return call().then((value) => {
      setCacheValue(
        cs.cacheState,
        keys,
        { value, date: Date.now(), invalid: false },
        maxCacheSize,
      );
      return value;
    });
  }
}

/**
 * Return the cached results of the key if available, otherwise return the value of source and cache it
 * @param options
 */
export function cacheRxCall<T>({
  key,
  call,
  expires,
  maxCacheSize,
  skip,
  cacheStore,
}: {
  key: CacheKey;
  call: Observable<T>;
  expires?: number;
  maxCacheSize?: number;
  skip?: boolean;
  cacheStore?: CacheStore;
}): Observable<T> {
  const cs = cacheStore ?? getGlobalCache();
  const exp = expires ?? Infinity;
  const keys = hashKey(key);
  const cache = getCacheEntry(cs.cacheState, keys);
  const isValid =
    cache && !skip && !cs.skipAllCache && isCacheValid(cache, exp);
  if (isValid) {
    increaseCacheHitCount(cs.cacheState, keys);
    return of(cache.value);
  } else {
    return call.pipe(
      tap((value) => {
        setCacheValue(
          cs.cacheState,
          keys,
          { value, date: Date.now(), invalid: false },
          maxCacheSize,
        );
        return value;
      }),
    );
  }
}

export function provideCacheStore(cacheStore: CacheStore): Provider[] {
  return [
    {
      provide: CacheStore,
      useValue: cacheStore,
    },
  ];
}
