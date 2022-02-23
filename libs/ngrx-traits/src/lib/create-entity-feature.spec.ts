import {
  addAsyncActionTrait,
  addCrudEntitiesTrait,
  addEntitiesPaginationTrait,
  addFilterEntitiesTrait,
  addLoadEntitiesTrait,
  addSelectEntitiesTrait,
  addSelectEntityTrait,
  addSortEntitiesTrait,
  CacheType,
} from 'ngrx-traits/traits';
import { createFeatureSelector, props, Store, StoreModule } from '@ngrx/store';
import {
  combineEntityFeatures,
  createEntityFeatureFactory,
} from './create-entity-feature';
import { TestBed } from '@angular/core/testing';
import { EffectsModule } from '@ngrx/effects';
import { first } from 'rxjs/operators';

export interface TodoFilter {
  content?: string;
  extra?: string;
}

interface Client {
  id: number;
  name: string;
}
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
}
export interface ProductOrder extends Product {
  quantity?: number;
}
export interface ProductFilter {
  search: string;
}

export interface ProductDetail extends Product {
  maker: string;
  releaseDate: string;
  image: string;
}
const todosFeatureFactory = createEntityFeatureFactory(
  { entityName: 'client', entitiesName: 'clients' },
  addLoadEntitiesTrait<Client>(),
  addCrudEntitiesTrait<Client>(),
  addEntitiesPaginationTrait<Client>()
);
const productOrderFeatureFactory = createEntityFeatureFactory(
  { entityName: 'productOrder' },
  addLoadEntitiesTrait<ProductOrder>(),
  addSelectEntitiesTrait<ProductOrder>(),
  addSelectEntityTrait<ProductOrder>(),
  addCrudEntitiesTrait<ProductOrder>(),
  addAsyncActionTrait({
    name: 'checkout',
    actionSuccessProps: props<{ orderId: string }>(),
  }),
  addSortEntitiesTrait<ProductOrder>({
    defaultSort: { direction: 'asc', active: 'name' },
  })
);
const productFeatureFactory = createEntityFeatureFactory(
  { entityName: 'product' },
  addLoadEntitiesTrait<Product>(),
  addSelectEntitiesTrait<Product>(),
  addFilterEntitiesTrait<Product, ProductFilter>({
    filterFn: (filter, entity) => {
      return entity.name.toLowerCase().includes(filter.search.toLowerCase());
    },
  }),
  addSortEntitiesTrait<Product>({
    defaultSort: { direction: 'asc', active: 'name' },
  })
);

function initCombineEntityFeatureInit() {
  const combinedFactory = combineEntityFeatures({
    products: productFeatureFactory,
    productOrders: productOrderFeatureFactory,
    todos: todosFeatureFactory,
  });

  const combinedFeature = combinedFactory({
    actionsGroupKey: '[Combined]',
    featureSelector: 'combined',
  });

  TestBed.configureTestingModule({
    imports: [
      StoreModule.forRoot({}),
      StoreModule.forFeature('combined', combinedFeature.reducer),
      EffectsModule.forRoot(combinedFeature.effects),
    ],
  });
  const store = TestBed.inject(Store);
  return { ...combinedFeature, store };
}

describe('Ngrx-Traits Integration Test', () => {
  it('should ', async () => {
    const { actions, selectors, store } = initCombineEntityFeatureInit();
    store.dispatch(
      actions.products.loadProductsSuccess({
        entities: [{ id: 1, name: 'X', description: 'Y', price: 10 }],
      })
    );
    const result = await store
      .select(selectors.products.selectProductsList)
      .pipe(first())
      .toPromise();
    expect(result).toEqual([{ id: 1, name: 'X', description: 'Y', price: 10 }]);
  });
});
// function mixedEntityFeatureInit() {
//   const mixedFactory = combineEntityFeatures({
//     products: productFeatureFactory,
//     productOrders: productOrderFeatureFactory,
//     todos: todosFeatureFactory,
//   });
//
//   const combinedFeature = mixedFactory({
//     actionsGroupKey: '[Mixed]',
//     featureSelector: 'mixed',
//   });
//
//   TestBed.configureTestingModule({
//     providers: [
//       StoreModule.forRoot({}),
//       StoreModule.forFeature('mixed', combinedFeature.reducer),
//       EffectsModule.forRoot(combinedFeature.effects),
//     ],
//   });
//   const store = TestBed.inject(Store);
//   return { ...combinedFeature, store };
// }
