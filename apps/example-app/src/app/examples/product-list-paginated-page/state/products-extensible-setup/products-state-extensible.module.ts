import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { productFeature } from './products.traits';
import { EffectsModule } from '@ngrx/effects';
import { ProductsEffects } from './products.effects';
import { productsReducer } from './products.reducer';

@NgModule({
  declarations: [],
  imports: [
    StoreModule.forFeature('products-paginated', productsReducer),
    EffectsModule.forFeature([ProductsEffects, ...productFeature.effects]),
  ],
})
export class ProductsStateExtensibleModule {}
