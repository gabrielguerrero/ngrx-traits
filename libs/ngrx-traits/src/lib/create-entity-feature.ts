import {
  Config,
  ExtractActionsType,
  ExtractMutatorsType,
  ExtractSelectorsType,
  ExtractStateType,
  FeatureFactory,
  FeatureSelectors,
  KeyedConfig,
  TraitActions,
  TraitFactory,
  TraitSelectors,
  TraitStateMutators,
} from './model';
import {
  Action,
  ActionType,
  createReducer,
  createSelector,
  MemoizedSelector,
} from '@ngrx/store';
import { TraitEffect } from './trait-effect';
import { Type } from './local-store';

export function createTraitFactory<
  State = {},
  A extends TraitActions = TraitActions,
  S extends TraitSelectors<State> = TraitSelectors<State>,
  M extends TraitStateMutators<State> = TraitStateMutators<State>,
  KEY extends string = string,
  C = unknown,
  KC = KeyedConfig<KEY, C>
>(f: TraitFactory<State, A, S, M, KEY, C, KC>) {
  return f;
}
export function createEntityFeatureFactory<
  F extends readonly TraitFactory[]
  // EntityName extends string,
  // EntitiesName extends string = `${EntityName}s`
>(
  // entityName: EntityName,
  // entitiesName: EntitiesName,
  ...traits: F
): FeatureFactory<
  undefined,
  '',
  ExtractStateType<F>,
  ExtractActionsType<F>,
  ExtractSelectorsType<F>,
  ExtractMutatorsType<F>
>;
export function createEntityFeatureFactory<
  F extends readonly TraitFactory[],
  EntityName extends string,
  EntitiesName extends string = `${EntityName}s`
>(
  name: { entityName: EntityName; entitiesName?: EntitiesName },
  ...traits: F
): FeatureFactory<
  EntityName,
  EntitiesName,
  ExtractStateType<F>,
  ExtractActionsType<F>,
  ExtractSelectorsType<F>,
  ExtractMutatorsType<F>
>;

export function createEntityFeatureFactory<
  F extends readonly TraitFactory[],
  EntityName extends string,
  EntitiesName extends string = `${EntityName}s`
>(
  name: { entityName: EntityName; entitiesName?: EntitiesName } | undefined,
  ...traits: F
): FeatureFactory<
  EntityName,
  EntitiesName,
  ExtractStateType<F>,
  ExtractActionsType<F>,
  ExtractSelectorsType<F>,
  ExtractMutatorsType<F>
> {
  return ((config: Config<any, any>) => {
    const sortedTraits = sortTraits([...traits]);

    const allConfigs = sortedTraits.reduce(
      (acc: KeyedConfig<string, any>, factory) => {
        acc[factory.key] = factory.config;
        return acc;
      },
      {}
    );

    const allActions = sortedTraits.reduce(
      (previousResult: TraitActions, factory) => {
        let result =
          factory?.actions?.({
            actionsGroupKey: config.actionsGroupKey,
            allConfigs,
          }) ?? {};
        result = previousResult ? { ...previousResult, ...result } : result;
        return result;
      },
      {}
    );

    const allSelectors = sortedTraits.reduce(
      (previousResult: TraitSelectors<any>, factory) => {
        let result =
          factory?.selectors?.({
            previousSelectors: previousResult,
            allConfigs,
          }) ?? {};
        result = previousResult ? { ...previousResult, ...result } : result;
        return result;
      },
      {}
    );

    const allMutators = sortedTraits.reduce(
      (previousResult: TraitStateMutators<any> | undefined, factory) => {
        let result =
          factory?.mutators?.({
            allSelectors: allSelectors,
            previousMutators: previousResult,
            allConfigs,
          }) ?? {};
        result = previousResult ? { ...previousResult, ...result } : result;
        return result;
      },
      {}
    );

    const initialState = sortedTraits.reduce((previousResult: any, factory) => {
      const result =
        factory?.initialState?.({
          previousInitialState: previousResult,
          allConfigs,
        }) ??
        previousResult ??
        {};
      return result;
    }, {});

    const reducer = sortedTraits.reduce(
      (
        previousResult: ((state: any, action: Action) => any) | undefined,
        factory
      ) => {
        const result = factory?.reducer?.({
          initialState,
          allActions,
          allSelectors,
          allMutators,
          allConfigs,
        });
        return result && previousResult
          ? (state = initialState, action) => {
              const aState = previousResult(state, action);
              return result(aState, action);
            }
          : result ?? previousResult;
      },
      undefined
    );

    const allFeatureSelectors =
      allSelectors &&
      getSelectorsForFeature(config.featureSelector, allSelectors);

    const allEffects = sortedTraits.reduce(
      (previousResult: Type<TraitEffect>[] | undefined, factory) => {
        let result =
          factory?.effects?.({
            allActions,
            allSelectors: allFeatureSelectors,
            allConfigs,
          }) ?? [];
        result = previousResult ? [...previousResult, ...result] : result;
        return result;
      },
      []
    );

    return {
      actions: allActions,
      selectors: allFeatureSelectors,
      mutators: allMutators,
      initialState,
      reducer: reducer ?? createReducer(initialState),
      effects: allEffects,
    };
  }) as FeatureFactory<
    EntityName,
    EntitiesName,
    ExtractStateType<F>,
    ExtractActionsType<F>,
    ExtractSelectorsType<F>,
    ExtractMutatorsType<F>
  >;
}

function sortTraits(
  traits: TraitFactory<any, any, any, any>[]
): TraitFactory<any, any, any, any>[] {
  const sortedTraits: TraitFactory<any, any, any, any>[] = [];
  for (let i = 0; i < traits.length; i++) {
    const trait = traits[i];
    if (!trait.depends?.length) {
      sortedTraits.push(trait);
      continue;
    }
    if (trait.depends.length > 1)
      for (const d of trait.depends) {
        const isTraitPresent = traits.some((tr) => tr.key === d);
        if (isTraitPresent) {
          trait.depends = [d];
          break;
        }
      }
    if (trait.depends.length > 1)
      throw Error('could not find dependencies ' + trait.depends.join(' '));
    const isDependencyAlreadyAdded = sortedTraits.some(
      (tr) => tr.key === trait?.depends?.[0]
    );

    if (isDependencyAlreadyAdded) sortedTraits.push(trait);
    else {
      // move trait to the end
      delete traits[i];
      traits.push(trait);
    }
  }
  return sortedTraits;
}

function getSelectorsForFeature<
  State,
  S extends TraitSelectors<State>,
  // eslint-disable-next-line @typescript-eslint/ban-types
  F extends MemoizedSelector<object, any>
>(featureSelect: F, selectors: S): FeatureSelectors<State, S> {
  const ss: { [key in keyof S]?: any } = {};
  for (const prop in selectors) {
    ss[prop] = createSelector(featureSelect as any, selectors[prop] as any);
  }
  return ss as FeatureSelectors<State, S>;
}

export function setPropertyReducer<State, P extends keyof State>(
  sourceReducer: (state: State, action: ActionType<any>) => State,
  property: P,
  propertyReducer: (state: State[P], action: ActionType<any>) => State[P]
): (state: State, action: ActionType<any>) => State {
  return function reducer(state: State, action: ActionType<any>): State {
    const sourceState = sourceReducer(state, action);
    return {
      ...sourceState,
      [property]: propertyReducer(sourceState[property], action),
    };
  };
}
export function setPropertiesReducer<State, P extends keyof State>(
  sourceReducer: (state: State, action: ActionType<any>) => State,
  propertiesReducers: {
    [key in P]: (state: State[P], action: ActionType<any>) => State[P];
  }
): (state: State, action: ActionType<any>) => State {
  return function reducer(state: State, action: ActionType<any>): State {
    const newState = { ...sourceReducer(state, action) };
    for (const property in propertiesReducers) {
      newState[property as P] = propertiesReducers[property](
        newState[property],
        action
      );
    }
    return newState;
  };
}

export function joinReducers<State>(
  firstReducer: (state: State, action: ActionType<any>) => State,
  secondReducer: (state: any, action: ActionType<any>) => any
): (state: State, action: ActionType<any>) => State {
  return function reducer(state: State, action: ActionType<any>): State {
    const sourceState = firstReducer(state, action);
    return secondReducer(sourceState, action);
  };
}
