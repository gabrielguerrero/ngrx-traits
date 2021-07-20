import { Injector } from '@angular/core';
import { FeatureFactory } from '../model';
import { TraitEffect } from '../trait-effect';
export declare function buildLocalTraits<
  State,
  F extends FeatureFactory<State, any, any, any>
>(
  injector: Injector,
  componentName: string,
  traitFactory: F,
  fetchEffectFactory?: TraitLocalEffectsFactory<F>
): {
  destroy: () => void;
} & ReturnType<F>;
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
export declare abstract class TraitsLocalStore<F extends FeatureFactory> {
  injector: Injector;
  traits: ReturnType<F> & {
    destroy: () => void;
  };
  actions: ReturnType<F>['actions'];
  selectors: ReturnType<F>['selectors'];
  constructor(injector: Injector);
  abstract setup(): LocalTraitsConfig<F>;
  ngOnDestroy(): void;
}
