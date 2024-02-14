import { NgModule } from '@angular/core';
import { ProductShopPageContainerComponent } from './product-shop-page-container.component';
import { ProductsStateModule } from './state/products/products-state.module';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { ProductListModule } from '../components/product-list/product-list.module';
import { CommonModule } from '@angular/common';
import { ProductSearchFormModule } from '../components/product-search-form/product-search-form.module';
import { ProductShopPageRoutingModule } from './product-shop-page-routing.module';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { ProductsBasketStateModule } from './state/products-basket/products-basket-state.module';
import { ProductBasketModule } from '../components/product-basket/product-basket.module';

import { ProductDetailModule } from '../components/product-detail/product-detail.module';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';

@NgModule({
  declarations: [ProductShopPageContainerComponent],
  imports: [
    ProductsStateModule,
    ProductsBasketStateModule,
    MatProgressSpinnerModule,
    ProductListModule,
    ProductSearchFormModule,
    CommonModule,
    ProductShopPageRoutingModule,
    MatCardModule,
    MatButtonModule,
    ProductBasketModule,

    ProductDetailModule,
    MatTabsModule,
    MatIconModule,
    MatBadgeModule,
  ],
})
export class ProductShopPageModule {}
