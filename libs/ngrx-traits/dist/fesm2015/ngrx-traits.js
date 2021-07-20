import {
  createReducer,
  createSelector,
  Store,
  ReducerManager,
  createFeatureSelector,
} from '@ngrx/store';
import { Injectable, Injector } from '@angular/core';
import { ofType, Actions, EffectSources } from '@ngrx/effects';
import { takeUntil } from 'rxjs/operators';

function createTraitFactory(f) {
  return f;
}
function createEntityFeatureFactory(...traits) {
  return (config) => {
    const sortedTraits = sortTraits([...traits]);
    const allConfigs = sortedTraits.reduce((acc, factory) => {
      acc[factory.key] = factory.config;
      return acc;
    }, {});
    const allActions = sortedTraits.reduce((previousResult, factory) => {
      var _a, _b;
      let result =
        (_b =
          (_a =
            factory === null || factory === void 0
              ? void 0
              : factory.actions) === null || _a === void 0
            ? void 0
            : _a.call(factory, {
                actionsGroupKey: config.actionsGroupKey,
                allConfigs,
              })) !== null && _b !== void 0
          ? _b
          : {};
      result = previousResult
        ? Object.assign(Object.assign({}, previousResult), result)
        : result;
      return result;
    }, {});
    const allSelectors = sortedTraits.reduce((previousResult, factory) => {
      var _a, _b;
      let result =
        (_b =
          (_a =
            factory === null || factory === void 0
              ? void 0
              : factory.selectors) === null || _a === void 0
            ? void 0
            : _a.call(factory, {
                previousSelectors: previousResult,
                allConfigs,
              })) !== null && _b !== void 0
          ? _b
          : {};
      result = previousResult
        ? Object.assign(Object.assign({}, previousResult), result)
        : result;
      return result;
    }, {});
    const allMutators = sortedTraits.reduce((previousResult, factory) => {
      var _a, _b;
      let result =
        (_b =
          (_a =
            factory === null || factory === void 0
              ? void 0
              : factory.mutators) === null || _a === void 0
            ? void 0
            : _a.call(factory, {
                allSelectors: allSelectors,
                previousMutators: previousResult,
                allConfigs,
              })) !== null && _b !== void 0
          ? _b
          : {};
      result = previousResult
        ? Object.assign(Object.assign({}, previousResult), result)
        : result;
      return result;
    }, {});
    const initialState = sortedTraits.reduce((previousResult, factory) => {
      var _a, _b, _c;
      const result =
        (_c =
          (_b =
            (_a =
              factory === null || factory === void 0
                ? void 0
                : factory.initialState) === null || _a === void 0
              ? void 0
              : _a.call(factory, {
                  previousInitialState: previousResult,
                  allConfigs,
                })) !== null && _b !== void 0
            ? _b
            : previousResult) !== null && _c !== void 0
          ? _c
          : {};
      return result;
    }, {});
    const reducer = sortedTraits.reduce((previousResult, factory) => {
      var _a;
      const result =
        (_a =
          factory === null || factory === void 0 ? void 0 : factory.reducer) ===
          null || _a === void 0
          ? void 0
          : _a.call(factory, {
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
        : result !== null && result !== void 0
        ? result
        : previousResult;
    }, undefined);
    const allFeatureSelectors =
      allSelectors &&
      getSelectorsForFeature(config.featureSelector, allSelectors);
    const allEffects = sortedTraits.reduce((previousResult, factory) => {
      var _a, _b;
      let result =
        (_b =
          (_a =
            factory === null || factory === void 0
              ? void 0
              : factory.effects) === null || _a === void 0
            ? void 0
            : _a.call(factory, {
                allActions,
                allSelectors: allFeatureSelectors,
                allConfigs,
              })) !== null && _b !== void 0
          ? _b
          : [];
      result = previousResult ? [...previousResult, ...result] : result;
      return result;
    }, []);
    return {
      actions: allActions,
      selectors: allFeatureSelectors,
      mutators: allMutators,
      initialState,
      reducer:
        reducer !== null && reducer !== void 0
          ? reducer
          : createReducer(initialState),
      effects: allEffects,
    };
  };
}
function sortTraits(traits) {
  var _a;
  const sortedTraits = [];
  for (let i = 0; i < traits.length; i++) {
    const trait = traits[i];
    if (
      !((_a = trait.depends) === null || _a === void 0 ? void 0 : _a.length)
    ) {
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
    const isDependencyAlreadyAdded = sortedTraits.some((tr) => {
      var _a;
      return (
        tr.key ===
        ((_a = trait === null || trait === void 0 ? void 0 : trait.depends) ===
          null || _a === void 0
          ? void 0
          : _a[0])
      );
    });
    if (isDependencyAlreadyAdded) sortedTraits.push(trait);
    else {
      // move trait to the end
      delete traits[i];
      traits.push(trait);
    }
  }
  return sortedTraits;
}
function getSelectorsForFeature(featureSelect, selectors) {
  const ss = {};
  for (const prop in selectors) {
    ss[prop] = createSelector(featureSelect, selectors[prop]);
  }
  return ss;
}
function setPropertyReducer(sourceReducer, property, propertyReducer) {
  return function reducer(state, action) {
    const sourceState = sourceReducer(state, action);
    return Object.assign(Object.assign({}, sourceState), {
      [property]: propertyReducer(sourceState[property], action),
    });
  };
}
function setPropertiesReducer(sourceReducer, propertiesReducers) {
  return function reducer(state, action) {
    const newState = Object.assign({}, sourceReducer(state, action));
    for (const property in propertiesReducers) {
      newState[property] = propertiesReducers[property](
        newState[property],
        action
      );
    }
    return newState;
  };
}
function joinReducers(firstReducer, secondReducer) {
  return function reducer(state, action) {
    const sourceState = firstReducer(state, action);
    return secondReducer(sourceState, action);
  };
}

class TraitEffect {
  constructor(actions$, store) {
    this.actions$ = actions$;
    this.store = store;
    this.name = this.constructor.name;
    this.componentId = '';
  }
  ngrxOnIdentifyEffects() {
    return this.componentId ? this.name + this.componentId : '';
  }
  ngrxOnRunEffects(resolvedEffects$) {
    return this.componentId
      ? resolvedEffects$.pipe(
          takeUntil(
            this.actions$.pipe(ofType(getDestroyActionName(this.componentId)))
          )
        )
      : resolvedEffects$;
  }
}
TraitEffect.decorators = [{ type: Injectable }];
TraitEffect.ctorParameters = () => [{ type: Actions }, { type: Store }];
function getDestroyActionName(id) {
  return `[${id}] Destroyed`;
}

let id = 0;
function uniqueComponentId() {
  return id++;
}
function buildLocalTraits(
  injector,
  componentName,
  traitFactory,
  fetchEffectFactory
) {
  var _a;
  const reducers = injector.get(ReducerManager);
  const effects = injector.get(EffectSources);
  const store = injector.get(Store);
  const componentId = `${componentName}_${uniqueComponentId()}`;
  const traits = traitFactory({
    featureSelector: createFeatureSelector(componentId),
    actionsGroupKey: `[${componentId}]`,
  });
  traits.reducer && reducers.addReducer(componentId, traits.reducer);
  const fetchEffect =
    fetchEffectFactory === null || fetchEffectFactory === void 0
      ? void 0
      : fetchEffectFactory(traits.actions, traits.selectors);
  const providers =
    (traits.effects && [...traits.effects.map((e) => ({ provide: e }))]) || [];
  if (fetchEffect) {
    providers.push({ provide: fetchEffect });
  }
  const i = Injector.create({
    providers: providers,
    parent: injector,
  });
  (_a = traits.effects) === null || _a === void 0
    ? void 0
    : _a.forEach((e) => {
        const effect = i.get(e);
        effect.componentId = componentId;
        effects.addEffects(effect);
      });
  if (fetchEffectFactory) {
    const effect = i.get(fetchEffect);
    effect.componentId = componentId;
    effects.addEffects(effect);
  }
  function destroy() {
    store.dispatch({ type: getDestroyActionName(componentId) });
    /**
     * A service that extends TraitsLocalStore and other component service are destroyed
     * before the component that depends on them, this causes that any subscriptions
     * to selectors of the TraitsLocalStore could fail because the store state is removed before
     * they are unsubscribe by the onDestroy of the component. Executing reducers.removeReducer
     * inside setTimeout ensures the state is remove after the component onDestroy was called,
     * avoiding the before mentioned possible issues.
     */
    setTimeout(() => reducers.removeReducer(componentId));
  }
  return Object.assign({ destroy }, traits);
}
class TraitsLocalStore {
  constructor(injector) {
    this.injector = injector;
    const config = this.setup();
    this.traits = buildLocalTraits(
      this.injector,
      config.componentName,
      config.traitsFactory,
      config.effectFactory
    );
    this.actions = this.traits.actions;
    this.selectors = this.traits.selectors;
  }
  ngOnDestroy() {
    this.traits.destroy();
  }
}
TraitsLocalStore.decorators = [{ type: Injectable }];
TraitsLocalStore.ctorParameters = () => [{ type: Injector }];

function insertIf(condition, getElement) {
  return condition ? [getElement()] : [];
}
function toMap(a) {
  return a.reduce((acum, value) => {
    acum[value] = true;
    return acum;
  }, {});
}

/**
 * Generated bundle index. Do not edit.
 */

export {
  TraitEffect,
  TraitsLocalStore,
  buildLocalTraits,
  createEntityFeatureFactory,
  createTraitFactory,
  getDestroyActionName,
  insertIf,
  joinReducers,
  setPropertiesReducer,
  setPropertyReducer,
  toMap,
};
//# sourceMappingURL=ngrx-traits.js.map
