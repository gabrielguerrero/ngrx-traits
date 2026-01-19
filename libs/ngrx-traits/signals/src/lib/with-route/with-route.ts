import { computed, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  NavigationEnd,
  Params,
  Router,
} from '@angular/router';
import { signalStoreFeature, withComputed } from '@ngrx/signals';
import { filter, map, startWith } from 'rxjs/operators';

/**
 * Store feature that provides access to route params, query params, and route data.
 * Creates a computed signal for each property returned by the mapParams function.
 *
 * @param mapParams Function receiving `{ params, queryParams, data }` and returning an object.
 *
 * @example
 * // Combined params, queryParams and data
 * const Store = signalStore(
 *   withRoute(({ params, queryParams, data }) => ({
 *     id: params['id'] as string,
 *     tab: queryParams['tab'] as string,
 *     title: data?.['title'] as string,
 *   })),
 *   withHooks(({ id, tab, title }) => ({
 *     onInit: () => console.log(`Product ID: ${id()}, tab: ${tab()}, title:${title()}` ),
 *   })),
 * );
 */
export function withRoute<T extends Record<string, any>>(
  mapParams: (options: {
    params: Params;
    queryParams: Params;
    data?: {
      [key: string | symbol]: any;
    };
  }) => T,
) {
  return signalStoreFeature(
    withComputed(() => {
      const activatedRoute = inject(ActivatedRoute);
      const router = inject(Router);

      // Fallback to direct params observable if router events don't provide snapshot
      const directParamsSignal = toSignal(activatedRoute.params);

      // Listen to router events and extract params from the entire route tree
      const paramsSignal = toSignal(
        router.events.pipe(
          filter((event) => event instanceof NavigationEnd),
          startWith(null),
          map(() => {
            // If snapshot is not available, return null to use fallback
            if (!activatedRoute.snapshot) {
              return null;
            }
            let route = activatedRoute.snapshot;
            // Navigate to the root of the route tree
            while (route.parent) {
              route = route.parent;
            }
            // Extract params from all child routes
            return extractRouteParams(route);
          }),
        ),
      );

      const dataSignal = activatedRoute.data
        ? toSignal(activatedRoute.data)
        : undefined;
      const queryParamSignal = activatedRoute.queryParams
        ? toSignal(activatedRoute.queryParams)
        : undefined;
      const params = computed(() =>
        mapParams({
          params: paramsSignal() ?? directParamsSignal() ?? {},
          data: dataSignal?.(),
          queryParams: queryParamSignal?.() ?? {},
        }),
      );
      const computedParams = {} as any;
      Object.keys(params()).forEach((key) => {
        computedParams[key] = computed(() => params()[key]);
      });
      return computedParams as { [K in keyof T]: Signal<T[K]> };
    }),
  );
}

function extractRouteParams(route: ActivatedRouteSnapshot): Params {
  return route.children.reduce(
    (params, childRoute) => ({ ...params, ...extractRouteParams(childRoute) }),
    { ...route.params },
  );
}
