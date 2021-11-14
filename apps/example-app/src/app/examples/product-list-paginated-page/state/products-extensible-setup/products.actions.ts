import { productTraits } from './products.traits';
import { createAction } from '@ngrx/store';

// you can rename the actions, only export a few , and add your own
export const {
  loadEntities: loadProducts,
  loadEntitiesSuccess: loadProductsSuccess,
  loadEntitiesFail: loadProductsFail,
  toggleSelect,
  loadPage,
  checkout,
  checkoutFail,
  checkoutSuccess,
} = productTraits.actions;

export const myCustomAction = createAction('[Products] My Custom Action');
