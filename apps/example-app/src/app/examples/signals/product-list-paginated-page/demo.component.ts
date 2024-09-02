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
    <mat-list>
      @for (product of store.products(); track product.id) {
        <mat-list-item>{{ product.name }} </mat-list-item>
      }
    </mat-list>
  `,
})
export class DemoComponent {
  store = inject(ProductStore);
}
