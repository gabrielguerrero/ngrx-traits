import {
  addAsyncAction,
  addFilterEntities,
  addLoadEntities,
  addEntitiesPagination,
  addSelectEntity,
  addSortEntities,
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
  addLoadEntities<Product>(),
  addSelectEntities<Product>(),
  addAsyncAction({
    name: 'checkout',
    actionSuccessProps: props<{ orderId: string }>(),
  }),
  addEntitiesPagination<Product>(),
  addFilterEntities<Product, ProductFilter>(),
  addSortEntities<Product>({
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
