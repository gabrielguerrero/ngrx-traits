import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { productTraits } from './products-basket.traits';
import { EffectsModule } from '@ngrx/effects';
import { ProductsBasketEffects } from './products-basket-effects.service';

@NgModule({
  declarations: [],
  imports: [
    StoreModule.forFeature('products-basket', productTraits.reducer),
    EffectsModule.forFeature([ProductsBasketEffects, ...productTraits.effects]),
  ],
})
export class ProductsBasketStateModule {}
