import {
  addAsyncActionTrait,
  addCrudEntitiesTrait,
  addFilterEntitiesTrait,
  addLoadEntitiesTrait,
  addSelectEntityTrait,
  addSelectEntityTrait,
  addSortEntitiesTrait,
  AsyncActionState,
  CrudEntitiesState,
  LoadEntitiesState,
  FilterEntitiesState,
  SelectEntitiesState,
  SelectEntityState,
  SortEntitiesState,
} from 'ngrx-traits/traits';
import { Product, ProductFilter, ProductOrder } from '../../../models';
import { createFeatureSelector, props } from '@ngrx/store';
import { createEntityFeatureFactory } from 'ngrx-traits';
import { addLoadProductDetail } from '../products/load-product.trait';

export interface ProductsBasketState
  extends LoadEntitiesState<ProductOrder>,
    SelectEntityState,
    SelectEntitiesState,
    CrudEntitiesState<ProductOrder>,
    AsyncActionState<'checkout'>,
    SortEntitiesState<ProductOrder> {}

export const productTraits = createEntityFeatureFactory(
  addLoadEntitiesTrait<ProductOrder>(),
  addSelectEntities<ProductOrder>(),
  addSelectEntities<ProductOrder>(),
  addCrudEntitiesTrait<ProductOrder>(),
  addAsyncActionTrait({
    name: 'checkout',
    actionSuccessProps: props<{ orderId: string }>(),
  }),
  addSortEntitiesTrait<ProductOrder>({
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
