import { Inject, OnDestroy } from '@angular/core';
import { from, isObservable, lastValueFrom, Observable, of, tap } from 'rxjs';

import { CacheKey, CacheState, CacheValue } from './cache.model';
import {
  clearCache,
  deleteCache,
  deleteExpiredOrInvalidCache,
  getCacheEntry,
  hashKey,
  increaseCacheHitCount,
  invalidateCache,
  isCacheValid,
  setCacheValue,
} from './cache.utils';

@Inject({})
export class CacheStore implements OnDestroy {
  cacheState: CacheState = {};
  skipAllCache = false;
  private intervalCancelKey: any;

  constructor({ clearExpiredEvery }: { clearExpiredEvery: number }) {
    if (clearExpiredEvery > 0) {
      this.intervalCancelKey = setInterval(
        () => deleteExpiredOrInvalidCache(this.cacheState),
        clearExpiredEvery,
      );
    }
  }

  get({ key }: { key: CacheKey }) {
    const keys = hashKey(key);
    const cache = getCacheEntry(this.cacheState, keys);
    const exp = cache?.expires ?? Infinity;
    const isValid = cache && !this.skipAllCache && isCacheValid(cache, exp);
    return isValid ? cache : undefined;
  }

  set<T extends CacheValue>({
    key,
    value: valueOrFn,
    expires,
    maxCacheSize,
  }: {
    key: CacheKey;
    value: ((previousValue?: T) => T) | T;
    expires?: number;
    maxCacheSize?: number;
  }) {
    const exp = expires ?? Infinity;
    const keys = hashKey(key);
    if (typeof valueOrFn === 'function') {
      const cache = getCacheEntry(this.cacheState, keys);
      const isValid = cache && !this.skipAllCache && isCacheValid(cache, exp);

      const value = isValid ? valueOrFn(cache?.value) : valueOrFn();
      setCacheValue(
        this.cacheState,
        keys,
        { value, date: Date.now(), invalid: false },
        maxCacheSize,
      );
    } else {
      setCacheValue(
        this.cacheState,
        keys,
        { value: valueOrFn, date: Date.now(), invalid: false },
        maxCacheSize,
      );
    }
  }

  invalidate({ key }: { key: CacheKey }) {
    return invalidateCache(this.cacheState, hashKey(key));
  }

  delete({ key }: { key: CacheKey }) {
    return deleteCache(this.cacheState, hashKey(key));
  }

  setSkipCacheForAllCalls(skipAllCache: boolean) {
    this.skipAllCache = skipAllCache;
  }

  clear() {
    clearCache(this.cacheState);
  }

  ngOnDestroy() {
    this.intervalCancelKey && clearInterval(this.intervalCancelKey);
    this.clear();
  }
}
