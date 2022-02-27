import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { productFeature } from './products.traits';
import { EffectsModule } from '@ngrx/effects';
import { ProductsEffects } from './products.effects';

@NgModule({
  declarations: [],
  imports: [
    StoreModule.forFeature('products', productFeature.reducer),
    EffectsModule.forFeature([ProductsEffects, ...productFeature.effects]),
  ],
})
export class ProductsStateModule {}
