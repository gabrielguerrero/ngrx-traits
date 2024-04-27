import {
  addAsyncActionTrait,
  addEntitiesPaginationTrait,
  addFilterEntitiesTrait,
  addLoadEntitiesTrait,
  addSelectEntityTrait,
  addSortEntitiesTrait,
} from '@ngrx-traits/common';
import { createEntityFeatureFactory } from '@ngrx-traits/core';
import { props } from '@ngrx/store';

import { Product, ProductFilter } from '../../../models';
import { selectProductState } from './products.state';

export const productFeature = createEntityFeatureFactory(
  { entityName: 'product' },
  addLoadEntitiesTrait<Product>(),
  addSelectEntityTrait<Product>(),
  addAsyncActionTrait({
    name: 'checkout',
    actionSuccessProps: props<{ orderId: string }>(),
  }),
  addEntitiesPaginationTrait<Product>(),
  addFilterEntitiesTrait<Product, ProductFilter>(),
  addSortEntitiesTrait<Product>({
    remote: true,
    defaultSort: {
      direction: 'asc',
      active: 'name',
    },
  }),
)({
  actionsGroupKey: '[Products Paginated]',
  featureSelector: selectProductState,
});
