## Custom Traits

To create a custom trait you will need to use createTraitFactory like in the following example, have a quick look at it, and then I will explain each section,

```typescript
import { TraitActionsFactoryConfig, TraitInitialStateFactoryConfig } from 'ngrx-traits';

interface ProductDetail {
  id: string;
  name: string;
  description: string;
  maker: string;
  price: number;
  releaseDate: string;
  image: string;
}

interface SelectedProductState {
  selectedProduct: ProductDetail;
}

export function addLoadProductTrait() {
  const initialState: SelectedProductState = { selectedProduct: null };

  return createTraitFactory({
    key: 'loadProduct',
    depends: [],
    config: {},
    actions: ({ actionsGroupKey }: TraitActionsFactoryConfig) => ({
      loadProduct: createAction(
        `${actionsGroupKey} Load Product`,
        props<{ id: string }>()
      ),
      loadProductSuccess: createAction(
        `${actionsGroupKey} Load Product Success`,
        props<{ product: ProductDetail }>()
      ),
      loadProductFail: createAction(`${actionsGroupKey} Load Product Fail`),
    }),
    selectors: () => ({
      selectProduct: (state: SelectedProductState) => state.selectedProduct,
    }),
    initialState: ({ previousInitialState }: TraitInitialStateFactoryConfig) =>
      (previousInitialState ?? {}) as SelectedProductState,
    reducer: (initialState, allActions, allSelectors) =>
      createReducer(
        initialState,
        on(allActions.loadProductSuccess, (state, { product }) => ({
          ...state,
          selectedProduct: product,
        }))
      ),
    effects: (allActions, allSelectors, allConfigs) => {
      @Injectable()
      class LoadProductEffect extends TraitEffect {
        loadProduct$ = createEffect(() => {
          return this.actions$.pipe(
            ofType(allActions.loadProduct),
            // call backend...
            map(({ id }) =>
              allActions.loadProductSuccess({ product: { id, name: 'sss' } })
            )
          );
        });
      }

      return [LoadProductEffect];
    },
  });
}
```

The code should look very familiar is essentially normal ngrx code but wrap in functions, there are two ways to implement the trait you either inline the function like shown above or move the functions to separate file, there are pro and cons of each approach, but essentially inline way is better for simple traits, if the trait code start becoming to big is better to split it, the inline way has the benefit that you won't need to create interfaces for the config, actions, selectors and mutators, because there are infer by TS, the typing here is very important because is what allows the merging of the traits work, there are some cases that you will be force to do the interfaces like if you need generics or you need to reference other traits actions, selectors,..etc.

Let's look at each part of the code:

#### Key and depends:

```typescript
  key: 'loadProduct',
  depends:[]
```

Every trait has a **key** , and it must be unique amon the other traits, is use for several things that I will mention later. The _depends_ property is optional, and you should not need it often, its an array with the keys of the other traits you depend on. Before the TraitFactories are merge they are sorted, this makes the traits that you depend be executed before this trait, which its needed if you want for example to create a selector in your trait that joins with a selector of another trait, you can see examples of this in the [muti-selection.trait.selectors.ts](traits/multi-selection/multi-selection.trait.selectors.ts)

#### Config

```typescript
config:{},
```

An optional parameter, here you can set as an object the parameters of your trait which generally are the params of your function, this is mostly needed if you think other traits could use those params or if you are splitting the trait into separate files, this is how your separate file will get a reference of your trait config, for the inline case is not needed because you have direct access to the params of the function you are creating.
After the traits are sorted all the configs are set in map that uses as keys the respective trait key , this is now pass as the param **allConfigs** in the other properties factories. You can cast this param to [TraitName]KeyedConfig, for example FilterKeyedConfig, LoadEntitiesKeyedConfig, so you get type safe access to other traits params.

#### actions

```typescript

actions: ({ actionsGroupKey, allConfigs }: TraitActionsFactoryConfig) => ({
  loadProduct: createAction(
    `${actionsGroupKey} Load Product`,
    props<{ id: string }>(),
  ),
  loadProductSuccess: createAction(
    `${actionsGroupKey} Load Product Success`,
    props<{ product: ProductDetail }>(),
  ),
  loadProductFail: createAction(`${actionsGroupKey} Load Product Fail`),
})
```

Actions factory is another optional property (you can create a trait that only uses other traits actions or even normal global actions), the most important thing you should see is the param actionsGroupKey, which you must use in the type of your actions to ensure they are unique when created.
After the allConfigs are build, createEntityFeatureFactory builds all the actions, then they get merged in a single object called allActions, which is pass to many of the factories as a parameter

> **IMPORTANT**
>
> When inlining the function for actions, selectors, mutators and initialState, like we are doing in the example above, is important that you type the arguments of the function, otherwise return type of the function is not inferred correctly there is a `TraitActionsFactoryConfig`, `TraitSelectorsFactoryConfig`, `TraitMutatorsFactoryConfig` and `TraitInitialStateFactoryConfig` that you can use on each case, in the case of effects or reducer the parameters are the inferred from the return types of the actions, selectors, mutators and initialState, so is better to not type them , this is due to a [bug in the TS inference logic](https://github.com/microsoft/TypeScript/issues/42379).
>
>
> Another way to work around it is by assigning the function to a variable, then the return type is inferred correctly, but you will still need to type the arguments you use because the type inference on then is lost, like:
>
> ```typescript
> const actions = ({ actionsGroupKey }: TraitActionsFactoryConfig) => ({
>    loadProduct: createAction(
>    `${actionsGroupKey} Load Product`,
>    props<{ id: string }>(),
>    ),
>    loadProductSuccess: createAction(
>    `${actionsGroupKey} Load Product Success`,
>    props<{ product: ProductDetail }>(),
>    ),
>    loadProductFail: createAction(`${actionsGroupKey} Load Product Fail`),
> });
> return createTraitFactory({
>    key: 'loadProduct',
>    depends: [],
>    actions,//<--- function moved to a variable
>    selectors: () => ({
> ```
>
> The main advantage of this approach is when you for example in a reducer or effect you need more than the actions of your trait, you can get the type of the actions like:
>
> ```typescript
>  const actions = ({ actionsGroupKey }: TraitActionsFactoryConfig) => ({
>     loadProduct: createAction(
>       `${actionsGroupKey} Load Product`,
>       props<{ id: string }>(),
>     ),
>     loadProductSuccess: createAction(
>       `${actionsGroupKey} Load Product Success`,
>       props<{ product: ProductDetail }>(),
>     ),
>     loadProductFail: createAction(`${actionsGroupKey} Load Product Fail`),
> });
> // now extract the actions types
> type LoadProductActions = ReturnType<typeof actions>
>
> return createTraitFactory({
>    key: 'loadProduct',
>    actions,
>    // ...
>    reducer: ({ initialState, allActions: actions }) => {
>    const allActions = actions  as LoadProductActions & LoadEntitiesActions<Product>;
>    createReducer(
>       initialState,
>       on(allActions.loadProductSuccess, (state, { product }) => ({
>    // ...
> ```
>
> If your actions have generics you are going to need to create your own Actions interfaces see the core traits for examples, the _typeof_ doesn't extract generics

#### Selectors

```typescript

selectors: ({ previousSelectors, allConfigs }: TraitSelectorsFactoryConfig) => ({
  selectProduct: (state: SelectedProductState) => state.selectedProduct,
});
```

Another optional parameter, its just to create the ngrx selectors, it comes with two params previousSelectors and allConfig. This params you will only need them if you interact with other traits, in the example above they can be removed.

I already explain what is the allConfig param, previousSelectors are the selectors of the traits that have been built before, you can see an example in select-entities.trait.selectors.ts. After the trait actions are build all the trait selector are built and merged into an object called allSelectors which you will receive in some factories, but while each selector is build is pass as a parameter the merge of the previous traits selectors in previousSelectors param, this is needed because some selectors need to be merged with selectors of other traits.

####Mutators
```mutators: ({ previousMutators, allConfigs }: TraitActionsFactoryConfig) => {```
The mutators are just a set of functions that change the state, they are use inside the reducer to implement the changes of the state when an action occurs, this is another optional parameter, its use is to expose the mutators to the devs of other traits, in case he/she might need to use them in their own trait, you can see examples of them in the core traits like in [select-entities.trait.mutators.ts](traits/multi-selection/multi-selection.trait.mutators.ts). The important param here is the previousMutators as with selectors this is the merge of the previous traits mutators. After the selectors are build all the mutators are merge in an object called allMutators, which you will receive as a param in your reducer.

####initialState

```typescript
initialState: ({ previousInitialState, allConfigs }: TraitInitialStateFactoryConfig) =>
  (previousInitialState ?? {}) as SelectedProductState;
```

The initialState factory, also optional (only needed if you are implementing a reducer), this is the initial state that is pass to your reducer, the important parameter here is the previousInitialState, this param is null if this is the first trait, so if not null you need to merge it with your initial state. After the allMutators are built then we build the intialState for each traits , this merge intialState is what get pass to all reducers. In this function is important that you cast the return state to your state interface, this helps the type inference be pass along to your reducer and be properly mix with the other traits state interfaces.

####reducer

```typescript
  reducer: ({initialState, allActions, allSelectors, allMutators, allConfigs}) =>
    createReducer(
      initialState,
      on(allActions.loadProductSuccess, (state, { product }) => ({
        ...state,
        selectedProduct: product,
      })),
    ),
```

The reducer is normal ngrx reducer code, and the params should make sense if you read the previous sections, initialState is the merge of all traits initialState, allActions is the merge of all the traits actions and same goes with allSelectors, allMutators and allConfigs. If you correctly typed the params of actions, selectors,mutators and the initial state, the type of this params should be auto inferred, so you won't need to type them as long as you are only using the actions, selectors etc that you created in this trait, if you need to use action, select , etc of other traits , then you will need to get types or interfaces for your trait,action, selectors etc , here is a way to do it

```typescript
 const actions = ({ actionsGroupKey }: TraitActionsFactoryConfig) => ({
    loadProduct: createAction(
      `${actionsGroupKey} Load Product`,
      props<{ id: string }>(),
    ),
    loadProductSuccess: createAction(
      `${actionsGroupKey} Load Product Success`,
      props<{ product: Product }>(),
    ),
    loadProductFail: createAction(`${actionsGroupKey} Load Product Fail`),
});
// now extract the actions types
type LoadProductActions = ReturnType<typeof actions>

return createTraitFactory({
   key: 'loadProduct',
   actions,
   // ...
  //notice the allActions types
   reducer: ({ initialState, allActions: actions }) => {
   const allActions = actions as LoadProductActions & LoadEntitiesActions<Product>; 
   createReducer(
      initialState,
      on(allActions.loadEntitiesSuccess, (state, { product }) => ({
   // ...
```

You can also manually create interfaces for your actions and selectors, have a look at the core traits code to see a few examples.
As with other variables , the reducers of each trait get merge into one function

####effect

```typescript
effects: ({ allActions, allSelectors, allConfigs }) => {
  @Injectable()
  class LoadProductEffect extends TraitEffect {
    loadProduct$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(allActions.loadProduct),
        // call backend...
        map(({ id }) =>
          allActions.loadEntitiesSuccess({ product: { id, name: 'sss' } })
        )
      );
    });
  }
  return [LoadProductEffect];
};
```

The effects is again normal effects code you are used to, just be sure to use the actions and selectors of allActions an allSelectors param, and as before if you only need your custom traits actions and selectors avoid the type, so they get auto inferred , but if you need other traits actions and selectors you will need to type them like we did in the previous reducer example. There is one more important thing about the effects class it needs to extend TraitFactory, this is needed for the trait to work as local store, plus it adds the actions$ and store variables, so you don't need to declare them in your effect with a constructor to inject them.
As before effects of each trait get merged , then that is mixed with the rest of merge of the other factories and becomes the return value of the createEntityFeatureFactory.

#### Interact with other traits

In the previous case we have shown that you can use actions and selectors of other traits in your custom trait, for example to continue with addLoadProduct trait, which adds the basic logic to load a product, but let's say we wanted that if this trait is added to a list of products where there is a single selection trait, we will like that when you select a product it automatically loads the details, to do that we will do:

```typescript
//... inside addLoadProduct
const actions = ({ actionsGroupKey }: TraitActionsFactoryConfig) => ({
  loadProduct: createAction(
    `${actionsGroupKey} Load Product`,
    props<{ id: string }>(),
  ),
  loadProductSuccess: createAction(
    `${actionsGroupKey} Load Product Success`,
    props<{ product: ProductDetail }>(),
  ),
  loadProductFail: createAction(`${actionsGroupKey} Load Product Fail`),
});
// now extract the actions types
type LoadProductActions = ReturnType<typeof actions>

return createTraitFactory({
  key: 'loadProduct',
  actions,
  // ...
  //notice the allActions types we added SingleSelectionActions
  effects: ({ allActions: actions, allSelectors, allConfigs }) => {
    const allActions = actions as LoadProductActions & SingleSelectionActions;
    @Injectable()
    class LoadProductEffect extends TraitEffect {
      loadProduct$ = createEffect(() => {
        return this.actions$.pipe(
          ofType(allActions.loadProduct),
          // call backend...
          map(({id}) =>
            allActions.loadProductSuccess({product: {id, name: 'sss'}}),
          ),
        );
      });
      // if select action exist map to loadProduct when a select action happens
      loadProductOnSelect$ = allActions.select && createEffect(() => {
          return this.actions$.pipe(
            ofType(allActions.select),
            // map to loadProduct...
            map(({id}) =>
              allActions.loadProduct({ id}),
            ),
          );
      });
    }

    return [LoadProductEffect];
  }
```

In this case we added `SingleSelectionActions` and the effect loadProductOnSelect$ is only created if in allActions.select exist, that means that the addSelectEntityTrait trait was added in the same trait config where our addLoadProduct was added, so if present it will also load the product details if one is selected on the list, but if its not present then the dev has to manually call loadProduct action to use it wherever he needs.

#### Combining with other traits

In the previous section we show how to interact with another trait that may or may not be present, but what happen if you need another trait always, to the point that you think that other trait should be added also if your custom trait is added.
Let's again go to an example which should make this easier to understand, there is a bit of boilerplate in our addLoadProduct trait, like the actions we created are the typical 3 actions you do when you call a backend, there is a trait that does that for us the addAsyncActionTrait, not only it creates the traits it also creates the selectors like isLoading to track the progress of the call, it will be better if we use that trait instead of writing again that code, then there is also the logic to store the result of action, and a selector to read that stored result in this case the selectProduct, well there is a trait that does all that as well called loadEntity, and in reality if we use loadEntity we only need to do the effect that loads the product because loadEntity, similarly to what we will do now, already adds addAsyncActionTrait, lets see the example:

```ts
export function addLoadProduct() {
  // notice how we use a trait
  const traits = addLoadEntityTraits({
    entityName: 'product',
    actionProps: props<{ id: string }>(),
    actionSuccessProps: props<{ product: ProductDetail }>(),
  });

  type LoadProductActions = ExtractActionsType<typeof traits>;

  return [
    ...traits, // loadEntity is an array of traits so needs to be spread
    createTraitFactory({
      key: 'loadProductEffect',
      effects: ({allActions: actions}) => {
        const allActions = actions as LoadProductActions;
        @Injectable()
        class LoadProductEffect extends TraitEffect {
          loadProduct$ = createEffect(() => {
            return this.actions$.pipe(
              ofType(allActions.loadProduct),
              // call backend...
              map(({ id }) =>
                allActions.loadProductSuccess({ product: { id, name: 'sss' } })
              )
            );
          });
        }
        return [LoadProductEffect];
      },
    }),
  ] as const; // important to add as const to keep the types working
}
```

Notice addLoadEntityTraits returns an array of traits, so it needs to be spread when used, and the same you will need to do when you use addLoadProduct trait, if you needed more traits, you could have join then in an array like:

```ts
const traits = [
  addLoadEntitiesTrait<Product>(),
  addSelectEntityTrait<Product>(),
  ...addLoadEntityTraits({
    entityName: 'product',
    actionProps: props<{ id: string }>(),
    actionSuccessProps: props<{ product: ProductDetail }>(),
  }),
];
type ProductnelListActions = ExtractActionsType<typeof traits>;
```

Also notice the `ExtractActionsType` that's a helper type that extracts and jonis the actions types of either a single trait or an array of traits (there is also `ExtractSelectorsType` and `ExtractStateType` if needed and work in the same way).
