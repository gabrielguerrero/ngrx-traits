import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Product, ProductFilter } from '@example-api/shared/models';
import { Sort } from '@ngrx-traits/common';
import { createSelector, Store } from '@ngrx/store';

import { ProductListComponent } from '../../../../components/product-list/product-list.component';
import { ProductSearchFormComponent } from '../../../../components/product-search-form/product-search-form.component';
import { ProductsLocalTraits } from './products.local-traits';

@Component({
  selector: 'product-select-dialog',
  template: ` <h2 mat-dialog-title>Install Angular</h2>
    @if (data$ | async; as data) {
      <mat-dialog-content class="mat-typography">
        <product-search-form
          (searchProductChange)="filter($event)"
        ></product-search-form>
        @if (data.isLoading) {
          <mat-spinner></mat-spinner>
        } @else {
          <product-list
            [list]="data.products"
            [selectedProduct]="data.selectedProduct"
            (selectProduct)="select($event)"
            (sort)="sort($event)"
          ></product-list>
        }
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button
          mat-raised-button
          type="button"
          [disabled]="!data.selectedProduct"
          [mat-dialog-close]="data.selectedProduct"
        >
          Select
        </button>
      </mat-dialog-actions>
    }`,
  styles: [
    `
      mat-spinner {
        margin: 10px auto;
      }
    `,
  ],
  providers: [ProductsLocalTraits],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatDialogModule,
    ProductSearchFormComponent,
    MatProgressSpinnerModule,
    ProductListComponent,
    MatButtonModule,
    AsyncPipe,
  ],
})
export class ProductSelectDialogComponent implements OnInit {
  data$ = this.store.select(
    createSelector({
      products: this.traits.localSelectors.selectProductsList,
      isLoading: this.traits.localSelectors.isProductsLoading,
      selectedProduct: this.traits.localSelectors.selectProductSelected,
    }),
  );

  constructor(
    private store: Store,
    private traits: ProductsLocalTraits,
  ) {}

  ngOnInit() {
    this.store.dispatch(this.traits.localActions.loadProducts());
  }

  select({ id }: Product) {
    this.store.dispatch(this.traits.localActions.selectProduct({ id }));
  }

  filter(filters: ProductFilter | undefined) {
    filters &&
      this.store.dispatch(this.traits.localActions.filterProducts({ filters }));
  }
  sort(sort: Sort<Product>) {
    this.store.dispatch(this.traits.localActions.sortProducts(sort));
  }
}
