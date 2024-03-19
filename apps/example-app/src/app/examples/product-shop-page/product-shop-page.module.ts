import { NgModule } from '@angular/core';
import { ProductShopPageContainerComponent } from './product-shop-page-container.component';
import { ProductsStateModule } from './state/products/products-state.module';
import { MatProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CommonModule } from '@angular/common';

import { ProductShopPageRoutingModule } from './product-shop-page-routing.module';
import { MatCardModule as MatCardModule } from '@angular/material/card';
import { MatButtonModule as MatButtonModule } from '@angular/material/button';
import { ProductsBasketStateModule } from './state/products-basket/products-basket-state.module';

import { MatTabsModule as MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';

@NgModule({
  imports: [
    ProductsStateModule,
    ProductsBasketStateModule,
    MatProgressSpinnerModule,
    CommonModule,
    ProductShopPageRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatTabsModule,
    MatIconModule,
    MatBadgeModule,
    ProductShopPageContainerComponent,
  ],
})
export class ProductShopPageModule {}
