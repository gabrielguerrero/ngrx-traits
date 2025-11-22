import { effect, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Product } from '@example-api/shared/models';
import {
  callConfig,
  withAllCallStatus,
  withCalls,
  withCallStatus,
  withEntitiesLoadingCall,
  withEntitiesLocalFilter,
  withEntitiesLocalPagination,
  withEntitiesLocalSort,
  withEntitiesSingleSelection,
  withEntitiesSyncToRouteQueryParams,
} from '@ngrx-traits/signals';
import {
  signalStore,
  signalStoreFeature,
  type,
  withHooks,
} from '@ngrx/signals';
import { entityConfig, withEntities } from '@ngrx/signals/entities';
import { map } from 'rxjs/operators';

import { OrderService } from '../../services/order.service';
import { ProductService } from '../../services/product.service';

const productsEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'products',
});
export const ProductsLocalStore = signalStore(
  { providedIn: 'root' },
  withErrorSnackbar(),
  withEntities(productsEntityConfig),
  withCallStatus({ ...productsEntityConfig, initialValue: 'loading' }),
  withEntitiesLocalPagination({
    ...productsEntityConfig,
    pageSize: 5,
  }),
  withEntitiesLocalFilter({
    ...productsEntityConfig,
    defaultFilter: { search: '' },
    filterFn: (entity, filter) =>
      !filter?.search ||
      entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
  }),
  withEntitiesLocalSort({
    ...productsEntityConfig,
    defaultSort: { field: 'name', direction: 'asc' },
  }),
  withEntitiesSingleSelection(productsEntityConfig),
  withEntitiesLoadingCall({
    ...productsEntityConfig,
    fetchEntities: () => {
      return inject(ProductService)
        .getProducts()
        .pipe(map((d) => d.resultList));
    },
  }),
  withCalls(({ productsEntitySelected }) => ({
    loadProductDetail: callConfig({
      call: ({ id }: { id: string }) =>
        inject(ProductService).getProductDetail(id),
      resultProp: 'productDetail',
      // call load the product detail when a product is selected
      callWith: productsEntitySelected,
      // productsEntitySelected is of type Signal<Product | undefined> so it can be pass directly to callWith
      // because it matches the type the call parameter, but you can use a function as bellow if it doesn't
      // callWith: () =>
      //   productsEntitySelected()
      //     ? { id: productsEntitySelected()!.id }
      //     : undefined, // if no product is selected, skip call
    }),

    checkout: () => inject(OrderService).checkout(),
    loadOrderDetail: callConfig({
      call: ({ orderId }: { orderId: string }) =>
        inject(OrderService).getOrderDetail(orderId),
      resultProp: 'orderDetail',
    }),
  })),
  // loadProductDetail callWith is equivalent to:
  // withHooks((store) => {
  //   return {
  //     onInit() {
  //       toObservable(store.productsEntitySelected)
  //         .pipe(filter((v) => !!v))
  //         .subscribe((v) => {
  //           store.loadProductDetail({ id: v!.id });
  //         });
  //   };
  // }),
  withEntitiesSyncToRouteQueryParams(productsEntityConfig),
);

export function withErrorSnackbar() {
  return signalStoreFeature(
    withAllCallStatus(),
    withHooks((store, snackBar = inject(MatSnackBar)) => ({
      onInit: () => {
        effect(() => {
          const errors = store.callsErrors();
          if (errors.length > 0) {
            snackBar.open('Error processing Call', 'Close', {
              duration: 5000,
            });
          }
        });
      },
    })),
  );
}
