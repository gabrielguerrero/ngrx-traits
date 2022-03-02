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
  addEntityFeaturesProperties,
  combineEntityFeatures,
  createEntityFeatureFactory,
  mixEntityFeatures,
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
const clientsFeatureFactory = createEntityFeatureFactory(
  { entityName: 'client', entitiesName: 'clients' },
  addLoadEntitiesTrait<Client>(),
  addCrudEntitiesTrait<Client>()
);
const productOrderFeatureFactory = createEntityFeatureFactory(
  { entityName: 'productOrder' },
  addLoadEntitiesTrait<ProductOrder>(),
  addSelectEntitiesTrait<ProductOrder>()
);
const productFeatureFactory = createEntityFeatureFactory(
  { entityName: 'product' },
  addLoadEntitiesTrait<Product>(),
  addSelectEntitiesTrait<Product>()
);

type ProductFeature = ReturnType<typeof productFeatureFactory>;

async function basicProductTest(
  actions: ProductFeature['actions'],
  selectors: ProductFeature['selectors'],
  store: Store
) {
  store.dispatch(
    actions.loadProductsSuccess({
      entities: [{ id: 1, name: 'X', description: 'Y', price: 10 }],
    })
  );
  store.dispatch(actions.selectProducts({ id: 1 }));
  const result = await store
    .select(selectors.selectProductsList)
    .pipe(first())
    .toPromise();
  expect(result).toEqual([{ id: 1, name: 'X', description: 'Y', price: 10 }]);
  const result2 = await store
    .select(selectors.selectProductsIdsList)
    .pipe(first())
    .toPromise();
  expect(result2).toEqual([1]);
}

type ProductOrderFeature = ReturnType<typeof productOrderFeatureFactory>;
async function basicProductOrdersTest(
  actions: ProductOrderFeature['actions'],
  selectors: ProductOrderFeature['selectors'],
  store: Store
) {
  store.dispatch(
    actions.loadProductOrdersSuccess({
      entities: [{ id: 2, name: 'X', description: 'Y', price: 10 }],
    })
  );
  store.dispatch(actions.selectProductOrders({ id: 2 }));
  const result = await store
    .select(selectors.selectProductOrdersList)
    .pipe(first())
    .toPromise();
  expect(result).toEqual([{ id: 2, name: 'X', description: 'Y', price: 10 }]);
  const result2 = await store
    .select(selectors.selectProductOrdersIdsList)
    .pipe(first())
    .toPromise();
  expect(result2).toEqual([2]);
}
type ClientFeature = ReturnType<typeof clientsFeatureFactory>;
async function basicClientsTest(
  actions: ClientFeature['actions'],
  selectors: ClientFeature['selectors'],
  store: Store
) {
  store.dispatch(
    actions.loadClientsSuccess({
      entities: [{ id: 3, name: 'X' }],
    })
  );
  store.dispatch(actions.addClients({ id: 4, name: 'X' }));
  const result = await store
    .select(selectors.selectClientsList)
    .pipe(first())
    .toPromise();
  expect(result).toEqual([
    { id: 3, name: 'X' },
    { id: 4, name: 'X' },
  ]);
}
function initIndividualEntityFeatureInit() {
  const combinedFactory = combineEntityFeatures({
    products: productFeatureFactory,
    productOrders: productOrderFeatureFactory,
    clients: clientsFeatureFactory,
  });

  const products = productFeatureFactory({
    actionsGroupKey: '[products]',
    featureSelector: 'products',
  });
  const productOrders = productOrderFeatureFactory({
    actionsGroupKey: '[productOrders]',
    featureSelector: 'productOrders',
  });
  const clients = clientsFeatureFactory({
    actionsGroupKey: '[clients]',
    featureSelector: 'clients',
  });

  TestBed.configureTestingModule({
    imports: [
      StoreModule.forRoot({}),
      StoreModule.forFeature('products', products.reducer),
      StoreModule.forFeature('productOrders', productOrders.reducer),
      StoreModule.forFeature('clients', clients.reducer),
      EffectsModule.forRoot([
        ...products.effects,
        ...productOrders.effects,
        ...clients.effects,
      ]),
    ],
  });
  const store = TestBed.inject(Store);
  return { products, productOrders, clients, store };
}

function initCombineEntityFeatureInit() {
  const combinedFactory = combineEntityFeatures({
    products: productFeatureFactory,
    productOrders: productOrderFeatureFactory,
    clients: clientsFeatureFactory,
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

function mixedEntityFeatureInit() {
  const mixedFactory = mixEntityFeatures({
    products: productFeatureFactory,
    productOrders: productOrderFeatureFactory,
    clients: clientsFeatureFactory,
  });

  const combinedFeature = mixedFactory({
    actionsGroupKey: '[Mixed]',
    featureSelector: 'mixed',
  });

  TestBed.configureTestingModule({
    imports: [
      StoreModule.forRoot({}),
      StoreModule.forFeature('mixed', combinedFeature.reducer),
      EffectsModule.forRoot(combinedFeature.effects),
    ],
  });
  const store = TestBed.inject(Store);
  return { ...combinedFeature, store };
}

function addEntityFeaturesPropertiesInit() {
  const mixedFactory = addEntityFeaturesProperties(productFeatureFactory, {
    productOrders: productOrderFeatureFactory,
    clients: clientsFeatureFactory,
  });

  const combinedFeature = mixedFactory({
    actionsGroupKey: '[addEntityFeatures]',
    featureSelector: 'addEntityFeatures',
  });

  TestBed.configureTestingModule({
    imports: [
      StoreModule.forRoot({}),
      StoreModule.forFeature('addEntityFeatures', combinedFeature.reducer),
      EffectsModule.forRoot(combinedFeature.effects),
    ],
  });
  const store = TestBed.inject(Store);
  return { ...combinedFeature, store };
}

describe('Ngrx-Traits Integration Test', () => {
  describe('individual entity features test', () => {
    it('test some action and selectors in products ', async () => {
      const { products, store } = initIndividualEntityFeatureInit();
      await basicProductTest(products.actions, products.selectors, store);
    });

    it('test some action and selectors in productOrders ', async () => {
      const { productOrders, store } = initIndividualEntityFeatureInit();
      await basicProductOrdersTest(
        productOrders.actions,
        productOrders.selectors,
        store
      );
    });

    it('test some action and selectors in clients ', async () => {
      const { clients, store } = initIndividualEntityFeatureInit();
      await basicClientsTest(clients.actions, clients.selectors, store);
    });
  });

  describe('combineEntityFeatures', () => {
    it('test some action and selectors in products ', async () => {
      const { actions, selectors, store } = initCombineEntityFeatureInit();
      await basicProductTest(actions.products, selectors.products, store);
    });

    it('test some action and selectors in productOrders ', async () => {
      const { actions, selectors, store } = initCombineEntityFeatureInit();
      await basicProductOrdersTest(
        actions.productOrders,
        selectors.productOrders,
        store
      );
    });

    it('test some action and selectors in clients ', async () => {
      const { actions, selectors, store } = initCombineEntityFeatureInit();
      await basicClientsTest(actions.clients, selectors.clients, store);
    });
  });

  describe('mixEntityFeatures', () => {
    it('test some action and selectors in products ', async () => {
      const { actions, selectors, store } = mixedEntityFeatureInit();
      await basicProductTest(actions, selectors, store);
    });

    it('test some action and selectors in productOrders ', async () => {
      const { actions, selectors, store } = mixedEntityFeatureInit();
      await basicProductOrdersTest(actions, selectors, store);
    });

    it('test some action and selectors in clients ', async () => {
      const { actions, selectors, store } = mixedEntityFeatureInit();
      await basicClientsTest(actions, selectors, store);
    });
  });

  describe('addEntityFeaturesProperties', () => {
    it('test some action and selectors in products ', async () => {
      const { actions, selectors, store } = addEntityFeaturesPropertiesInit();
      await basicProductTest(actions, selectors, store);
    });

    it('test some action and selectors in productOrders ', async () => {
      const { actions, selectors, store } = addEntityFeaturesPropertiesInit();
      await basicProductOrdersTest(
        actions.productOrders,
        selectors.productOrders,
        store
      );
    });

    it('test some action and selectors in clients ', async () => {
      const { actions, selectors, store } = addEntityFeaturesPropertiesInit();
      await basicClientsTest(actions.clients, selectors.clients, store);
    });
  });
});
