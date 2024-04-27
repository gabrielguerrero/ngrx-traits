import {
  addAsyncActionTrait,
  addCrudEntitiesTrait,
  addFilterEntitiesTrait,
  addLoadEntitiesTrait,
  addSelectEntitiesTrait,
  addSelectEntityTrait,
  addSortEntitiesTrait,
} from '@ngrx-traits/common';
import {
  combineEntityFeatures,
  createEntityFeatureFactory,
} from '@ngrx-traits/core';
import { props } from '@ngrx/store';

import { Product, ProductFilter, ProductOrder } from '../../../models';
import { addLoadProductDetailTraits } from '../products/load-product.trait';

export const productFeatureFactory = createEntityFeatureFactory(
  { entityName: 'product' },
  addLoadEntitiesTrait<Product>(),
  addSelectEntityTrait<Product>(),
  addFilterEntitiesTrait<Product, ProductFilter>({
    filterFn: (filter, entity) => {
      return (
        !filter.search ||
        entity.name.toLowerCase().includes(filter.search.toLowerCase())
      );
    },
  }),
  addSortEntitiesTrait<Product>({
    defaultSort: { direction: 'asc', active: 'name' },
  }),
  ...addLoadProductDetailTraits(),
);

export const productOrderFeatureFactory = createEntityFeatureFactory(
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
    defaultSort: { direction: 'asc', active: 'name' },
  }),
  ...addLoadProductDetailTraits(),
);

export const combinedFeature = combineEntityFeatures({
  products: productFeatureFactory,
  productOrders: productOrderFeatureFactory,
})({
  actionsGroupKey: '[Combined Products]',
  featureSelector: 'combined-products',
});

export const ProductBasketActions = combinedFeature.actions.productOrders;
export const ProductActions = combinedFeature.actions.products;
export const ProductBasketSelectors = combinedFeature.selectors.productOrders;
export const ProductSelectors = combinedFeature.selectors.products;
