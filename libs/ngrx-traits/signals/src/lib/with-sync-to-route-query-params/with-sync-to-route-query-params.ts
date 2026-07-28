import {
  computed,
  DestroyRef,
  EnvironmentInjector,
  inject,
  Injector,
  runInInjectionContext,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  SignalStoreFeature,
  signalStoreFeature,
  SignalStoreFeatureResult,
  type,
  withHooks,
  withMethods,
  withProps,
} from '@ngrx/signals';
import { concatWith, debounce, defaultIfEmpty, NEVER, timer } from 'rxjs';

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
  onQueryParamsStored?: (store: StoreSource<Input>) => void;
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
  // per instance holder for the last query params this store pushed to the url.
  // It has to live on the store because withHooks writes it and withMethods
  // reads it, and it is symbol keyed so it stays off the store public api.
  const LAST_PUSHED_QUERY_PARAMS = Symbol('lastPushedQueryParams');
  return signalStoreFeature(
    type<Input>(),
    withProps(() => ({
      [LAST_PUSHED_QUERY_PARAMS]: {
        value: undefined as Record<string, unknown> | undefined,
      },
    })),
    withMethods((store) => {
      const injector = inject(Injector);
      const environmentInjector = inject(EnvironmentInjector);
      const destroyRef = inject(DestroyRef);
      const lastPushedQueryParams = store[LAST_PUSHED_QUERY_PARAMS];
      // per store instance, true until the first query params emission has been
      // restored into the store. Mappers receive it so they can force the load
      // and honour skipLoadingCall only on that first restore.
      let firstLoad = true;
      return combineFunctionsInObject(
        {
          loadFromQueryParams: () => {
            const activatedRoute = injector.get(ActivatedRoute);
            activatedRoute.queryParams
              .pipe(
                defaultIfEmpty({}), // Provide default empty object if observable completes without emitting
                takeUntilDestroyed(destroyRef),
              )
              .subscribe((queryParams) => {
                if (
                  shallowEqualParams(lastPushedQueryParams.value, queryParams)
                ) {
                  return;
                }
                runInInjectionContext(environmentInjector, () => {
                  const queryMappers = config.mappers;
                  queryMappers.forEach((mapper) => {
                    mapper.queryParamsToState(
                      queryParams as Params,
                      store as any,
                      firstLoad,
                    );
                  });
                  firstLoad = false;
                  config.onQueryParamsStored?.(store);
                });
              });
          },
        },
        store,
      );
    }),
    withHooks((store) => {
      const router = inject(Router);
      const lastPushedQueryParams = store[LAST_PUSHED_QUERY_PARAMS];
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
              const lastParams: Record<string, unknown> = {
                ...(activatedRoute.snapshot?.queryParams || {}),
                ...queryParams,
              };
              for (const key of Object.keys(lastParams)) {
                // undefined params will be deleted from the url so we should
                // not store them
                if (lastParams[key] === undefined) {
                  delete lastParams[key];
                }
              }
              lastPushedQueryParams.value = lastParams;
              router
                .navigate([], {
                  relativeTo: activatedRoute,
                  queryParams,
                  queryParamsHandling: 'merge',
                })
                .catch((error) => {
                  console.error(
                    'withSyncToRouteQueryParams: failed to sync the store to the route query params',
                    error,
                  );
                });
            });
        },
      };
    }),
  ) as any;
}

function shallowEqualParams(
  a: Record<string, unknown> | undefined,
  b: Record<string, unknown>,
): boolean {
  if (!a) return false;
  const aKeys = Object.keys(a);
  if (aKeys.length !== Object.keys(b).length) return false;
  return aKeys.every((k) => a[k] === b[k]);
}
