import { Component, OnInit } from '@angular/core';
import { ProductActions, ProductSelectors } from './state/products';
import { combineLatest } from 'rxjs';
import { Product, ProductFilter } from '../models';
import { createSelector, Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { Sort } from '@ngrx-traits/common';
import { MatButtonModule } from '@angular/material/button';
import { ProductListComponent } from '../components/product-list/product-list.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'ngrx-traits-product-list-example-container',
  template: `
    @if (data$ | async; as data) {
    <mat-card>
      <mat-card-header>
        <mat-card-title>Product List</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <!--        <product-search-form-->
        <!--          (searchProduct)="filter($event)"-->
        <!--        ></product-search-form>-->
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
    MatProgressSpinnerModule,
    ProductListComponent,
    MatButtonModule,
    AsyncPipe,
  ],
})
export class ProductListPageContainerComponent implements OnInit {
  data$ = this.store.select(
    createSelector({
      products: ProductSelectors.selectProductsList,
      isLoading: ProductSelectors.isProductsLoading,
      selectedProduct: ProductSelectors.selectProductSelected,
      isLoadingCheckout: ProductSelectors.isLoadingCheckout,
    })
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

  filter(filters: ProductFilter) {
    this.store.dispatch(ProductActions.filterProducts({ filters }));
  }
  // new event handler ↓
  sort(sort: Sort<Product>) {
    this.store.dispatch(ProductActions.sortProducts(sort));
  }
}
