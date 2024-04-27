import {
  addAsyncActionTrait,
  addCrudEntitiesTrait,
  addLoadEntitiesTrait,
  addSelectEntitiesTrait,
  addSelectEntityTrait,
  addSortEntitiesTrait,
} from '@ngrx-traits/common';
import { createEntityFeatureFactory } from '@ngrx-traits/core';
import { props } from '@ngrx/store';

import { ProductOrder } from '../../../../models';
import { addLoadProductDetailTraits } from '../products/load-product.trait';

export const productOrdersFeature = createEntityFeatureFactory(
  { entityName: 'productOrder' },
  addLoadEntitiesTrait<ProductOrder>(),
  addSelectEntitiesTrait<ProductOrder>(),
  addSelectEntityTrait<ProductOrder>(),
  addCrudEntitiesTrait<ProductOrder>(),
  addAsyncActionTrait({
    name: 'checkout',
    actionSuccessProps: props<{ orderId: string }>(),
  }),
  addSortEntitiesTrait<ProductOrder>({
    remote: false,
    defaultSort: { direction: 'asc', active: 'name' },
  }),
  ...addLoadProductDetailTraits(),
)({
  actionsGroupKey: '[Products Basket]',
  featureSelector: 'products-basket',
});

export const ProductBasketActions = productOrdersFeature.actions;
export const ProductBasketSelectors = productOrdersFeature.selectors;
