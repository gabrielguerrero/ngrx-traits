import { inject } from '@angular/core';
import {
  typedCallConfig,
  withCalls,
  withCallStatus,
  withEntitiesLoadingCall,
  withEntitiesLocalFilter,
  withEntitiesLocalPagination,
} from '@ngrx-traits/signals';
import { signalStore, type } from '@ngrx/signals';
import { entityConfig, withEntities } from '@ngrx/signals/entities';
import { map } from 'rxjs/operators';

import { Product } from '../../models';
import { ProductService } from '../../services/product.service';

/**
 * Example of the store for the product list page but without using any of the ngrx-traits/signals methods, for comparation of code saved.
 */
const productsEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'products',
});
export const ProductStore = signalStore(
  withEntities(productsEntityConfig),
  withCallStatus({ ...productsEntityConfig, initialValue: 'loading' }),
  withEntitiesLocalPagination(productsEntityConfig),
  withEntitiesLocalFilter({
    ...productsEntityConfig,
    defaultFilter: { search: '' },
    filterFn: (entity, filter) =>
      !filter?.search ||
      entity?.name.toLowerCase().includes(filter?.search.toLowerCase()),
  }),
  withEntitiesLoadingCall(() => ({
    ...productsEntityConfig,
    fetchEntities: () =>
      inject(ProductService)
        .getProducts()
        .pipe(map((d) => d.resultList)),
  })),
  withCalls(() => {
    return {
      loadProductDetail: typedCallConfig({
        call: ({ id }: { id: string }) =>
          inject(ProductService).getProductDetail(id),
        resultProp: 'productDetail',
      }),
    };
  }),
);
