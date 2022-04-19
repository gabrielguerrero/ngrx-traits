export * from './cache.service';
export * from './cache.module';
import { invalidateCache, deleteCache } from './cache.actions';
import { selectCache } from './cache.selectors';
export const CacheActions = { invalidateCache, deleteCache };
export const CacheSelectors = { getCache: selectCache };
