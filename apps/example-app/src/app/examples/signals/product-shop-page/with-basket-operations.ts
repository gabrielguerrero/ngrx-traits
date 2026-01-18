import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductOrder } from '@example-api/shared/models';
import { cacheRxCall, callConfig, withCalls } from '@ngrx-traits/signals';
import {
  patchState,
  signalStoreFeature,
  type,
  withMethods,
} from '@ngrx/signals';
import {
  addEntities,
  removeEntities,
  updateEntity,
} from '@ngrx/signals/entities';

import { OrderService } from '../../services/order.service';
import { ProductService } from '../../services/product.service';
import {
  OrderEntitiesStoreFeature,
  orderItemEntityConfig,
} from './with-order-entities';
import { ProductEntitiesStoreFeature } from './with-product-entities';

export function withBasketOperations() {
  return signalStoreFeature(
    type<ProductEntitiesStoreFeature & OrderEntitiesStoreFeature>(),
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
    withMethods(
      ({ productEntitySelected, orderItemIdsSelected, ...state }) => ({
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
      }),
    ),
  );
}
