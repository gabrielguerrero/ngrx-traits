import { createFeatureSelector } from '@ngrx/store';
import {
  AsyncActionState,
  LoadEntitiesState,
  FilterState,
  PaginationState,
  SingleSelectionState,
  SortState,
} from 'ngrx-traits/traits';
import { Product, ProductFilter } from '../../../models';
export interface ProductsState
  extends LoadEntitiesState<Product>,
    SingleSelectionState,
    AsyncActionState<'checkout'>,
    PaginationState,
    FilterState<ProductFilter>,
    SortState<Product> {
  myProp?: string;
}

export const productStateKey = 'products-paginated';
export const selectProductState =
  createFeatureSelector<ProductsState>(productStateKey);
