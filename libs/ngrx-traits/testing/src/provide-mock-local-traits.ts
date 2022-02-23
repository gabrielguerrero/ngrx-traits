import {
  EntityFeatureFactory,
  TraitsLocalStore,
  DISABLE_LOCAL_TRAIT_EFFECTS,
} from 'ngrx-traits';
import { Injector, Provider, Type } from '@angular/core';
import { EffectSources } from '@ngrx/effects';
import { MockStore } from '@ngrx/store/testing';

/*
 * NOTE: provideMockStore({initialState}) initialState will be ignored with local traits store!
 * Override selectors instead
 *
 * You still need to provideMockStore and provideMockActions
 * */
export function provideMockLocalTraits<
  T extends TraitsLocalStore<EntityFeatureFactory<any, any>>
>({
  traitFactory,
  selectors,
}: {
  traitFactory: Type<T>;
  selectors?: {
    [key in keyof T['selectors']]?: ReturnType<T['selectors'][key]>;
  };
}): Provider[] {
  return [
    { provide: DISABLE_LOCAL_TRAIT_EFFECTS, useValue: true },
    {
      provide: EffectSources,
      useValue: {
        addEffects: () => {
          return;
        },
      },
    },
    {
      provide: traitFactory,
      deps: [Injector, MockStore],
      useFactory: (injector: Injector, mockStore: MockStore) => {
        const trait = new traitFactory(injector);
        if (selectors) {
          Object.keys(selectors).forEach(
            (key) =>
              trait.selectors?.[key] &&
              mockStore.overrideSelector(trait.selectors[key], selectors?.[key])
          );
        }
        return trait;
      },
    },
  ];
}
