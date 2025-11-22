import { Product, ProductFilter } from '@example-api/shared/models';
import { createEntityFeatureFactory } from '@ngrx-traits/core';
import { props } from '@ngrx/store';

import {
  addAsyncActionTrait,
  addFilterEntitiesTrait,
  addLoadEntitiesTrait,
  addSelectEntityTrait,
  addSortEntitiesTrait,
} from '../../../../../../../../../libs/ngrx-traits/common/src/lib';

const productFeatureFactory = createEntityFeatureFactory(
  { entityName: 'product' },
  addLoadEntitiesTrait<Product>(),
  addSelectEntityTrait<Product>(),
  addAsyncActionTrait({
    name: 'checkout',
    actionSuccessProps: props<{ orderId: string }>(),
  }),
  addFilterEntitiesTrait<Product, ProductFilter>({
    filterFn: (filter, entity) => {
      return (
        !filter.search ||
        entity.name.toLowerCase().includes(filter.search.toLowerCase())
      );
    },
  }),
  addSortEntitiesTrait<Product>({
    remote: false,
    defaultSort: { direction: 'asc', active: 'name' },
  }),
);

export const productFeature = productFeatureFactory({
  actionsGroupKey: '[Products]',
  featureSelector: 'products',
});

export const ProductActions = productFeature.actions;
export const ProductSelectors = productFeature.selectors;
