import { createFeatureSelector } from '@ngrx/store';
import {
  AsyncActionState,
  LoadEntitiesState,
  FilterEntitiesState,
  EntitiesPaginationState,
  SelectEntityState,
  SortEntitiesState,
} from 'ngrx-traits/traits';
import { Product, ProductFilter } from '../../../models';
export interface ProductsState
  extends LoadEntitiesState<Product>,
    SelectEntityState,
    AsyncActionState<'checkout'>,
    EntitiesPaginationState,
    FilterEntitiesState<ProductFilter>,
    SortEntitiesState<Product> {
  myProp?: string;
}

export const productStateKey = 'products-paginated';
export const selectProductState =
  createFeatureSelector<ProductsState>(productStateKey);
