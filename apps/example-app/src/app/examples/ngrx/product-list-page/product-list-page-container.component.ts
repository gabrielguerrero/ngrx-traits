import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Sort } from '@ngrx-traits/common';
import { createSelector, Store } from '@ngrx/store';

import { ProductListComponent } from '../../components/product-list/product-list.component';
import { ProductSearchFormComponent } from '../../components/product-search-form/product-search-form.component';
import { Product, ProductFilter } from '../../models';
import { ProductActions, ProductSelectors } from './state/products';
import { ProductsStateModule } from './state/products/products-state.module';

@Component({
  selector: 'ngrx-traits-product-list-example-container',
  template: `
    @if (data$ | async; as data) {
      <mat-card>
        <mat-card-header>
          <mat-card-title>Product List</mat-card-title>
        </mat-card-header>
        <mat-card-content>
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
        </mat-card-content>
        <mat-card-actions [align]="'end'">
          <button
            mat-raised-button
            color="primary"
            type="submit"
            [disabled]="!data.selectedProduct || data.isLoadingCheckout"
            (click)="checkout()"
          >
            @if (data.isLoadingCheckout) {
              <mat-spinner [diameter]="20"></mat-spinner>
            }
            <span>CHECKOUT</span>
          </button>
        </mat-card-actions>
      </mat-card>
    }
  `,
  styles: [
    `
      mat-card-content > mat-spinner {
        margin: 10px auto;
      }
      mat-card-actions mat-spinner {
        display: inline-block;
        margin-right: 5px;
      }
    `,
  ],
  standalone: true,
  imports: [
    MatCardModule,
    ProductsStateModule,
    MatProgressSpinnerModule,
    ProductListComponent,
    MatButtonModule,
    AsyncPipe,
    ProductSearchFormComponent,
  ],
})
export class ProductListPageContainerComponent implements OnInit {
  data$ = this.store.select(
    createSelector({
      products: ProductSelectors.selectProductsList,
      isLoading: ProductSelectors.isProductsLoading,
      selectedProduct: ProductSelectors.selectProductSelected,
      isLoadingCheckout: ProductSelectors.isLoadingCheckout,
    }),
  );

  constructor(private store: Store) {}

  ngOnInit() {
    this.store.dispatch(ProductActions.loadProducts());
  }

  select({ id }: Product) {
    this.store.dispatch(ProductActions.selectProduct({ id }));
  }

  checkout() {
    this.store.dispatch(ProductActions.checkout());
  }

  filter(filters: ProductFilter | undefined) {
    filters && this.store.dispatch(ProductActions.filterProducts({ filters }));
  }
  // new event handler ↓
  sort(sort: Sort<Product>) {
    this.store.dispatch(ProductActions.sortProducts(sort));
  }
}
