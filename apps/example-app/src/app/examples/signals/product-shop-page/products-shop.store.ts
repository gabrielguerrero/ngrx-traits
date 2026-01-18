import { signalStore } from '@ngrx/signals';

import { withBasketOperations } from './with-basket-operations';
import { withOrderEntities } from './with-order-entities';
import { withProductEntities } from './with-product-entities';

/**
 * The store for the products shop page
 * This store is used to manage the products and the order items,
 * it has two collections, one for the products and one for the order items.
 * Here you can see how to split a store into multiple features for better
 * organization and reusability. We also wanted to show how you can use multiple
 * collections in one store, at the moment of writing this comment, signalStore
 * method can only have 10 parameters, and you can easily reach this limit if you
 * have multiple collections in one store, the way to solve this, is to group the store
 * features into custom store features as seen bellow. Also notice the output types of
 * withProductEntities and withOrderEntities are extracted using ExtractStoreFeatureOutput
 * and then used as input of withBasketOperations.
 */

export const ProductsShopStore = signalStore(
  { providedIn: 'root' },
  withProductEntities(),
  withOrderEntities(),
  withBasketOperations(),
);
