import {
  addAsyncAction,
  addFilter,
  addLoadEntities,
  addSingleSelection,
  addSort,
  AsyncActionState,
  LoadEntitiesState,
  FilterState,
  SingleSelectionState,
  SortState,
} from 'ngrx-traits/traits';
import { Product, ProductFilter } from '../../../models';
import { createFeatureSelector, props } from '@ngrx/store';
import { createEntityFeatureFactory, ExtractActionsType, ReplaceEntityNames } from 'ngrx-traits';

export interface ProductsState
  extends LoadEntitiesState<Product>,
    SingleSelectionState,
    AsyncActionState<'checkout'>,
    FilterState<ProductFilter>,
    SortState<Product> {}

let entityFeatureFactory = createEntityFeatureFactory(
  { entityName: 'product'},
  addLoadEntities<Product>(),
  addSingleSelection<Product>(),
  addAsyncAction({
    name: 'checkout',
    actionSuccessProps: props<{ orderId: string }>(),
  }),
  addFilter<Product, ProductFilter>({
    filterFn: (filter, entity) => {
      return entity.name.toLowerCase().includes(filter.search.toLowerCase());
    },
  }),
  addSort<Product>({
    defaultSort: { direction: 'asc', active: 'name' },
  })
);
export const productTraits = entityFeatureFactory({
  actionsGroupKey: '[Products]',
  featureSelector: createFeatureSelector<ProductsState>('products'),
});
productTraits.actions.;
export const ProductActions = productTraits.actions;
export const ProductSelectors = productTraits.selectors;

const c = [addLoadEntities<Product>(), addSingleSelection<Product>()] as const;
type G = ExtractActionsType<typeof c>;
const g: ReplaceEntityNames<G, 'product', 'products'> = null;
// g.
