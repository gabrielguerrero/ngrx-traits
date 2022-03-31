import { Injectable, Injector, OnDestroy } from '@angular/core';
import { BaseEntityFeatureFactory, EntityFeatureFactory } from '../model';
import { createFeatureSelector, ReducerManager, Store } from '@ngrx/store';
import { Actions, EffectSources } from '@ngrx/effects';
import { getDestroyActionName, TraitEffect } from '../trait-effect';
import { DISABLE_LOCAL_TRAIT_EFFECTS } from './disable-local-trait-effects.token';

let id = 0;
function uniqueComponentId() {
  return id++;
}

export function buildLocalTraits<
  State,
  F extends BaseEntityFeatureFactory<any, any, any>
>(injector: Injector, componentName: string, traitFactory: F) {
  const reducers = injector.get(ReducerManager);
  const effects = injector.get(EffectSources);
  const store = injector.get(Store);
  const componentId = `${componentName}_${uniqueComponentId()}`;

  const traits = traitFactory({
    featureSelector: createFeatureSelector<State>(componentId),
    actionsGroupKey: `[${componentId}]`,
  }) as ReturnType<F>;

  traits.reducer && reducers.addReducer(componentId, traits.reducer);

  const providers =
    (traits.effects && [...traits.effects.map((e) => ({ provide: e }))]) || [];

  const disableLocalTraitsEffects = injector.get(
    DISABLE_LOCAL_TRAIT_EFFECTS,
    false
  );
  if (!disableLocalTraitsEffects) {
    const i = Injector.create({
      providers: providers,
      parent: injector,
    });

    traits.effects?.forEach((e) => {
      const effect = i.get(e) as TraitEffect;
      effect.componentId = componentId;
      effects.addEffects(effect);
    });
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
    actions: traits.actions,
    selectors: traits.selectors,
    addEffects(localEffect: TraitEffect) {
      localEffect.componentId = componentId;
      effects.addEffects(localEffect);
    },
  };
}

export interface Type<T> extends Function {
  new (...args: any[]): T;
}

export interface LocalTraitsConfig<
  F extends BaseEntityFeatureFactory<any, any, any>
> {
  componentName: string;
  traitsFactory: F;
}

@Injectable()
export abstract class TraitsLocalStore<
    F extends BaseEntityFeatureFactory<any, any, any>
  >
  extends TraitEffect
  implements OnDestroy
{
  traits: {
    actions: ReturnType<F>['actions'];
    selectors: ReturnType<F>['selectors'];
    destroy: () => void;
    addEffects: (localEffect: TraitEffect) => void;
  };

  localActions: ReturnType<F>['actions'];
  localSelectors: ReturnType<F>['selectors'];

  public constructor(public injector: Injector) {
    super(injector.get(Actions), injector.get(Store));
    const config = this.setup();
    this.traits = buildLocalTraits(
      this.injector,
      config.componentName,
      config.traitsFactory
    );
    this.localActions = this.traits.actions;
    this.localSelectors = this.traits.selectors;
  }

  abstract setup(): LocalTraitsConfig<F>;

  ngOnDestroy() {
    this.traits.destroy();
  }
}
