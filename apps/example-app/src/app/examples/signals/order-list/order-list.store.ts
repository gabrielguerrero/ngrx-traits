import { inject } from '@angular/core';
import {
  withCallStatus,
  withEntitiesLoadingCall,
  withEntitiesMultiSelection,
} from '@ngrx-traits/signals';
import { signalStore, type, withMethods } from '@ngrx/signals';
import { entityConfig, withEntities } from '@ngrx/signals/entities';
import { map } from 'rxjs/operators';

import { entityCallConfig } from '../../../../../../../libs/ngrx-traits/signals/src/lib/with-entities-calls/entity-call-config';
import { withEntitiesCalls } from '../../../../../../../libs/ngrx-traits/signals/src/lib/with-entities-calls/with-entities-calls';
import { OrderDetail, OrderSummary } from '../../models';
import { OrderService } from '../../services/order.service';

const orderEntity = entityConfig({
  entity: type<OrderSummary & { items?: OrderDetail['items'] }>(),
  collection: 'orders',
});
export const OrderStore = signalStore(
  withEntities(orderEntity),
  withEntitiesMultiSelection(orderEntity),
  withCallStatus({ ...orderEntity, initialValue: 'loading' }),
  withEntitiesLoadingCall({
    ...orderEntity,
    fetchEntities: () =>
      inject(OrderService)
        .getOrders()
        .pipe(map((res) => res.resultList)),
  }),
  withEntitiesCalls({
    ...orderEntity,
    calls: (store, orderService = inject(OrderService)) => ({
      loadOrderDetail: (entity: OrderSummary) =>
        orderService.getOrderDetail(entity.id),
      // alternative way to define the call
      // loadOrderDetail: entityCallConfig({
      //   call: (entity: OrderSummary) => orderService.getOrderDetail(entity.id),
      //   skipWhen: (param, previousResult) => !!previousResult?.items,
      // }),
      changeOrderStatus: (option: {
        entity: OrderSummary;
        status: OrderSummary['status'];
      }) => orderService.changeStatus(option.entity.id, option.status),
      deleteOrder: (entity: OrderSummary) => {
        return orderService.delete(entity.id).pipe(
          map((deleted) => {
            deleted ? undefined : entity; // returning undefined will remove the entity from the store
          }),
        );
      },
    }),
  }),
  withMethods(
    ({
      loadOrderDetail,
      isLoadOrderDetailLoaded,
      toggleSelectOrdersEntities,
    }) => ({
      toggleShowDetail(order: OrderSummary) {
        toggleSelectOrdersEntities(order);
        // only load the order detail if it is not loaded yet, this can be avoided by using the skipWhen option in the call
        if (!isLoadOrderDetailLoaded(order)) {
          loadOrderDetail(order);
        }
      },
    }),
  ),
);
