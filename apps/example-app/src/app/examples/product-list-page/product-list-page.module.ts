import { NgModule } from '@angular/core';
import { ProductListPageContainerComponent } from './product-list-page-container.component';
import { ProductsStateModule } from './state/products/products-state.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductListModule } from '../components/product-list/product-list.module';
import { CommonModule } from '@angular/common';
import { ProductSearchFormModule } from '../components/product-search-form/product-search-form.module';
import { ProductListPageRoutingModule } from './product-list-page-routing.module';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [ProductListPageContainerComponent],
  imports: [
    ProductsStateModule,
    MatProgressSpinnerModule,
    ProductListModule,
    ProductSearchFormModule,
    CommonModule,
    ProductListPageRoutingModule,
    MatCardModule,
    MatButtonModule,
  ],
})
export class ProductListPageModule {}
