import { computed, inject } from '@angular/core';
import { ProductDetail } from '@example-api/shared/models';
import {
  cacheRxCall,
  callConfig,
  withCalls,
  withLink,
  withLogger,
  withStateSetter,
} from '@ngrx-traits/signals';
import {
  patchState,
  signalStore,
  withComputed,
  withState,
} from '@ngrx/signals';
import { of } from 'rxjs';

import { ProductService } from '../../services/product.service';

// the blank draft: what the link falls back to before a detail is loaded, and
// the starting point of a new product. An empty id is what marks it as new, so
// saving it creates instead of updates
const noProduct: ProductDetail = {
  id: '',
  name: '',
  description: '',
  price: 0,
  image: '',
  genre: 'action',
  console: 'snes',
  maker: '',
  releaseDate: '',
};

/**
 * Store of the product edit panel, one per panel instance.
 *
 * The id it works on is state, fed from the component's input through the
 * generated `setId()`; the detail is loaded from it with `callWith`, and the
 * result prop is what the edit form is linked to.
 */
export const ProductEditStore = signalStore(
  withState({ id: '' }),
  // generates setId(), which the panel feeds its id input — a signalMethod, so
  // passing the input signal keeps the store following it
  withStateSetter('id'),
  withCalls((store) => ({
    loadProductDetail: callConfig({
      call: ({ id }: { id: string }) =>
        // the call is cached last 5 calls so switching between products doesn't refetch them
        cacheRxCall({
          key: `productDetail-${id}`,
          call: inject(ProductService).getProductDetail(id),
          maxCacheSize: 5,
        }),
      resultProp: 'productDetail',
      // so the link always has a value to bind a form to
      defaultResult: noProduct,
      // skip the call when the id is empty
      skipWhen: (param) => !param?.id,
      callWith: () => ({ id: store.id() }),
    }),
    saveProduct: callConfig({
      // a draft with no id yet is a new product
      call: (product: ProductDetail) =>
        product.id
          ? inject(ProductService).updateProduct(product)
          : inject(ProductService).createProduct(product),
      storeResult: false,
      // a created product now has an id: keep editing it rather than the draft
      onSuccess: (saved) =>
        patchState(store as any, { id: saved.id, productDetail: saved }),
    }),
  })),
  // the form binds to this: writes land in productDetail, and only valid ones,
  // since the panel gates them with updateStoreWhen
  withLink('productDetail'),
  withComputed(({ productDetail }) => ({
    // a draft that has never been saved still has no id
    isNew: () => !productDetail().id,
  })),
  withLogger({ name: 'ProductEditStore', filter: ['id'] }),
);
