import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
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
  removeEntities,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { lastValueFrom } from 'rxjs';

import { withLogger } from '../../../../../../../libs/ngrx-traits/signals/src/lib/with-logger/with-logger';
import { Product, ProductOrder } from '../../models';
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
const productsEntity = type<Product>();
const productsCollection = 'products';
const productsStoreFeature = signalStoreFeature(
  withEntities({
    entity: productsEntity,
    collection: productsCollection,
  }),
  withCallStatus({
    initialValue: 'loading',
    collection: productsCollection,
    errorType: type<string>(),
  }),
  withEntitiesRemoteFilter({
    entity: productsEntity,
    collection: productsCollection,
    defaultFilter: { search: '' },
  }),
  withEntitiesRemotePagination({
    entity: productsEntity,
    collection: productsCollection,
    pageSize: 10,
  }),
  withEntitiesRemoteSort({
    entity: productsEntity,
    collection: productsCollection,
    defaultSort: { field: 'name', direction: 'asc' },
  }),
  withEntitiesSingleSelection({
    entity: productsEntity,
    collection: productsCollection,
  }),
);

const orderEntity = type<ProductOrder>();
const orderItemsCollection = 'orderItems';
const orderItemsStoreFeature = signalStoreFeature(
  withEntities({
    entity: orderEntity,
    collection: orderItemsCollection,
  }),
  withEntitiesLocalSort({
    entity: orderEntity,
    collection: orderItemsCollection,
    defaultSort: { field: 'name', direction: 'asc' },
  }),
  withEntitiesMultiSelection({
    entity: orderEntity,
    collection: orderItemsCollection,
  }),
  withEntitiesLocalPagination({
    pageSize: 10,
    entity: orderEntity,
    collection: orderItemsCollection,
  }),
  withLogger({
    name: 'orderItemsStore',
    showDiff: true,
    // filter: ({ orderItemsEntityMap, orderItemsIds }) => ({
    //   orderItemsEntityMap,
    //   orderItemsIds,
    // }),
    filter: ['orderItemsIdsSelected'],
  }),
  withSyncToWebStorage({
    key: 'orderItems',
    type: 'session',
    filterState: ({ orderItemsEntityMap, orderItemsIds }) => ({
      orderItemsEntityMap,
      orderItemsIds,
    }),
  }),
);

export const ProductsShopStore = signalStore(
  { providedIn: 'root' },
  productsStoreFeature,
  orderItemsStoreFeature,
  withEntitiesLoadingCall(
    ({ productsPagedRequest, productsFilter, productsSort }) => ({
      collection: productsCollection,
      fetchEntities: async () => {
        const res = await lastValueFrom(
          inject(ProductService).getProducts({
            search: productsFilter().search,
            skip: productsPagedRequest().startIndex,
            take: productsPagedRequest().size,
            sortAscending: productsSort().direction === 'asc',
            sortColumn: productsSort().field,
          }),
        );
        return { entities: res.resultList, total: res.total };
      },
      mapError: (error) => (error as Error).message,
    }),
  ),
  withCalls(({ orderItemsEntities }, snackBar = inject(MatSnackBar)) => ({
    loadProductDetail: ({ id }: { id: string }) =>
      inject(ProductService).getProductDetail(id),

    checkout: callConfig({
      call: () =>
        inject(OrderService).checkout(
          ...orderItemsEntities().map((p) => ({
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
  })),
  withMethods(
    ({ productsEntitySelected, orderItemsIdsSelected, ...state }) => ({
      addProductToBasket: () => {
        const product = productsEntitySelected();
        if (product) {
          patchState(
            state,
            addEntities([{ ...product, quantity: 1 } as ProductOrder], {
              collection: orderItemsCollection,
            }),
          );
        }
      },
      updateProductInBasket: ({ id, quantity }: ProductOrder) => {
        patchState(
          state,
          updateEntity(
            { id, changes: { quantity } },
            {
              collection: orderItemsCollection,
            },
          ),
        );
      },
      removeProductsFromBasket: () => {
        if (orderItemsIdsSelected().length) {
          patchState(
            state,
            removeEntities(orderItemsIdsSelected(), {
              collection: orderItemsCollection,
            }),
          );
        }
      },
    }),
  ),
);
