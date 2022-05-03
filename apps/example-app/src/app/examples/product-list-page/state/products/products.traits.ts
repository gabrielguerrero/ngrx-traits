import {
  addAsyncActionTrait,
  addFilterEntitiesTrait,
  addLoadEntitiesTrait,
  addSelectEntityTrait,
  addSortEntitiesTrait,
} from '@ngrx-traits/common';
import { Product, ProductFilter } from '../../../models';
import { props } from '@ngrx/store';
import { createEntityFeatureFactory } from '@ngrx-traits/core';

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
      return entity.name.toLowerCase().includes(filter.search.toLowerCase());
    },
  }),
  addSortEntitiesTrait<Product>({
    defaultSort: { direction: 'asc', active: 'name' },
  })
);

export const productFeature = productFeatureFactory({
  actionsGroupKey: '[Products]',
  featureSelector: 'products',
});

export const ProductActions = productFeature.actions;
export const ProductSelectors = productFeature.selectors;
