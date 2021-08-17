import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductShopTabComponent } from './product-shop-tab.component';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductSearchFormModule } from '../../../components/product-search-form/product-search-form.module';
import { ProductListModule } from '../../../components/product-list/product-list.module';
import { ProductDetailModule } from '../../../components/product-detail/product-detail.module';
import { ProductBasketModule } from '../../../components/product-basket/product-basket.module';
import { GridModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';

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
    GridModule,
    MatButtonModule,
  ],
})
export class ProductShopTabModule {}
