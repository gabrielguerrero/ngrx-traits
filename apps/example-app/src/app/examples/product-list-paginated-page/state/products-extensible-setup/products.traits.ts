import {
  addAsyncAction,
  addFilterEntities,
  addLoadEntities,
  addEntitiesPagination,
  addSelectEntity,
  addSortEntities,
} from 'ngrx-traits/traits';
import { Product, ProductFilter } from '../../../models';
import { props } from '@ngrx/store';
import { createEntityFeatureFactory } from 'ngrx-traits';
import { selectProductState } from './products.state';

export const productTraits = createEntityFeatureFactory(
  addLoadEntities<Product>(),
  addSelectEntities<Product>(),
  addAsyncAction({
    name: 'checkout',
    actionSuccessProps: props<{ orderId: string }>(),
  }),
  addEntitiesPagination<Product>(),
  addFilterEntities<Product, ProductFilter>(),
  addSortEntities<Product>({
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
