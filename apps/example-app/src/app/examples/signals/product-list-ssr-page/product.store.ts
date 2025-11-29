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
  withServerStateTransfer,
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
  collection: 'product',
});

export const ProductsSSRStore = signalStore(
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
  withCalls(({ productEntitySelected }) => ({
    loadProductDetail: callConfig({
      call: ({ id }: { id: string }) =>
        inject(ProductService).getProductDetail(id),
      resultProp: 'productDetail',
      // Skip call if param undefined or the selected product
      // is the same as the previous one
      skipWhen: (param, previousResult) =>
        !param || (!!previousResult && previousResult.id === param?.id),
      // call when selected product changes
      callWith: productEntitySelected,
    }),
    checkout: () => inject(OrderService).checkout(),
  })),
  // Sync filter, pagination, sort to URL query params
  withEntitiesSyncToRouteQueryParams(productsEntityConfig),
  // Transfer state from server to client for SSR hydration
  withServerStateTransfer({
    key: 'product-list-ssr',
  }),
  // be sure to put loading call last, so any state updates are done before loading
  withEntitiesLoadingCall({
    ...productsEntityConfig,
    fetchEntities: () => {
      return inject(ProductService)
        .getProducts()
        .pipe(map((d) => d.resultList));
    },
  }),
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
