/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { Type } from '@angular/core';
import { Action, ActionType, MemoizedSelector } from '@ngrx/store';
import {
  ActionCreator,
  Selector,
  SelectorWithProps,
} from '@ngrx/store/src/models';

import { TraitEffect } from './trait-effect';

export type TraitActions = {
  [key: string]: ActionCreator<string, (...args: any[]) => Action<string>>;
};

export type TraitSelectors<State> = {
  [key: string]:
    | Selector<State, any>
    | SelectorWithProps<State, any, any>
    | MemoizedSelector<State, any>;
};

export type TraitStateMutators<State> = {
  [key: string]: <S extends State>(...arg: any[]) => S;
};

export interface BaseFeatureTraits<State = any, A = any, S = any> {
  actions: A;
  selectors: S;
  reducer: (state: State, action: ActionType<any>) => State;
  effects: Type<any>[];
  initialState: State;
}

export type FeatureTraits<
  State,
  A extends TraitActions = TraitActions,
  S extends TraitSelectors<State> = TraitSelectors<State>,
> = BaseFeatureTraits<State, A, FeatureSelectors<State, S>>;

export type BaseEntityFeatureFactory<State, A, S> = (
  config: Config<State>,
) => BaseFeatureTraits<State, A, S>;

export type EntityFeatureFactory<
  EntityName extends string | undefined,
  EntitiesName extends string = `${EntityName}s`,
  State = any,
  A extends TraitActions = TraitActions,
  S extends TraitSelectors<State> = TraitSelectors<State>,
> = (
  config: Config<State>,
) => FeatureTraits<
  State,
  EntityName extends string
    ? ReplaceEntityNames<A, EntityName, EntitiesName>
    : A,
  EntityName extends string
    ? ReplaceEntityNames<S, EntityName, EntitiesName>
    : S
>;

export type Config<
  State,
  F extends MemoizedSelector<object, State> = MemoizedSelector<object, State>,
> = {
  actionsGroupKey: string;
  featureSelector: F | string;
};

export type FeatureSelectors<State, S extends TraitSelectors<State>> = {
  [key in keyof S]: MemoizedSelector<object, ReturnType<S[key]>, S[key]>;
};

// TODO see if we can make AllTraitConfigs extends or use KeyedConfig
export type AllTraitConfigs = {
  [id: string]: any;
};

export type TraitActionsFactory<
  A extends TraitActions = TraitActions,
  C extends AllTraitConfigs = AllTraitConfigs,
> = (options: TraitActionsFactoryConfig<C>) => A;

export type TraitActionsFactoryConfig<
  C extends AllTraitConfigs = AllTraitConfigs,
> = {
  actionsGroupKey: string;
  entityName: string;
  entitiesName: string;
  allConfigs: C;
};
export type TraitSelectorsFactory<
  State = unknown,
  S extends TraitSelectors<State> = TraitSelectors<State>,
  C extends AllTraitConfigs = AllTraitConfigs,
> = (options: TraitSelectorsFactoryConfig<C>) => S;

export type TraitSelectorsFactoryConfig<
  C extends AllTraitConfigs = AllTraitConfigs,
> = {
  previousSelectors: TraitSelectors<unknown> | undefined;
  allConfigs: C;
};
export type TraitInitialStateFactory<
  State = unknown,
  C extends AllTraitConfigs = AllTraitConfigs,
> = (options: TraitInitialStateFactoryConfig<C>) => State;

export type TraitInitialStateFactoryConfig<
  C extends AllTraitConfigs = AllTraitConfigs,
> = {
  previousInitialState: any;
  allConfigs: C;
};

export type TraitStateMutatorsFactory<
  State = unknown,
  M extends TraitStateMutators<State> = TraitStateMutators<State>,
  C extends AllTraitConfigs = AllTraitConfigs,
> = (options: TraitStateMutatorsFactoryConfig<C>) => M;

export type TraitStateMutatorsFactoryConfig<
  C extends AllTraitConfigs = AllTraitConfigs,
> = {
  allSelectors: TraitSelectors<any>;
  previousMutators: TraitStateMutators<unknown> | undefined;
  allConfigs: C;
};

export type TraitReducerFactory<
  State = unknown,
  A extends TraitActions = TraitActions,
  S extends TraitSelectors<State> = TraitSelectors<State>,
  M extends TraitStateMutators<State> = TraitStateMutators<State>,
  C extends AllTraitConfigs = AllTraitConfigs,
> = (
  options: TraitReducerFactoryConfig<State, A, S, M, C>,
) => (initialState: State, action: Action) => State;

export type TraitReducerFactoryConfig<
  State = unknown,
  A extends TraitActions = TraitActions,
  S extends TraitSelectors<State> = TraitSelectors<State>,
  M extends TraitStateMutators<State> = TraitStateMutators<State>,
  C extends AllTraitConfigs = AllTraitConfigs,
> = {
  initialState: State;
  allActions: A;
  allSelectors: S;
  allMutators: M;
  allConfigs: C;
};

export type TraitEffectsFactory<
  State = unknown,
  A extends TraitActions = TraitActions,
  S extends TraitSelectors<State> = TraitSelectors<State>,
  C extends AllTraitConfigs = AllTraitConfigs,
> = (options: TraitEffectsFactoryConfig<State, A, S, C>) => Type<TraitEffect>[];

export type TraitEffectsFactoryConfig<
  State = unknown,
  A extends TraitActions = TraitActions,
  S extends TraitSelectors<State> = TraitSelectors<State>,
  C extends AllTraitConfigs = AllTraitConfigs,
> = {
  allActions: A;
  allSelectors: S;
  allConfigs: C;
};

export type KeyedConfig<KEY extends string, C> = Record<string, any> & {
  [K in KEY]?: C;
};

export interface TraitFactory<
  State = any,
  A extends TraitActions = any,
  S extends TraitSelectors<State> = any,
  M extends TraitStateMutators<State> = any,
  KEY extends string = string,
  C = any,
  KC extends AllTraitConfigs = KeyedConfig<KEY, C>,
> {
  key: KEY;
  config?: C;
  depends?: string[];
  actions: TraitActionsFactory<A, KC>;
  selectors: TraitSelectorsFactory<State, S, KC>;
  initialState: TraitInitialStateFactory<State, KC>;
  mutators: TraitStateMutatorsFactory<State, M, KC>;
  reducer?: TraitReducerFactory<State, A, S, M, KC>;
  effects?: TraitEffectsFactory<State, A, S, KC>;
}
type ExtractArrayElementTypes<X> = X extends ReadonlyArray<infer T> ? T : never;

export type UnionToIntersection<T> = (
  T extends any ? (x: T) => any : never
) extends (x: infer R) => any
  ? R
  : never;

export type ExtractStateType<T> =
  T extends TraitFactory<infer State>
    ? State
    : T extends ReadonlyArray<TraitFactory>
      ? UnionToIntersection<ExtractStateType<ExtractArrayElementTypes<T>>>
      : T extends BaseFeatureTraits<infer State>
        ? State
        : never;

export type ExtractActionsType<T> =
  T extends TraitFactory<any, infer A>
    ? A
    : T extends ReadonlyArray<TraitFactory>
      ? UnionToIntersection<ExtractActionsType<ExtractArrayElementTypes<T>>>
      : T extends BaseFeatureTraits<any, infer A>
        ? A
        : never;

export type ExtractSelectorsType<T> =
  T extends TraitFactory<any, any, infer S>
    ? S
    : T extends ReadonlyArray<TraitFactory>
      ? UnionToIntersection<ExtractSelectorsType<ExtractArrayElementTypes<T>>>
      : T extends BaseFeatureTraits<any, any, infer S>
        ? S
        : never;

export type ExtractMutatorsType<T> =
  T extends TraitFactory<any, any, any, infer M>
    ? M
    : T extends ReadonlyArray<TraitFactory>
      ? UnionToIntersection<ExtractMutatorsType<ExtractArrayElementTypes<T>>>
      : never;

export type ExtractKeyedConfigType<T> =
  T extends TraitFactory<any, any, any, any, infer KEY, infer C>
    ? KeyedConfig<KEY, C>
    : T extends ReadonlyArray<TraitFactory>
      ? UnionToIntersection<ExtractKeyedConfigType<ExtractArrayElementTypes<T>>>
      : never;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type PrefixProps<T, P extends string> = {
  [K in keyof T as `${P}${Capitalize<string & K>}`]: T[K];
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type PostfixProps<T, P extends string> = {
  [K in keyof T as `${Uncapitalize<string & K>}${Capitalize<P>}`]: T[K];
};

type Replace<
  Target extends string,
  FindKey extends string,
  FindKey2 extends string,
  ReplaceKey extends string,
  ReplaceKey2 extends string,
> = Target extends `${infer Prefix}${FindKey}${infer Postfix}`
  ? `${Prefix}${Capitalize<ReplaceKey>}${Postfix}`
  : Target extends `${infer Prefix}${FindKey2}${infer Postfix}`
    ? `${Prefix}${Capitalize<ReplaceKey2>}${Postfix}`
    : Target;

export type ReplaceProps<
  Target,
  FindKey extends string,
  FindKey2 extends string,
  ReplaceKey extends string,
  ReplaceKey2 extends string,
> = {
  [Prop in keyof Target as Replace<
    string & Prop,
    FindKey,
    FindKey2,
    ReplaceKey,
    ReplaceKey2
  >]: Target[Prop];
};
export type ReplaceEntityNames<
  T,
  EntityName extends string,
  EntitiesName extends string,
> = ReplaceProps<T, 'Entities', 'Entity', EntitiesName, EntityName>;
