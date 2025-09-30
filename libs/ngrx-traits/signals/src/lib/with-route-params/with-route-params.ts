import { computed, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Params, Router } from '@angular/router';
import { signalStoreFeature, withComputed } from '@ngrx/signals';
import { filter, map, startWith } from 'rxjs/operators';

/**
 * This store feature provides access to the route params. The mapParams receives the route params object, use it to transform it
 * to an object, this will create a computed for each prop return by the mapParams function
 * @param mapParams A function to transform the params before they are stored.
 *
 * @example
 *
 * // example route  /products/:id/
 * const ProductDetailStore = signalStore(
 *   withRouteParams(({ id }) => ({ id })),
 *   withCalls(() => ({
 *     loadProductDetail: (id: string) =>
 *       inject(ProductService).getProductDetail(id),
 *   })),
 *   withHooks(({ loadProductDetail, id }) => ({
 *     onInit: () => {
 *       loadProductDetail(id());
 *     },
 *   })),
 * );
 */
/**
 * Recursively extracts route parameters from the current route and all its children.
 * Parameters from deeper child routes take precedence over parent route parameters.
 */
function extractRouteParams(route: ActivatedRouteSnapshot): Params {
  return route.children.reduce(
    (params, childRoute) => ({ ...params, ...extractRouteParams(childRoute) }),
    { ...route.params }
  );
}

export function withRouteParams<T extends Record<string, any>>(
  mapParams: (params: Params, data?: any) => T,
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
          })
        )
      );

      const dataSignal = activatedRoute.data
        ? toSignal(activatedRoute.data)
        : undefined;
      const params = computed(() =>
        mapParams(paramsSignal() ?? directParamsSignal() ?? {}, dataSignal?.()),
      );
      const computedParams = {} as any;
      Object.keys(params()).forEach((key) => {
        computedParams[key] = computed(() => params()[key]);
      });
      return computedParams as { [K in keyof T]: Signal<T[K]> };
    }),
  );
}
