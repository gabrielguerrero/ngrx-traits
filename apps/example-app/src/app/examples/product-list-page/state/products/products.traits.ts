import {
  addAsyncActionTrait,
  addFilterEntitiesTrait,
  addLoadEntitiesTrait,
  addSelectEntityTrait,
  addSortEntitiesTrait,
  AsyncActionState,
  LoadEntitiesState,
  FilterEntitiesState,
  SelectEntityState,
  SortEntitiesState,
} from 'ngrx-traits/traits';
import { Product, ProductFilter } from '../../../models';
import { createFeatureSelector, props } from '@ngrx/store';
import {
  combineEntityFeatures,
  createEntityFeatureFactory,
  ExtractActionsType,
  ReplaceEntityNames,
  addEntityFeaturesProperties,
  mixEntityFeatures,
} from 'ngrx-traits';

export interface ProductsState
  extends LoadEntitiesState<Product>,
    SelectEntityState,
    AsyncActionState<'checkout'>,
    FilterEntitiesState<ProductFilter>,
    SortEntitiesState<Product> {}

const entityFeatureFactory = createEntityFeatureFactory(
  { entityName: 'product' },
  addLoadEntitiesTrait<Product>(),
  addSelectEntityTrait<Product>(),
  addAsyncActionTrait({
    name: 'checkout',
    actionSuccessProps: props<{ orderId: string }>(),
  }),
  addFilterEntitiesTrait<Product, ProductFilter>({
    filterFn: (filter, entity) => {
      return entity.name.toLowerCase().includes(filter.search.toLowerCase());
    },
  }),
  addSortEntitiesTrait<Product>({
    defaultSort: { direction: 'asc', active: 'name' },
  })
);
const entityFeatureFactory2 = createEntityFeatureFactory(
  { entityName: 'order' },
  addLoadEntitiesTrait<Product>(),
  addSelectEntityTrait<Product>(),
  addAsyncActionTrait({
    name: 'checkout',
    actionSuccessProps: props<{ orderId: string }>(),
  }),
  addFilterEntitiesTrait<Product, ProductFilter>({
    filterFn: (filter, entity) => {
      return entity.name.toLowerCase().includes(filter.search.toLowerCase());
    },
  }),
  addSortEntitiesTrait<Product>({
    defaultSort: { direction: 'asc', active: 'name' },
  })
);
const entityFeatureFactory3 = createEntityFeatureFactory(
  { entityName: 'practice' },
  addLoadEntitiesTrait<Product>(),
  addSelectEntityTrait<Product>(),
  addAsyncActionTrait({
    name: 'checkout',
    actionSuccessProps: props<{ orderId: string }>(),
  }),
  addFilterEntitiesTrait<Product, ProductFilter>({
    filterFn: (filter, entity) => {
      return entity.name.toLowerCase().includes(filter.search.toLowerCase());
    },
  }),
  // addSetEntityTrait({
  //   entityName: 'practice',
  //   actionProps: props<{ practice: { id: number; name: string } }>(),
  // }),
  addSortEntitiesTrait<Product>({
    defaultSort: { direction: 'asc', active: 'name' },
  })
);
export const productTraits = entityFeatureFactory({
  actionsGroupKey: '[Products]',
  featureSelector: 'products', //createFeatureSelector<ProductsState>('products'),
});
// productTraits.actions.;
export const ProductActions = productTraits.actions;
export const ProductSelectors = productTraits.selectors;

// const c = [addLoadEntitiesTrait<Product>(), addSelectEntityTrait<Product>()] as const;
// type G = ExtractActionsType<typeof c>;
// const g: ReplaceEntityNames<G, 'product', 'products'> = null;
// g.

const f = combineEntityFeatures({
  products: entityFeatureFactory,
  orders: entityFeatureFactory2,
})({actionsGroupKey: '', featureSelector:''}).selectors.orders.;
//
// combineEntityFeatures({
//   products: f,
//   orders: f,
//   practices: entityFeatureFactory3,
// })({ actionsGroupKey: 'sdasda', featureSelector: 'sdasda' }).selectors.practices.
  // .orders;


// mixEntityFeatures({
//   products: entityFeatureFactory,
//   orders: entityFeatureFactory2,
//   practices: entityFeatureFactory3,
// })({ actionsGroupKey: 'sdasda', featureSelector: null as any}).selectors.
//
addEntityFeaturesProperties(entityFeatureFactory, {
  orders: f,
  practices: entityFeatureFactory3,
})({ actionsGroupKey: 'sdasda', featureSelector: null as any }).selectors.;
