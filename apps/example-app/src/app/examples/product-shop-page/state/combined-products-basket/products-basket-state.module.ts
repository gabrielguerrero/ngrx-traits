import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { combinedFeature } from './products-basket.traits';
import { EffectsModule } from '@ngrx/effects';
import { ProductsBasketEffects } from './products-basket-effects.service';

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
