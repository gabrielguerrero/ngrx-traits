import { ActionCreator } from '@ngrx/store';
import { ActionType } from '@ngrx/store';
import { ReducerTypes } from '@ngrx/store';

export function insertIf<State>(
  condition: any,
  getElement: () => ReducerTypes<State, ActionCreator[]>,
): ReducerTypes<State, ActionCreator[]>[] {
  return condition ? [getElement()] : [];
}
export function toMap(a: Array<string | number>) {
  return a.reduce((acum: { [key: string]: boolean }, value) => {
    acum[value] = true;
    return acum;
  }, {});
}

export function capitalize(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function camelCaseToSentence(text: string) {
  const result = text.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

/**
 * Set propertyReducer in sourceReducer in a property of the source state,
 * @param sourceReducer
 * @param property
 * @param propertyReducer
 *
 * @example
 *
 * const newReducer = setPropertyReducer(productsReducer, 'selectedProduct', selectedProductReducer)
 */
export function setPropertyReducer<State, P extends keyof State>(
  sourceReducer: (state: State, action: ActionType<any>) => State,
  property: P,
  propertyReducer: (state: State[P], action: ActionType<any>) => State[P],
): (state: State, action: ActionType<any>) => State {
  return function reducer(state: State, action: ActionType<any>): State {
    const sourceState = sourceReducer(state, action);
    return {
      ...sourceState,
      [property]: propertyReducer(sourceState[property], action),
    };
  };
}

/**
 * Set propertyReducers in sourceReducer each in a property of the source state,
 * @param sourceReducer
 * @param property
 * @param propertyReducer
 *
 * @example
 *
 * const newReducer = setPropertyReducer(productsReducer,
 * {
 *    selectedProduct: selectedProductReducer
 *    favoriteProduct: favoriteProductReducer
 * })
 */
export function setPropertiesReducer<State, P extends keyof State>(
  sourceReducer: (state: State, action: ActionType<any>) => State,
  propertiesReducers: {
    [key in P]: (state: State[P], action: ActionType<any>) => State[P];
  },
): (state: State, action: ActionType<any>) => State {
  return function reducer(state: State, action: ActionType<any>): State {
    const newState = { ...sourceReducer(state, action) };
    for (const property in propertiesReducers) {
      newState[property as P] = propertiesReducers[property](
        newState[property],
        action,
      );
    }
    return newState;
  };
}

/**
 * joins two reducers so the work in the same state
 * @param firstReducer
 * @param secondReducer
 */
export function joinReducers<State>(
  firstReducer: (state: State, action: ActionType<any>) => State,
  secondReducer: (state: any, action: ActionType<any>) => any,
): (state: State, action: ActionType<any>) => State {
  return function reducer(state: State, action: ActionType<any>): State {
    const sourceState = firstReducer(state, action);
    return secondReducer(sourceState, action);
  };
}
