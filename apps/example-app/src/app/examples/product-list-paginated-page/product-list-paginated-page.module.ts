import { NgModule } from '@angular/core';
import { ProductListPaginatedPageContainerComponent } from './product-list-paginated-page-container.component';
import { ProductsStateModule } from './state/products/products-state.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductListModule } from '../components/product-list/product-list.module';
import { CommonModule } from '@angular/common';
import { ProductSearchFormModule } from '../components/product-search-form/product-search-form.module';
import { ProductListPaginatedPageRoutingModule } from './product-list-paginated-page-routing.module';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';

@NgModule({
  declarations: [ProductListPaginatedPageContainerComponent],
  imports: [
    ProductsStateModule,
    MatProgressSpinnerModule,
    ProductListModule,
    ProductSearchFormModule,
    CommonModule,
    ProductListPaginatedPageRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatPaginatorModule,
  ],
})
export class ProductListPaginatedPageModule {}
