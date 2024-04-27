import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { ProductsBasketEffects } from './products-basket-effects.service';
import { combinedFeature } from './products-basket.traits';

@NgModule({
  declarations: [],
  imports: [
    StoreModule.forFeature('products-basket', combinedFeature.reducer),
    EffectsModule.forFeature([
      ProductsBasketEffects,
      ...combinedFeature.effects,
    ]),
  ],
})
export class ProductsBasketStateModule {}
