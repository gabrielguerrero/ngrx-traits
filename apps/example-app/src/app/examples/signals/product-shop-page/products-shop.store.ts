import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Product, ProductOrder } from '@example-api/shared/models';
import {
  cacheRxCall,
  callConfig,
  withCalls,
  withCallStatus,
  withEntitiesLoadingCall,
  withEntitiesLocalPagination,
  withEntitiesLocalSort,
  withEntitiesMultiSelection,
  withEntitiesRemoteFilter,
  withEntitiesRemotePagination,
  withEntitiesRemoteSort,
  withEntitiesSingleSelection,
  withLogger,
  withSyncToWebStorage,
} from '@ngrx-traits/signals';
import {
  patchState,
  signalStore,
  signalStoreFeature,
  type,
  withMethods,
} from '@ngrx/signals';
import {
  addEntities,
  entityConfig,
  removeEntities,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { lastValueFrom, of } from 'rxjs';

import { OrderService } from '../../services/order.service';
import { ProductService } from '../../services/product.service';

/**
 * The store for the products shop page
 * This store is used to manage the products and the order items,
 * it has two collections, one for the products and one for the order items.
 * I implemented all in one store mainly for simplicity, but you can split it
 * into two stores if you prefer. I also wanted to show how you can use multiple
 * collections in one store, at the moment of writing this comment, signalStore
 * method can only have 9 parameters, and you can easily reach this limit if you
 * have multiple collections in one store, the way to solve this group the store
 * features using signalStoreFeature, for this case we did two groups,
 * productsStoreFeature and orderItemsStoreFeature.
 */
const productEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'product',
});
const productsStoreFeature = signalStoreFeature(
  withEntities(productEntityConfig),
  withCallStatus({
    ...productEntityConfig,
    initialValue: 'loading',
    errorType: type<string>(),
  }),
  withEntitiesRemoteFilter({
    ...productEntityConfig,
    defaultFilter: { search: '' },
  }),
  withEntitiesRemotePagination({
    ...productEntityConfig,
    pageSize: 10,
  }),
  withEntitiesRemoteSort({
    ...productEntityConfig,
    defaultSort: { field: 'name', direction: 'asc' },
  }),
  withEntitiesSingleSelection(productEntityConfig),
);

const orderItemEntityConfig = entityConfig({
  entity: type<ProductOrder>(),
  collection: 'orderItem',
});
const orderItemsStoreFeature = signalStoreFeature(
  withEntities(orderItemEntityConfig),
  withEntitiesLocalSort({
    ...orderItemEntityConfig,
    defaultSort: { field: 'name', direction: 'asc' },
  }),
  withEntitiesMultiSelection(orderItemEntityConfig),
  withEntitiesLocalPagination({
    ...orderItemEntityConfig,
    pageSize: 10,
  }),
  withLogger({
    name: 'orderItemStore',
    showDiff: true,
    // filter: ({ orderItemEntityMap, orderItemIds }) => ({
    //   orderItemEntityMap,
    //   orderItemIds,
    // }),
    filter: ['orderItemIdsSelected'],
  }),
  withSyncToWebStorage({
    key: 'orderItems',
    type: 'session',
    filterState: ({ orderItemEntityMap, orderItemIds }) => ({
      orderItemEntityMap,
      orderItemIds,
    }),
  }),
);

export const ProductsShopStore = signalStore(
  { providedIn: 'root' },
  productsStoreFeature,
  orderItemsStoreFeature,
  withEntitiesLoadingCall(
    (
      { productEntitiesPagedRequest, productEntitiesFilter, productEntitiesSort },
      service = inject(ProductService),
    ) => ({
      ...productEntityConfig,
      fetchEntities: async () => {
        const query = {
          search: productEntitiesFilter().search,
          skip: productEntitiesPagedRequest().startIndex,
          take: productEntitiesPagedRequest().size,
          sortAscending: productEntitiesSort().direction === 'asc',
          sortColumn: productEntitiesSort().field,
        };
        const source = cacheRxCall({
          key: ['products', query],
          call: service.getProducts(query),
          maxCacheSize: 5,
        });
        const res = await lastValueFrom(source);
        return { entities: res.resultList, total: res.total };
      },
      mapError: (error) => (error as Error).message,
    }),
  ),
  withCalls(
    (
      { orderItemEntities },
      snackBar = inject(MatSnackBar),
      service = inject(ProductService),
    ) => ({
      loadProductDetail: ({ id }: { id: string }) =>
        cacheRxCall({
          key: ['products', id],
          call: service.getProductDetail(id),
          maxCacheSize: 3,
        }),
      checkout: callConfig({
        call: () =>
          inject(OrderService).checkout(
            ...orderItemEntities().map((p) => ({
              productId: p.id,
              quantity: p.quantity!,
            })),
          ),
        resultProp: 'orderNumber',
        onSuccess: (orderId) => {
          snackBar.open(`Order number: ${orderId}`, 'Close', {
            duration: 5000,
          });
        },
        mapError: (error) => (error as Error).message,
        onError: (error) => {
          snackBar.open(error, 'Close', {
            duration: 5000,
          });
        },
      }),
    }),
  ),
  withMethods(({ productEntitySelected, orderItemIdsSelected, ...state }) => ({
    addProductToBasket: () => {
      const product = productEntitySelected();
      if (product) {
        patchState(
          state,
          addEntities(
            [{ ...product, quantity: 1 } as ProductOrder],
            orderItemEntityConfig,
          ),
        );
      }
    },
    updateProductInBasket: ({ id, quantity }: ProductOrder) => {
      patchState(
        state,
        updateEntity({ id, changes: { quantity } }, orderItemEntityConfig),
      );
    },
    removeProductsFromBasket: () => {
      if (orderItemIdsSelected().length) {
        patchState(
          state,
          removeEntities(orderItemIdsSelected(), orderItemEntityConfig),
        );
      }
    },
  })),
);
