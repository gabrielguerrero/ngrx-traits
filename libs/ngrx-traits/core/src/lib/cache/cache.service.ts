import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { CacheData, CacheKey, isCacheValid } from './cache.models';
import { selectCache } from './cache.selectors';
import { concatMap, first, tap } from 'rxjs/operators';
import * as CacheActions from './cache.actions';

/**
 * Cache the result of source parameter using the provided key, when call
 * again if the cache is valid (exist and is not expired or invalidated)
 * it will return the cache value without calling again source
 * @example
 * // cache for 3 min
 * loadStores$ = createEffect(() => {
 *   return this.actions$.pipe(
 *     ofType(ProductStoreActions.loadStores),
 *     exhaustMap(() =>
 *       cache({
 *         key: ['stores'],
 *         store: this.store,
 *         source: this.storeService.getStores(),
 *         expire: 1000 * 60 * 3 // optional param , cache forever if not present
 *       }).pipe(
 *         map((res) => ProductStoreActions.loadStoresSuccess({ entities: res })),
 *         catchError(() => of(ProductStoreActions.loadStoresFail()))
 *       )
 *     )
 *   );
 * });
 * // cache top 10, for 3 mins
 *   loadDepartments$ = createEffect(() => {
 *   return this.actions$.pipe(
 *     ofType(this.localActions.loadDepartments),
 *     concatLatestFrom(() =>
 *       this.store.select(this.localSelectors.selectDepartmentsFilter)
 *     ),
 *     exhaustMap(([_, filters]) =>
 *       cache({
 *         key: ['stores','departments',{ storeId: filters!.storeId },
 *         store: this.store,
 *         source: this.storeService.getStoreDepartments(filters!.storeId),
 *         expires: 1000 * 60 * 3,
 *         maxCacheSize: 10,
 *       }).pipe(
 *         map((res) =>
 *           this.localActions.loadDepartmentsSuccess({
 *             entities: res,
 *           })
 *         ),
 *         catchError(() => of(this.localActions.loadDepartmentsFail()))
 *       )
 *     )
 *   );
 * });
 *
 * @param options - configuration
 * @param options.store - required ngrx store
 * @param options.key - key can be string, array of string or array of string with plain objects
 * @param options.source - called when cache is invalid
 * @param options.expires - time to expire the cache valued, if not present is infinite
 * @param options.maxCacheSize - max number of keys to store , only works if last key is variable
 */
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
