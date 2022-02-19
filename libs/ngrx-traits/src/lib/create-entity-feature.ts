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
  TraitActionsFactoryConfig,
  TraitFactory,
  TraitSelectors,
  TraitSelectorsFactoryConfig,
  TraitStateMutators,
  UnionToIntersection,
} from './model';
import {
  Action,
  ActionType,
  createAction,
  createFeatureSelector,
  createReducer,
  createSelector,
  MemoizedSelector,
  on,
} from '@ngrx/store';
import { TraitEffect } from './trait-effect';
import { Type } from './local-store';
import { stringify } from 'ts-jest/dist/utils/json';

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

    const allConfigs = buildAllConfigs(sortedTraits);

    const allActions = buildAllActions(
      sortedTraits,
      config.actionsGroupKey,
      allConfigs
    );

    const allSelectors = buildAllSelectors(sortedTraits, allConfigs);

    const allMutators = buildAllMutators(
      sortedTraits,
      allSelectors,
      allConfigs
    );

    const initialState = buildInitialState(sortedTraits, allConfigs);

    const reducer = buildReducer(
      sortedTraits,
      initialState,
      allActions,
      allSelectors,
      allMutators,
      allConfigs
    );

    const featureSelector =
      typeof config.featureSelector === 'string'
        ? createFeatureSelector<ExtractStateType<F>>(config.featureSelector)
        : config.featureSelector;

    const allFeatureSelectors =
      allSelectors && getSelectorsForFeature(featureSelector, allSelectors);

    const allEffects = buildAllEffects(
      sortedTraits,
      allActions,
      allFeatureSelectors,
      allConfigs
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

function buildAllConfigs(sortedTraits: TraitFactory<any, any, any, any>[]) {
  return sortedTraits.reduce((acc: KeyedConfig<string, any>, factory) => {
    acc[factory.key] = factory.config;
    return acc;
  }, {});
}

function buildAllActions(
  sortedTraits: TraitFactory<any, any, any, any>[],
  actionsGroupKey: string,
  allConfigs: Record<string, any> & { [p: string]: any }
) {
  return sortedTraits.reduce((previousResult: TraitActions, factory) => {
    let result =
      factory?.actions?.({
        actionsGroupKey: actionsGroupKey,
        allConfigs,
      }) ?? {};
    result = previousResult ? { ...previousResult, ...result } : result;
    return result;
  }, {});
}

function buildAllSelectors(
  sortedTraits: TraitFactory<any, any, any, any>[],
  allConfigs: Record<string, any> & { [p: string]: any }
) {
  return sortedTraits.reduce((previousResult: TraitSelectors<any>, factory) => {
    let result =
      factory?.selectors?.({
        previousSelectors: previousResult,
        allConfigs,
      }) ?? {};
    result = previousResult ? { ...previousResult, ...result } : result;
    return result;
  }, {});
}

function buildAllMutators(
  sortedTraits: TraitFactory<any, any, any, any>[],
  allSelectors: TraitSelectors<any>,
  allConfigs: Record<string, any> & { [p: string]: any }
) {
  return (
    sortedTraits.reduce(
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
    ) || {}
  );
}

function buildInitialState(
  sortedTraits: TraitFactory<any, any, any, any>[],
  allConfigs: Record<string, any> & { [p: string]: any }
) {
  return sortedTraits.reduce((previousResult: any, factory) => {
    const result =
      factory?.initialState?.({
        previousInitialState: previousResult,
        allConfigs,
      }) ??
      previousResult ??
      {};
    return result;
  }, {});
}

function buildReducer(
  sortedTraits: TraitFactory<any, any, any, any>[],
  initialState: any,
  allActions: TraitActions,
  allSelectors: TraitSelectors<any>,
  allMutators: TraitStateMutators<any>,
  allConfigs: Record<string, any> & { [p: string]: any }
) {
  return sortedTraits.reduce(
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
}

function buildAllEffects(
  sortedTraits: TraitFactory<any, any, any, any>[],
  allActions: TraitActions,
  allFeatureSelectors: TraitSelectors<any>,
  allConfigs: Record<string, any> & { [p: string]: any }
) {
  return sortedTraits.reduce(
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

export function addProperty<
  F extends readonly TraitFactory[],
  EntityName extends string,
  EntitiesName extends string = `${EntityName}s`
>(
  name: { entityName: EntityName; entitiesName?: EntitiesName },
  ...traits: F
): TraitFactory<
  // EntityName,
  // EntitiesName,
  ExtractStateType<F>,
  ExtractActionsType<F>,
  ExtractSelectorsType<F>,
  ExtractMutatorsType<F>
> {
  const sortedTraits = sortTraits([...traits]);

  const allConfigs = sortedTraits.reduce(
    (acc: KeyedConfig<string, any>, factory) => {
      acc[factory.key] = factory.config;
      return acc;
    },
    {}
  );

  let allActions: ExtractActionsType<F>;
  let allSelectors: ExtractSelectorsType<F>;
  return createTraitFactory({
    key: 'property',
    config: {},
    actions: ({ actionsGroupKey }: TraitActionsFactoryConfig) => {
      allActions = buildAllActions(
        sortedTraits,
        actionsGroupKey,
        allConfigs
      ) as ExtractActionsType<F>;
      return allActions;
    },
    selectors: (options: TraitSelectorsFactoryConfig) => {
      allSelectors = buildAllSelectors(
        sortedTraits,
        allConfigs
      ) as ExtractSelectorsType<F>;
      return allSelectors;
    },
    // reducer: ({ allActions, initialState }) =>
    //   createReducer(
    //     initialState,
    //     on(allActions.reset, () => initialState)
    //   ),
  });
}
export function combineTraits<
  T extends { [key: string]: FeatureFactory<any, any> },
  K extends keyof T
>(
  p: T
): (
  config: Config<{ [P in K]: ExtractStateType<T[P]> }>
) => { [P in K]: ReturnType<T[P]> } {
  return null as any;
}

export function addPropertiesTraits<
  F extends FeatureFactory<any, any>,
  T extends { [key: string]: FeatureFactory<any, any> },
  K extends keyof T
>(
  f: F,
  p: T
): (
  config: Config<{ [P in K]: ExtractStateType<T[P]> }>
) => ExtractActionsType<ReturnType<F>> &
  UnionToIntersection<ExtractActionsType<ReturnType<T[K]>>> {
  return null as any;
}

// export

/// products:{actions, selectors, }, orders: {actions,slectors}
/// { actions: {ProductActions, OrderActions}, selectors: {ProductSelectors, OrderSelectors}
// TODO finish implementing combineTrais and addPropertiesTraits
// TODO finish renaming traits
