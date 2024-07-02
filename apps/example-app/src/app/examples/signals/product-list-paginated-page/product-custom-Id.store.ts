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
import { withEntities } from '@ngrx/signals/entities';
import { map } from 'rxjs/operators';

import { Product } from '../../models';
import { OrderService } from '../../services/order.service';
import { ProductService } from '../../services/product.service';

// Example of wihEntities with a custom id key
type ProductCustom = Omit<Product, 'id'> & { productId: string };
const entityConfig = {
  entity: type<ProductCustom>(),
  collection: 'products',
  idKey: 'productId' as any,
} as const;

export const ProductsLocalStore = signalStore(
  { providedIn: 'root' },
  withEntities(entityConfig),
  withCallStatus({ ...entityConfig, initialValue: 'loading' }),
  withEntitiesLocalPagination({
    ...entityConfig,
    pageSize: 5,
  }),
  withEntitiesLocalFilter({
    ...entityConfig,
    defaultFilter: { search: '' },
    filterFn: (entity, filter) =>
      !filter?.search ||
      entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
  }),
  withEntitiesLocalSort({
    ...entityConfig,
    defaultSort: { field: 'name', direction: 'asc' },
  }),
  withEntitiesSingleSelection({
    ...entityConfig,
  }),
  withEntitiesLoadingCall({
    ...entityConfig,
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
