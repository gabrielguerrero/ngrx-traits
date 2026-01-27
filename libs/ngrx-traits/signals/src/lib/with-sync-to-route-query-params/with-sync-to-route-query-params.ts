import { computed, inject, Injector } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  SignalStoreFeature,
  signalStoreFeature,
  SignalStoreFeatureResult,
  type,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { concatWith, debounce, defaultIfEmpty, NEVER, take, timer } from 'rxjs';

import { combineFunctionsInObject } from '../util';
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
>(config: {
  mappers: Mappers;
  defaultDebounce?: number;
  restoreOnInit?: boolean;
}): SignalStoreFeature<
  Input,
  {
    state: {};
    props: {};
    methods: {
      loadFromQueryParams: () => void;
    };
  }
> {
  return signalStoreFeature(
    type<Input>(),
    withState({}),
    withMethods((store) => {
      const injector = inject(Injector);
      return combineFunctionsInObject(
        {
          loadFromQueryParams: () => {
            const activatedRoute = injector.get(ActivatedRoute);
            activatedRoute.queryParams
              .pipe(
                take(1),
                defaultIfEmpty({}), // Provide default empty object if observable completes without emitting
              )
              .subscribe((queryParams) => {
                const queryMappers = config.mappers;
                queryMappers.forEach((mapper) => {
                  mapper.queryParamsToState(
                    queryParams as Params,
                    store as any,
                  );
                });
              });
          },
        },
        store,
      );
    }),
    withHooks((store) => {
      const router = inject(Router);

      return {
        onInit: () => {
          if (config.restoreOnInit ?? true) {
            store.loadFromQueryParams();
          }

          const activatedRoute = inject(ActivatedRoute);
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
            .pipe(
              concatWith(NEVER),
              debounce(() => timer(config.defaultDebounce ?? 300)),
              takeUntilDestroyed(),
            )
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
  ) as any;
}
