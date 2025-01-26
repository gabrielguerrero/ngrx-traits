import { inject } from '@angular/core';
import {
  callConfig,
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
    fetchEntities: () => {
      return inject(ProductService)
        .getProducts()
        .pipe(map((d) => d.resultList));
    },
  }),
  withCalls(({ productsEntitySelected }) => ({
    loadProductDetail: callConfig({
      call: ({ id }: { id: string }) =>
        inject(ProductService).getProductDetail(id),
      resultProp: 'productDetail',
      // call load the product detail when a product is selected
      callWith: productsEntitySelected,
      // productsEntitySelected is of type Signal<Product | undefined> so it can be pass directly to callWith
      // because it matches the type the call parameter, but you can use a function as bellow if it doesnt
      // callWith: () =>
      //   productsEntitySelected()
      //     ? { id: productsEntitySelected()!.id }
      //     : undefined, // if no product is selected, skip call
    }),
    checkout: () => inject(OrderService).checkout(),
  })),
  // loadProductDetail callWith is equivalent to:
  // withHooks((store) => {
  //   return {
  //     onInit() {
  //       toObservable(store.productsEntitySelected)
  //         .pipe(filter((v) => !!v))
  //         .subscribe((v) => {
  //           store.loadProductDetail({ id: v!.id });
  //         });
  //   };
  // }),
  withEntitiesSyncToRouteQueryParams({
    collection,
    entity,
  }),
);
