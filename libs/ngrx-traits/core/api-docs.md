## Members

<dl>
<dt><a href="#TraitsLocalStore">TraitsLocalStore</a></dt>
<dd><p>Class used to create local traits service, receives a trait factory, which will be
built and its reducers and effect register using a dynamic id when the service is built
and get destroyed when the onDestroy lifecycle method of the service is called, if the service
has effects this.traits.addEffects(this) should be call in the constructor</p></dd>
</dl>

## Functions

<dl>
<dt><a href="#createEntityFeatureFactory">createEntityFeatureFactory(namesConfig, ...traits)</a></dt>
<dd><p>Creates a function that when execute will combine all the traits, and return a EntityFeatureFactory
which combines all the traits actions, selectors , reducers and effects,
the names param will replace any action and selector with the word Entity or Entities,
with the corresponding entityName and  entitiesName param (entityName+'s' if entitiesName is omitted).</p></dd>
<dt><a href="#combineEntityFeatures">combineEntityFeatures(traitFactoriesMap)</a></dt>
<dd><p>Combine a map entityFeatureFactories into one,
grouping the actions and selectors by the key of the respective entityFeatureFactory</p></dd>
<dt><a href="#mixEntityFeatures">mixEntityFeatures(traitFactoriesMap)</a></dt>
<dd><p>Mix a map entityFeatureFactories into one, different from combine the actions and selectors a mix, not group by key like in combine, the keys are still use
internal in the reducers and selector to separate the state</p></dd>
<dt><a href="#addEntityFeaturesProperties">addEntityFeaturesProperties(targetTraitFactory, traitFactoriesMap)</a></dt>
<dd><p>Combines targetTraitFactory with the traitFactoriesMap using the keys as props for the targetTraitFactory state,
and grouping the combined actions by key</p></dd>
<dt><a href="#createTraitFactory">createTraitFactory(f)</a></dt>
<dd><p>Helper function to create an implementation  a TraitFactory</p></dd>
<dt><a href="#setPropertyReducer">setPropertyReducer(sourceReducer, property, propertyReducer)</a></dt>
<dd><p>Set propertyReducer in sourceReducer in a property of the source state,</p></dd>
<dt><a href="#setPropertiesReducer">setPropertiesReducer(sourceReducer, property, propertyReducer)</a></dt>
<dd><p>Set propertyReducers in sourceReducer each in a property of the source state,</p></dd>
<dt><a href="#joinReducers">joinReducers(firstReducer, secondReducer)</a></dt>
<dd><p>joins two reducers so the work in the same state</p></dd>
<dt><a href="#cache">cache(options)</a></dt>
<dd><p>Cache the result of source parameter using the provided key, when call
again if the cache is valid (exist and is not expired or invalidated)
it will return the cache value without calling again source</p></dd>
<dt><a href="#buildLocalTraits">buildLocalTraits(injector, componentName, traitFactory)</a></dt>
<dd><p>Builds traitFactory and registers effects and reducers with
a generated component id, returns build actions and selectors
and a destroy method that will unergister the effects and reducers
when called, and a addEffect which can be use to register extra effects</p>
<p>Used inside TraitsLocalStore, can be used to create your
own Component Service without extending TraitsLocalStore</p></dd>
</dl>

<a name="TraitsLocalStore"></a>

## TraitsLocalStore
<p>Class used to create local traits service, receives a trait factory, which will be
built and its reducers and effect register using a dynamic id when the service is built
and get destroyed when the onDestroy lifecycle method of the service is called, if the service
has effects this.traits.addEffects(this) should be call in the constructor</p>

**Kind**: global variable  
**Example**  
```js
const productFeatureFactory = createEntityFeatureFactory(
  { entityName: 'product' },
  addLoadEntitiesTrait<Product>(),
  addSelectEntityTrait<Product>(),
);

Injectable()
export class ProductsLocalTraits extends TraitsLocalStore<
  typeof productFeatureFactory
> {
  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(this.localActions.loadProducts),
      switchMap(() =>
        //call your service to get the products data
        this.productService.getProducts().pipe(
          map((res) =>
            this.localActions.loadProductsSuccess({ entities: res.resultList })
          ),
          catchError(() => of(this.localActions.loadProductsFail()))
        )
      )
    )
  );

  constructor(injector: Injector, private productService: ProductService) {
    super(injector);
    this.traits.addEffects(this); // IMPORTANT! add this line if the service has effects
  }

  setup(): LocalTraitsConfig<typeof productFeatureFactory> {
    return {
      componentName: 'ProductsPickerComponent',
      traitsFactory: productFeatureFactory,
    };
  }
}

// use in component later

Component({
  selector: 'some-component',
  template: `<div> some content</div> `,
  providers: [ProductsLocalTraits],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductSelectDialogComponent implements OnInit {
  constructor(private store: Store, private traits: ProductsLocalTraits) {}

  ngOnInit() {
    this.store.dispatch(this.traits.localActions.loadProducts());
  }
}
```
<a name="createEntityFeatureFactory"></a>

## createEntityFeatureFactory(namesConfig, ...traits)
<p>Creates a function that when execute will combine all the traits, and return a EntityFeatureFactory
which combines all the traits actions, selectors , reducers and effects,
the names param will replace any action and selector with the word Entity or Entities,
with the corresponding entityName and  entitiesName param (entityName+'s' if entitiesName is omitted).</p>

**Kind**: global function  

| Param | Description |
| --- | --- |
| namesConfig | <p>Optional Names for entities</p> |
| namesConfig.entityName | <p>singular name for entity</p> |
| [namesConfig.entitiesName] | <p>plural name for entities, defaults to entityName + 's'</p> |
| ...traits | <p>set of traits to be combined</p> |

**Example**  
```js
const featureFactory = createEntityFeatureFactory(
  { entityName: 'product' },
  addLoadEntitiesTrait<Product>(),
  addSelectEntityTrait<Product>(),
  addAsyncActionTrait({
    name: 'checkout',
    actionSuccessProps: props<{ orderId: string }>(),
  })
);

export const productsFeature = featureFactory({
  actionsGroupKey: '[Products]',
  featureSelector: 'products',
});
```
<a name="combineEntityFeatures"></a>

## combineEntityFeatures(traitFactoriesMap)
<p>Combine a map entityFeatureFactories into one,
grouping the actions and selectors by the key of the respective entityFeatureFactory</p>

**Kind**: global function  

| Param |
| --- |
| traitFactoriesMap | 

**Example**  
```js
const clientsFeatureFactory = createEntityFeatureFactory(
  { entityName: 'client', entitiesName: 'clients' },
  addLoadEntitiesTrait<Client>(),
  addCrudEntitiesTrait<Client>()
);

const productOrderFeatureFactory = createEntityFeatureFactory(
  { entityName: 'productOrder' },
  addLoadEntitiesTrait<ProductOrder>(),
  addSelectEntitiesTrait<ProductOrder>()
);

const productFeatureFactory = createEntityFeatureFactory(
  { entityName: 'product' },
  addLoadEntitiesTrait<Product>(),
  addSelectEntitiesTrait<Product>()
);

const productCombinedFactory = combineEntityFeatures({
  products: productFeatureFactory,
  productOrders: productOrderFeatureFactory,
  clients: clientsFeatureFactory,
});

const combinedFeature = productCombinedFactory({
    actionsGroupKey: '[Combined]',
    featureSelector: 'combined',
  });

  combinedFeature.actions.client.loadClients();
  combinedFeature.actions.product.loadProducts();
```
<a name="mixEntityFeatures"></a>

## mixEntityFeatures(traitFactoriesMap)
<p>Mix a map entityFeatureFactories into one, different from combine the actions and selectors a mix, not group by key like in combine, the keys are still use
internal in the reducers and selector to separate the state</p>

**Kind**: global function  

| Param |
| --- |
| traitFactoriesMap | 

**Example**  
```js
const clientsFeatureFactory = createEntityFeatureFactory(
  { entityName: 'client', entitiesName: 'clients' },
  addLoadEntitiesTrait<Client>(),
  addCrudEntitiesTrait<Client>()
);

const productOrderFeatureFactory = createEntityFeatureFactory(
  { entityName: 'productOrder' },
  addLoadEntitiesTrait<ProductOrder>(),
  addSelectEntitiesTrait<ProductOrder>()
);

const productFeatureFactory = createEntityFeatureFactory(
  { entityName: 'product' },
  addLoadEntitiesTrait<Product>(),
  addSelectEntitiesTrait<Product>()
);

const productMixedFactory = mixEntityFeatures({
  products: productFeatureFactory,
  productOrders: productOrderFeatureFactory,
  clients: clientsFeatureFactory,
});

const mixedFeature = productMixedFactory({
    actionsGroupKey: '[Mixed]',
    featureSelector: 'mixed',
  });
mixedFeature.actions.loadClients();
mixedFeature.actions.loadProducts();
```
<a name="addEntityFeaturesProperties"></a>

## addEntityFeaturesProperties(targetTraitFactory, traitFactoriesMap)
<p>Combines targetTraitFactory with the traitFactoriesMap using the keys as props for the targetTraitFactory state,
and grouping the combined actions by key</p>

**Kind**: global function  

| Param |
| --- |
| targetTraitFactory | 
| traitFactoriesMap | 

**Example**  
```js
const clientsFeatureFactory = createEntityFeatureFactory(
  { entityName: 'client', entitiesName: 'clients' },
  addLoadEntitiesTrait<Client>(),
  addCrudEntitiesTrait<Client>()
);

const productOrderFeatureFactory = createEntityFeatureFactory(
  { entityName: 'productOrder' },
  addLoadEntitiesTrait<ProductOrder>(),
  addSelectEntitiesTrait<ProductOrder>()
);

const productFeatureFactory = createEntityFeatureFactory(
  { entityName: 'product' },
  addLoadEntitiesTrait<Product>(),
  addSelectEntitiesTrait<Product>()
);

const productAddEntityPropertiesFactory = addEntityFeaturesProperties(
  productFeatureFactory,
  {
    productOrders: productOrderFeatureFactory,
    clients: clientsFeatureFactory,
  }
);

const combinedFeature = productAddEntityPropertiesFactory({
    actionsGroupKey: '[addEntityFeatures]',
    featureSelector: 'addEntityFeatures',
  });

  combinedFeature.actions.loadProducts();
  combinedFeature.actions.clients.loadClients();
  combinedFeature.actions.productOrders.loadProductOrders();
```
<a name="createTraitFactory"></a>

## createTraitFactory(f)
<p>Helper function to create an implementation  a TraitFactory</p>

**Kind**: global function  

| Param | Description |
| --- | --- |
| f | <p>TraitFactory implementation</p> |

<a name="setPropertyReducer"></a>

## setPropertyReducer(sourceReducer, property, propertyReducer)
<p>Set propertyReducer in sourceReducer in a property of the source state,</p>

**Kind**: global function  

| Param |
| --- |
| sourceReducer | 
| property | 
| propertyReducer | 

**Example**  
```js
const newReducer = setPropertyReducer(productsReducer, 'selectedProduct', selectedProductReducer)
```
<a name="setPropertiesReducer"></a>

## setPropertiesReducer(sourceReducer, property, propertyReducer)
<p>Set propertyReducers in sourceReducer each in a property of the source state,</p>

**Kind**: global function  

| Param |
| --- |
| sourceReducer | 
| property | 
| propertyReducer | 

**Example**  
```js
const newReducer = setPropertyReducer(productsReducer,
{
   selectedProduct: selectedProductReducer
   favoriteProduct: favoriteProductReducer
})
```
<a name="joinReducers"></a>

## joinReducers(firstReducer, secondReducer)
<p>joins two reducers so the work in the same state</p>

**Kind**: global function  

| Param |
| --- |
| firstReducer | 
| secondReducer | 

<a name="cache"></a>

## cache(options)
<p>Cache the result of source parameter using the provided key, when call
again if the cache is valid (exist and is not expired or invalidated)
it will return the cache value without calling again source</p>

**Kind**: global function  

| Param | Description |
| --- | --- |
| options | <p>configuration</p> |
| options.store | <p>required ngrx store</p> |
| options.key | <p>key can be string, array of string or array of string with plain objects</p> |
| options.source | <p>called when cache is invalid</p> |
| options.expires | <p>time to expire the cache valued, if not present is infinite</p> |
| options.maxCacheSize | <p>max number of keys to store , only works if last key is variable</p> |

**Example**  
```js
// cache for 3 min
loadStores$ = createEffect(() => {
  return this.actions$.pipe(
    ofType(ProductStoreActions.loadStores),
    exhaustMap(() =>
      cache({
        key: ['stores'],
        store: this.store,
        source: this.storeService.getStores(),
        expire: 1000 * 60 * 3 // optional param , cache forever if not present
      }).pipe(
        map((res) => ProductStoreActions.loadStoresSuccess({ entities: res })),
        catchError(() => of(ProductStoreActions.loadStoresFail()))
      )
    )
  );
});
// cache top 10, for 3 mins
  loadDepartments$ = createEffect(() => {
  return this.actions$.pipe(
    ofType(this.localActions.loadDepartments),
    concatLatestFrom(() =>
      this.store.select(this.localSelectors.selectDepartmentsFilter)
    ),
    exhaustMap(([_, filters]) =>
      cache({
        key: ['stores','departments',{ storeId: filters!.storeId },
        store: this.store,
        source: this.storeService.getStoreDepartments(filters!.storeId),
        expires: 1000 * 60 * 3,
        maxCacheSize: 10,
      }).pipe(
        map((res) =>
          this.localActions.loadDepartmentsSuccess({
            entities: res,
          })
        ),
        catchError(() => of(this.localActions.loadDepartmentsFail()))
      )
    )
  );
});
```
<a name="buildLocalTraits"></a>

## buildLocalTraits(injector, componentName, traitFactory)
<p>Builds traitFactory and registers effects and reducers with
a generated component id, returns build actions and selectors
and a destroy method that will unergister the effects and reducers
when called, and a addEffect which can be use to register extra effects</p>
<p>Used inside TraitsLocalStore, can be used to create your
own Component Service without extending TraitsLocalStore</p>

**Kind**: global function  

| Param |
| --- |
| injector | 
| componentName | 
| traitFactory | 

