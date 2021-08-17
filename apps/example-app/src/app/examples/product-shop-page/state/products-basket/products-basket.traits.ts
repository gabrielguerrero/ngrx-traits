import {
  addAsyncAction,
  addCrudEntities,
  addFilter,
  addLoadEntities,
  addMultiSelection,
  addSingleSelection,
  addSort,
  AsyncActionState,
  CrudState,
  EntityAndStatusState,
  FilterState,
  MultipleSelectionState,
  SingleSelectionState,
  SortState,
} from 'ngrx-traits/traits';
import { Product, ProductFilter, ProductOrder } from '../../../models';
import { createFeatureSelector, props } from '@ngrx/store';
import { createEntityFeatureFactory } from 'ngrx-traits';
import { addLoadProductDetail } from '../products/load-product.trait';

export interface ProductsBasketState
  extends EntityAndStatusState<ProductOrder>,
    SingleSelectionState,
    MultipleSelectionState,
    CrudState<ProductOrder>,
    AsyncActionState<'checkout'>,
    SortState<ProductOrder> {}

export const productTraits = createEntityFeatureFactory(
  addLoadEntities<ProductOrder>(),
  addSingleSelection<ProductOrder>(),
  addMultiSelection<ProductOrder>(),
  addCrudEntities<ProductOrder>(),
  addAsyncAction({
    name: 'checkout',
    actionSuccessProps: props<{ orderId: string }>(),
  }),
  addSort<ProductOrder>({
    defaultSort: { direction: 'asc', active: 'name' },
  }),
  ...addLoadProductDetail()
)({
  actionsGroupKey: '[Products Basket]',
  featureSelector:
    createFeatureSelector<ProductsBasketState>('products-basket'),
});

export const ProductBasketActions = productTraits.actions;
export const ProductBasketSelectors = productTraits.selectors;
