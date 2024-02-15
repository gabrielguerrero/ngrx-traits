import { NgModule } from '@angular/core';
import { ProductListPaginatedPageContainerComponent } from './product-list-paginated-page-container.component';
import { ProductsStateModule } from './state/products/products-state.module';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { ProductListModule } from '../components/product-list/product-list.module';
import { CommonModule } from '@angular/common';
import { ProductSearchFormModule } from '../components/product-search-form/product-search-form.module';
import { ProductListPaginatedPageRoutingModule } from './product-list-paginated-page-routing.module';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';

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
