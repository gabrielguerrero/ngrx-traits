import {
  addAsyncActionTrait,
  addFilterEntitiesTrait,
  addLoadEntitiesTrait,
  addEntitiesPaginationTrait,
  addSelectEntityTrait,
  addSortEntitiesTrait,
  AsyncActionState,
  LoadEntitiesState,
  FilterEntitiesState,
  EntitiesPaginationState,
  SelectEntityState,
  SortEntitiesState,
} from 'ngrx-traits/traits';
import { Product, ProductFilter } from '../../../models';
import { createFeatureSelector, props } from '@ngrx/store';
import { createEntityFeatureFactory } from 'ngrx-traits';

export interface ProductsState
  extends LoadEntitiesState<Product>,
    SelectEntityState,
    AsyncActionState<'checkout'>,
    EntitiesPaginationState,
    FilterEntitiesState<ProductFilter>,
    SortEntitiesState<Product> {}

export const productTraits = createEntityFeatureFactory(
  addLoadEntitiesTrait<Product>(),
  addSelectEntities<Product>(),
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
  featureSelector: 'products-paginated', //createFeatureSelector<ProductsState>('products-paginated'),
});

export const ProductActions = productTraits.actions;
export const ProductSelectors = productTraits.selectors;
