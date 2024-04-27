import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { ProductsEffects } from './products.effects';
import { productFeature } from './products.traits';

@NgModule({
  declarations: [],
  imports: [
    StoreModule.forFeature('products', productFeature.reducer),
    EffectsModule.forFeature([ProductsEffects, ...productFeature.effects]),
  ],
})
export class ProductsStateModule {}
