import { ProductOrder } from '@example-api/shared/models';
import {
  ExtractStoreFeatureOutput,
  withEntitiesLocalPagination,
  withEntitiesLocalSort,
  withEntitiesMultiSelection,
  withLogger,
  withSyncToWebStorage,
} from '@ngrx-traits/signals';
import { signalStoreFeature, type } from '@ngrx/signals';
import { entityConfig, withEntities } from '@ngrx/signals/entities';

export const orderItemEntityConfig = entityConfig({
  entity: type<ProductOrder>(),
  collection: 'orderItem',
});

export function withOrderEntities() {
  return signalStoreFeature(
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
}
export type OrderEntitiesStoreFeature = ExtractStoreFeatureOutput<
  typeof withOrderEntities
>;
