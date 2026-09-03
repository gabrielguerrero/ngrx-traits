import { deleteCache, invalidateCache } from './cache.actions';
import { selectCache } from './cache.selectors';

export * from './cache.service';
export * from './cache.module';

export const CacheActions = { invalidateCache, deleteCache };
export const CacheSelectors = { getCache: selectCache };
