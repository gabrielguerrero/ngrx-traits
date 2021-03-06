import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { productOrdersFeature } from './products-basket.traits';
import { EffectsModule } from '@ngrx/effects';
import { ProductsBasketEffects } from './products-basket-effects.service';

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
