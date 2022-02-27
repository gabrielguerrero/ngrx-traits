import {
  addAsyncActionTrait,
  addFilterEntitiesTrait,
  addLoadEntitiesTrait,
  addSelectEntityTrait,
  addSortEntitiesTrait,
} from 'ngrx-traits/traits';
import { Product, ProductFilter } from '../../../models';
import { props } from '@ngrx/store';
import { createEntityFeatureFactory } from 'ngrx-traits';

const entityFeatureFactory = createEntityFeatureFactory(
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

export const productTraits = entityFeatureFactory({
  actionsGroupKey: '[Products]',
  featureSelector: 'products',
});

export const ProductActions = productTraits.actions;
export const ProductSelectors = productTraits.selectors;
