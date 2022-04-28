import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { CacheData, CacheKey, isCacheValid } from './cache.models';
import { selectCache } from './cache.selectors';
import { concatMap, first, tap } from 'rxjs/operators';
import * as CacheActions from './cache.actions';

export function cache<T>({
  store,
  key,
  source,
  expires,
  maxCacheSize,
}: {
  store: Store;
  key: CacheKey;
  source: Observable<T>;
  expires?: number;
  maxCacheSize?: number;
}) {
  const exp = expires ?? Infinity;
  return store.select(selectCache(key)).pipe(
    first(),
    concatMap((cache) =>
      cache && isCacheValid(cache, exp)
        ? of(cache.value).pipe(
            tap(() => store.dispatch(CacheActions.hitCache({ key })))
          )
        : source.pipe(
            tap((value) =>
              store.dispatch(
                CacheActions.cache({
                  key,
                  date: Date.now(),
                  value,
                  maxCacheSize,
                })
              )
            )
          )
    )
  );
}
