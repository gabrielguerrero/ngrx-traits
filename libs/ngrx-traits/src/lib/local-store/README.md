# NGRX-Traits

###Local Store Traits
Set of utilities to transform a set of traits which normally are global estate to be transformed in local state for a component,
meaning the effects, reducers and state are created and later destroyed when a component respectively created and destroyed

To use it first you need a trait factory like the following, (it can have any combination of traits)

```typescript
const traitsFactory = createEntityFeatureFactory(
  addLoadEntities<Practice>(),
  addFilter<Practice, PracticeFilter>()
);
```

The next step is optional, if the state of your component needs to be instantiated from a backend call or needs any sort of side effects you can add an extra effect a follows:

```typescript
const practiceEffect: TraitLocalEffectsFactory<typeof traitsFactory> = (
  allActions
) => {
  @Injectable()
  class PracticesLocalEffects extends TraitEffect {
    loadPractices$ = createEffect(() =>
      this.actions$.pipe(
        ofType(allActions.fetch),
        send(EventHubLookupMessages.getPracticesLookupList()),
        exhaustMapToResponse(
          EventHubLookupMessages.getPracticesLookupListResponse
        ),
        map(({ data }) =>
          allActions.fetchSuccess({
            entities: data.map((p) => ({
              id: p.id,
              name: p.name,
            })),
          })
        )
      )
    );
  }
  return PracticesLocalEffects;
};
```

Notice this is a normal effect wrap in a function, an important bit is `practiceEffect: TraitLocalEffectsFactory<typeof traitsFactory>`
the _typeof traitsFactory_ gives the types for the allActions and allSelectors params from the traitsFactory, you could also simply add your own types to the allActions and allSelectors params by using the traits actions in and selectors interfaces like `allActions:LoadEntitiesActions<MyEntity> & FilterActions<MyEntities>`.

In the future you will be able to add custom actions, selectors, reducers, and effects but for now is just an extra effect which should help with most of the cases, but this means the logic inside the effect is currently is limited to only use traits actions or global action no custom actions, if you need custom logic you can mix it with ngrx component store

The next step is to create a service that will be use in your component, it needs to extend `TraitsLocalStore< typeof traitsFactory>` again notice the use of **typeof** to get the types of the traits factory you created.

```typescript
@Injectable()
export class PracticesLocalTraits extends TraitsLocalStore<
  typeof traitsFactory
> {
  setup(): LocalTraitsConfig<typeof traitsFactory> {
    return {
      componentName: 'PracticesDropdownComponent',
      traitsFactory: traitsFactory,
      effectFactory: practiceEffect,
    };
  }
}
```

The **effectFactory** param in the setup method is optional. By extending **TraitsLocalStore** you get an _actions_ and _selectors_ properties in the service with all the actions and selectors you set up in your trait factory.

Now we are ready to use the service in our component, basically just need to add the service we just created in the providers property of the _@Component_ like `providers: [PracticesLocalTraits],` and declare the service in the constructor of your component, after that you use like you will use normal actions and selectors for example:

```typescript
.
.
.
  providers: [PracticesLocalTraits], //<- Our local store service
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PracticesDropdownComponent
  extends ControlValueAccessorBase<FormControl>
  implements OnInit {
  @Input() label: string;
  @Input() placeholder = 'Please Select';
  @Input() allowAll = false;
  @Input() allValue = '';

  data$ = combineLatest([
    //using local traits selectors
    this.store.select(this.localTraits.selectors.selectAll),
    this.store.select(this.localTraits.selectors.isLoading),
    this.control.disabled$,
    // you can mix it with normal selectors
    this.store.select(PracticesSelectors.selectDefaultPracticeId),
  ]).pipe(
    tap(([practices, isLoading, disabled, defaultPracticeId]) => {
      if (!isLoading && !this.control.value) {
        const defaultValue = this.allowAll ? this.allValue : defaultPracticeId;
        this.control.patchValue(defaultValue);
      }
    }),
    map(([practices, isLoading, disabled]) => ({
      practices,
      disabled: isLoading || disabled,
      isLoading,
    })),
  );

  constructor(
    private store: Store,
    injector: Injector,
    private localTraits: PracticesLocalTraits, // inject our service
  ) {
    super(injector);
  }

  buildControl(): FormControl {
    return new FormControl<string>();
  }

  ngOnInit() {
    super.ngOnInit();
    // firing a local trait action
    this.store.dispatch(this.localTraits.actions.filter());
  }
}
```

Extending **TraitsLocalStore** allows you to only get one set of traits this normally should be enough, but it could happen that you need more than one traitFactory, if so you need to create a service like the following:

```typescript
@Injectable()
export class PracticesLocalTraits implements OnDestroy {
  traits1 = buildLocalTraits(
    this.injector,
    'PracticesDropdownComponent',
    traitsFactory1,
    practiceEffect1
  );
  traits2 = buildLocalTraits(
    this.injector,
    'PracticesDropdownComponent',
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
