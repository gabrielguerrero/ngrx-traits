import {
  addAsyncAction,
  addFilter,
  addLoadEntities,
  addPagination,
  addSingleSelection,
  addSort,
  AsyncActionState,
  LoadEntitiesState,
  FilterState,
  PaginationState,
  SingleSelectionState,
  SortState,
} from 'ngrx-traits/traits';
import { Product, ProductFilter } from '../../../models';
import { createFeatureSelector, props } from '@ngrx/store';
import { createEntityFeatureFactory } from 'ngrx-traits';

export interface ProductsState
  extends LoadEntitiesState<Product>,
    SingleSelectionState,
    AsyncActionState<'checkout'>,
    PaginationState,
    FilterState<ProductFilter>,
    SortState<Product> {}

export const productTraits = createEntityFeatureFactory(
  addLoadEntities<Product>(),
  addSingleSelection<Product>(),
  addAsyncAction({
    name: 'checkout',
    actionSuccessProps: props<{ orderId: string }>(),
  }),
  addPagination<Product>(),
  addFilter<Product, ProductFilter>(),
  addSort<Product>({
    remote: true,
    defaultSort: {
      direction: 'asc',
      active: 'name',
    },
  })
)({
  actionsGroupKey: '[Products Paginated]',
  featureSelector: createFeatureSelector<ProductsState>('products-paginated'),
});

export const ProductActions = productTraits.actions;
export const ProductSelectors = productTraits.selectors;
