import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { Product, ProductFilter } from '@example-api/shared/models';

import { Sort } from '@ngrx-traits/common';

import { ProductDetailComponent } from '../../components/product-detail/product-detail.component';
import { ProductListComponent } from '../../components/product-list/product-list.component';
import { ProductSearchFormComponent } from '../../components/product-search-form/product-search-form.component';
import { ProductResourceStore } from './product-resource.store';

@Component({
  selector: 'product-resource-page',
  template: `
    <a mat-raised-button routerLink="/signals" class="mb-4">Back to Examples</a>
    <mat-card>
      <mat-card-header>
        <mat-card-title>Products (Angular Resource view)</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="flex flex-wrap items-center gap-4">
          <product-search-form
            [searchProduct]="store.productEntitiesFilter()"
            (searchProductChange)="filter($event)"
          />
          <button
            mat-stroked-button
            [disabled]="products.isLoading()"
            (click)="store.setProductEntitiesLoading()"
          >
            Refresh
          </button>
          <code>products.status(): {{ products.status() }}</code>
          <code>detail.status(): {{ detail.status() }}</code>
        </div>
        <div class="sm:m-4 grid sm:grid-cols-2 gap-8">
          <div>
            <!-- loading is the first load, reloading keeps the list on screen -->
            @if (products.status() === 'loading') {
              <mat-spinner />
            } @else if (products.status() === 'error') {
              <h3>Error loading the products</h3>
              <button
                mat-stroked-button
                (click)="store.setProductEntitiesLoading()"
              >
                Retry
              </button>
            } @else {
              @if (products.status() === 'reloading') {
                <mat-progress-bar mode="indeterminate" />
              }
              <product-list
                [list]="products.value()"
                [selectedProduct]="selectedProduct()"
                [selectedSort]="{
                  active: $any(store.productEntitiesSort().field),
                  direction: store.productEntitiesSort().direction
                }"
                (selectProduct)="selectedProduct.set($event)"
                (sort)="sort($event)"
              />
            }
          </div>

          <div>
            <!-- hasValue() narrows detail.value() to ProductDetail -->
            @if (detail.hasValue()) {
              <product-detail
                [product]="detail.value()"
                [productLoading]="detail.isLoading()"
              />
            } @else if (detail.isLoading()) {
              <mat-spinner />
            } @else if (detail.status() === 'error') {
              <h3>Error loading the product detail</h3>
              <button mat-stroked-button (click)="retryDetail()">Retry</button>
            } @else {
              <div class="content-center"><h2>Please select a product</h2></div>
            }
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      mat-spinner {
        margin: 10px auto;
      }
    `,
  ],
  imports: [
    MatCardModule,
    MatButtonModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    ProductSearchFormComponent,
    ProductListComponent,
    ProductDetailComponent,
    RouterLink,
  ],
  providers: [ProductResourceStore],
})
export class ProductResourcePageComponent {
  store = inject(ProductResourceStore);

  // resource view of the entities and their loading call: value() is
  // store.productEntities(), status() the withCallStatus status. The fetch is
  // triggered by the store, with store.setProductEntitiesLoading()
  products = this.store.productEntitiesResource();

  selectedProduct = signal<Product | undefined>(undefined);

  // resource view of loadProductDetail, driven by the selection: the call
  // runs each time it changes, undefined skips it
  detail = this.store.productDetailResource({
    params: () => {
      const product = this.selectedProduct();
      return product ? { id: product.id } : undefined;
    },
  });

  // the call is the store's, so retrying is calling it again with the same row
  retryDetail() {
    const product = this.selectedProduct();
    product && this.store.loadProductDetail({ id: product.id });
  }

  filter(filter: ProductFilter | undefined) {
    filter && this.store.filterProductEntities({ filter });
  }

  sort(sort: Sort<Product>) {
    this.store.sortProductEntities({
      sort: { field: sort.active, direction: sort.direction },
    });
  }
}
