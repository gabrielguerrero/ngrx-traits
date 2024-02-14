import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductShopTabComponent } from './product-shop-tab.component';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { ProductSearchFormModule } from '../../../components/product-search-form/product-search-form.module';
import { ProductListModule } from '../../../components/product-list/product-list.module';
import { ProductDetailModule } from '../../../components/product-detail/product-detail.module';
import { ProductBasketModule } from '../../../components/product-basket/product-basket.module';

import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

@NgModule({
  declarations: [ProductShopTabComponent],
  exports: [ProductShopTabComponent],
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    ProductSearchFormModule,
    ProductListModule,
    ProductDetailModule,
    ProductBasketModule,

    MatButtonModule,
  ],
})
export class ProductShopTabModule {}
