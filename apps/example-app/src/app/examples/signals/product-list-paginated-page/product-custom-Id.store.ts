import { inject } from '@angular/core';
import {
  withCalls,
  withCallStatus,
  withEntitiesLoadingCall,
  withEntitiesLocalFilter,
  withEntitiesLocalPagination,
  withEntitiesLocalSort,
  withEntitiesSingleSelection,
} from '@ngrx-traits/signals';
import { signalStore, type } from '@ngrx/signals';
import { entityConfig, withEntities } from '@ngrx/signals/entities';
import { map } from 'rxjs/operators';

import { Product } from '../../models';
import { OrderService } from '../../services/order.service';
import { ProductService } from '../../services/product.service';

// Example of wihEntities with a custom id key
type ProductCustom = Omit<Product, 'id'> & { productId: string };
const config = entityConfig({
  entity: type<ProductCustom>(),
  collection: 'products',
  selectId: (entity) => entity.productId,
});

export const ProductsLocalStore = signalStore(
  { providedIn: 'root' },
  withEntities(config),
  withCallStatus({ ...config, initialValue: 'loading' }),
  withEntitiesLocalPagination({
    ...config,
    pageSize: 5,
  }),
  withEntitiesLocalFilter({
    ...config,
    defaultFilter: { search: '' },
    filterFn: (entity, filter) =>
      !filter?.search ||
      entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
  }),
  withEntitiesLocalSort({
    ...config,
    defaultSort: { field: 'name', direction: 'asc' },
  }),
  withEntitiesSingleSelection({
    ...config,
  }),
  withEntitiesLoadingCall({
    ...config,
    fetchEntities: ({ productsFilter }) => {
      return inject(ProductService)
        .getProducts({
          search: productsFilter().search,
        })
        .pipe(
          map((d) =>
            d.resultList.map(({ id, ...product }) => ({
              ...product,
              productId: id,
            })),
          ),
        );
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
);
