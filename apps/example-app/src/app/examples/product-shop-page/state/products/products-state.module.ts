import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { productTraits } from './products.traits';
import { EffectsModule } from '@ngrx/effects';
import { ProductsEffects } from './products.effects';

@NgModule({
  declarations: [],
  imports: [
    StoreModule.forFeature('products', productTraits.reducer),
    EffectsModule.forFeature([ProductsEffects, ...productTraits.effects]),
  ],
})
export class ProductsStateModule {}
