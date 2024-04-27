import { Action, createReducer, on } from '@ngrx/store';

// inside the state folder dont import from actions and selectors from
// /index or you will create a circular dependency
import * as ProductActions from './products.actions';
import { ProductsState } from './products.state';
import { productFeature } from './products.traits';

const initialState: ProductsState = {
  ...productFeature.initialState,
  myProp: 'hello',
};
const myReducer = createReducer(
  initialState,
  on(ProductActions.myCustomAction, (state) => ({
    ...state,
    myProp: state.myProp + 'world',
  })),
);

// join your reducer with the traits reducer

// mixing our productFeature reducers with myReducer
export function productsReducer(state = initialState, action: Action) {
  const s = myReducer(state, action);
  return productFeature.reducer(s, action);
}
// the previous function is the same as using the helper function
// export const productsReducer = joinReducers(myReducer,productFeature.reducer);
