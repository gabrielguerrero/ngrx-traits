import { inject } from '@angular/core';
import {
  withCallStatus,
  withEntitiesLoadingCall,
  withEntitiesRemoteFilter,
  withEntitiesRemoteScrollPagination,
  withLogger,
} from '@ngrx-traits/signals';
import { signalStore, type } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import { lastValueFrom } from 'rxjs';

import { ProductsStore } from '../../../../models';
import { ProductsStoreService } from '../../../../services/products-store.service';

const entity = type<ProductsStore>();
export const ProductsBranchStore = signalStore(
  withEntities({
    entity,
  }),
  withCallStatus({ initialValue: 'loading' }),
  withEntitiesRemoteFilter({
    entity,
    defaultFilter: { search: '' },
  }),
  withEntitiesRemoteScrollPagination({
    pageSize: 10,
    entity,
  }),
  withEntitiesLoadingCall({
    fetchEntities: async ({ entitiesPagedRequest, entitiesFilter }) => {
      const res = await lastValueFrom(
        inject(ProductsStoreService).getStores({
          search: entitiesFilter().search,
          skip: entitiesPagedRequest().startIndex,
          take: entitiesPagedRequest().size,
        }),
      );
      return { entities: res.resultList, total: res.total };
    },
  }),
  withLogger('branchStore'),
);
