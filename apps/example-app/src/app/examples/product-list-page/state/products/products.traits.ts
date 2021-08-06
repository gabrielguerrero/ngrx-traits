import {
  addAsyncAction,
  addFilter,
  addLoadEntities,
  addSingleSelection,
  addSort,
  AsyncActionState,
  EntityAndStatusState,
  FilterState,
  SingleSelectionState,
  SortState,
} from 'ngrx-traits/traits';
import { Product, ProductFilter } from '../../../models';
import { createFeatureSelector, props } from '@ngrx/store';
import { createEntityFeatureFactory } from 'ngrx-traits';

export interface ProductsState
  extends EntityAndStatusState<Product>,
    SingleSelectionState,
    AsyncActionState<'checkout'>,
    FilterState<ProductFilter>,
    SortState<Product> {}

export const productTraits = createEntityFeatureFactory(
  addLoadEntities<Product>(),
  addSingleSelection<Product>(),
  addAsyncAction({
    name: 'checkout',
    actionSuccessProps: props<{ orderId: string }>(),
  }),
  addFilter<Product, ProductFilter>({
    filterFn: (filter, entity) => {
      return entity.name.toLowerCase().includes(filter.search.toLowerCase());
    },
  }),
  addSort<Product>({
    defaultSort: { direction: 'asc', active: 'name' },
  })
)({
  actionsGroupKey: '[Products]',
  featureSelector: createFeatureSelector<ProductsState>('products'),
});

export const ProductActions = productTraits.actions;
export const ProductSelectors = productTraits.selectors;
