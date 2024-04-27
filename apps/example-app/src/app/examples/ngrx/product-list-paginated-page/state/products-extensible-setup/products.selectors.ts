import { createSelector } from '@ngrx/store';

import { selectProductState } from './products.state';
import { productFeature } from './products.traits';

// rename selector, export only a subset, and add your own
export const {
  selectProductsList: selectProducts,
  selectProductsTotal,
  isProductsLoading,
  isLoadingCheckout,
  selectProductSelected,
  selectProductsFilter,
  selectProductsSort,
  selectProductsPagedRequest,
} = productFeature.selectors;

export const selectMyProp = createSelector(selectProductState, (state) => {
  // join to the base state
  return state.myProp;
});

export const selectFavoriteProducts = createSelector(
  selectProducts,
  (state) => {
    // join to one of the generate states
    return state;
  },
);
