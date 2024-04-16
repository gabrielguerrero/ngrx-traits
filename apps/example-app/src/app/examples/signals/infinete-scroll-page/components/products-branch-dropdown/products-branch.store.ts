import { inject } from '@angular/core';
import {
  withCalls,
  withCallStatus,
  withEntitiesInfinitePagination,
  withEntitiesLoadingCall,
  withEntitiesRemoteFilter,
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
  withEntitiesInfinitePagination({
    pageSize: 10,
    entity,
  }),

  withEntitiesLoadingCall({
    fetchEntities: async ({ entitiesPagedRequest, entitiesFilter }) => {
      console.log('fetchEntities', entitiesPagedRequest(), entitiesFilter());
      const res = await lastValueFrom(
        inject(ProductsStoreService).getStores({
          search: entitiesFilter().search,
          skip: entitiesPagedRequest().startIndex,
          take: entitiesPagedRequest().size,
        }),
      );
      console.log({
        search: entitiesFilter().search,
        skip: entitiesPagedRequest().startIndex,
        take: entitiesPagedRequest().size,
        entities: res.resultList.length,
        total: res.total,
      });
      return { entities: res.resultList, total: res.total };
    },
  }),
  withLogger('branchStore'),
);
