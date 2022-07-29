import { productFeature } from './products.traits';
import { createSelector } from '@ngrx/store';
import { selectProductState } from './products.state';

// rename selector, export only a subset, and add your own
export const {
  selectProductsList: selectProducts,
  selectProductsTotal,
  isProductsLoading,
  isCheckoutLoading,
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
  }
);
