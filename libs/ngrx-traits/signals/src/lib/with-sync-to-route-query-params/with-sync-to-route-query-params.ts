import {
  computed,
  DestroyRef,
  EnvironmentInjector,
  inject,
  Injectable,
  Injector,
  runInInjectionContext,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import {
  SignalStoreFeature,
  signalStoreFeature,
  SignalStoreFeatureResult,
  type,
  withHooks,
  withMethods,
} from '@ngrx/signals';
import { concatWith, debounce, defaultIfEmpty, NEVER, timer } from 'rxjs';

import { combineFunctionsInObject } from '../util';
import { StoreSource } from '../with-feature-factory/with-feature-factory.model';
import { QueryMapper } from './with-sync-to-route-query-params.util';

/**
 * Syncs the route query params with the store and back. On init it will load
 * the query params once and set them in the store using the mapper.queryParamsToState, after that
 * and change on the store will be reflected in the query params using the mapper.stateToQueryParams.
 * URL changes made outside the sync features (links, back/forward, app code)
 * restore every sync store, which may overwrite changes still waiting on their
 * debounce (mappers that skip missing keys don't); the stores' own pushes are
 * not restored unless a guard redirects them.
 * A push made while another navigation runs may be lost, the url catches up on
 * the store's next change.
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
  Mappers extends ReadonlyArray<QueryMapper<any, StoreSource<Input>, Input>>,
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
  return signalStoreFeature(
    type<Input>(),
    withMethods((store) => {
      const injector = inject(Injector);
      const environmentInjector = inject(EnvironmentInjector);
      const destroyRef = inject(DestroyRef);
      const navigator = inject(QueryParamsSyncNavigator);
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
                // a sync navigation only writes values the stores already
                // hold, restoring it could overwrite a change still waiting on
                // its debounce, so only url changes made elsewhere (a link,
                // back/forward, the app) are restored
                if (!firstLoad && navigator.isSyncNavigation()) {
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
      const navigator = inject(QueryParamsSyncNavigator);
      return {
        onInit: () => {
          if (config.restoreOnInit ?? true) {
            store.loadFromQueryParams();
          }

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
          // the first push only reflects the initial state into the url, so it
          // replaces the current history entry rather than adding one.
          // Otherwise every sync feature in the store would cost the user an
          // extra back navigation to get off the page.
          let firstPush = true;
          toObservable(computedChanges)
            .pipe(
              concatWith(NEVER),
              debounce(() => timer(config.defaultDebounce ?? 300)),
              takeUntilDestroyed(),
            )
            .subscribe((queryParams) => {
              navigator.push(queryParams, { replaceUrl: firstPush });
              firstPush = false;
            });
        },
      };
    }),
  ) as any;
}

/**
 * Compares values the way the url stores them: as strings, a one item array
 * as a single value, and a null or undefined param as a missing one.
 */
function sameUrlValue(a: unknown, b: unknown): boolean {
  // the router drops a null param, but writes null array items as 'null'
  const toUrlValues = (value: unknown) =>
    value == null ? [] : (Array.isArray(value) ? value : [value]).map(String);
  const aValues = toUrlValues(a);
  const bValues = toUrlValues(b);
  return (
    aValues.length === bValues.length &&
    aValues.every((value, i) => value === bValues[i])
  );
}

type PendingPush = {
  queryParams: Record<string, unknown>;
  replaceUrl: boolean;
};

/**
 * Writes the query params pushes of every sync feature to the url, one
 * navigation at a time. The router merges query params against the url of the
 * last completed navigation, and a new navigation cancels the one in flight,
 * so pushes landing while a sync navigation runs wait for it and then go
 * together in the next one. A navigation from elsewhere, a guard redirect of
 * a sync one included, wins: pushes waiting or landing while it runs are
 * dropped rather than cancelling it, and a sync navigation it cancels is
 * lost. If it changed the store params the stores are restored, otherwise the
 * url catches up on the store's next change.
 */
@Injectable({ providedIn: 'root' })
class QueryParamsSyncNavigator {
  private router = inject(Router);
  private pending: PendingPush | undefined;
  private navigating = false;
  // id of the last sync navigation. A redirect of it gets a new id, so it is
  // seen as a navigation from elsewhere
  private syncNavigationId: number | undefined;

  constructor() {
    this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof NavigationStart && !this.isSyncNavigation()) {
        this.pending = undefined;
      }
    });
  }

  isSyncNavigation(): boolean {
    const id = this.router.currentNavigation()?.id;
    return id !== undefined && id === this.syncNavigationId;
  }

  push(
    queryParams: Record<string, unknown>,
    { replaceUrl }: Omit<PendingPush, 'queryParams'>,
  ) {
    // a navigation from elsewhere is running, it may leave the page and
    // restores the stores if it changes their params
    if (this.router.currentNavigation() && !this.isSyncNavigation()) return;
    this.pending = {
      queryParams: { ...this.pending?.queryParams, ...queryParams },
      // a user change must keep its history entry even when an initial push,
      // which replaces it, goes in the same navigation
      replaceUrl: (this.pending?.replaceUrl ?? true) && replaceUrl,
    };
    this.flush();
  }

  private flush() {
    if (this.navigating) return;
    const next = this.pending;
    this.pending = undefined;
    // defensive: the push guard and the NavigationStart drop normally keep
    // pending empty while a navigation from elsewhere runs, this makes sure
    // the push never reads a stale url or cancels that navigation anyway
    if (!next || this.router.currentNavigation()) return;
    const current: Record<string, unknown> =
      this.router.routerState.snapshot.root.queryParams;
    if (
      Object.entries(next.queryParams).every(([key, value]) =>
        sameUrlValue(value, current[key]),
      )
    ) {
      return;
    }
    let navigation: Promise<boolean>;
    try {
      // without relativeTo the router keeps the current url path, a route
      // the store was on may be gone by now
      navigation = this.router.navigate([], {
        queryParams: next.queryParams,
        queryParamsHandling: 'merge',
        preserveFragment: true,
        // with router scrolling enabled every push would scroll the page to
        // the top or to the fragment anchor
        scroll: 'manual',
        // replaceUrl defaults to false, so it is only set when needed to keep
        // the navigation extras unchanged for later pushes
        ...(next.replaceUrl ? { replaceUrl: true } : {}),
      });
    } catch (error) {
      logSyncError(error);
      return;
    }
    // the router starts the navigation synchronously
    this.syncNavigationId = this.router.currentNavigation()?.id;
    this.navigating = true;
    navigation.catch(logSyncError).finally(() => {
      // the router has cleared the navigation by now, so the pushes that
      // waited for it are not mistaken for waiting on one from elsewhere
      this.navigating = false;
      this.flush();
    });
  }
}

function logSyncError(error: unknown) {
  console.error(
    'withSyncToRouteQueryParams: failed to sync the store to the route query params',
    error,
  );
}
