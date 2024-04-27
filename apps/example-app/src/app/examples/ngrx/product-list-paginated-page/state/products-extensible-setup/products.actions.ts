import { createAction } from '@ngrx/store';

import { productFeature } from './products.traits';

// you can rename the actions, only export a few , and add your own
export const {
  loadProducts,
  loadProductsSuccess,
  loadProductsFail,
  toggleSelectProduct,
  loadProductsPage,
  checkout,
  checkoutFail,
  checkoutSuccess,
} = productFeature.actions;

export const myCustomAction = createAction('[Products] My Custom Action');
