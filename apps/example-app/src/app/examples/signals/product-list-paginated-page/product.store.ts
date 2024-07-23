import { inject } from '@angular/core';
import { Params } from '@angular/router';
import {
  withCalls,
  withCallStatus,
  withEntitiesLoadingCall,
  withEntitiesLocalFilter,
  withEntitiesLocalPagination,
  withEntitiesLocalSort,
  withEntitiesSingleSelection,
  withEntitiesSyncToRouteQueryParams,
} from '@ngrx-traits/signals';
import { signalStore, type } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import { map } from 'rxjs/operators';

import { Product } from '../../models';
import { OrderService } from '../../services/order.service';
import { ProductService } from '../../services/product.service';

const entity = type<Product>();
const collection = 'products';

export const ProductsLocalStore = signalStore(
  { providedIn: 'root' },
  withEntities({ entity, collection }),
  withCallStatus({ collection, initialValue: 'loading' }),
  withEntitiesLocalPagination({
    entity,
    collection,
    pageSize: 5,
  }),
  withEntitiesLocalFilter({
    entity,
    collection,
    defaultFilter: { search: '' },
    filterFn: (entity, filter) =>
      !filter?.search ||
      entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
  }),
  withEntitiesLocalSort({
    entity,
    collection,
    defaultSort: { field: 'name', direction: 'asc' },
  }),
  withEntitiesSingleSelection({
    entity,
    collection,
  }),
  withEntitiesLoadingCall({
    collection,
    fetchEntities: ({ productsFilter }) => {
      return inject(ProductService)
        .getProducts({
          search: productsFilter().search,
        })
        .pipe(map((d) => d.resultList));
    },
  }),
  withCalls(() => ({
    loadProductDetail: {
      call: ({ id }: { id: string }) =>
        inject(ProductService).getProductDetail(id),
      resultProp: 'productDetail',
      mapPipe: 'switchMap',
    },
    checkout: () => inject(OrderService).checkout(),
  })),
  withEntitiesSyncToRouteQueryParams({
    collection,
    entity,
    onQueryParamsLoaded: ({ productsEntitySelected, loadProductDetail }) => {
      if (productsEntitySelected())
        loadProductDetail(productsEntitySelected()!);
    },
  }),
);
