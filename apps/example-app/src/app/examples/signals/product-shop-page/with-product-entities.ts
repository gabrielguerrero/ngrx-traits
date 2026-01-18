import { inject } from '@angular/core';
import { Product } from '@example-api/shared/models';
import {
  cacheRxCall,
  ExtractStoreFeatureOutput,
  withCallStatus,
  withEntitiesLoadingCall,
  withEntitiesRemoteFilter,
  withEntitiesRemotePagination,
  withEntitiesRemoteSort,
  withEntitiesSingleSelection,
} from '@ngrx-traits/signals';
import { signalStoreFeature, type } from '@ngrx/signals';
import { entityConfig, withEntities } from '@ngrx/signals/entities';
import { lastValueFrom } from 'rxjs';

import { ProductService } from '../../services/product.service';

export const productEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'product',
});

export function withProductEntities() {
  return signalStoreFeature(
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
    withEntitiesLoadingCall(
      (
        {
          productEntitiesPagedRequest,
          productEntitiesFilter,
          productEntitiesSort,
        },
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
  );
}

export type ProductEntitiesStoreFeature = ExtractStoreFeatureOutput<
  typeof withProductEntities
>;
