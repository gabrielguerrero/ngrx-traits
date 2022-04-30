import { ReducerTypes } from '@ngrx/store/src/reducer_creator';
import { ActionCreator } from '@ngrx/store/src/models';

export function insertIf<State>(
  condition: any,
  getElement: () => ReducerTypes<State, ActionCreator[]>
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
