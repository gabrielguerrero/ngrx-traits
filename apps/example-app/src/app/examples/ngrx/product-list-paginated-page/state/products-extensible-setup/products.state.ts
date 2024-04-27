import {
  AsyncActionState,
  EntitiesPaginationState,
  FilterEntitiesState,
  LoadEntitiesState,
  SelectEntityState,
  SortEntitiesState,
} from '@ngrx-traits/common';
import { createFeatureSelector } from '@ngrx/store';

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
