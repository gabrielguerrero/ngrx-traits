import {
  addAsyncActionTrait,
  addFilterEntitiesTrait,
  addLoadEntitiesTrait,
  addSelectEntityTrait,
  addSortEntitiesTrait,
  AsyncActionState,
  LoadEntitiesState,
  FilterEntitiesState,
  SelectEntityState,
  SortEntitiesState,
} from 'ngrx-traits/traits';
import { Product, ProductFilter } from '../../../models';
import { createFeatureSelector, props } from '@ngrx/store';
import { createEntityFeatureFactory } from 'ngrx-traits';
import { addLoadProductDetailTraits } from './load-product.trait';

export interface ProductsState
  extends LoadEntitiesState<Product>,
    SelectEntityState,
    FilterEntitiesState<ProductFilter>,
    SortEntitiesState<Product> {}

export const productTraits = createEntityFeatureFactory(
  addLoadEntitiesTrait<Product>(),
  addSelectEntities<Product>(),
  addFilterEntitiesTrait<Product, ProductFilter>({
    filterFn: (filter, entity) => {
      return entity.name.toLowerCase().includes(filter.search.toLowerCase());
    },
  }),
  addSortEntitiesTrait<Product>({
    defaultSort: { direction: 'asc', active: 'name' },
  }),
  ...addLoadProductDetailTraits()
)({
  actionsGroupKey: '[Products]',
  featureSelector: createFeatureSelector<ProductsState>('products'),
});

export const ProductActions = productTraits.actions;
export const ProductSelectors = productTraits.selectors;
