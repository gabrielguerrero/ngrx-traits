import { inject } from '@angular/core';
import {
  withCallStatus,
  withEntitiesLoadingCall,
  withEntitiesRemoteFilter,
  withEntitiesRemoteScrollPagination,
} from '@ngrx-traits/signals';
import { signalStore, signalStoreFeature, type } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import { lastValueFrom } from 'rxjs';

import { Branch, Product } from '../../models';
import { BranchService } from '../../services/branch.service';
import { ProductService } from '../../services/product.service';

const entity = type<Branch>();
const entity2 = type<Product>();
const collection = 'products';
export const ProductsBranchStore = signalStore(
  signalStoreFeature(
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
    withEntitiesLoadingCall(({ entitiesPagedRequest, entitiesFilter }) => ({
      fetchEntities: async () => {
        const res = await lastValueFrom(
          inject(BranchService).getBranches({
            search: entitiesFilter().search,
            skip: entitiesPagedRequest().startIndex,
            take: entitiesPagedRequest().size,
          }),
        );
        return { entities: res.resultList };
      },
    })),
  ),
);
