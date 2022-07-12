# NGRX-Traits

###Local Store Traits
Set of utilities to transform a set of traits which normally are global estate to be transformed in local state for a component,
meaning the effects, reducers and state are created and later destroyed when a component respectively created and destroyed

To use it first you need a trait factory like the following, (it can have any combination of traits)

```typescript
const productFeatureFactory = createEntityFeatureFactory(
  { entityName: 'product' },
  addLoadEntitiesTrait<Product>(),
  addSelectEntityTrait<Product>(),
  addFilterEntitiesTrait<Product, ProductFilter>({
    filterFn: (filter, entity) => {
      return !filter.search  || entity.name.toLowerCase().includes(filter.search.toLowerCase());
    },
  }),
  addSortEntitiesTrait<Product>({
    defaultSort: { direction: 'asc', active: 'name' },
  })
);
```

The next step is to create a service that will be use in your component, it needs to extend `TraitsLocalStore< typeof traitsFactory>` notice the use of **typeof** to get the types of the traits factory you created.

```typescript
@Injectable()
export class ProductsLocalTraits extends TraitsLocalStore<
  typeof productFeatureFactory
> {
  setup(): LocalTraitsConfig<typeof productFeature> {
    return {
      componentName: 'ProductsPickerComponent',
      traitsFactory: productFeature,
    };
  }
}
```

By extending **TraitsLocalStore** you get an _localActions_ and _localSelectors_ properties in the service with all the actions and selectors you set up in your trait factory.

The next step is optional, if the state of your component needs to be instantiated from a backend call or needs any sort of side effects you can add an extra effect a follows:

```typescript
import { ProductService } from './product.service';

@Injectable()
export class ProductsLocalTraits extends TraitsLocalStore<
  typeof productFeatureFactory
> {
  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(this.localActions.loadProducts),
      switchMap(() =>
        //call your service to get the products data
        this.productService.getProducts().pipe(
          map((products) =>
            this.localActions.loadProductsSuccess({ entities: products })
          ),
          catchError(() => of(this.localActions.loadProductsFail()))
        )
      )
    )
  );

  constructor(private productService: ProductService) {
    super();
    this.traits.addEffects(this);
  }
  setup(): LocalTraitsConfig<typeof productFeature> {
    return {
      componentName: 'ProductsPickerComponent',
      traitsFactory: productFeature,
    };
  }
}
```

An important bit is `extends TraitLocalEffectsFactory<typeof traitsFactory>`
the _typeof traitsFactory_ gives the types for the localActions and localSelectors properties in the class. Also you must override the constructor, one to inject either the service you want to call, and to add ` this.traits.addEffects(this)` that registers the effects in the current class otherwise the wont run

You can also add custom actions, selectors, reducers, and effects to your LocalTrait by creating a [Custom Traits](../../../../common/src/lib/custom-traits.md), for this is just an extra effect we need and this should help with most of the cases.

We are ready to use the service in our component, basically we just need to add the service we just created in the providers property of the _@Component_ like `providers: [ProductsLocalTraits],` and declare the service in the constructor of your component, after that you use like you will use normal actions and selectors for example:

```typescript
@Component({
  selector: 'product-select-dialog',
  templateUrl: './product-select-dialog.component.html',
  providers: [ProductsLocalTraits], //<- Our local store service
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductSelectDialogComponent implements OnInit {
  data$ = combineLatest([
    //using local traits selectors
    this.store.select(this.localTraits.localSelectors.selectProductsList),
    this.store.select(this.localTraits.localSelectors.isProductsLoading),
    this.store.select(this.localTraits.localSelectors.selectProductSelected),
    // you could mix it with normal selectors
    // this.store.selectEntity(UserSelectors.selectCurrentUser),
  ]).pipe(
    map(([products, isLoading, selectedProduct]) => ({
      products,
      isLoading,
      selectedProduct,
    }))
  );

  constructor(
    private store: Store,
    private traits: ProductsLocalTraits //<-- inject our service
  ) {}

  ngOnInit() {
    // firing a local trait action like a normal action
    this.store.dispatch(this.localTraits.localActions.loadProducts());
  }

  select({ id }: Product) {
    this.store.dispatch(this.localTraits.localActions.selectProduct({ id }));
  }

  filter(filters: ProductFilter) {
    this.store.dispatch(
      this.localTraits.localActions.filterProducts({ filters })
    );
  }
  sort(sort: Sort<Product>) {
    this.store.dispatch(this.localTraits.localActions.sortProducts(sort));
  }
}
```

And that's it :)

[//]: # 'Extending **TraitsLocalStore** allows you to only get one set of traits this normally should be enough, but it could happen that you need more than one traitFactory, if so you need to create a service like the following:'
[//]: #
[//]: # '```typescript'
[//]: # '@Injectable()'
[//]: # 'export class ProductsLocalTraits implements OnDestroy {'
[//]: # '  traits1 = buildLocalTraits('
[//]: # '    this.injector,'
[//]: # "    'ProductsDropdownComponent',"
[//]: # '    traitsFactory1,'
[//]: # '    practiceEffect1'
[//]: # '  );'
[//]: # '  traits2 = buildLocalTraits('
[//]: # '    this.injector,'
[//]: # "    'ProductsDropdownComponent',"
[//]: # '    traitsFactory2,'
[//]: # '    practiceEffect2'
[//]: # '  );'
[//]: #
[//]: # '  actions1 = this.traits1.actions;'
[//]: # '  selectors1 = this.traits1.selectors;'
[//]: #
[//]: # '  actions2 = this.traits2.actions;'
[//]: # '  selectors2 = this.traits2.selectors;'
[//]: #
[//]: # '  constructor(private injector: Injector) {}'
[//]: #
[//]: # '  ngOnDestroy() {'
[//]: # '    // Very important be sure to call the traits destroy here'
[//]: # '    this.traits1.destroy();'
[//]: # '    this.traits2.destroy();'
[//]: # '  }'
[//]: # '}'
[//]: # '```'
[//]: #
[//]: # 'Essentially you just need to use **buildLocalTraits** to create the traits and then use your preferred way to store the actions and selectors, but be sure to implement a **ngOnDestroy** and call the destroy method in the resulting traits, which ensures the effects and reducers are clean when the component is destroyed'
