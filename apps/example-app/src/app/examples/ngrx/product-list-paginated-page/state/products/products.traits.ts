import { Product, ProductFilter } from '@example-api/shared/models';
import {
  addAsyncActionTrait,
  addEntitiesPaginationTrait,
  addEntitiesSyncToRouteQueryParams,
  addFilterEntitiesTrait,
  addLoadEntitiesTrait,
  addSelectEntityTrait,
  addSortEntitiesTrait,
} from '@ngrx-traits/common';
import { createEntityFeatureFactory } from '@ngrx-traits/core';
import { props } from '@ngrx/store';

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
  addSortEntitiesTrait<Product>({
    remote: true,
    defaultSort: { active: 'id', direction: 'asc' },
  }),
  addEntitiesSyncToRouteQueryParams(),
)({
  actionsGroupKey: '[Products Paginated]',
  featureSelector: 'products-paginated',
});

export const ProductActions = productFeature.actions;
export const ProductSelectors = productFeature.selectors;
