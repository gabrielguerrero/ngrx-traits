import { ReducerTypes } from '@ngrx/store/src/reducer_creator';
import { ActionCreator } from '@ngrx/store/src/models';
export declare function insertIf<State>(
  condition: any,
  getElement: () => ReducerTypes<State, ActionCreator[]>
): ReducerTypes<State, ActionCreator[]>[];
export declare function toMap(a: Array<string | number>): {};
