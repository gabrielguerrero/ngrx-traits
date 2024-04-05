import { inject } from '@angular/core';
import {
  withCalls,
  withCallStatus,
  withEntitiesLoadingCall,
  withEntitiesLocalFilter,
  withEntitiesLocalPagination,
  withEntitiesLocalSort,
  withEntitiesMultiSelection,
  withEntitiesRemoteFilter,
  withEntitiesRemotePagination,
  withEntitiesRemoteSort,
  withEntitiesSingleSelection,
  withLogger,
} from '@ngrx-traits/signals';
import { signalStore, type, withMethods } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import { map } from 'rxjs/operators';

import { Product, ProductFilter } from '../../models';
import { OrderService } from '../../services/order.service';
import { ProductService } from '../../services/product.service';

const entity = type<Product>();
const collection = 'products';
export const ProductsRemoteStore = signalStore(
  { providedIn: 'root' },
  withEntities({ entity, collection }),
  withCallStatus({ prop: collection, initialValue: 'loading' }),
  withEntitiesRemoteFilter({
    entity,
    collection,
    defaultFilter: { name: '' },
  }),
  withEntitiesRemotePagination({
    entity,
    collection,
    pageSize: 5,
    pagesToCache: 2,
  }),
  withEntitiesRemoteSort({
    entity,
    collection,
    defaultSort: { field: 'name', direction: 'asc' },
  }),
  withEntitiesSingleSelection({
    entity,
    collection,
  }),
  withEntitiesMultiSelection({
    entity,
    collection,
  }),
  withEntitiesLoadingCall({
    collection,
    fetchEntities: ({ productsFilter, productsPagedRequest, productsSort }) => {
      return inject(ProductService)
        .getProducts({
          search: productsFilter().name,
          take: productsPagedRequest().size,
          skip: productsPagedRequest().startIndex,
          sortColumn: productsSort().field,
          sortAscending: productsSort().direction === 'asc',
        })
        .pipe(
          map((d) => ({
            entities: d.resultList,
            total: d.total,
          })),
        );
    },
  }),
  withCalls(() => ({
    loadProductDetail: {
      call: ({ id }: { id: string }) =>
        inject(ProductService).getProductDetail(id),
      resultProp: 'productDetail',
    },
    checkout: () => inject(OrderService).checkout(),
  })),
);

export const ProductsLocalStore = signalStore(
  { providedIn: 'root' },
  withEntities({ entity, collection }),
  withCallStatus({ prop: collection, initialValue: 'loading' }),
  withEntitiesLocalFilter({
    entity,
    collection,
    defaultFilter: { search: '' },
    filterFn: (entity, filter) =>
      !filter?.search ||
      entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
  }),
  withEntitiesLocalPagination({
    entity,
    collection,
    pageSize: 5,
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
  withLogger('sdsd'),
);

export const ProductsLocalStore2 = signalStore(
  { providedIn: 'root' },
  withEntities({ entity }),
  withCallStatus({ initialValue: 'loading' }),
  withEntitiesLocalFilter({
    entity,
    defaultFilter: { search: '' },
    filterFn: (entity, filter) =>
      !filter?.search ||
      entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
  }),
  withEntitiesLocalPagination({
    entity,
    pageSize: 5,
  }),
  withEntitiesLocalSort({
    entity,
    defaultSort: { field: 'name', direction: 'asc' },
  }),
  withEntitiesSingleSelection({
    entity,
  }),
  withEntitiesLoadingCall({
    fetchEntities: ({ entitiesFilter }) => {
      return inject(ProductService)
        .getProducts({
          search: entitiesFilter().search,
        })
        .pipe(map((d) => d.resultList));
    },
  }),
  withCalls(() => ({
    loadProductDetail: {
      call: ({ id }: { id: string }) =>
        inject(ProductService).getProductDetail(id),
      resultProp: 'productDetail',
    },
    checkout: () => inject(OrderService).checkout(),
  })),
);
