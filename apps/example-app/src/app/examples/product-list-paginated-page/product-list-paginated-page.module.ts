import { NgModule } from '@angular/core';
import { ProductListPaginatedPageContainerComponent } from './product-list-paginated-page-container.component';
import { ProductsStateModule } from './state/products/products-state.module';
import { MatProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CommonModule } from '@angular/common';

import { ProductListPaginatedPageRoutingModule } from './product-list-paginated-page-routing.module';
import { MatCardModule as MatCardModule } from '@angular/material/card';
import { MatButtonModule as MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule as MatPaginatorModule } from '@angular/material/paginator';

@NgModule({
  imports: [
    ProductsStateModule,
    MatProgressSpinnerModule,
    CommonModule,
    ProductListPaginatedPageRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatPaginatorModule,
    ProductListPaginatedPageContainerComponent,
  ],
})
export class ProductListPaginatedPageModule {}
