import { computed, inject } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Prettify,
  signalStoreFeature,
  SignalStoreFeatureResult,
  StateSignals,
  type,
  withHooks,
  withState,
  WritableStateSource,
} from '@ngrx/signals';
import { debounce, first, timer } from 'rxjs';

import { StoreSource } from '../with-feature-factory/with-feature-factory.model';
import { QueryMapper } from './with-sync-to-route-query-params.util';

/**
 * Syncs the route query params with the store and back. On init it will load
 * the query params once and set them in the store using the mapper.queryParamsToState, after that
 * and change on the store will be reflected in the query params using the mapper.stateToQueryParams
 * @param config.mappers - The mappers to sync the query params with the store
 * @param config.defaultDebounce - The debounce time to wait before updating the query params from the store
 *
 * @example
 *     const Store = signalStore(
 *       withState({
 *         test: 'test',
 *         foo: 'foo',
 *         bar: false,
 *       }),
 *       withSyncToRouteQueryParams({
 *         mappers: [
 *           {
 *             queryParamsToState: (query, store) => {
 *             // set the query params in the store (only called once on init)
 *               patchState(store, {
 *                 test: query.test,
 *                 foo: query.foo,
 *                 bar: query.bar === 'true',
 *               });
 *             },
 *             stateToQueryParams: (store) =>
 *               // return the query params to be set in the route
 *               computed(() => ({
 *                 test: store.test(),
 *                 foo: store.foo(),
 *                 bar: store.bar().toString(),
 *               })),
 *           },
 *         ],
 *         defaultDebounce: debounce,
 *       }),
 *     );
 */
export function withSyncToRouteQueryParams<
  Input extends SignalStoreFeatureResult,
  Params extends Record<string, any>,
  Mappers extends ReadonlyArray<QueryMapper<any, StoreSource<Input>>>,
>(config: { mappers: Mappers; defaultDebounce?: number }) {
  return signalStoreFeature(
    type<Input>(),
    withState({}),
    withHooks((store: Record<string, any>) => {
      const router = inject(Router);

      return {
        onInit: () => {
          const activatedRoute = inject(ActivatedRoute);
          activatedRoute.queryParams
            .pipe(first(), takeUntilDestroyed())
            .subscribe((queryParams) => {
              const queryMappers = config.mappers;
              queryMappers.forEach((mapper) => {
                mapper.queryParamsToState(queryParams as Params, store as any);
              });
            });

          const changesSignals = config.mappers
            .map((mapper) => mapper.stateToQueryParams(store as any))
            .filter((mapper) => !!mapper);

          const computedChanges = computed(() => {
            const queryParams = changesSignals.reduce((acc, mapper) => {
              return {
                ...acc,
                ...mapper?.(),
              };
            }, {});
            return queryParams;
          });

          toObservable(computedChanges)
            .pipe(debounce(() => timer(config.defaultDebounce ?? 300)))
            .subscribe((queryParams) => {
              router.navigate([], {
                relativeTo: activatedRoute,
                queryParams,
                queryParamsHandling: 'merge',
              });
            });
        },
      };
    }),
  );
}
