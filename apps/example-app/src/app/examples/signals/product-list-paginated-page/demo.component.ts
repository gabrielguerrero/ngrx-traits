import { Component, inject } from '@angular/core';
import { MatList, MatListItem } from '@angular/material/list';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';

import { ProductDetailComponent } from '../../components/product-detail/product-detail.component';
import { ProductStore } from './product-no-traits.store';

@Component({
  selector: 'demo',
  standalone: true,
  imports: [
    MatList,
    MatListItem,
    MatProgressSpinner,
    ProductDetailComponent,
    RouterLink,
  ],
  providers: [ProductStore],
  template: `
    <h1>Products List Demo</h1>
    @if (store.isLoadProductsLoading()) {
      <p class="m-8">Loading...</p>
    } @else if (store.isLoadProductsLoaded()) {
      <div class="sm:m-4 grid sm:grid-cols-2 gap-8">
        <div>
          <mat-list>
            @for (product of store.loadProductsResult(); track product.id) {
              <mat-list-item
                (click)="store.loadProductDetail({ id: product.id })"
                >{{ product.name }}
              </mat-list-item>
            }
          </mat-list>
        </div>
        @if (store.isLoadProductDetailLoading()) {
          <mat-spinner />
        } @else if (store.isLoadProductDetailLoaded()) {
          <product-detail [product]="store.productDetail()!" />
        } @else {
          <div class="content-center"><h2>Please Select a product</h2></div>
        }
      </div>
    } @else {
      <p>Error</p>
    }
  `,
})
export class DemoComponent {
  store = inject(ProductStore);
}
