import { NgModule } from '@angular/core';
import { ProductListPageContainerComponent } from './product-list-page-container.component';
import { ProductsStateModule } from './state/products/products-state.module';
import { MatProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CommonModule } from '@angular/common';

import { ProductListPageRoutingModule } from './product-list-page-routing.module';
import { MatCardModule as MatCardModule } from '@angular/material/card';
import { MatButtonModule as MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [
    ProductsStateModule,
    MatProgressSpinnerModule,
    CommonModule,
    ProductListPageRoutingModule,
    MatCardModule,
    MatButtonModule,
    ProductListPageContainerComponent,
  ],
})
export class ProductListPageModule {}
