import { Injectable, Injector } from '@angular/core';
import { FeatureFactory } from '../model';
import { createFeatureSelector, ReducerManager, Store } from '@ngrx/store';
import { EffectSources } from '@ngrx/effects';
import { getDestroyActionName, TraitEffect } from '../trait-effect';

let id = 0;
function uniqueComponentId() {
  return id++;
}

export function buildLocalTraits<
  State,
  F extends FeatureFactory<State, any, any, any>
>(
  injector: Injector,
  componentName: string,
  traitFactory: F,
  fetchEffectFactory?: TraitLocalEffectsFactory<F>
) {
  const reducers = injector.get(ReducerManager);
  const effects = injector.get(EffectSources);
  const store = injector.get(Store);
  const componentId = `${componentName}_${uniqueComponentId()}`;

  const traits = traitFactory({
    featureSelector: createFeatureSelector<State>(componentId),
    actionsGroupKey: `[${componentId}]`,
  }) as ReturnType<F>;

  traits.reducer && reducers.addReducer(componentId, traits.reducer);

  const fetchEffect = fetchEffectFactory?.(traits.actions, traits.selectors);

  const providers =
    (traits.effects && [...traits.effects.map((e) => ({ provide: e }))]) || [];
  if (fetchEffect) {
    providers.push({ provide: fetchEffect });
  }

  const i = Injector.create({
    providers: providers,
    parent: injector,
  });

  traits.effects?.forEach((e) => {
    const effect = i.get(e) as TraitEffect;
    effect.componentId = componentId;
    effects.addEffects(effect);
  });

  if (fetchEffectFactory) {
    const effect = i.get(fetchEffect) as TraitEffect;
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

  return {
    destroy,
    ...traits,
  };
}

export interface Type<T> extends Function {
  new (...args: any[]): T;
}

export interface TraitLocalEffectsFactory<F extends FeatureFactory> {
  (
    allActions: ReturnType<F>['actions'],
    allSelectors: ReturnType<F>['selectors']
  ): Type<TraitEffect>;
}

export interface LocalTraitsConfig<F extends FeatureFactory> {
  componentName: string;
  traitsFactory: F;
  effectFactory?: TraitLocalEffectsFactory<F>;
}

@Injectable()
export abstract class TraitsLocalStore<F extends FeatureFactory> {
  traits: ReturnType<F> & { destroy: () => void };

  actions: ReturnType<F>['actions'];
  selectors: ReturnType<F>['selectors'];

  public constructor(public injector: Injector) {
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

  abstract setup(): LocalTraitsConfig<F>;

  ngOnDestroy() {
    this.traits.destroy();
  }
}
