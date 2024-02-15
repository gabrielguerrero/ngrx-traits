import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductBasketTabComponent } from './product-basket-tab.component';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { ProductBasketModule } from '../../../components/product-basket/product-basket.module';
import { ProductDetailModule } from '../../../components/product-detail/product-detail.module';

import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

@NgModule({
  declarations: [ProductBasketTabComponent],
  exports: [ProductBasketTabComponent],
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    ProductBasketModule,
    ProductDetailModule,

    MatButtonModule,
  ],
})
export class ProductBasketTabModule {}
