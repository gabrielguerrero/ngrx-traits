import {
  ExtractActionsType,
  ExtractMutatorsType,
  ExtractSelectorsType,
  ExtractStateType,
  FeatureFactory,
  KeyedConfig,
  TraitActions,
  TraitFactory,
  TraitSelectors,
  TraitStateMutators,
} from './model';
import { ActionType } from '@ngrx/store';
export declare function createTraitFactory<
  State = {},
  A extends TraitActions = TraitActions,
  S extends TraitSelectors<State> = TraitSelectors<State>,
  M extends TraitStateMutators<State> = TraitStateMutators<State>,
  KEY extends string = string,
  C = unknown,
  KC = KeyedConfig<KEY, C>
>(
  f: TraitFactory<State, A, S, M, KEY, C, KC>
): TraitFactory<State, A, S, M, KEY, C, KC>;
export declare function createEntityFeatureFactory<
  F extends readonly TraitFactory[]
>(
  ...traits: F
): FeatureFactory<
  ExtractStateType<F>,
  ExtractActionsType<F>,
  ExtractSelectorsType<F>,
  ExtractMutatorsType<F>
>;
export declare function setPropertyReducer<State, P extends keyof State>(
  sourceReducer: (state: State, action: ActionType<any>) => State,
  property: P,
  propertyReducer: (state: State[P], action: ActionType<any>) => State[P]
): (state: State, action: ActionType<any>) => State;
export declare function setPropertiesReducer<State, P extends keyof State>(
  sourceReducer: (state: State, action: ActionType<any>) => State,
  propertiesReducers: {
    [key in P]: (state: State[P], action: ActionType<any>) => State[P];
  }
): (state: State, action: ActionType<any>) => State;
export declare function joinReducers<State>(
  firstReducer: (state: State, action: ActionType<any>) => State,
  secondReducer: (state: any, action: ActionType<any>) => any
): (state: State, action: ActionType<any>) => State;
