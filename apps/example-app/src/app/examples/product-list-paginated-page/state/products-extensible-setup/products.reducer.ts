import { Action, createReducer, on } from '@ngrx/store';
import { productTraits } from './products.traits';
import { ProductsState } from './products.state';

// inside the state folder dont import from actions and selectors from
// /index or you will create a circular dependency
import * as ProductActions from './products.actions';

const initialState: ProductsState = {
  ...productTraits.initialState,
  myProp: 'hello',
};
const myReducer = createReducer(
  initialState,
  on(ProductActions.myCustomAction, (state) => ({
    ...state,
    myProp: state.myProp + 'world',
  }))
);

// join your reducer with the traits reducer

// mixing our productTraits reducers with myReducer
export function productsReducer(state = initialState, action: Action) {
  const s = myReducer(state, action);
  return productTraits.reducer(s, action);
}
// the previous function is the same as using the helper function
// export const productsReducer = joinReducers(myReducer,productTraits.reducer);
