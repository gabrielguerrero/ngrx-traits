import { Component, inject } from '@angular/core';
import { MatList, MatListItem } from '@angular/material/list';

import { ProductStore } from './product-no-traits.store';

@Component({
  selector: 'demo',
  standalone: true,
  imports: [MatList, MatListItem],
  providers: [ProductStore],
  template: `
    <h1>Products List Demo</h1>
    @if (store.isLoadProductsLoading()) {
      <p class="m-8">Loading...</p>
    } @else if (store.isLoadProductsLoaded()) {
      <mat-list>
        @for (product of store.loadProductsResult(); track product.id) {
          <mat-list-item>{{ product.name }} </mat-list-item>
        }
      </mat-list>
    } @else {
      <p>Error</p>
    }
  `,
})
export class DemoComponent {
  store = inject(ProductStore);
}
