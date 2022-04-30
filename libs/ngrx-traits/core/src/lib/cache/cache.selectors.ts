import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CacheKey, CacheState, getCacheValue, hashKey } from './cache.models';

export const cacheStateSelector = createFeatureSelector<CacheState>('cache');

export const selectCache = (key: CacheKey) =>
  createSelector(cacheStateSelector, (state) =>
    getCacheValue(hashKey(key), state)
  );
