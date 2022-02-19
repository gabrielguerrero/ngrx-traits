import {
  addAsyncAction,
  addFilterEntities,
  addLoadEntities,
  addSelectEntity,
  addSortEntities,
  AsyncActionState,
  LoadEntitiesState,
  FilterEntitiesState,
  SelectEntityState,
  SortEntitiesState,
} from 'ngrx-traits/traits';
import { Product, ProductFilter } from '../../../models';
import { createFeatureSelector, props } from '@ngrx/store';
import { createEntityFeatureFactory } from 'ngrx-traits';
import { addLoadProductDetail } from './load-product.trait';

export interface ProductsState
  extends LoadEntitiesState<Product>,
    SelectEntityState,
    FilterEntitiesState<ProductFilter>,
    SortEntitiesState<Product> {}

export const productTraits = createEntityFeatureFactory(
  addLoadEntities<Product>(),
  addSelectEntities<Product>(),
  addFilterEntities<Product, ProductFilter>({
    filterFn: (filter, entity) => {
      return entity.name.toLowerCase().includes(filter.search.toLowerCase());
    },
  }),
  addSortEntities<Product>({
    defaultSort: { direction: 'asc', active: 'name' },
  }),
  ...addLoadProductDetail()
)({
  actionsGroupKey: '[Products]',
  featureSelector: createFeatureSelector<ProductsState>('products'),
});

export const ProductActions = productTraits.actions;
export const ProductSelectors = productTraits.selectors;
