import {
  EntityFeatureFactory,
  TraitsLocalStore,
  DISABLE_LOCAL_TRAIT_EFFECTS,
} from '@ngrx-traits/core';
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
    [key in keyof T['localSelectors']]?: ReturnType<T['localSelectors'][key]>;
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
              trait.localSelectors?.[key] &&
              mockStore.overrideSelector(
                trait.localSelectors[key],
                selectors?.[key]
              )
          );
        }
        return trait;
      },
    },
  ];
}
