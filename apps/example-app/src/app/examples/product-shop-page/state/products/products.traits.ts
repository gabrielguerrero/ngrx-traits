import {
  addAsyncAction,
  addFilter,
  addLoadEntities,
  addSingleSelection,
  addSort,
  AsyncActionState,
  LoadEntitiesState,
  FilterState,
  SingleSelectionState,
  SortState,
} from 'ngrx-traits/traits';
import { Product, ProductFilter } from '../../../models';
import { createFeatureSelector, props } from '@ngrx/store';
import { createEntityFeatureFactory } from 'ngrx-traits';
import { addLoadProductDetail } from './load-product.trait';

export interface ProductsState
  extends LoadEntitiesState<Product>,
    SingleSelectionState,
    FilterState<ProductFilter>,
    SortState<Product> {}

export const productTraits = createEntityFeatureFactory(
  addLoadEntities<Product>(),
  addSingleSelection<Product>(),
  addFilter<Product, ProductFilter>({
    filterFn: (filter, entity) => {
      return entity.name.toLowerCase().includes(filter.search.toLowerCase());
    },
  }),
  addSort<Product>({
    defaultSort: { direction: 'asc', active: 'name' },
  }),
  ...addLoadProductDetail()
)({
  actionsGroupKey: '[Products]',
  featureSelector: createFeatureSelector<ProductsState>('products'),
});

export const ProductActions = productTraits.actions;
export const ProductSelectors = productTraits.selectors;
