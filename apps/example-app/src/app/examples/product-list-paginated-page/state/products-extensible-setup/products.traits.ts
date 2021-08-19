import {
  addAsyncAction,
  addFilter,
  addLoadEntities,
  addPagination,
  addSingleSelection,
  addSort,
} from 'ngrx-traits/traits';
import { Product, ProductFilter } from '../../../models';
import { props } from '@ngrx/store';
import { createEntityFeatureFactory } from 'ngrx-traits';
import { selectProductState } from './products.state';

export const productTraits = createEntityFeatureFactory(
  addLoadEntities<Product>(),
  addSingleSelection<Product>(),
  addAsyncAction({
    name: 'checkout',
    actionSuccessProps: props<{ orderId: string }>(),
  }),
  addPagination<Product>(),
  addFilter<Product, ProductFilter>(),
  addSort<Product>({
    remote: true,
    defaultSort: {
      direction: 'asc',
      active: 'name',
    },
  })
)({
  actionsGroupKey: '[Products Paginated]',
  featureSelector: selectProductState,
});
