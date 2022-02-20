import {
  addAsyncActionTrait,
  addCrudEntitiesTrait,
  addFilterEntitiesTrait,
  addLoadEntitiesTrait,
  addSelectEntityTrait,
  addSortEntitiesTrait,
  AsyncActionState,
  CrudEntitiesState,
  LoadEntitiesState,
  FilterEntitiesState,
  SelectEntitiesState,
  SelectEntityState,
  SortEntitiesState,
  addSelectEntitiesTrait,
} from 'ngrx-traits/traits';
import { Product, ProductFilter, ProductOrder } from '../../../models';
import { createFeatureSelector, props } from '@ngrx/store';
import { createEntityFeatureFactory } from 'ngrx-traits';
import { addLoadProductDetailTraits } from '../products/load-product.trait';

export interface ProductsBasketState
  extends LoadEntitiesState<ProductOrder>,
    SelectEntityState,
    SelectEntitiesState,
    CrudEntitiesState<ProductOrder>,
    AsyncActionState<'checkout'>,
    SortEntitiesState<ProductOrder> {}

export const productTraits = createEntityFeatureFactory(
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
  ...addLoadProductDetailTraits()
)({
  actionsGroupKey: '[Products Basket]',
  featureSelector:
    createFeatureSelector<ProductsBasketState>('products-basket'),
});

export const ProductBasketActions = productTraits.actions.c;
export const ProductBasketSelectors = productTraits.selectors;
