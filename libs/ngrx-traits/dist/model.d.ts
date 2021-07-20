import {
  ActionCreator,
  Selector,
  SelectorWithProps,
  TypedAction,
} from '@ngrx/store/src/models';
import { Action, ActionType, MemoizedSelector } from '@ngrx/store';
import { Type } from '@angular/core';
import { TraitEffect } from './trait-effect';
export declare type TraitActions = {
  [key: string]: ActionCreator<string, (...args: any[]) => TypedAction<string>>;
};
export declare type TraitSelectors<State> = {
  [key: string]:
    | Selector<State, any>
    | SelectorWithProps<State, any, any>
    | MemoizedSelector<State, any>;
};
export declare type TraitStateMutators<State> = {
  [key: string]: <S extends State>(...arg: any[]) => S;
};
export interface FeatureTraits<
  State,
  A extends TraitActions = TraitActions,
  S extends TraitSelectors<State> = TraitSelectors<State>,
  M extends TraitStateMutators<State> = TraitStateMutators<State>
> {
  actions: A;
  selectors: FeatureSelectors<State, S>;
  mutators: M;
  reducer: (state: State, action: ActionType<any>) => State;
  effects: Type<any>[];
  initialState: State;
}
export declare type FeatureFactory<
  State = any,
  A extends TraitActions = TraitActions,
  S extends TraitSelectors<State> = TraitSelectors<State>,
  M extends TraitStateMutators<State> = TraitStateMutators<State>
> = (config: Config<State>) => FeatureTraits<State, A, S, M>;
export interface Config<
  State,
  F extends MemoizedSelector<object, State> = MemoizedSelector<object, State>
> {
  actionsGroupKey: string;
  featureSelector: F;
}
export declare type FeatureSelectors<State, S extends TraitSelectors<State>> = {
  [key in keyof S]: MemoizedSelector<object, ReturnType<S[key]>, S[key]>;
};
export declare type AllTraitConfigs = {
  [id: string]: any;
};
export declare type TraitActionsFactory<
  A extends TraitActions = TraitActions,
  C extends AllTraitConfigs = AllTraitConfigs
> = (options: TraitActionsFactoryConfig<C>) => A;
export declare type TraitActionsFactoryConfig<
  C extends AllTraitConfigs = AllTraitConfigs
> = {
  actionsGroupKey: string;
  allConfigs: C;
};
export declare type TraitSelectorsFactory<
  State = unknown,
  S extends TraitSelectors<State> = TraitSelectors<State>,
  C extends AllTraitConfigs = AllTraitConfigs
> = (options: TraitSelectorsFactoryConfig<C>) => S;
export declare type TraitSelectorsFactoryConfig<
  C extends AllTraitConfigs = AllTraitConfigs
> = {
  previousSelectors: TraitSelectors<unknown> | undefined;
  allConfigs: C;
};
export declare type TraitInitialStateFactory<
  State = unknown,
  C extends AllTraitConfigs = AllTraitConfigs
> = (options: TraitInitialStateFactoryConfig<C>) => State;
export declare type TraitInitialStateFactoryConfig<
  C extends AllTraitConfigs = AllTraitConfigs
> = {
  previousInitialState: any;
  allConfigs: C;
};
export declare type TraitStateMutatorsFactory<
  State = unknown,
  M extends TraitStateMutators<State> = TraitStateMutators<State>,
  C extends AllTraitConfigs = AllTraitConfigs
> = (options: TraitStateMutatorsFactoryConfig<C>) => M;
export declare type TraitStateMutatorsFactoryConfig<
  C extends AllTraitConfigs = AllTraitConfigs
> = {
  allSelectors: TraitSelectors<any>;
  previousMutators: TraitStateMutators<unknown> | undefined;
  allConfigs: C;
};
export declare type TraitReducerFactory<
  State = unknown,
  A extends TraitActions = TraitActions,
  S extends TraitSelectors<State> = TraitSelectors<State>,
  M extends TraitStateMutators<State> = TraitStateMutators<State>,
  C extends AllTraitConfigs = AllTraitConfigs
> = (
  options: TraitReducerFactoryConfig<State, A, S, M, C>
) => (initialState: State, action: Action) => State;
export declare type TraitReducerFactoryConfig<
  State = unknown,
  A extends TraitActions = TraitActions,
  S extends TraitSelectors<State> = TraitSelectors<State>,
  M extends TraitStateMutators<State> = TraitStateMutators<State>,
  C extends AllTraitConfigs = AllTraitConfigs
> = {
  initialState: State;
  allActions: A;
  allSelectors: S;
  allMutators: M;
  allConfigs: C;
};
export declare type TraitEffectsFactory<
  State = unknown,
  A extends TraitActions = TraitActions,
  S extends TraitSelectors<State> = TraitSelectors<State>,
  C extends AllTraitConfigs = AllTraitConfigs
> = (options: TraitEffectsFactoryConfig<State, A, S, C>) => Type<TraitEffect>[];
export declare type TraitEffectsFactoryConfig<
  State = unknown,
  A extends TraitActions = TraitActions,
  S extends TraitSelectors<State> = TraitSelectors<State>,
  C extends AllTraitConfigs = AllTraitConfigs
> = {
  allActions: A;
  allSelectors: S;
  allConfigs: C;
};
export declare type KeyedConfig<KEY extends string, C> = Record<string, any> &
  {
    [K in KEY]?: C;
  };
export interface TraitFactory<
  State = any,
  A extends TraitActions = any,
  S extends TraitSelectors<State> = any,
  M extends TraitStateMutators<State> = any,
  KEY extends string = string,
  C = any,
  KC = KeyedConfig<KEY, C>
> {
  key: KEY;
  config?: C;
  depends?: string[];
  actions?: TraitActionsFactory<A, KC>;
  selectors?: TraitSelectorsFactory<State, S, KC>;
  initialState?: TraitInitialStateFactory<State, KC>;
  mutators?: TraitStateMutatorsFactory<State, M, KC>;
  reducer?: TraitReducerFactory<State, A, S, M, KC>;
  effects?: TraitEffectsFactory<State, A, S, KC>;
}
declare type ExtractArrayElementTypes<X> = X extends ReadonlyArray<infer T>
  ? T
  : never;
declare type UnionToIntersection<T> = (
  T extends any ? (x: T) => any : never
) extends (x: infer R) => any
  ? R
  : never;
export declare type ExtractStateType<T> = T extends TraitFactory<infer State>
  ? State
  : T extends ReadonlyArray<TraitFactory>
  ? UnionToIntersection<ExtractStateType<ExtractArrayElementTypes<T>>>
  : never;
export declare type ExtractActionsType<T> = T extends TraitFactory<any, infer A>
  ? A
  : T extends ReadonlyArray<TraitFactory>
  ? UnionToIntersection<ExtractActionsType<ExtractArrayElementTypes<T>>>
  : never;
export declare type ExtractSelectorsType<T> = T extends TraitFactory<
  any,
  any,
  infer S
>
  ? S
  : T extends ReadonlyArray<TraitFactory>
  ? UnionToIntersection<ExtractSelectorsType<ExtractArrayElementTypes<T>>>
  : never;
export declare type ExtractMutatorsType<T> = T extends TraitFactory<
  any,
  any,
  any,
  infer M
>
  ? M
  : T extends ReadonlyArray<TraitFactory>
  ? UnionToIntersection<ExtractMutatorsType<ExtractArrayElementTypes<T>>>
  : never;
export declare type ExtractKeyedConfigType<T> = T extends TraitFactory<
  any,
  any,
  any,
  any,
  infer KEY,
  infer C
>
  ? KeyedConfig<KEY, C>
  : T extends ReadonlyArray<TraitFactory>
  ? UnionToIntersection<ExtractKeyedConfigType<ExtractArrayElementTypes<T>>>
  : never;
export declare type PrefixProps<T, P extends string> = {
  [K in keyof T as `${P}${Capitalize<string & K>}`]: T[K];
};
export declare type PostfixProps<T, P extends string> = {
  [K in keyof T as `${Uncapitalize<string & K>}${Capitalize<P>}`]: T[K];
};
export {};
