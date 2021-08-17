import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductBasketTabComponent } from './product-basket-tab.component';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductBasketModule } from '../../../components/product-basket/product-basket.module';
import { ProductDetailModule } from '../../../components/product-detail/product-detail.module';
import { GridModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [ProductBasketTabComponent],
  exports: [ProductBasketTabComponent],
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    ProductBasketModule,
    ProductDetailModule,
    GridModule,
    MatButtonModule,
  ],
})
export class ProductBasketTabModule {}
