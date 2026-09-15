import { inject } from '@angular/core';
import { Product } from '@example-api/shared/models';
import { signalStore, type } from '@ngrx/signals';
import { entityConfig, withEntities } from '@ngrx/signals/entities';
import { map } from 'rxjs/operators';

import {
  callConfig,
  withCalls,
  withCallStatus,
  withEntitiesLoadingCall,
  withEntitiesRemoteFilter,
  withEntitiesRemoteSort,
} from '@ngrx-traits/signals';

import { ProductService } from '../../services/product.service';

const productEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'product',
});

export const ProductResourceStore = signalStore(
  withEntities(productEntityConfig),
  withCallStatus(productEntityConfig, { initialValue: 'loading' }),
  withEntitiesRemoteFilter(productEntityConfig, {
    defaultFilter: { search: '' },
  }),
  withEntitiesRemoteSort(productEntityConfig, {
    defaultSort: { field: 'name', direction: 'asc' },
  }),
  // also generates productEntitiesResource(), a resource view of the
  // entities and their loading call
  withEntitiesLoadingCall(
    productEntityConfig,
    ({ productEntitiesFilter, productEntitiesSort }) => ({
      fetchEntities: () =>
        inject(ProductService)
          .getProducts({
            search: productEntitiesFilter().search,
            sortColumn: productEntitiesSort().field,
            sortAscending: productEntitiesSort().direction === 'asc',
          })
          .pipe(map((d) => d.resultList)),
    }),
  ),
  // also generates productDetailResource(), a resource view of the call
  withCalls(() => ({
    loadProductDetail: callConfig({
      call: ({ id }: { id: string }) =>
        inject(ProductService).getProductDetail(id),
      resultProp: 'productDetail',
      // a new selection cancels the detail still loading
      mapPipe: 'switchMap',
    }),
  })),
);
