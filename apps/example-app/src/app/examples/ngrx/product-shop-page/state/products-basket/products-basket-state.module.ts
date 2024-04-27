import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { ProductsBasketEffects } from './products-basket-effects.service';
import { productOrdersFeature } from './products-basket.traits';

@NgModule({
  declarations: [],
  imports: [
    StoreModule.forFeature('products-basket', productOrdersFeature.reducer),
    EffectsModule.forFeature([
      ProductsBasketEffects,
      ...productOrdersFeature.effects,
    ]),
  ],
})
export class ProductsBasketStateModule {}
