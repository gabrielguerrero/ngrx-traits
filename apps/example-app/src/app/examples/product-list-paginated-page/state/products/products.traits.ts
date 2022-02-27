import {
  addAsyncActionTrait,
  addEntitiesPaginationTrait,
  addFilterEntitiesTrait,
  addLoadEntitiesTrait,
  addSelectEntitiesTrait,
  addSelectEntityTrait,
  addSortEntitiesTrait,
} from 'ngrx-traits/traits';
import { Product, ProductFilter } from '../../../models';
import { props } from '@ngrx/store';
import { createEntityFeatureFactory } from 'ngrx-traits';

export const productTraits = createEntityFeatureFactory(
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
  })
)({
  actionsGroupKey: '[Products Paginated]',
  featureSelector: 'products-paginated',
});

export const ProductActions = productTraits.actions;
export const ProductSelectors = productTraits.selectors;
