import { CacheData, CacheKey, CacheKeys, CacheState } from './cache.model';

function hash(key: string | object): string {
  return JSON.stringify(key, (_, val) =>
    typeof val == 'object'
      ? Object.keys(val)
          .sort()
          .reduce((result, k) => {
            result[k] = val[k];
            return result;
          }, {} as any)
      : val,
  );
}

export function hashKey(key: CacheKey): string[] {
  return typeof key === 'string'
    ? [key]
    : key.map((k) => {
        return typeof k === 'string' ? k : hash(k);
      });
}
export function getCacheData(
  state: CacheState,
  keys: string[],
): CacheData | undefined {
  let parent: CacheKeys | undefined = state;
  for (const key of keys) {
    parent = parent?.keys?.get(key);
    if (!parent) return undefined;
  }
  return parent?.data;
}

export function isCacheValid(cache: CacheData, exp: number) {
  return !cache.invalid && Date.now() <= cache.date + exp;
}

export function setCacheValue(
  cacheState: CacheState,
  keys: string[],
  value: Omit<CacheData, 'hitCount'>,
  maxCacheSize?: number,
  expires?: number,
) {
  let cache = cacheState;
  let lastCache: CacheKeys | undefined = undefined;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    cache.keys = cache?.keys ?? new Map<string, CacheKeys>();
    let v = cache.keys.get(key);
    v = v ?? ({} as CacheKeys);
    cache.keys.set(key, v);
    lastCache = cache;
    cache = v;
  }
  cache.data = cache.data
    ? { ...value, hitCount: cache.data.hitCount + 1, expires }
    : { ...value, hitCount: 1, expires };

  if (maxCacheSize && lastCache?.keys && lastCache.keys.size > maxCacheSize) {
    const entries = findLessHitOrOldestCacheEntries(
      lastCache,
      expires ?? Infinity,
      maxCacheSize,
    );
    if (entries && entries.length) {
      for (const [key] of entries) {
        lastCache.keys.delete(key);
      }
    }
  }
}

export function findLessHitOrOldestCacheEntries(
  state: CacheKeys,
  expires: number,
  maxCacheSize: number,
) {
  if (!state.keys) return undefined;
  const entries = [...state.keys.entries()];
  // find the newest key;
  const [newestKey] = entries.reduce((a, b) => {
    const aDate = a[1].data?.date ?? 0;
    const bDate = b[1].data?.date ?? 0;
    return aDate > bDate ? a : b;
  });
  const sorted = entries.sort(([aKey, aValue], [bKey, bValue]) => {
    // ensures the newest key always wins
    if (aKey === newestKey) return -1;
    if (bKey === newestKey) return 1;
    const aValid = aValue.data && isCacheValid(aValue.data, expires) ? 1 : 0;
    const bValid = bValue.data && isCacheValid(bValue.data, expires) ? 1 : 0;
    const diffValid = aValid - bValid;
    const diffHit = (aValue.data?.hitCount ?? 0) - (bValue.data?.hitCount ?? 0);
    const diffDate = (aValue.data?.date ?? 0) - (bValue.data?.date ?? 0);
    return (
      -1 * (diffValid === 0 ? (diffHit === 0 ? diffDate : diffHit) : diffValid)
    );
  });
  return sorted.slice(maxCacheSize);
}

export function deleteCache(cacheState: CacheState, keys: string[]) {
  let cache = cacheState;
  for (const key of keys) {
    if (!cache.keys) return;
    let v = cache.keys.get(key);
    if (!v) return;
    cache = v;
  }
  if (cache.data) delete cache.data;
  else if (cache.keys) delete cache.keys;
}

export function invalidateCache(cacheState: CacheState, keys: string[]) {
  let cache = cacheState;
  for (const key of keys) {
    if (!cache?.keys) return;
    let v = cache?.keys?.get(key);
    if (!v) return;
    cache = v;
  }
  cache && invalidateSubKeys(cache);
}

export function increaseCacheHitCount(cacheState: CacheState, keys: string[]) {
  let cache = cacheState;
  for (const key of keys) {
    if (!cache?.keys) return;
    let v = cache?.keys?.get(key);
    if (!v) return;
    cache = v;
  }
  if (!cache.data) return;
  cache.data = { ...cache.data, hitCount: cache.data.hitCount + 1 };
}

export function invalidateSubKeys(state: CacheKeys) {
  if (state.data) {
    state.data = { ...state.data, invalid: true };
  }
  if (state.keys) {
    for (const key in state.keys) {
      const cache = state.keys.get(key);
      cache && invalidateSubKeys(cache);
    }
  }
  return state;
}
export function getCacheEntry(cacheState: CacheState, keys: string[]) {
  let parent = cacheState as CacheKeys | undefined;
  for (const key of keys) {
    parent = parent?.keys?.get(key);
    if (!parent) return undefined;
  }
  return parent?.data;
}

export function deleteExpiredOrInvalidCache(cacheState: CacheState) {
  const entries = cacheState.keys ? [...cacheState.keys.entries()] : [];
  for (const [key, value] of entries) {
    if (
      value.data &&
      (value.data.invalid ||
        Date.now() > value.data.date + (value.data.expires ?? Infinity))
    ) {
      cacheState.keys?.delete(key);
    } else if (value.keys) {
      deleteExpiredOrInvalidCache(value);
    }
  }
}
export function clearCache(cacheState: CacheState) {
  const entries = cacheState.keys ? [...cacheState.keys.entries()] : [];
  for (const [key, value] of entries) {
    if (value.data) {
      cacheState.keys?.clear();
    } else if (value.keys) {
      clearCache(value);
    }
  }
  cacheState.keys?.clear();
}
