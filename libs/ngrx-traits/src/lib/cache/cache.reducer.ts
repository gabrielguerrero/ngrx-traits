import { createReducer, on } from '@ngrx/store';
import {
  CacheData,
  CacheKeys,
  CacheState,
  hashKey,
  isCacheValid,
} from './cache.models';
import * as CacheActions from './cache.actions';

export const initialState: CacheState = {
  keys: {},
};

export const cacheReducer = createReducer(
  initialState,
  on(CacheActions.cache, (state, { key, value, date, maxCacheSize }) =>
    setCacheValue(
      hashKey(key),
      { value, date, invalid: false },
      state,
      maxCacheSize
    )
  ),
  on(CacheActions.invalidateCache, (state, { key }) => {
    const k = hashKey(key);
    return invalidateCache(k, state);
  }),
  on(CacheActions.deleteCache, (state, { key }) => {
    const k = hashKey(key);
    return deleteCacheValue(k, state);
  }),
  on(CacheActions.hitCache, (state, { key }) => {
    const k = hashKey(key);
    return increaseCacheHitCount(k, state);
  })
);

function setCacheValue(
  keys: string[],
  value: Omit<CacheData, 'hitCount'>,
  state: CacheState,
  maxCacheSize?: number,
  expires?: number
) {
  const newState = { ...state };
  let cache = newState;
  let lastCache: CacheKeys | undefined = undefined;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    cache.keys = cache?.keys ? { ...cache?.keys } : {};
    let v = cache.keys[key];
    v = v ? { ...v } : {};
    cache.keys[key] = v;
    lastCache = cache;
    cache = v;
  }
  cache.data = cache.data
    ? { ...value, hitCount: cache.data.hitCount + 1 }
    : { ...value, hitCount: 1 };

  if (
    maxCacheSize &&
    lastCache?.keys &&
    Object.keys(lastCache.keys).length > maxCacheSize
  ) {
    const entries = findLessHitOrOldestCacheEntries(
      lastCache,
      expires ?? Infinity,
      maxCacheSize
    );
    if (entries && entries.length) {
      for (const [key] of entries) {
        delete lastCache.keys[key];
      }
    }
  }
  return newState;
}

function findLessHitOrOldestCacheEntries(
  state: CacheKeys,
  expires: number,
  maxCacheSize: number
) {
  if (!state.keys) return undefined;
  const entries = Object.entries(state.keys);
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

function deleteCacheValue(keys: string[], state: CacheState) {
  const newState = { ...state };
  let cache = newState;
  for (const key of keys) {
    if (!cache.keys) return state;
    cache.keys = { ...cache?.keys };
    let v = cache.keys[key];
    if (!v) return state;
    v = { ...v };
    cache.keys[key] = v;
    cache = v;
  }
  if (cache.data) delete cache.data;
  else if (cache.keys) delete cache.keys;
  return newState;
}

function invalidateCache(keys: string[], state: CacheState) {
  const newState = { ...state };
  let cache = newState;
  for (const key of keys) {
    if (!cache?.keys) return state;
    cache.keys = { ...cache?.keys };
    let v = cache?.keys?.[key];
    if (!v) return state;
    v = { ...v };
    cache.keys[key] = v;
    cache = v;
  }
  cache && invalidaSubKeys(cache);
  return newState;
}

function increaseCacheHitCount(keys: string[], state: CacheState) {
  const newState = { ...state };
  let cache = newState;
  for (const key of keys) {
    if (!cache?.keys) return state;
    cache.keys = { ...cache?.keys };
    let v = cache?.keys?.[key];
    if (!v) return state;
    v = { ...v };
    cache.keys[key] = v;
    cache = v;
  }
  if (!cache.data) return state;
  cache.data = { ...cache.data, hitCount: cache.data.hitCount + 1 };
  return newState;
}

function invalidaSubKeys(state: CacheKeys) {
  if (state.data) {
    state.data = { ...state.data, invalid: true };
  }
  if (state.keys) {
    state.keys = { ...state.keys };
    for (const key in state.keys) {
      state.keys[key] = invalidaSubKeys({ ...state.keys[key] });
    }
  }
  return state;
}
