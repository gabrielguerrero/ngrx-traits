import { inject } from '@angular/core';
import { Console, Genre, genres, Product } from '@example-api/shared/models';
import {
  withCallStatus,
  withEntitiesLoadingCall,
  withEntitiesLocalFilter,
  withEntitiesLocalPagination,
  withEntitiesSingleSelection,
  withLinkEntitiesFilter,
  withLogger,
} from '@ngrx-traits/signals';
import { patchState, signalStore, type, withMethods } from '@ngrx/signals';
import {
  entityConfig,
  upsertEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { map } from 'rxjs/operators';

import { ProductService } from '../../services/product.service';

const productsEntityConfig = entityConfig({
  entity: type<Product>(),
  collection: 'product',
});

export type ProductFilter = {
  search: string;
  genres: Genre[];
  price: { min: number; max: number };
};

export const ProductLinkStore = signalStore(
  withCallStatus({ ...productsEntityConfig, initialValue: 'loading' }),
  withEntities(productsEntityConfig),
  withEntitiesSingleSelection(productsEntityConfig),
  withEntitiesLocalPagination({ ...productsEntityConfig, pageSize: 10 }),
  withEntitiesLocalFilter({
    ...productsEntityConfig,
    defaultFilter: {
      search: '',
      genres: genres,
      consoles: [] as Console[],
      price: { min: 0, max: 100 },
    },
    filterFn: (entity, filter) =>
      (!filter?.search ||
        entity.name.toLowerCase().includes(filter.search.toLowerCase())) &&
      filter.genres.includes(entity.genre) &&
      (filter.consoles.length === 0 ||
        filter.consoles.includes(entity.console)) &&
      (!filter?.price ||
        (entity.price >= filter.price.min && entity.price <= filter.price.max)),
  }),
  withEntitiesLoadingCall({
    ...productsEntityConfig,
    fetchEntities: () =>
      inject(ProductService)
        .getProducts()
        .pipe(map((d) => d.resultList)),
  }),
  // generates linkProductEntitiesFilter(), used by the filter signal form
  withLinkEntitiesFilter(productsEntityConfig),

  withMethods((store) => ({
    // what the edit panel emits when the server accepted a save: an edited
    // product updates its row, a created one is added
    upsertProduct: (product: Product) =>
      patchState(store, upsertEntity(product, productsEntityConfig)),
  })),
  withLogger({
    name: 'ProductLinkStore',
    showDiff: true,
    filter: ['productEntitiesFilter', 'productEntitySelected'],
  }),
);
