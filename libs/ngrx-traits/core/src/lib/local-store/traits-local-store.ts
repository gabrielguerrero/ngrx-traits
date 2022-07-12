import { inject, Injectable, Injector, OnDestroy } from '@angular/core';
import { BaseEntityFeatureFactory, EntityFeatureFactory } from '../model';
import { createFeatureSelector, ReducerManager, Store } from '@ngrx/store';
import { Actions, EffectSources } from '@ngrx/effects';
import { getDestroyActionName, TraitEffect } from '../trait-effect';
import { DISABLE_LOCAL_TRAIT_EFFECTS } from './disable-local-trait-effects.token';

let id = 0;
function uniqueComponentId() {
  return id++;
}

/**
 * Builds traitFactory and registers effects and reducers with
 * a generated component id, returns build actions and selectors
 * and a destroy method that will unergister the effects and reducers
 * when called, and a addEffect which can be use to register extra effects
 *
 * Used inside TraitsLocalStore, can be used to create your
 * own Component Service without extending TraitsLocalStore
 * @param injector
 * @param componentName
 * @param traitFactory
 */
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

/**
 * Class used to create local traits service, receives a trait factory, which will be
 * built and its reducers and effect register using a dynamic id when the service is built
 * and get destroyed when the onDestroy lifecycle method of the service is called, if the service
 * has effects this.traits.addEffects(this) should be call in the constructor
 *
 * @example
 * const productFeatureFactory = createEntityFeatureFactory(
 *   { entityName: 'product' },
 *   addLoadEntitiesTrait<Product>(),
 *   addSelectEntityTrait<Product>(),
 * );
 *
 * Injectable()
 * export class ProductsLocalTraits extends TraitsLocalStore<
 *   typeof productFeatureFactory
 * > {
 *   loadProducts$ = createEffect(() =>
 *     this.actions$.pipe(
 *       ofType(this.localActions.loadProducts),
 *       switchMap(() =>
 *         //call your service to get the products data
 *         this.productService.getProducts().pipe(
 *           map((res) =>
 *             this.localActions.loadProductsSuccess({ entities: res.resultList })
 *           ),
 *           catchError(() => of(this.localActions.loadProductsFail()))
 *         )
 *       )
 *     )
 *   );
 *
 *   constructor(injector: Injector, private productService: ProductService) {
 *     super(injector);
 *     this.traits.addEffects(this); // IMPORTANT! add this line if the service has effects
 *   }
 *
 *   setup(): LocalTraitsConfig<typeof productFeatureFactory> {
 *     return {
 *       componentName: 'ProductsPickerComponent',
 *       traitsFactory: productFeatureFactory,
 *     };
 *   }
 * }
 *
 * // use in component later
 *
 * Component({
 *   selector: 'some-component',
 *   template: `<div> some content</div> `,
 *   providers: [ProductsLocalTraits],
 *   changeDetection: ChangeDetectionStrategy.OnPush,
 * })
 * export class ProductSelectDialogComponent implements OnInit {
 *   constructor(private store: Store, private traits: ProductsLocalTraits) {}
 *
 *   ngOnInit() {
 *     this.store.dispatch(this.traits.localActions.loadProducts());
 *   }
 * }
 */
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
  private injector = inject(Injector);

  public constructor() {
    super();
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
