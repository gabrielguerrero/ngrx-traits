import { createAction, props } from '@ngrx/store';
import { CacheKey } from './cache.models';

export const cache = createAction(
  '[Cache] Cache',
  props<{
    key: CacheKey;
    value: any;
    date: number;
    maxCacheSize?: number;
    expires?: number;
  }>()
);
export const hitCache = createAction(
  '[Cache] Hit Cache',
  props<{ key: CacheKey }>()
);
export const invalidateCache = createAction(
  '[Cache] Invalidate Cache',
  props<{ key: CacheKey }>()
);
export const deleteCache = createAction(
  '[Cache] Delete Cache',
  props<{ key: CacheKey }>()
);
