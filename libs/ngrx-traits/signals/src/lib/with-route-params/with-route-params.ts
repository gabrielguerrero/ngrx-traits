import { computed, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params } from '@angular/router';
import { signalStoreFeature, withComputed } from '@ngrx/signals';

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
export function withRouteParams<T extends Record<string, any>>(
  mapParams: (params: Params, data?: any) => T,
) {
  return signalStoreFeature(
    withComputed(() => {
      const activatedRoute = inject(ActivatedRoute);
      const paramsSignal = toSignal(activatedRoute.params);
      const dataSignal = activatedRoute.data
        ? toSignal(activatedRoute.data)
        : undefined;
      const params = computed(() =>
        mapParams(paramsSignal() ?? {}, dataSignal?.()),
      );
      const computedParams = {} as any;
      Object.keys(params()).forEach((key) => {
        computedParams[key] = computed(() => params()[key]);
      });
      return computedParams as { [K in keyof T]: Signal<T[K]> };
    }),
  );
}
