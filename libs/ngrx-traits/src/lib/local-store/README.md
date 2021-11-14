# NGRX-Traits

###Local Store Traits
Set of utilities to transform a set of traits which normally are global estate to be transformed in local state for a component,
meaning the effects, reducers and state are created and later destroyed when a component respectively created and destroyed

To use it first you need a trait factory like the following, (it can have any combination of traits)

```typescript
const productTraits = createEntityFeatureFactory(
  addLoadEntities<Product>(),
  addSingleSelection<Product>(),
  addFilter<Product, ProductFilter>({
    filterFn: (filter, entity) => {
      return entity.name.toLowerCase().includes(filter.search.toLowerCase());
    },
  }),
  addSort<Product>({
    defaultSort: { direction: 'asc', active: 'name' },
  })
);
```

The next step is optional, if the state of your component needs to be instantiated from a backend call or needs any sort of side effects you can add an extra effect a follows:

```typescript
const productsEffect: TraitLocalEffectsFactory<typeof productTraits> = (
  allActions
) => {
  @Injectable()
  class ProductsEffects extends TraitEffect {
    loadProducts$ = createEffect(() =>
      this.actions$.pipe(
        ofType(allActions.loadEntities),
        switchMap(() =>
          //call your service to get the products data
          this.productService.getProducts().pipe(
            map((products) => allActions.loadEntitiesSuccess({ entities: products })),
            catchError(() => of(allActions.loadEntitiesFail()))
          )
        )
      )
    );

    constructor(
      actions$: Actions,
      store: Store,
      private productService: ProductService
    ) {
      super(actions$, store);
    }
  }
  return ProductsEffects;
};
```

Notice this is a normal effect wrap in a function, an important bit is `practiceEffect: TraitLocalEffectsFactory<typeof traitsFactory>`
the _typeof traitsFactory_ gives the types for the allActions and allSelectors params from the traitsFactory, you could also simply add your own types to the allActions and allSelectors params by using the traits actions in and selectors interfaces like `allActions:LoadEntitiesActions<MyEntity> & FilterActions<MyEntities>`.

In the future you will be able to add custom actions, selectors, reducers, and effects but for now is just an extra effect which should help with most of the cases, but this means the logic inside the effect is currently is limited to only use traits actions or global action no custom actions, if you need custom logic you can mix it with ngrx component store

The next step is to create a service that will be use in your component, it needs to extend `TraitsLocalStore< typeof traitsFactory>` again notice the use of **typeof** to get the types of the traits factory you created.

```typescript
@Injectable()
export class ProductsLocalTraits extends TraitsLocalStore<
  typeof productTraits
  > {
  setup(): LocalTraitsConfig<typeof productTraits> {
    return {
      componentName: 'ProductsPickerComponent',
      traitsFactory: productTraits,
      effectFactory: productsEffect,
    };
  }
}
```

The **effectFactory** param in the setup method is optional. By extending **TraitsLocalStore** you get an _actions_ and _selectors_ properties in the service with all the actions and selectors you set up in your trait factory.

Now we are ready to use the service in our component, basically just need to add the service we just created in the providers property of the _@Component_ like `providers: [ProductsLocalTraits],` and declare the service in the constructor of your component, after that you use like you will use normal actions and selectors for example:

```typescript
.
.
.
  providers: [ProductsLocalTraits], //<- Our local store service
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductSelectDialogComponent implements OnInit {
  data$ = combineLatest([
    //using local traits selectors
    this.store.select(this.localTraits.selectors.selectAll),
    this.store.select(this.localTraits.selectors.isLoading),
    this.store.select(this.localTraits.selectors.selectEntitySelected),
    // you could mix it with normal selectors
    // this.store.select(UserSelectors.selectCurrentUser),
  ]).pipe(
    map(([products, isLoading, selectedProduct]) => ({
      products,
      isLoading,
      selectedProduct,
    }))
  );

  constructor(private store: Store,
              private localTraits: ProductsLocalTraits // inject our service
  ) {}

  ngOnInit() {
    // firing a local trait action like a normal action
    this.store.dispatch(this.localTraits.actions.loadEntities());
  }

  select(id: string) {
    this.store.dispatch(this.localTraits.actions.select({ id }));
  }

  filter(filters: ProductFilter) {
    this.store.dispatch(this.localTraits.actions.filter({ filters }));
  }
  sort(sort: Sort<Product>) {
    this.store.dispatch(this.localTraits.actions.sort(sort));
  }
}
```

Extending **TraitsLocalStore** allows you to only get one set of traits this normally should be enough, but it could happen that you need more than one traitFactory, if so you need to create a service like the following:

```typescript
@Injectable()
export class ProductsLocalTraits implements OnDestroy {
  traits1 = buildLocalTraits(
    this.injector,
    'ProductsDropdownComponent',
    traitsFactory1,
    practiceEffect1
  );
  traits2 = buildLocalTraits(
    this.injector,
    'ProductsDropdownComponent',
    traitsFactory2,
    practiceEffect2
  );

  actions1 = this.traits1.actions;
  selectors1 = this.traits1.selectors;

  actions2 = this.traits2.actions;
  selectors2 = this.traits2.selectors;

  constructor(private injector: Injector) {}

  ngOnDestroy() {
    // Very important be sure to call the traits destroy here
    this.traits1.destroy();
    this.traits2.destroy();
  }
}
```

Essentially you just need to use **buildLocalTraits** to create the traits and then use your preferred way to store the actions and selectors, but be sure to implement a **ngOnDestroy** and call the destroy method in the resulting traits, which ensures the effects and reducers are clean when the component is destroyed
