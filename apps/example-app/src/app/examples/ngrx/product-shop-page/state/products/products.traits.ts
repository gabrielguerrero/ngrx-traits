import {
  addFilterEntitiesTrait,
  addLoadEntitiesTrait,
  addSelectEntityTrait,
  addSortEntitiesTrait,
} from '@ngrx-traits/common';
import { createEntityFeatureFactory } from '@ngrx-traits/core';

import { Product, ProductFilter } from '../../../../models';
import { addLoadProductDetailTraits } from './load-product.trait';

export const productFeature = createEntityFeatureFactory(
  { entityName: 'product' },
  addLoadEntitiesTrait<Product>(),
  addSelectEntityTrait<Product>(),
  addFilterEntitiesTrait<Product, ProductFilter>({
    filterFn: (filter, entity) => {
      return entity.name.toLowerCase().includes(filter.search.toLowerCase());
    },
  }),
  addSortEntitiesTrait<Product>({
    remote: false,
    defaultSort: { direction: 'asc', active: 'name' },
  }),
  ...addLoadProductDetailTraits(),
)({
  actionsGroupKey: '[Products]',
  featureSelector: 'products',
});

export const ProductActions = productFeature.actions;
export const ProductSelectors = productFeature.selectors;
